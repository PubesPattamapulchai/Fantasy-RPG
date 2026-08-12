// Emberfall desktop shell — preload bridge.
//
// The game (index.html/game.js/...) is a plain web page that only needs standard browser APIs
// (localStorage, Canvas2D, WebAudio) for everything except the PC-only window controls added in
// the Options screen (window mode, resolution presets). Those need the main process, so this
// preload exposes a narrow, read-only-shaped bridge via contextBridge instead of turning on
// nodeIntegration — contextIsolation stays on and the renderer still can't reach Node/Electron
// APIs directly.
'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('emberfallDesktop', {
  isElectron: true,
  setWindowMode: (mode) => ipcRenderer.invoke('emberfall:set-window-mode', mode),
  setResolution: (width, height) => ipcRenderer.invoke('emberfall:set-resolution', width, height),
});
