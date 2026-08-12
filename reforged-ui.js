(() => {
  'use strict';
  const PREF_KEY = 'emberfall-ui-prefs-v1';
  const defaults = {
    guide: true, reducedMotion: false, largeText: false, highContrast: false, compactHud: false,
    // Display & performance additions (§35, §36, §38-40 of the PC polish pass).
    uiScale: 100, brightness: 100, shakeIntensity: 100, effectsIntensity: 100, fpsCap: 'uncapped',
    windowMode: 'windowed', resolution: 'current',
  };
  let prefs = defaults;
  try { prefs = { ...defaults, ...(JSON.parse(localStorage.getItem(PREF_KEY) || '{}')) }; } catch (_) {}

  // Read-only bridge so game.js (shake magnitude) and renderer2d-v14.js (particle count, frame
  // cap) can pick up these prefs without re-parsing localStorage every frame. `get` always
  // reflects the live `prefs` reference, even after later reassignment below.
  window.EmberfallPrefs = {
    get: k => prefs[k], getAll: () => ({ ...prefs }),
    // Each render loop calls this once to get its OWN independent limiter closure — game.js's
    // legacy loop and renderer2d-v14.js's canvas loop are separate rAF chains and must not share
    // one throttle clock, or throttling one would desync the other's own delta-time math.
    makeFrameLimiter: () => {
      let last = 0;
      return now => {
        const cap = prefs.fpsCap;
        if (!cap || cap === 'uncapped') return true;
        const interval = 1000 / Number(cap);
        if (now - last < interval) return false;
        last = now; return true;
      };
    },
  };

  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const make = (html) => { const t=document.createElement('template'); t.innerHTML=html.trim(); return t.content.firstElementChild; };

  const hud = $('.hud-panel');
  if (hud && !$('#huntText')) {
    const materials = $('.material-grid', hud);
    const quick = make('<div class="quick-status-card" aria-label="Quick progression status"><span>HUNT <strong id="huntText">x0</strong></span><span>GEAR <strong id="gearPowerText">0</strong></span><span>GUIDE <strong id="guideModeText">ON</strong></span></div>');
    materials ? hud.insertBefore(quick, materials) : hud.appendChild(quick);
  }

  const rules = $('.combat-rules-row');
  if (rules && !$('#huntBattleText')) rules.appendChild(make('<span id="huntBattleText" class="hunt-chip">HUNT x0</span>'));
  if (rules && !$('#combatCoach')) rules.insertAdjacentElement('afterend', make('<div id="combatCoach" class="combat-coach" aria-live="polite"><small>TACTICAL GUIDE</small><strong>READING THE FIELD...</strong><span>Recommendations are optional and can be disabled in Options.</span></div>'));

  const battleTip = $('.battle-tip');
  if (battleTip && !$('#actionInspector')) battleTip.insertAdjacentElement('beforebegin', make('<div id="actionInspector" class="action-inspector"><small>ACTION INFO</small><strong>Choose an action</strong><span>Hover, focus, or tap an action to see what it does and why it may help.</span></div>'));

  const header = $('.header-actions');
  if (header && !$('#settingsBtn')) {
    const btn=make('<button id="settingsBtn" class="pixel-button compact settings-button" type="button">OPTIONS</button>');
    const reset=$('#resetBtn'); reset ? header.insertBefore(btn, reset) : header.appendChild(btn);
  }
  const mobileRow=$('.mobile-utility-row');
  if (mobileRow && !$('#mobileOptionsBtn')) mobileRow.appendChild(make('<button id="mobileOptionsBtn" class="utility-key" type="button">OPTIONS</button>'));

  // ---- Display & Performance controls (§35, §36, §38-39) ----------------------------------
  const isElectron = !!(window.emberfallDesktop && window.emberfallDesktop.isElectron);
  const RESOLUTIONS = [
    { id: '1280x720', label: '1280 × 720', w: 1280, h: 720 },
    { id: '1366x768', label: '1366 × 768', w: 1366, h: 768 },
    { id: '1600x900', label: '1600 × 900', w: 1600, h: 900 },
    { id: '1920x1080', label: '1920 × 1080', w: 1920, h: 1080 },
    { id: '2560x1440', label: '2560 × 1440', w: 2560, h: 1440 },
  ];
  const sliderHtml = (pref, label, desc, min, max, step) => `
    <div class="setting-card setting-slider" data-slider="${pref}">
      <span><strong>${label}</strong><small>${desc}</small></span>
      <input type="range" min="${min}" max="${max}" step="${step}" value="${prefs[pref]}" aria-label="${label}">
      <b>${prefs[pref]}%</b>
    </div>`;
  const selectHtml = (pref, label, desc, options, electronOnly) => `
    <div class="setting-card setting-select${electronOnly ? ' electron-only' : ''}" data-select="${pref}">
      <span><strong>${label}</strong><small>${desc}</small></span>
      <select aria-label="${label}">${options.map(o=>`<option value="${o.id}">${o.label}</option>`).join('')}</select>
    </div>`;

  const screen=$('.screen-wrap');
  if (screen && !$('#settingsScreen')) screen.appendChild(make(`
    <section id="settingsScreen" class="overlay menu-overlay hidden settings-overlay" aria-label="Game options">
      <div class="menu-window settings-window">
        <div class="menu-header"><div><p class="eyebrow">PLAYER-FIRST OPTIONS</p><h2>OPTIONS</h2></div><button id="settingsCloseBtn" class="pixel-button compact" type="button">CLOSE</button></div>
        <p class="menu-copy">These options change presentation only. Combat balance and story progress are not affected.</p>
        <h3 class="settings-subhead">ACCESSIBILITY &amp; UI</h3>
        <div class="settings-grid">
          <button class="setting-card" data-pref="guide" type="button"><span><strong>TACTICAL GUIDE</strong><small>Highlights a useful response to enemy intent.</small></span><b>ON</b></button>
          <button class="setting-card" data-pref="reducedMotion" type="button"><span><strong>REDUCED MOTION</strong><small>Reduces shakes, flashes, scanlines, and looping effects.</small></span><b>OFF</b></button>
          <button class="setting-card" data-pref="largeText" type="button"><span><strong>LARGE TEXT</strong><small>Increases menu, dialogue, and battle readability.</small></span><b>OFF</b></button>
          <button class="setting-card" data-pref="highContrast" type="button"><span><strong>HIGH CONTRAST</strong><small>Strengthens borders, danger labels, and focus states.</small></span><b>OFF</b></button>
          <button class="setting-card" data-pref="compactHud" type="button"><span><strong>COMPACT HUD</strong><small>Hides secondary map/material information on the side panels.</small></span><b>OFF</b></button>
        </div>
        <div class="settings-help"><strong>QUICK COMBAT READ</strong><span>Red = incoming danger · Gold = recommended action · Blue = defense/position · Purple = party/build tools. The guide suggests choices but never makes them for you.</span></div>

        <h3 class="settings-subhead">DISPLAY &amp; PERFORMANCE</h3>
        <div class="settings-grid">
          ${sliderHtml('uiScale','UI SCALE','Resizes menus, HUD, and text.',85,125,5)}
          ${sliderHtml('brightness','BRIGHTNESS','Adjusts overall screen brightness.',70,130,5)}
          ${sliderHtml('shakeIntensity','SCREEN SHAKE','Scales camera shake on hits and ultimates.',0,150,10)}
          ${sliderHtml('effectsIntensity','EFFECTS INTENSITY','Scales particle bursts and impact FX.',0,150,10)}
          ${selectHtml('fpsCap','FRAME RATE CAP','Caps rendering rate to reduce GPU usage.',[{id:'uncapped',label:'UNCAPPED'},{id:'30',label:'30 FPS'},{id:'60',label:'60 FPS'},{id:'120',label:'120 FPS'}])}
          ${selectHtml('windowMode','WINDOW MODE','Windowed, borderless, or fullscreen.',[{id:'windowed',label:'WINDOWED'},{id:'borderless',label:'BORDERLESS FULLSCREEN'},{id:'fullscreen',label:'FULLSCREEN'}],true)}
          ${selectHtml('resolution','RESOLUTION','Applies a window size (switches to Windowed).',[{id:'current',label:'KEEP CURRENT'},...RESOLUTIONS],true)}
        </div>
        <p class="menu-copy browser-only">Window mode and resolution need the desktop app — unavailable in a plain browser tab.</p>

        <h3 class="settings-subhead">CONTROLS <button id="keybindResetBtn" class="pixel-button compact" type="button">RESET ALL</button></h3>
        <p class="menu-copy">Click REBIND, then press the key you want. Arrow keys and Enter always work for movement/confirm alongside whatever you bind here. Escape can’t be rebound.</p>
        <div id="rebindList" class="rebind-list"></div>
      </div>
    </section>`));

  if (!isElectron) $$('.electron-only').forEach(el => el.classList.add('hidden'));
  if (isElectron) $$('.browser-only').forEach(el => el.classList.add('hidden'));

  function applySlider(el) {
    const pref = el.dataset.slider, input = $('input', el), badge = $('b', el);
    input.value = prefs[pref]; badge.textContent = `${prefs[pref]}%`;
  }
  function applySelect(el) {
    const pref = el.dataset.select, select = $('select', el);
    if (select) select.value = String(prefs[pref]);
  }

  function applyDisplayPerf() {
    const scale = clamp(prefs.uiScale, 85, 125) / 100;
    // `zoom` (not `transform`) so layout, hit-testing, and pointer coordinates all stay correct
    // after scaling — see PC_POLISH_ROADMAP.md Phase 2's mouse/tooltip re-verification note.
    document.body.style.zoom = String(scale);
    if (screen) screen.style.filter = `brightness(${clamp(prefs.brightness, 70, 130) / 100})`;
    $$('.setting-slider').forEach(applySlider);
    $$('.setting-select').forEach(applySelect);
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, Number(v) || 0)); }

  function applyPrefs() {
    document.body.classList.toggle('pref-guide-off', !prefs.guide);
    document.body.classList.toggle('pref-reduced-motion', !!prefs.reducedMotion);
    document.body.classList.toggle('pref-large-text', !!prefs.largeText);
    document.body.classList.toggle('pref-high-contrast', !!prefs.highContrast);
    document.body.classList.toggle('pref-compact-hud', !!prefs.compactHud);
    const guide=$('#guideModeText'); if(guide) guide.textContent=prefs.guide?'ON':'OFF';
    document.querySelectorAll('[data-pref]').forEach(btn=>{
      const on=!!prefs[btn.dataset.pref]; btn.classList.toggle('enabled',on); btn.setAttribute('aria-pressed',String(on));
      const state=btn.querySelector('b'); if(state) state.textContent=on?'ON':'OFF';
    });
    applyDisplayPerf();
    try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch (_) {}
    window.dispatchEvent(new CustomEvent('emberfall:prefschange', { detail: { ...prefs } }));
  }
  function openOptions(){ $('#settingsScreen')?.classList.remove('hidden'); }
  function closeOptions(){ $('#settingsScreen')?.classList.add('hidden'); }
  $('#settingsBtn')?.addEventListener('click',openOptions); $('#mobileOptionsBtn')?.addEventListener('click',openOptions); $('#settingsCloseBtn')?.addEventListener('click',closeOptions);
  document.querySelectorAll('[data-pref]').forEach(btn=>btn.addEventListener('click',()=>{ prefs={...prefs,[btn.dataset.pref]:!prefs[btn.dataset.pref]}; applyPrefs(); }));

  $$('.setting-slider').forEach(el => {
    $('input', el).addEventListener('input', e => { prefs = { ...prefs, [el.dataset.slider]: Number(e.target.value) }; applyPrefs(); });
  });
  $$('.setting-select').forEach(el => {
    $('select', el).addEventListener('change', e => {
      const pref = el.dataset.select, value = e.target.value;
      prefs = { ...prefs, [pref]: value };
      applyPrefs();
      if (!isElectron) return;
      if (pref === 'windowMode') window.emberfallDesktop.setWindowMode(value);
      if (pref === 'resolution' && value !== 'current') {
        const r = RESOLUTIONS.find(r => r.id === value);
        if (r) { prefs = { ...prefs, windowMode: 'windowed' }; applyPrefs(); window.emberfallDesktop.setWindowMode('windowed'); window.emberfallDesktop.setResolution(r.w, r.h); }
      }
    });
  });
  // Re-apply the saved window mode/resolution on launch so they persist across restarts, same
  // as every other pref here — matches Phase 2's exit criterion.
  if (isElectron) {
    if (prefs.windowMode && prefs.windowMode !== 'windowed') window.emberfallDesktop.setWindowMode(prefs.windowMode);
    else if (prefs.resolution && prefs.resolution !== 'current') { const r = RESOLUTIONS.find(r => r.id === prefs.resolution); if (r) window.emberfallDesktop.setResolution(r.w, r.h); }
  }

  document.addEventListener('keydown',e=>{ if(e.key.toLowerCase()==='o' && !e.ctrlKey && !e.metaKey){ e.preventDefault(); $('#settingsScreen')?.classList.toggle('hidden'); } if(e.key==='Escape' && !$('#settingsScreen')?.classList.contains('hidden')) closeOptions(); });

  const info={attack:'Timed weapon attack. Better timing increases damage, stagger, and Momentum.',skill1:'Job Skill I. Costs MP and uses your class identity.',skill2:'Job Skill II. Stronger MP skill with damage, healing, or status effects.',weaponTechnique:'Weapon-specific active technique. Costs Stamina and has a short cooldown.',guard:'Recover MP and Stamina, build Ward, and reduce incoming damage.',dodge:'Spend Stamina to shift range and attempt to evade the next hit.',parry:'Spend Stamina to counter a readable incoming attack.',execute:'Spend Momentum on a finisher against wounded, staggered, or broken enemies.',potion:'Consume a potion to restore HP.',bomb:'Consume a Crown Bomb for strong fire damage and stagger.',burst:'Spend full Momentum on your job-specific ultimate.',tactic:'Cycle stance to trade offense, defense, and critical chance.',inspire:'Spend Inspiration to gain advantage on the next weapon attack.',companion:'Call your companion. At Bond 20+ and 70 Momentum this becomes a stronger Covenant Surge.',reaction:'Ready your unique class reaction for the next incoming attack.',position:'Cycle CLOSE / MID / FAR range. Weapon and enemy effectiveness change with distance.',environment:'Use the battlefield feature once for damage, control, healing, or resources.',partyTactic:'Cycle Assault / Guardian / Support companion doctrine.'};
  document.querySelectorAll('[data-action]').forEach(btn=>{
    const text=info[btn.dataset.action]; if(text){btn.title=text;btn.setAttribute('aria-description',text);}
    const show=()=>{const box=$('#actionInspector');if(!box||!text)return;box.innerHTML=`<small>ACTION INFO</small><strong>${btn.textContent.trim()}</strong><span>${text}</span>`;};
    btn.addEventListener('pointerenter',show);btn.addEventListener('focus',show);btn.addEventListener('pointerdown',show);
  });

  // ---- Control rebinding UI ----------------------------------------------------------------
  const KEY_LABELS = { ' ': 'SPACE', arrowup: '↑', arrowdown: '↓', arrowleft: '←', arrowright: '→', enter: 'ENTER' };
  const keyLabel = k => KEY_LABELS[k] || String(k || '').toUpperCase();
  let listeningFor = null;

  function renderRebindList() {
    const list = $('#rebindList'); if (!list || !window.EmberfallKeybinds) return;
    const groups = {};
    window.EmberfallKeybinds.ACTIONS.forEach(a => { (groups[a.group] ||= []).push(a); });
    list.innerHTML = Object.entries(groups).map(([group, actions]) => `
      <div class="rebind-group">
        <h4>${group}</h4>
        ${actions.map(a => `
          <div class="rebind-row" data-action="${a.id}">
            <span>${a.label}</span>
            <b class="rebind-key">${listeningFor === a.id ? 'PRESS A KEY…' : keyLabel(window.EmberfallKeybinds.get(a.id))}</b>
            <button class="pixel-button compact" type="button" data-rebind="${a.id}">${listeningFor === a.id ? 'CANCEL' : 'REBIND'}</button>
          </div>`).join('')}
      </div>`).join('');
    list.querySelectorAll('[data-rebind]').forEach(btn => btn.addEventListener('click', () => {
      listeningFor = listeningFor === btn.dataset.rebind ? null : btn.dataset.rebind;
      renderRebindList();
    }));
  }
  $('#keybindResetBtn')?.addEventListener('click', () => { window.EmberfallKeybinds?.resetAll(); listeningFor = null; renderRebindList(); });
  window.addEventListener('emberfall:keybindschange', renderRebindList);

  // Capture phase fires before ANY bubble-phase listener anywhere (including game.js's, no
  // matter script load order), so while a rebind is being captured this consumes the keystroke
  // via stopImmediatePropagation and the game never sees it as a move/attack/etc — pressing "1"
  // to rebind Attack won't also swing Attack.
  let toastTimer = null;
  function showToastLocal(text) {
    const toast = $('#toast'); if (!toast) return;
    toast.textContent = text; toast.classList.add('show'); clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }
  document.addEventListener('keydown', e => {
    if (!listeningFor) return;
    e.preventDefault(); e.stopImmediatePropagation();
    const key = e.key.toLowerCase();
    if (key === 'escape') { listeningFor = null; renderRebindList(); return; }
    const result = window.EmberfallKeybinds?.set(listeningFor, key);
    listeningFor = null;
    if (result?.ok && result.swappedWith?.length) showToastLocal(`SWAPPED WITH ${result.swappedWith.join(', ').toUpperCase()}`);
    renderRebindList();
  }, true);

  applyPrefs();
  renderRebindList();
})();
