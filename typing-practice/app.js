'use strict';

// ─── State ───────────────────────────────────────────────────────────────────

const state = {
    lessonIndex: 0,
    currentPosition: 0,
    errors: 0,
    correctChars: 0,
    startTime: null,
    timerInterval: null,
    hasError: false,
    isStarted: false,
    isComplete: false,
    elapsedSeconds: 0,
    progress: JSON.parse(localStorage.getItem('typingProgress') || '{}')
};

let currentCode = '';
let charSpans = [];
let isNewlineAt = [];

// Scroll animation state
let codeTranslateY = 0;  // current Y offset of the code block (negative = scrolled up)

// ─── DOM References ───────────────────────────────────────────────────────────

const codeDisplay      = document.getElementById('code-display');
const codeContainer    = document.getElementById('code-container');
const lessonList       = document.getElementById('lesson-list');
const completionEl     = document.getElementById('completion');
const hintEl           = document.getElementById('hint');

const elWPM            = document.getElementById('wpm');
const elAccuracy       = document.getElementById('accuracy');
const elTimer          = document.getElementById('timer');
const elProgressPct    = document.getElementById('progress-pct');
const elProgressBar    = document.getElementById('progress-fill');

const elLessonCategory = document.getElementById('lesson-category');
const elLessonTitle    = document.getElementById('lesson-title');
const elLessonDesc     = document.getElementById('lesson-desc');
const elDifficulty     = document.getElementById('difficulty-stars');
const elLessonType     = document.getElementById('lesson-type-badge');

const elFinalWPM       = document.getElementById('final-wpm');
const elFinalAccuracy  = document.getElementById('final-accuracy');
const elFinalTime      = document.getElementById('final-time');

const btnRestart = document.getElementById('btn-restart');
const btnNext    = document.getElementById('btn-next');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function escapeHtml(ch) {
    switch (ch) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        default:  return ch;
    }
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return m + ':' + String(s).padStart(2, '0');
}

function starsFor(id) {
    const p = state.progress[id];
    if (!p) return 0;
    if (p.accuracy >= 95 && p.wpm >= 25) return 3;
    if (p.accuracy >= 88) return 2;
    return 1;
}

function saveProgress(lessonId, wpm, accuracy) {
    const existing = state.progress[lessonId];
    if (!existing || wpm > (existing.wpm || 0)) {
        state.progress[lessonId] = { wpm, accuracy };
        localStorage.setItem('typingProgress', JSON.stringify(state.progress));
    }
}

// ─── Smooth Scroll (Typewriter Effect) ───────────────────────────────────────

// Moves the code block so the current character sits at CURSOR_ROW_RATIO
// from the top of the visible container — completed text scrolls out above.
const CURSOR_ROW_RATIO = 0.30; // cursor target: 30% from container top

function scrollToCurrent(animated) {
    const span = charSpans[state.currentPosition];
    if (!span) return;

    const containerRect = codeContainer.getBoundingClientRect();
    const spanRect      = span.getBoundingClientRect();

    // How far the current span is from our desired row
    const targetTop  = containerRect.top + containerRect.height * CURSOR_ROW_RATIO;
    const delta      = spanRect.top - targetTop;

    if (Math.abs(delta) < 1) return; // already in position, skip

    codeTranslateY -= delta;

    if (animated === false) {
        // Instant snap — no CSS transition for initial load positioning
        codeDisplay.style.transition = 'none';
        codeDisplay.style.transform  = `translateY(${codeTranslateY}px)`;
        // Force reflow so the transition: none takes effect, then re-enable
        void codeDisplay.offsetHeight;
        codeDisplay.style.transition = 'transform 0.18s cubic-bezier(0.25,0.46,0.45,0.94)';
    } else {
        codeDisplay.style.transform = `translateY(${codeTranslateY}px)`;
    }
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function renderSidebar() {
    const categories = {};
    LESSONS.forEach((lesson, idx) => {
        if (!categories[lesson.category]) categories[lesson.category] = [];
        categories[lesson.category].push({ lesson, idx });
    });

    lessonList.innerHTML = '';
    Object.entries(categories).forEach(([cat, items]) => {
        const header = document.createElement('div');
        header.className = 'sidebar-category';
        header.textContent = cat;
        lessonList.appendChild(header);

        items.forEach(({ lesson, idx }) => {
            const btn = document.createElement('button');
            btn.className = 'lesson-btn' + (idx === state.lessonIndex ? ' active' : '');
            btn.dataset.idx = idx;

            const stars = starsFor(lesson.id);
            const starStr = stars > 0
                ? '<span class="stars">' + '★'.repeat(stars) + '☆'.repeat(3 - stars) + '</span>'
                : '';
            const typeTag = lesson.type === 'api'
                ? '<span class="badge badge-api">API</span>'
                : '<span class="badge badge-ex">EX</span>';

            btn.innerHTML = `
                <span class="lesson-btn-title">${lesson.title}</span>
                <span class="lesson-btn-meta">
                    ${typeTag}
                    ${'●'.repeat(lesson.difficulty)}${'○'.repeat(5 - lesson.difficulty)}
                    ${starStr}
                </span>`;
            btn.addEventListener('click', () => loadLesson(idx));
            lessonList.appendChild(btn);
        });
    });
}

// ─── Load Lesson ──────────────────────────────────────────────────────────────

function loadLesson(idx) {
    // Reset all state
    state.lessonIndex     = idx;
    state.currentPosition = 0;
    state.errors          = 0;
    state.correctChars    = 0;
    state.startTime       = null;
    state.hasError        = false;
    state.isStarted       = false;
    state.isComplete      = false;
    state.elapsedSeconds  = 0;
    codeTranslateY        = 0;

    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }

    completionEl.classList.remove('visible');
    hintEl.style.display = 'block';
    hintEl.textContent   = 'לחץ על מקש כלשהו להתחלה';

    const lesson = LESSONS[idx];
    currentCode  = lesson.code;
    isNewlineAt  = currentCode.split('').map(c => c === '\n');

    // Update header UI
    elLessonCategory.textContent = lesson.category;
    elLessonTitle.textContent    = lesson.title;
    elLessonDesc.textContent     = lesson.description;
    elDifficulty.textContent     = '●'.repeat(lesson.difficulty) + '○'.repeat(5 - lesson.difficulty);

    if (elLessonType) {
        elLessonType.textContent  = lesson.type === 'api' ? 'API Reference' : 'Practical Example';
        elLessonType.className    = 'lesson-type-label ' + (lesson.type === 'api' ? 'type-api' : 'type-example');
    }

    // Reset stats
    elWPM.textContent         = '0';
    elAccuracy.textContent    = '100%';
    elTimer.textContent       = '0:00';
    elProgressPct.textContent = '0%';
    elProgressBar.style.width = '0%';

    // Build DOM spans for every character
    buildCodeDisplay();

    // Position the code block so first char is at CURSOR_ROW_RATIO
    // Need two rAF cycles for layout to settle after innerHTML write
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            codeDisplay.style.transition = 'none';
            codeDisplay.style.transform  = 'translateY(0)';
            codeTranslateY = 0;
            scrollToCurrent(false);
        });
    });

    // Highlight active lesson in sidebar
    document.querySelectorAll('.lesson-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === idx);
    });
    const activeBtn = document.querySelector('.lesson-btn.active');
    if (activeBtn) activeBtn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

// ─── Code Display ─────────────────────────────────────────────────────────────

function buildCodeDisplay() {
    let html = '';
    for (let i = 0; i < currentCode.length; i++) {
        const ch = currentCode[i];
        if (ch === '\n') {
            // Render visible ↵ symbol; the raw \n after the closing tag
            // creates the actual line break in white-space:pre context
            html += `<span class="char char-pending char-newline" data-i="${i}">↵</span>\n`;
        } else if (ch === ' ') {
            // Use a middot · for spaces to make them visible while typing
            html += `<span class="char char-pending char-space" data-i="${i}">·</span>`;
        } else {
            html += `<span class="char char-pending" data-i="${i}">${escapeHtml(ch)}</span>`;
        }
    }
    codeDisplay.innerHTML = html;
    charSpans = Array.from(codeDisplay.querySelectorAll('.char'));

    // Mark first character as the cursor position
    if (charSpans.length > 0) {
        charSpans[0].classList.replace('char-pending', 'char-current');
    }
}

// ─── Typing Logic ─────────────────────────────────────────────────────────────

document.addEventListener('keydown', handleKeyDown);

function handleKeyDown(e) {
    if (state.isComplete) return;
    if (!LESSONS[state.lessonIndex]) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return; // don't intercept browser shortcuts

    if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
        return;
    }

    let typed;
    if (e.key === 'Enter') {
        typed = '\n';
    } else if (e.key === 'Tab') {
        e.preventDefault();
        return; // tabs are spaces in all lessons; just ignore
    } else if (e.key.length === 1) {
        typed = e.key;
    } else {
        return; // ignore Shift, F1, ArrowUp, etc.
    }

    e.preventDefault();
    handleChar(typed);
}

function handleChar(typed) {
    if (state.hasError) return; // must press Backspace to clear error first

    if (!state.isStarted) {
        state.isStarted = true;
        state.startTime = Date.now();
        hintEl.style.display = 'none';
        startTimer();
    }

    const expected = currentCode[state.currentPosition];

    if (typed === expected) {
        // ✓ Correct keystroke
        setSpanClass(state.currentPosition, 'correct');
        state.correctChars++;
        state.currentPosition++;

        if (state.currentPosition < currentCode.length) {
            setSpanClass(state.currentPosition, 'current');
        }

        // Scroll so new current character stays at the target row
        scrollToCurrent(true);
        updateStats();

        if (state.currentPosition >= currentCode.length) {
            completeLesson();
        }
    } else {
        // ✗ Wrong keystroke — mark error, force Backspace to continue
        state.errors++;
        state.hasError = true;
        charSpans[state.currentPosition].classList.add('char-wrong');
        // Brief shake animation for feedback
        charSpans[state.currentPosition].classList.add('shake');
        setTimeout(() => {
            charSpans[state.currentPosition]?.classList.remove('shake');
        }, 280);
    }
}

function handleBackspace() {
    if (state.hasError) {
        // Clear the error state — user can retry
        state.hasError = false;
        charSpans[state.currentPosition].classList.remove('char-wrong');
        return;
    }

    if (state.currentPosition > 0) {
        setSpanClass(state.currentPosition, 'pending');
        state.currentPosition--;
        state.correctChars = Math.max(0, state.correctChars - 1);
        setSpanClass(state.currentPosition, 'current');
        scrollToCurrent(true); // scroll back too
        updateStats();
    }
}

// Efficiently update a single span's CSS class
function setSpanClass(idx, type) {
    if (idx < 0 || idx >= charSpans.length) return;
    const span = charSpans[idx];
    const isNL    = isNewlineAt[idx];
    const isSp    = currentCode[idx] === ' ';
    let base = 'char char-' + type;
    if (isNL) base += ' char-newline';
    if (isSp) base += ' char-space';
    span.className = base;
}

// ─── Stats ────────────────────────────────────────────────────────────────────

function startTimer() {
    state.timerInterval = setInterval(() => {
        state.elapsedSeconds = (Date.now() - state.startTime) / 1000;
        elTimer.textContent = formatTime(state.elapsedSeconds);
        updateWPM();
    }, 250);
}

function updateStats() {
    updateWPM();
    const attempted = state.correctChars + state.errors;
    const acc = attempted > 0 ? Math.round((state.correctChars / attempted) * 100) : 100;
    elAccuracy.textContent    = acc + '%';
    const pct = Math.round((state.currentPosition / currentCode.length) * 100);
    elProgressPct.textContent = pct + '%';
    elProgressBar.style.width = pct + '%';
}

function updateWPM() {
    if (!state.startTime || state.elapsedSeconds < 1) { elWPM.textContent = '0'; return; }
    const minutes = state.elapsedSeconds / 60;
    const wpm = Math.round((state.correctChars / 5) / minutes);
    elWPM.textContent = wpm;
}

// ─── Completion ───────────────────────────────────────────────────────────────

function completeLesson() {
    state.isComplete = true;
    clearInterval(state.timerInterval);
    state.timerInterval = null;

    const minutes = state.elapsedSeconds / 60;
    const wpm     = minutes > 0 ? Math.round((state.correctChars / 5) / minutes) : 0;
    const attempted = state.correctChars + state.errors;
    const acc     = attempted > 0 ? Math.round((state.correctChars / attempted) * 100) : 100;

    saveProgress(LESSONS[state.lessonIndex].id, wpm, acc);

    elFinalWPM.textContent      = wpm;
    elFinalAccuracy.textContent = acc + '%';
    elFinalTime.textContent     = formatTime(state.elapsedSeconds);

    const stars = (acc >= 95 && wpm >= 25) ? 3 : (acc >= 88 ? 2 : 1);
    document.getElementById('final-stars').textContent =
        '★'.repeat(stars) + '☆'.repeat(3 - stars);

    completionEl.classList.add('visible');
    renderSidebar();
}

// ─── Navigation ───────────────────────────────────────────────────────────────

btnRestart.addEventListener('click', () => loadLesson(state.lessonIndex));
btnNext.addEventListener('click', nextLesson);
document.getElementById('btn-completion-retry').addEventListener('click', () => loadLesson(state.lessonIndex));
document.getElementById('btn-completion-next').addEventListener('click', nextLesson);

function nextLesson() {
    loadLesson((state.lessonIndex + 1) % LESSONS.length);
}

// ─── Init ─────────────────────────────────────────────────────────────────────

renderSidebar();
loadLesson(0);
