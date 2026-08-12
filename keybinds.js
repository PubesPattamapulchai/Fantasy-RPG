// Emberfall key rebinding — action/key model.
//
// This file only owns the action->key mapping (storage, lookup, conflict handling). It does not
// touch the DOM or build any UI; reforged-ui.js renders the rebind rows inside the existing
// Options overlay and calls into the API below. game.js's keydown handler resolves every
// keypress to an action id via `resolve()` instead of matching literal key strings, so a rebind
// takes effect immediately without touching game.js again.
(() => {
  'use strict';
  const STORAGE_KEY = 'emberfall-keybinds-v1';

  // Movement and menu actions are grouped for the rebind UI; battle actions mirror the
  // battleKeys map that used to live inline in game.js's keydown handler.
  const ACTIONS = [
    { id: 'moveUp', label: 'Move Up', group: 'Movement' },
    { id: 'moveDown', label: 'Move Down', group: 'Movement' },
    { id: 'moveLeft', label: 'Move Left', group: 'Movement' },
    { id: 'moveRight', label: 'Move Right', group: 'Movement' },
    { id: 'interact', label: 'Interact / Confirm', group: 'General' },
    { id: 'toggleSound', label: 'Toggle Sound', group: 'General' },
    { id: 'openGear', label: 'Open Gear', group: 'Menus' },
    { id: 'openSheet', label: 'Open Character Sheet', group: 'Menus' },
    { id: 'openBuild', label: 'Open Build', group: 'Menus' },
    { id: 'openCamp', label: 'Open Camp', group: 'Menus' },
    { id: 'battleAttack', label: 'Attack', group: 'Battle' },
    { id: 'battleSkill1', label: 'Skill I', group: 'Battle' },
    { id: 'battleSkill2', label: 'Skill II', group: 'Battle' },
    { id: 'battleGuard', label: 'Guard', group: 'Battle' },
    { id: 'battlePotion', label: 'Potion', group: 'Battle' },
    { id: 'battleBomb', label: 'Bomb', group: 'Battle' },
    { id: 'battleBurst', label: 'Roadburst (Ultimate)', group: 'Battle' },
    { id: 'battleTactic', label: 'Tactic', group: 'Battle' },
    { id: 'battleInspire', label: 'Inspiration', group: 'Battle' },
    { id: 'battleDodge', label: 'Dodge', group: 'Battle' },
    { id: 'battleEnvironment', label: 'Use Environment', group: 'Battle' },
    { id: 'battleWeaponTechnique', label: 'Weapon Technique', group: 'Battle' },
    { id: 'battleParry', label: 'Parry', group: 'Battle' },
    { id: 'battleExecute', label: 'Execution', group: 'Battle' },
    { id: 'battlePartyTactic', label: 'Party Tactic', group: 'Battle' },
  ];

  // The exact literal keys game.js used to hardcode, now the *default* rebindable scheme.
  const DEFAULTS = {
    moveUp: 'w', moveDown: 's', moveLeft: 'a', moveRight: 'd',
    interact: ' ', toggleSound: 'm',
    openGear: 'g', openSheet: 'c', openBuild: 'b', openCamp: 'r',
    battleAttack: '1', battleSkill1: '2', battleSkill2: '3', battleGuard: '4', battlePotion: '5',
    battleBomb: '6', battleBurst: '7', battleTactic: '8', battleInspire: '9', battleDodge: '0',
    battleEnvironment: 'e', battleWeaponTechnique: 'q', battleParry: 'p', battleExecute: 'x',
    battlePartyTactic: 't',
  };

  // Arrow keys + Enter stay on permanently alongside whatever the primary key is rebound to.
  // They are intentionally NOT part of the rebindable map or its conflict detection: the game
  // already treats arrows/Enter as a second scheme running in parallel with WASD/Space (see the
  // original keydown handler), and keeping them fixed means a rebind can never strand a player
  // without a way to move or confirm.
  const PERMANENT_ALIASES = {
    moveUp: ['arrowup'], moveDown: ['arrowdown'], moveLeft: ['arrowleft'], moveRight: ['arrowright'],
    interact: ['enter'],
  };
  const RESERVED_KEYS = ['escape']; // Escape always closes menus; never rebindable, never assignable.

  let binds = { ...DEFAULTS };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    for (const id of Object.keys(DEFAULTS)) if (typeof saved[id] === 'string') binds[id] = saved[id];
  } catch (_) { /* corrupted save: fall back to defaults */ }

  function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(binds)); } catch (_) {} }
  function normalize(key) { return String(key || '').toLowerCase(); }

  function resolve(key) {
    key = normalize(key);
    for (const id of Object.keys(binds)) if (binds[id] === key) return id;
    for (const id of Object.keys(PERMANENT_ALIASES)) if (PERMANENT_ALIASES[id].includes(key)) return id;
    return null;
  }

  function owners(key, excludeId) {
    key = normalize(key);
    return Object.keys(binds).filter(id => id !== excludeId && binds[id] === key);
  }

  function labelFor(id) { return ACTIONS.find(a => a.id === id)?.label || id; }

  function emit() { window.dispatchEvent(new CustomEvent('emberfall:keybindschange', { detail: { ...binds } })); }

  function set(id, key) {
    if (!(id in DEFAULTS)) return { ok: false, reason: 'Unknown action.' };
    key = normalize(key);
    if (!key || key.length > 12) return { ok: false, reason: 'Unrecognized key.' };
    if (RESERVED_KEYS.includes(key)) return { ok: false, reason: 'Escape is reserved and can’t be rebound.' };
    // Friendly conflict handling: swap rather than block, so rebinding never requires a second
    // confirmation step or leaves an action with no key at all.
    const conflicting = owners(key, id);
    const swappedWith = [];
    const previousKey = binds[id];
    for (const otherId of conflicting) { binds[otherId] = previousKey; swappedWith.push(labelFor(otherId)); }
    binds[id] = key;
    save(); emit();
    return { ok: true, swappedWith };
  }

  function resetAll() { binds = { ...DEFAULTS }; save(); emit(); }
  function resetOne(id) { if (id in DEFAULTS) { binds[id] = DEFAULTS[id]; save(); emit(); } }

  window.EmberfallKeybinds = {
    ACTIONS, DEFAULTS, PERMANENT_ALIASES,
    get: id => binds[id],
    getAll: () => ({ ...binds }),
    resolve,
    set,
    resetAll,
    resetOne,
  };
})();
