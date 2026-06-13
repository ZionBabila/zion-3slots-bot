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

// ─── DOM References ───────────────────────────────────────────────────────────

const codeDisplay   = document.getElementById('code-display');
const lessonList    = document.getElementById('lesson-list');
const completionEl  = document.getElementById('completion');
const hintEl        = document.getElementById('hint');

const elWPM         = document.getElementById('wpm');
const elAccuracy    = document.getElementById('accuracy');
const elTimer       = document.getElementById('timer');
const elProgressPct = document.getElementById('progress-pct');
const elProgressBar = document.getElementById('progress-fill');

const elLessonCategory = document.getElementById('lesson-category');
const elLessonTitle    = document.getElementById('lesson-title');
const elLessonDesc     = document.getElementById('lesson-desc');
const elDifficulty     = document.getElementById('difficulty-stars');

const elFinalWPM      = document.getElementById('final-wpm');
const elFinalAccuracy = document.getElementById('final-accuracy');
const elFinalTime     = document.getElementById('final-time');

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
    if (!existing || wpm > existing.wpm) {
        state.progress[lessonId] = { wpm, accuracy };
        localStorage.setItem('typingProgress', JSON.stringify(state.progress));
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
            const starStr = stars > 0 ? '<span class="stars">' + '★'.repeat(stars) + '☆'.repeat(3 - stars) + '</span>' : '';

            btn.innerHTML = `
                <span class="lesson-btn-title">${lesson.title}</span>
                <span class="lesson-btn-meta">
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
    state.lessonIndex    = idx;
    state.currentPosition = 0;
    state.errors         = 0;
    state.correctChars   = 0;
    state.startTime      = null;
    state.hasError       = false;
    state.isStarted      = false;
    state.isComplete     = false;
    state.elapsedSeconds = 0;

    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }

    completionEl.classList.remove('visible');
    hintEl.textContent = 'לחץ על מקש כלשהו להתחלה';
    hintEl.style.display = 'block';

    const lesson = LESSONS[idx];
    currentCode = lesson.code;
    isNewlineAt = currentCode.split('').map(c => c === '\n');

    // Update lesson info
    elLessonCategory.textContent = lesson.category;
    elLessonTitle.textContent    = lesson.title;
    elLessonDesc.textContent     = lesson.description;
    elDifficulty.textContent     = '●'.repeat(lesson.difficulty) + '○'.repeat(5 - lesson.difficulty);

    // Reset stats display
    elWPM.textContent         = '0';
    elAccuracy.textContent    = '100%';
    elTimer.textContent       = '0:00';
    elProgressPct.textContent = '0%';
    elProgressBar.style.width = '0%';

    // Build code spans
    buildCodeDisplay();

    // Highlight active lesson in sidebar
    document.querySelectorAll('.lesson-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === idx);
    });

    // Scroll active lesson into view
    const activeBtn = document.querySelector('.lesson-btn.active');
    if (activeBtn) activeBtn.scrollIntoView({ block: 'nearest' });
}

// ─── Code Display ─────────────────────────────────────────────────────────────

function buildCodeDisplay() {
    let html = '';
    for (let i = 0; i < currentCode.length; i++) {
        const ch = currentCode[i];
        if (ch === '\n') {
            // Show ↵ as visible hint, then a raw newline text node for line break
            html += `<span class="char char-pending char-newline" data-i="${i}">↵</span>\n`;
        } else if (ch === ' ') {
            html += `<span class="char char-pending" data-i="${i}">&nbsp;</span>`;
        } else {
            html += `<span class="char char-pending" data-i="${i}">${escapeHtml(ch)}</span>`;
        }
    }
    codeDisplay.innerHTML = html;
    charSpans = Array.from(codeDisplay.querySelectorAll('.char'));

    // Mark first char as current
    if (charSpans.length > 0) {
        charSpans[0].classList.remove('char-pending');
        charSpans[0].classList.add('char-current');
    }
}

// ─── Typing Logic ─────────────────────────────────────────────────────────────

document.addEventListener('keydown', handleKeyDown);

function handleKeyDown(e) {
    if (state.isComplete) return;
    if (!LESSONS[state.lessonIndex]) return;

    // Allow browser shortcuts
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
        return;
    }

    // Map Enter to \n, ignore Tab (not used in lessons), ignore non-printable keys
    let typed;
    if (e.key === 'Enter') {
        typed = '\n';
    } else if (e.key === 'Tab') {
        e.preventDefault();
        return;
    } else if (e.key.length === 1) {
        typed = e.key;
    } else {
        return; // Ignore Shift, Ctrl, F1, etc.
    }

    e.preventDefault();
    handleChar(typed);
}

function handleChar(typed) {
    if (state.hasError) return; // must backspace first

    // Start timer on first keystroke
    if (!state.isStarted) {
        state.isStarted = true;
        state.startTime = Date.now();
        hintEl.style.display = 'none';
        startTimer();
    }

    const expected = currentCode[state.currentPosition];

    if (typed === expected) {
        // Correct
        setSpanClass(state.currentPosition, 'correct');
        state.correctChars++;
        state.currentPosition++;

        if (state.currentPosition < currentCode.length) {
            setSpanClass(state.currentPosition, 'current');
        }

        updateStats();

        if (state.currentPosition >= currentCode.length) {
            completeLesson();
        }
    } else {
        // Wrong
        state.errors++;
        state.hasError = true;
        charSpans[state.currentPosition].classList.add('char-wrong');

        // Shake effect
        charSpans[state.currentPosition].classList.add('shake');
        setTimeout(() => {
            if (charSpans[state.currentPosition]) {
                charSpans[state.currentPosition].classList.remove('shake');
            }
        }, 300);
    }
}

function handleBackspace() {
    if (state.hasError) {
        state.hasError = false;
        charSpans[state.currentPosition].classList.remove('char-wrong');
        return;
    }

    if (state.currentPosition > 0) {
        setSpanClass(state.currentPosition, 'pending');
        state.currentPosition--;
        state.correctChars = Math.max(0, state.correctChars - 1);
        setSpanClass(state.currentPosition, 'current');
        updateStats();
    }
}

function setSpanClass(idx, type) {
    if (idx < 0 || idx >= charSpans.length) return;
    const span = charSpans[idx];
    const isNL = isNewlineAt[idx];
    span.className = 'char char-' + type + (isNL ? ' char-newline' : '');
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
    elAccuracy.textContent = acc + '%';

    const pct = Math.round((state.currentPosition / currentCode.length) * 100);
    elProgressPct.textContent = pct + '%';
    elProgressBar.style.width = pct + '%';
}

function updateWPM() {
    if (!state.startTime || state.elapsedSeconds < 1) return;
    const minutes = state.elapsedSeconds / 60;
    const wpm = Math.round((state.correctChars / 5) / minutes);
    elWPM.textContent = wpm;
}

// ─── Completion ───────────────────────────────────────────────────────────────

function completeLesson() {
    state.isComplete = true;

    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }

    const minutes = state.elapsedSeconds / 60;
    const wpm = minutes > 0 ? Math.round((state.correctChars / 5) / minutes) : 0;
    const attempted = state.correctChars + state.errors;
    const acc = attempted > 0 ? Math.round((state.correctChars / attempted) * 100) : 100;

    const lesson = LESSONS[state.lessonIndex];
    saveProgress(lesson.id, wpm, acc);

    elFinalWPM.textContent      = wpm;
    elFinalAccuracy.textContent = acc + '%';
    elFinalTime.textContent     = formatTime(state.elapsedSeconds);

    // Stars
    const stars = acc >= 95 && wpm >= 25 ? 3 : acc >= 88 ? 2 : 1;
    document.getElementById('final-stars').textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);

    completionEl.classList.add('visible');
    renderSidebar();
}

// ─── Navigation ───────────────────────────────────────────────────────────────

btnRestart.addEventListener('click', () => loadLesson(state.lessonIndex));
btnNext.addEventListener('click', nextLesson);

document.getElementById('btn-completion-retry').addEventListener('click', () => {
    loadLesson(state.lessonIndex);
});
document.getElementById('btn-completion-next').addEventListener('click', nextLesson);

function nextLesson() {
    const next = (state.lessonIndex + 1) % LESSONS.length;
    loadLesson(next);
}

// ─── Init ─────────────────────────────────────────────────────────────────────

renderSidebar();
loadLesson(0);
