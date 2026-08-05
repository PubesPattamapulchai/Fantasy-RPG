(() => {
  'use strict';

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const TILE = 40;
  const COLS = 16;
  const ROWS = 12;
  const SAVE_KEY = 'emberfall-save-v1';

  const ui = {
    title: document.getElementById('titleScreen'),
    start: document.getElementById('startBtn'),
    continueBtn: document.getElementById('continueBtn'),
    dialogue: document.getElementById('dialogueBox'),
    speaker: document.getElementById('speakerName'),
    dialogueText: document.getElementById('dialogueText'),
    dialogueNext: document.getElementById('dialogueNext'),
    battle: document.getElementById('battleScreen'),
    battleLog: document.getElementById('battleLog'),
    enemyName: document.getElementById('enemyName'),
    enemyHpText: document.getElementById('enemyHpText'),
    enemyHpBar: document.getElementById('enemyHpBar'),
    toast: document.getElementById('toast'),
    log: document.getElementById('adventureLog'),
    sound: document.getElementById('soundBtn'),
    save: document.getElementById('saveBtn'),
    reset: document.getElementById('resetBtn'),
    action: document.getElementById('actionBtn')
  };

  const map = [
    'WWWWWWWWWWWWWWWW',
    'WGGGTTGGGGTTGGGW',
    'WGGGBBGGGGGGGGGW',
    'WGGGBBGGGTTGGGGW',
    'WGGGGGGGGGGGBBGW',
    'WTTGGGGPPGGGBBGW',
    'WGGGGGGPPGGGGGGW',
    'WGGTTGGGGGGTTGGW',
    'WGGGGGGGGGGGGGGW',
    'WGGGWWWGGGTTGGGW',
    'WGGGWWWGGGGGGGGW',
    'WWWWWWWWWWWWWWWW'
  ];

  const world = {
    elder: { x: 4, y: 5, name: 'Elder Mira' },
    blacksmith: { x: 12, y: 8, name: 'Bram' },
    chest: { x: 13, y: 2, opened: false },
    shrine: { x: 8, y: 5 },
    slimes: [
      { id: 1, x: 7, y: 2, defeated: false },
      { id: 2, x: 10, y: 7, defeated: false },
      { id: 3, x: 3, y: 9, defeated: false },
      { id: 4, x: 13, y: 9, defeated: false }
    ]
  };

  const initialState = () => ({
    started: false,
    player: { x: 2, y: 7, hp: 30, maxHp: 30, mp: 10, maxMp: 10, level: 1, exp: 0, nextExp: 30, gold: 0, potions: 1 },
    questStage: 0,
    slimesDefeated: 0,
    logs: [],
    soundOn: true,
    inBattle: false,
    battleEnemy: null,
    dialogueQueue: [],
    activeSlimeId: null
  });

  let state = initialState();
  let audioCtx = null;
  let toastTimer = null;
  let lastMove = 0;

  function tileAt(x, y) {
    return map[y]?.[x] || 'W';
  }

  function isBlocked(x, y) {
    const tile = tileAt(x, y);
    if (tile === 'W' || tile === 'T' || tile === 'B') return true;
    const people = [world.elder, world.blacksmith];
    return people.some(p => p.x === x && p.y === y);
  }

  function beep(freq = 440, duration = 0.06, type = 'square', volume = 0.035) {
    if (!state.soundOn) return;
    try {
      audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.value = volume;
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (_) {}
  }

  function chord(notes) {
    notes.forEach((n, i) => setTimeout(() => beep(n, .08, 'square', .028), i * 70));
  }

  function addLog(text, important = false) {
    state.logs.unshift({ text, important, time: Date.now() });
    state.logs = state.logs.slice(0, 8);
    renderLog();
  }

  function renderLog() {
    ui.log.innerHTML = state.logs.length
      ? state.logs.map(item => `<div class="log-item">${item.important ? '<strong>NEW</strong><br>' : ''}${escapeHtml(item.text)}</div>`).join('')
      : '<div class="log-item">Your story begins in Moonmere...</div>';
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
  }

  function showToast(message) {
    ui.toast.textContent = message;
    ui.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => ui.toast.classList.remove('show'), 1800);
  }

  function questText() {
    if (state.questStage === 0) return 'Speak to Elder Mira.';
    if (state.questStage === 1) return `Defeat 3 Moss Slimes (${state.slimesDefeated}/3).`;
    if (state.questStage === 2) return 'Return to Elder Mira.';
    return 'Moonmere is safe. Explore freely!';
  }

  function updateHud() {
    const p = state.player;
    document.getElementById('levelText').textContent = p.level;
    document.getElementById('hpText').textContent = `${p.hp} / ${p.maxHp}`;
    document.getElementById('mpText').textContent = `${p.mp} / ${p.maxMp}`;
    document.getElementById('expText').textContent = `${p.exp} / ${p.nextExp}`;
    document.getElementById('goldText').textContent = p.gold;
    document.getElementById('potionText').textContent = p.potions;
    document.getElementById('questText').textContent = questText();
    document.getElementById('hpBar').style.width = `${Math.max(0, p.hp / p.maxHp * 100)}%`;
    document.getElementById('mpBar').style.width = `${Math.max(0, p.mp / p.maxMp * 100)}%`;
    document.getElementById('expBar').style.width = `${Math.max(0, p.exp / p.nextExp * 100)}%`;
    ui.continueBtn.disabled = !localStorage.getItem(SAVE_KEY);
    ui.continueBtn.style.opacity = ui.continueBtn.disabled ? '.45' : '1';
  }

  function drawTile(x, y, tile) {
    const px = x * TILE;
    const py = y * TILE;
    if (tile === 'W') {
      ctx.fillStyle = '#1d5c78'; ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = '#2a7791';
      ctx.fillRect(px + 4, py + 9, 12, 3); ctx.fillRect(px + 22, py + 25, 14, 3);
      return;
    }
    ctx.fillStyle = (x + y) % 2 ? '#4f9d45' : '#559f48';
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = '#76b95e';
    ctx.fillRect(px + ((x * 7 + y * 3) % 28), py + ((x * 5 + y * 11) % 28), 4, 5);
    if (tile === 'T') drawTree(px, py);
    if (tile === 'B') drawHouse(px, py);
    if (tile === 'P') {
      ctx.fillStyle = '#8d8a78'; ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = '#aaa58f'; ctx.fillRect(px + 3, py + 5, 15, 4); ctx.fillRect(px + 24, py + 26, 12, 4);
    }
  }

  function drawTree(px, py) {
    ctx.fillStyle = '#5b351e'; ctx.fillRect(px + 17, py + 22, 7, 16);
    ctx.fillStyle = '#1f6538'; ctx.fillRect(px + 7, py + 10, 26, 18);
    ctx.fillStyle = '#2f8244'; ctx.fillRect(px + 11, py + 5, 18, 12);
    ctx.fillStyle = '#59a84f'; ctx.fillRect(px + 12, py + 8, 7, 6);
  }

  function drawHouse(px, py) {
    ctx.fillStyle = '#6b3d2b'; ctx.fillRect(px + 3, py + 15, 34, 22);
    ctx.fillStyle = '#b45f36'; ctx.beginPath(); ctx.moveTo(px, py + 17); ctx.lineTo(px + 20, py + 2); ctx.lineTo(px + 40, py + 17); ctx.fill();
    ctx.fillStyle = '#2a1e1c'; ctx.fillRect(px + 17, py + 24, 8, 13);
    ctx.fillStyle = '#f2cf67'; ctx.fillRect(px + 7, py + 23, 6, 6);
  }

  function drawCharacter(x, y, colors, facing = 'down') {
    const px = x * TILE + 10;
    const py = y * TILE + 5;
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(px + 4, py + 29, 20, 5);
    ctx.fillStyle = colors.hair; ctx.fillRect(px + 6, py, 16, 10); ctx.fillRect(px + 3, py + 6, 22, 8);
    ctx.fillStyle = colors.skin; ctx.fillRect(px + 6, py + 10, 16, 10);
    ctx.fillStyle = '#172033';
    if (facing === 'left') ctx.fillRect(px + 7, py + 13, 3, 3);
    else if (facing === 'right') ctx.fillRect(px + 18, py + 13, 3, 3);
    else { ctx.fillRect(px + 8, py + 13, 3, 3); ctx.fillRect(px + 17, py + 13, 3, 3); }
    ctx.fillStyle = colors.body; ctx.fillRect(px + 4, py + 20, 20, 11);
    ctx.fillStyle = colors.accent; ctx.fillRect(px + 4, py + 20, 20, 4);
    ctx.fillStyle = '#2b2631'; ctx.fillRect(px + 6, py + 31, 6, 4); ctx.fillRect(px + 16, py + 31, 6, 4);
  }

  function drawSlime(slime) {
    if (slime.defeated) return;
    const px = slime.x * TILE + 8;
    const py = slime.y * TILE + 12;
    const pulse = Math.floor(Date.now() / 350) % 2;
    ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(px + 3, py + 20, 22, 5);
    ctx.fillStyle = pulse ? '#75cf61' : '#6ac75a';
    ctx.fillRect(px + 4, py + 4, 20, 18); ctx.fillRect(px, py + 10, 28, 12);
    ctx.fillStyle = '#a1ed79'; ctx.fillRect(px + 7, py + 6, 6, 4);
    ctx.fillStyle = '#15331d'; ctx.fillRect(px + 7, py + 13, 4, 4); ctx.fillRect(px + 18, py + 13, 4, 4);
  }

  function drawChest() {
    const c = world.chest;
    const px = c.x * TILE + 7, py = c.y * TILE + 10;
    ctx.fillStyle = c.opened ? '#5d4323' : '#8b5b22'; ctx.fillRect(px, py + 8, 26, 16);
    ctx.fillStyle = '#d69b33'; ctx.fillRect(px, py + (c.opened ? 2 : 3), 26, 9);
    ctx.fillStyle = '#f3cd55'; ctx.fillRect(px + 11, py + 10, 5, 8);
    if (c.opened) { ctx.fillStyle = '#17131a'; ctx.fillRect(px + 3, py, 20, 5); }
  }

  function drawShrine() {
    const { x, y } = world.shrine;
    const px = x * TILE, py = y * TILE;
    ctx.fillStyle = '#687285'; ctx.fillRect(px + 12, py + 12, 16, 22);
    ctx.fillStyle = '#95a3b9'; ctx.fillRect(px + 8, py + 31, 24, 6);
    ctx.fillStyle = '#4fd7ff'; ctx.fillRect(px + 17, py + 6, 6, 12);
    ctx.fillStyle = `rgba(79,215,255,${.25 + Math.sin(Date.now()/300)*.1})`; ctx.fillRect(px + 11, py, 18, 24);
  }

  function drawWorld() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) drawTile(x, y, map[y][x]);
    drawShrine();
    drawChest();
    world.slimes.forEach(drawSlime);
    drawCharacter(world.elder.x, world.elder.y, { hair: '#d9d4d8', skin: '#efb988', body: '#684b89', accent: '#ce8bea' });
    drawCharacter(world.blacksmith.x, world.blacksmith.y, { hair: '#4c271b', skin: '#c9865b', body: '#553c31', accent: '#c95e3c' });
    drawCharacter(state.player.x, state.player.y, { hair: '#60351f', skin: '#f0b27b', body: '#2d67bd', accent: '#55b2f4' }, state.player.facing);
    drawLocationLabels();
  }

  function drawLocationLabels() {
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(6,10,18,.82)'; ctx.fillRect(60, 42, 120, 20);
    ctx.fillStyle = '#f6c453'; ctx.fillText('MOONMERE VILLAGE', 120, 56);
    ctx.fillStyle = 'rgba(6,10,18,.72)'; ctx.fillRect(292, 188, 56, 16);
    ctx.fillStyle = '#74d9ff'; ctx.fillText('SHRINE', 320, 200);
  }

  function animate() {
    if (state.started && !state.inBattle) drawWorld();
    requestAnimationFrame(animate);
  }

  function startNewGame() {
    state = initialState();
    state.started = true;
    world.chest.opened = false;
    world.slimes.forEach(s => s.defeated = false);
    ui.title.classList.add('hidden');
    addLog('You arrive in Moonmere beneath a sky stained gold.', true);
    addLog('Find Elder Mira near the village square.');
    updateHud();
    drawWorld();
    chord([330, 440, 660]);
  }

  function saveGame(silent = false) {
    if (!state.started) return;
    const save = {
      state: { ...state, dialogueQueue: [], inBattle: false, battleEnemy: null },
      world: { chestOpened: world.chest.opened, defeated: world.slimes.map(s => s.defeated) }
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    updateHud();
    if (!silent) { showToast('ADVENTURE SAVED'); beep(660); }
  }

  function loadGame() {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    try {
      const save = JSON.parse(raw);
      state = { ...initialState(), ...save.state, started: true, inBattle: false, battleEnemy: null, dialogueQueue: [] };
      world.chest.opened = !!save.world?.chestOpened;
      world.slimes.forEach((s, i) => s.defeated = !!save.world?.defeated?.[i]);
      ui.title.classList.add('hidden');
      ui.dialogue.classList.add('hidden');
      ui.battle.classList.add('hidden');
      addLog('Your adventure continues.', true);
      updateHud();
      drawWorld();
      chord([440, 554, 660]);
    } catch (_) {
      localStorage.removeItem(SAVE_KEY);
      showToast('SAVE FILE WAS CORRUPT');
    }
  }

  function resetGame() {
    if (!confirm('Erase your local Emberfall save and restart?')) return;
    localStorage.removeItem(SAVE_KEY);
    state = initialState();
    world.chest.opened = false;
    world.slimes.forEach(s => s.defeated = false);
    ui.title.classList.remove('hidden');
    ui.dialogue.classList.add('hidden');
    ui.battle.classList.add('hidden');
    renderLog();
    updateHud();
  }

  function move(dx, dy) {
    if (!state.started || state.inBattle || !ui.dialogue.classList.contains('hidden')) return;
    const now = Date.now();
    if (now - lastMove < 85) return;
    lastMove = now;
    const nx = state.player.x + dx, ny = state.player.y + dy;
    state.player.facing = dx < 0 ? 'left' : dx > 0 ? 'right' : dy < 0 ? 'up' : 'down';
    if (isBlocked(nx, ny)) { beep(100, .04, 'square', .02); return; }
    state.player.x = nx; state.player.y = ny;
    beep(150 + ((nx + ny) % 2) * 25, .025, 'square', .015);
    checkTile();
  }

  function checkTile() {
    const slime = world.slimes.find(s => !s.defeated && s.x === state.player.x && s.y === state.player.y);
    if (slime) startBattle(slime);
    const shrine = world.shrine;
    if (state.player.x === shrine.x && state.player.y === shrine.y) {
      state.player.hp = state.player.maxHp;
      state.player.mp = state.player.maxMp;
      showToast('THE SHRINE RESTORES YOU');
      addLog('The ancient shrine restores your strength.');
      chord([392, 523, 659]);
      updateHud();
    }
  }

  function interact() {
    if (!state.started) return;
    if (!ui.dialogue.classList.contains('hidden')) { nextDialogue(); return; }
    if (state.inBattle) return;
    const targets = [
      { ...world.elder, type: 'elder' },
      { ...world.blacksmith, type: 'blacksmith' },
      { ...world.chest, type: 'chest' }
    ];
    const near = targets.find(t => Math.abs(t.x - state.player.x) + Math.abs(t.y - state.player.y) <= 1);
    if (!near) { showToast('NOTHING TO INTERACT WITH'); beep(110); return; }
    if (near.type === 'elder') talkToElder();
    if (near.type === 'blacksmith') talkToBlacksmith();
    if (near.type === 'chest') openChest();
  }

  function queueDialogue(speaker, lines) {
    state.dialogueQueue = lines.map(text => ({ speaker, text }));
    ui.dialogue.classList.remove('hidden');
    nextDialogue();
  }

  function nextDialogue() {
    const line = state.dialogueQueue.shift();
    if (!line) { ui.dialogue.classList.add('hidden'); return; }
    ui.speaker.textContent = line.speaker.toUpperCase();
    ui.dialogueText.textContent = line.text;
    beep(260, .045, 'square', .02);
  }

  function talkToElder() {
    if (state.questStage === 0) {
      state.questStage = 1;
      addLog('Quest accepted: Green Trouble.', true);
      queueDialogue('Elder Mira', [
        'Rowan, the Moss Slimes have crept too close to Moonmere.',
        'Defeat three of them, then return. The village will remember your courage.'
      ]);
    } else if (state.questStage === 1) {
      queueDialogue('Elder Mira', [`The wilds are still restless. You have defeated ${state.slimesDefeated} of 3 slimes.`]);
    } else if (state.questStage === 2) {
      state.questStage = 3;
      state.player.gold += 50;
      state.player.potions += 2;
      gainExp(35);
      addLog('Quest complete! Received 50 gold and 2 potions.', true);
      queueDialogue('Elder Mira', [
        'The paths are safe again. Moonmere owes you a great debt.',
        'Take this reward—and know that your adventure has only begun.'
      ]);
      chord([523, 659, 784, 1047]);
    } else {
      queueDialogue('Elder Mira', ['The dawn feels brighter since you came to Moonmere.']);
    }
    updateHud();
  }

  function talkToBlacksmith() {
    if (state.player.gold >= 20 && state.player.maxHp < 42) {
      state.player.gold -= 20;
      state.player.maxHp += 6;
      state.player.hp = state.player.maxHp;
      addLog('Bram reinforced your armor. Max HP increased!', true);
      queueDialogue('Bram', ['Twenty gold buys good steel. Your armor will turn a stronger blow now.']);
      chord([220, 330, 440]);
    } else if (state.player.maxHp >= 42) {
      queueDialogue('Bram', ['That armor is as strong as I can make it. Wear it proudly.']);
    } else {
      queueDialogue('Bram', ['Bring me 20 gold and I will reinforce your armor.']);
    }
    updateHud();
  }

  function openChest() {
    if (world.chest.opened) { queueDialogue('Old Chest', ['Only dust and a faded map remain.']); return; }
    world.chest.opened = true;
    state.player.gold += 25;
    state.player.potions += 1;
    addLog('Found 25 gold and a potion in an old chest!', true);
    queueDialogue('Treasure Chest', ['You found 25 gold and a sparkling red potion!']);
    chord([659, 784, 988]);
    updateHud();
  }

  function startBattle(slime) {
    state.inBattle = true;
    state.activeSlimeId = slime.id;
    const levelScale = Math.max(0, state.player.level - 1);
    state.battleEnemy = { name: 'Moss Slime', hp: 18 + levelScale * 4, maxHp: 18 + levelScale * 4, attack: 4 + levelScale };
    ui.battle.classList.remove('hidden');
    ui.battleLog.textContent = 'A wild Moss Slime jiggles into your path!';
    updateBattleUi();
    chord([196, 185, 174]);
  }

  function updateBattleUi() {
    const e = state.battleEnemy;
    if (!e) return;
    ui.enemyName.textContent = e.name.toUpperCase();
    ui.enemyHpText.textContent = `${Math.max(0, e.hp)} / ${e.maxHp} HP`;
    ui.enemyHpBar.style.width = `${Math.max(0, e.hp / e.maxHp * 100)}%`;
    updateHud();
  }

  function battleAction(action) {
    if (!state.inBattle || !state.battleEnemy) return;
    const p = state.player;
    const e = state.battleEnemy;
    let playerActed = false;

    if (action === 'attack') {
      const damage = 6 + Math.floor(Math.random() * 5) + p.level * 2;
      e.hp -= damage;
      ui.battleLog.textContent = `You slash the ${e.name} for ${damage} damage.`;
      beep(130, .08, 'sawtooth', .04);
      playerActed = true;
    }
    if (action === 'spell') {
      if (p.mp < 3) { ui.battleLog.textContent = 'Not enough MP to cast Ember.'; beep(90); return; }
      p.mp -= 3;
      const damage = 10 + Math.floor(Math.random() * 6) + p.level * 2;
      e.hp -= damage;
      ui.battleLog.textContent = `Ember bursts for ${damage} magic damage!`;
      chord([392, 523, 784]);
      playerActed = true;
    }
    if (action === 'potion') {
      if (p.potions < 1) { ui.battleLog.textContent = 'Your potion pouch is empty.'; beep(90); return; }
      p.potions -= 1;
      const healed = Math.min(16, p.maxHp - p.hp);
      p.hp += healed;
      ui.battleLog.textContent = `You recover ${healed} HP.`;
      chord([523, 659]);
      playerActed = true;
    }
    if (action === 'run') {
      if (Math.random() < .65) {
        ui.battleLog.textContent = 'You escape safely.';
        setTimeout(endBattle, 450);
        beep(500);
        return;
      }
      ui.battleLog.textContent = 'You could not escape!';
      playerActed = true;
    }

    updateBattleUi();
    if (e.hp <= 0) { setTimeout(victory, 450); return; }
    if (playerActed) setTimeout(enemyTurn, 520);
  }

  function enemyTurn() {
    if (!state.inBattle || !state.battleEnemy) return;
    const damage = Math.max(1, state.battleEnemy.attack + Math.floor(Math.random() * 3) - Math.floor(state.player.level / 2));
    state.player.hp -= damage;
    ui.battleLog.textContent = `The ${state.battleEnemy.name} bumps you for ${damage} damage.`;
    beep(80, .12, 'square', .04);
    updateBattleUi();
    if (state.player.hp <= 0) setTimeout(defeat, 500);
  }

  function victory() {
    const slime = world.slimes.find(s => s.id === state.activeSlimeId);
    if (slime && !slime.defeated) {
      slime.defeated = true;
      state.slimesDefeated += 1;
    }
    const gold = 7 + Math.floor(Math.random() * 7);
    state.player.gold += gold;
    gainExp(12);
    addLog(`Defeated a Moss Slime. Gained ${gold} gold and 12 EXP.`);
    if (state.questStage === 1 && state.slimesDefeated >= 3) {
      state.questStage = 2;
      addLog('Return to Elder Mira for your reward.', true);
    }
    ui.battleLog.textContent = `Victory! You gain ${gold} gold and 12 EXP.`;
    chord([392, 523, 659, 784]);
    updateBattleUi();
    setTimeout(endBattle, 900);
  }

  function defeat() {
    state.player.hp = state.player.maxHp;
    state.player.mp = state.player.maxMp;
    state.player.gold = Math.max(0, state.player.gold - 10);
    state.player.x = 8; state.player.y = 6;
    ui.battleLog.textContent = 'The shrine pulls you back from defeat...';
    addLog('You awaken at the shrine. Ten gold was lost.');
    setTimeout(endBattle, 900);
  }

  function endBattle() {
    state.inBattle = false;
    state.battleEnemy = null;
    state.activeSlimeId = null;
    ui.battle.classList.add('hidden');
    updateHud();
    saveGame(true);
  }

  function gainExp(amount) {
    const p = state.player;
    p.exp += amount;
    while (p.exp >= p.nextExp) {
      p.exp -= p.nextExp;
      p.level += 1;
      p.nextExp = Math.floor(p.nextExp * 1.35);
      p.maxHp += 6; p.hp = p.maxHp;
      p.maxMp += 3; p.mp = p.maxMp;
      addLog(`Level up! Rowan reached level ${p.level}.`, true);
      showToast(`LEVEL ${p.level}!`);
      chord([523, 659, 784, 1047]);
    }
    updateHud();
  }

  document.addEventListener('keydown', event => {
    const key = event.key.toLowerCase();
    const handled = ['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d',' ','enter','m'].includes(key);
    if (handled) event.preventDefault();
    if (key === 'arrowup' || key === 'w') move(0, -1);
    if (key === 'arrowdown' || key === 's') move(0, 1);
    if (key === 'arrowleft' || key === 'a') move(-1, 0);
    if (key === 'arrowright' || key === 'd') move(1, 0);
    if (key === ' ' || key === 'enter') interact();
    if (key === 'm') toggleSound();
  });

  document.querySelectorAll('[data-move]').forEach(btn => {
    btn.addEventListener('pointerdown', () => {
      const directions = { up: [0,-1], down: [0,1], left: [-1,0], right: [1,0] };
      move(...directions[btn.dataset.move]);
    });
  });
  document.querySelectorAll('[data-action]').forEach(btn => btn.addEventListener('click', () => battleAction(btn.dataset.action)));

  function toggleSound() {
    state.soundOn = !state.soundOn;
    ui.sound.textContent = state.soundOn ? '♪ SOUND' : '× MUTED';
    ui.sound.setAttribute('aria-pressed', String(state.soundOn));
    if (state.soundOn) beep(660);
  }

  ui.start.addEventListener('click', startNewGame);
  ui.continueBtn.addEventListener('click', loadGame);
  ui.dialogueNext.addEventListener('click', nextDialogue);
  ui.action.addEventListener('click', interact);
  ui.sound.addEventListener('click', toggleSound);
  ui.save.addEventListener('click', () => saveGame(false));
  ui.reset.addEventListener('click', resetGame);
  window.addEventListener('beforeunload', () => state.started && saveGame(true));

  updateHud();
  renderLog();
  animate();
})();
