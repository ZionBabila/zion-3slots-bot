// lessons-loader.js
// Combines all lesson packs into the single LESSONS array used by app.js.
// To add a new pack: define LESSONS_YOURPACK in a new file,
// add its <script> tag to index.html, then spread it in here.

const LESSONS = [
    ...LESSONS_API,
    ...LESSONS_SHELL_BOUND,
    ...LESSONS_EXAMPLES,
];
