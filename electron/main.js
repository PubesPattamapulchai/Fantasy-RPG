// Emberfall desktop shell.
//
// This is a thin Electron wrapper around the existing vanilla HTML/CSS/JS
// game (index.html + game.js etc.) — no gameplay code lives here. It only
// owns: window creation/sizing, remembering window state between launches,
// a minimal game-appropriate menu, and basic navigation hardening.
'use strict';

const { app, BrowserWindow, Menu, shell, screen, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

const isDev = !app.isPackaged;
const STATE_FILE = path.join(app.getPath('userData'), 'window-state.json');

function loadWindowState() {
  try {
    const raw = fs.readFileSync(STATE_FILE, 'utf8');
    const state = JSON.parse(raw);
    if (state && typeof state.width === 'number' && typeof state.height === 'number') {
      return state;
    }
  } catch (_) {
    // No saved state yet, or it's corrupted — fall through to defaults.
  }
  return null;
}

function saveWindowState(win) {
  if (!win || win.isDestroyed()) return;
  try {
    const bounds = win.isMaximized() ? win.getNormalBounds() : win.getBounds();
    const state = { ...bounds, maximized: win.isMaximized() };
    fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(state));
  } catch (_) {
    // Best-effort only; losing the remembered window size is not fatal.
  }
}

function clampToWorkArea(state) {
  if (!state) return state;
  const display = screen.getDisplayMatching(state) || screen.getPrimaryDisplay();
  const area = display.workArea;
  const width = Math.min(state.width, area.width);
  const height = Math.min(state.height, area.height);
  let x = state.x, y = state.y;
  // If the saved position no longer lands on any connected display (e.g. a
  // monitor was unplugged since last run), re-center on the primary display
  // instead of letting the window open off-screen.
  const onScreen = screen.getAllDisplays().some(d => {
    const a = d.workArea;
    return x >= a.x && y >= a.y && x < a.x + a.width && y < a.y + a.height;
  });
  if (typeof x !== 'number' || typeof y !== 'number' || !onScreen) {
    x = undefined;
    y = undefined;
  }
  return { ...state, width, height, x, y };
}

function createWindow() {
  const savedRaw = loadWindowState();
  const saved = clampToWorkArea(savedRaw);
  const primaryArea = screen.getPrimaryDisplay().workAreaSize;

  const win = new BrowserWindow({
    width: saved?.width ?? Math.min(1366, primaryArea.width),
    height: saved?.height ?? Math.min(850, primaryArea.height),
    x: saved?.x,
    y: saved?.y,
    minWidth: 1024,
    minHeight: 640,
    backgroundColor: '#04060b',
    title: 'Emberfall',
    icon: path.join(__dirname, '..', 'assets', 'icon-512.png'),
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      backgroundThrottling: false,
    },
  });

  if (saved?.maximized) win.maximize();

  win.once('ready-to-show', () => win.show());

  win.loadFile(path.join(__dirname, '..', 'index.html'));

  // Keep external/unknown navigation out of the game window: anything that
  // is not our own index.html (e.g. a future external link) opens in the
  // user's normal browser instead of hijacking the game window.
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (event, url) => {
    if (url !== win.webContents.getURL()) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  win.on('close', () => saveWindowState(win));

  // F11 fullscreen toggle. Deliberately not intercepting Escape here: the
  // game itself uses Escape to close its own menus, and stealing it at the
  // window level would break that.
  win.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown' && input.key === 'F11') {
      win.setFullScreen(!win.isFullScreen());
      event.preventDefault();
    }
  });

  if (isDev) win.webContents.openDevTools({ mode: 'detach' });

  return win;
}

// PC settings screen (Options > Display & Performance): window mode + resolution presets.
// Renderer-side calls come through preload.js's narrow `emberfallDesktop` bridge, never raw
// nodeIntegration, and everything here is re-validated regardless of what the renderer sent.
const WINDOW_MODES = ['windowed', 'borderless', 'fullscreen'];
function applyWindowMode(win, mode) {
  if (!win || win.isDestroyed() || !WINDOW_MODES.includes(mode)) return { ok: false };
  if (mode === 'fullscreen') { win.setSimpleFullScreen(false); win.setFullScreen(true); }
  else if (mode === 'borderless') { win.setFullScreen(false); win.setSimpleFullScreen(true); }
  else { win.setFullScreen(false); win.setSimpleFullScreen(false); }
  return { ok: true, mode };
}
const MIN_W = 640, MIN_H = 480, MAX_W = 7680, MAX_H = 4320; // sane bounds regardless of what the renderer requests
function applyResolution(win, width, height) {
  if (!win || win.isDestroyed()) return { ok: false };
  width = Math.round(Number(width)); height = Math.round(Number(height));
  if (!Number.isFinite(width) || !Number.isFinite(height)) return { ok: false };
  width = Math.min(MAX_W, Math.max(MIN_W, width));
  height = Math.min(MAX_H, Math.max(MIN_H, height));
  // A resolution preset only makes sense windowed — leaving fullscreen/borderless first avoids
  // Electron silently ignoring setSize() while one of those modes is active.
  if (win.isFullScreen()) win.setFullScreen(false);
  if (win.isSimpleFullScreen && win.isSimpleFullScreen()) win.setSimpleFullScreen(false);
  win.setSize(width, height);
  win.center();
  return { ok: true, width, height };
}
ipcMain.handle('emberfall:set-window-mode', (event, mode) => applyWindowMode(BrowserWindow.fromWebContents(event.sender), mode));
ipcMain.handle('emberfall:set-resolution', (event, width, height) => applyResolution(BrowserWindow.fromWebContents(event.sender), width, height));

// Prevent two copies of the game from running at once and fighting over the
// same localStorage-backed save data.
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  Menu.setApplicationMenu(null);

  app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
