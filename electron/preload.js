// Intentionally empty. The game (index.html/game.js/...) is a plain web
// page that only needs standard browser APIs (localStorage, Canvas2D,
// WebAudio) — it has no need to reach into Node.js or Electron APIs, so
// nothing is exposed here. Keeping contextIsolation on and nodeIntegration
// off with an empty preload is the safest default for wrapping an existing
// web app that doesn't require it.
'use strict';
