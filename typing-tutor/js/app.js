const STORAGE_KEY = "csharp-unity-typing-progress";

const KEYBOARD_ROWS = [
  ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
  ["Tab", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]"],
  ["Caps", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"],
  ["Shift", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
  ["Space"],
];

// Standard touch-typing finger assignment per key, for the blind-typing guide.
const FINGER_MAP = {
  "`": "l-pinky", "1": "l-pinky", "tab": "l-pinky", "caps": "l-pinky", "shift": "l-pinky", "z": "l-pinky", "q": "l-pinky", "a": "l-pinky",
  "2": "l-ring", "w": "l-ring", "s": "l-ring", "x": "l-ring",
  "3": "l-middle", "e": "l-middle", "d": "l-middle", "c": "l-middle",
  "4": "l-index", "5": "l-index", "r": "l-index", "t": "l-index", "f": "l-index", "g": "l-index", "v": "l-index", "b": "l-index",
  "6": "r-index", "7": "r-index", "y": "r-index", "u": "r-index", "h": "r-index", "j": "r-index", "n": "r-index", "m": "r-index",
  "8": "r-middle", "i": "r-middle", "k": "r-middle", ",": "r-middle",
  "9": "r-ring", "o": "r-ring", "l": "r-ring", ".": "r-ring",
  "0": "r-pinky", "-": "r-pinky", "=": "r-pinky", "p": "r-pinky", "[": "r-pinky", "]": "r-pinky", ";": "r-pinky", "'": "r-pinky", "/": "r-pinky",
  "space": "thumb",
};

// Shifted symbols map to the same physical key as their unshifted base character.
const SHIFT_SYMBOL_MAP = {
  "{": "[", "}": "]", "(": "9", ")": "0", "<": ",", ">": ".",
  ":": ";", '"': "'", "_": "-", "+": "=", "?": "/", "!": "1",
  "@": "2", "#": "3", "$": "4", "%": "5", "^": "6", "&": "7",
  "*": "8", "~": "`", "|": "\\",
};

const FINGER_LABELS = {
  "l-pinky": "אצבע זרת — יד שמאל",
  "l-ring": "אצבע קמיצה — יד שמאל",
  "l-middle": "אצבע אמה — יד שמאל",
  "l-index": "אצבע מורה — יד שמאל",
  "r-index": "אצבע מורה — יד ימין",
  "r-middle": "אצבע אמה — יד ימין",
  "r-ring": "אצבע קמיצה — יד ימין",
  "r-pinky": "אצבע זרת — יד ימין",
  "thumb": "אגודל",
};

const state = {
  lessonIndex: 0,
  fullText: "",
  typed: "",
  startTime: null,
  errorCount: 0,
  totalTyped: 0,
  finished: false,
};

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveProgress(lessonId, wpm, accuracy) {
  const progress = loadProgress();
  const prev = progress[lessonId];
  if (!prev || wpm > prev.wpm) {
    progress[lessonId] = { wpm, accuracy };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }
}

function buildSidebar() {
  const list = document.getElementById("lesson-list");
  const progress = loadProgress();
  list.innerHTML = "";
  LESSONS.forEach((lesson, i) => {
    const btn = document.createElement("button");
    btn.className = "lesson-btn";
    btn.dataset.index = i;
    const best = progress[lesson.id];
    btn.innerHTML = `${lesson.title}${
      best ? `<span class="best">שיא: ${best.wpm} מ/ד · ${best.accuracy}%</span>` : ""
    }`;
    btn.addEventListener("click", () => loadLesson(i));
    list.appendChild(btn);
  });
  highlightActiveLesson();
}

function highlightActiveLesson() {
  document.querySelectorAll(".lesson-btn").forEach((b) => {
    b.classList.toggle("active", Number(b.dataset.index) === state.lessonIndex);
  });
}

function buildKeyboard() {
  const kb = document.getElementById("keyboard");
  kb.innerHTML = "";
  KEYBOARD_ROWS.forEach((row) => {
    const rowEl = document.createElement("div");
    rowEl.className = "kb-row";
    row.forEach((k) => {
      const keyEl = document.createElement("div");
      const finger = FINGER_MAP[k.toLowerCase()];
      keyEl.className = "key" + (k.length > 1 ? " wide" : "") + (finger ? ` finger-${finger}` : "");
      keyEl.dataset.key = k.toLowerCase();
      keyEl.textContent = k === "Space" ? "␣" : k;
      rowEl.appendChild(keyEl);
    });
    kb.appendChild(rowEl);
  });
}

function highlightNextKey(char) {
  document.querySelectorAll(".key.active").forEach((k) => k.classList.remove("active"));
  const fingerLabel = document.getElementById("finger-label");
  if (char === undefined) {
    fingerLabel.textContent = "";
    return;
  }
  let target = char.toLowerCase();
  let needsShift = char !== char.toLowerCase() && /[a-z]/i.test(char);
  if (char === " " || char === "\n") {
    target = "space";
  } else if (SHIFT_SYMBOL_MAP[char]) {
    target = SHIFT_SYMBOL_MAP[char];
    needsShift = true;
  }
  const keyEl = document.querySelector(`.key[data-key="${cssEscape(target)}"]`);
  if (keyEl) keyEl.classList.add("active");
  if (needsShift) {
    const shiftEl = document.querySelector('.key[data-key="shift"]');
    if (shiftEl) shiftEl.classList.add("active");
  }
  const finger = FINGER_MAP[target];
  fingerLabel.textContent = finger ? `השתמש ב: ${FINGER_LABELS[finger]}` : "";
}

function cssEscape(s) {
  return s.replace(/["\\]/g, "\\$&");
}

function loadLesson(index) {
  state.lessonIndex = index;
  state.fullText = LESSONS[index].lines.join("\n");
  state.typed = "";
  state.startTime = null;
  state.errorCount = 0;
  state.totalTyped = 0;
  state.finished = false;

  document.getElementById("lesson-title").textContent = LESSONS[index].title;
  document.getElementById("lesson-desc").textContent = LESSONS[index].description;
  document.getElementById("result-panel").hidden = true;

  renderCode();
  updateStats();
  highlightActiveLesson();

  const input = document.getElementById("hidden-input");
  input.value = "";
  input.focus();
  highlightNextKey(state.fullText[0]);
}

function renderCode() {
  const display = document.getElementById("code-display");
  const { fullText, typed } = state;
  let html = "";
  for (let i = 0; i < fullText.length; i++) {
    const ch = fullText[i] === "\n" ? "\n" : fullText[i];
    const display_ch = ch === " " ? " " : ch;
    if (i < typed.length) {
      const cls = typed[i] === fullText[i] ? "char-correct" : "char-incorrect";
      html += `<span class="${cls}">${escapeHtml(display_ch)}</span>`;
    } else if (i === typed.length) {
      html += `<span class="char-current">${escapeHtml(display_ch === "\n" ? " " : display_ch)}</span>`;
      if (ch === "\n") html += "\n";
    } else {
      html += `<span class="char-pending">${escapeHtml(display_ch)}</span>`;
    }
  }
  display.innerHTML = html;
}

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function updateStats() {
  const { typed, fullText, errorCount, totalTyped, startTime } = state;
  const elapsedMin = startTime ? (Date.now() - startTime) / 60000 : 0;
  const wordsTyped = typed.length / 5;
  const wpm = elapsedMin > 0 ? Math.round(wordsTyped / elapsedMin) : 0;
  const accuracy = totalTyped > 0 ? Math.round(((totalTyped - errorCount) / totalTyped) * 100) : 100;
  const progressPct = fullText.length > 0 ? Math.round((typed.length / fullText.length) * 100) : 0;

  document.getElementById("stat-wpm").textContent = wpm;
  document.getElementById("stat-acc").textContent = `${Math.max(accuracy, 0)}%`;
  document.getElementById("stat-errors").textContent = errorCount;
  document.getElementById("stat-progress").textContent = `${progressPct}%`;

  return { wpm, accuracy: Math.max(accuracy, 0) };
}

function finishLesson() {
  state.finished = true;
  const { wpm, accuracy } = updateStats();
  const lesson = LESSONS[state.lessonIndex];
  saveProgress(lesson.id, wpm, accuracy);
  buildSidebar();

  document.getElementById("result-text").textContent =
    `מהירות: ${wpm} מילים לדקה · דיוק: ${accuracy}%`;
  document.getElementById("result-panel").hidden = false;
  highlightNextKey(undefined);
}

function handleInput(e) {
  if (state.finished) return;
  const input = e.target;
  const value = input.value;

  if (state.startTime === null && value.length > 0) {
    state.startTime = Date.now();
  }

  if (value.length > state.typed.length) {
    const newChar = value[value.length - 1];
    const expected = state.fullText[state.typed.length];
    state.totalTyped++;
    if (newChar !== expected) state.errorCount++;
  }

  if (value.length <= state.fullText.length) {
    state.typed = value;
  } else {
    state.typed = value.slice(0, state.fullText.length);
    input.value = state.typed;
  }

  renderCode();
  updateStats();
  highlightNextKey(state.fullText[state.typed.length]);

  if (state.typed.length === state.fullText.length && state.typed === state.fullText) {
    finishLesson();
  }
}

function handleKeydown(e) {
  if (state.finished) return;

  if (e.key === "Enter") {
    if (state.fullText[state.typed.length] !== "\n") {
      e.preventDefault();
    }
  } else if (e.key === "Tab") {
    e.preventDefault();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  buildSidebar();
  buildKeyboard();
  loadLesson(0);

  const input = document.getElementById("hidden-input");
  input.addEventListener("input", handleInput);
  input.addEventListener("keydown", handleKeydown);

  document.getElementById("code-display").addEventListener("click", () => input.focus());

  document.getElementById("btn-retry").addEventListener("click", () => loadLesson(state.lessonIndex));
  document.getElementById("btn-next").addEventListener("click", () => {
    const next = (state.lessonIndex + 1) % LESSONS.length;
    loadLesson(next);
  });

  const blindToggle = document.getElementById("btn-blind-mode");
  blindToggle.addEventListener("click", () => {
    const hiding = document.body.classList.toggle("blind-mode");
    blindToggle.textContent = hiding ? "👁️ הצג מקלדת" : "🙈 מצב הקלדה עיוורת";
    input.focus();
  });
});
