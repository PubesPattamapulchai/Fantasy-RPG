(() => {
  'use strict';
  const PREF_KEY = 'emberfall-ui-prefs-v1';
  const defaults = { guide: true, reducedMotion: false, largeText: false, highContrast: false, compactHud: false };
  let prefs = defaults;
  try { prefs = { ...defaults, ...(JSON.parse(localStorage.getItem(PREF_KEY) || '{}')) }; } catch (_) {}

  const $ = (s, root=document) => root.querySelector(s);
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

  const screen=$('.screen-wrap');
  if (screen && !$('#settingsScreen')) screen.appendChild(make(`
    <section id="settingsScreen" class="overlay menu-overlay hidden settings-overlay" aria-label="Game options">
      <div class="menu-window settings-window">
        <div class="menu-header"><div><p class="eyebrow">PLAYER-FIRST OPTIONS</p><h2>ACCESSIBILITY & UI</h2></div><button id="settingsCloseBtn" class="pixel-button compact" type="button">CLOSE</button></div>
        <p class="menu-copy">These options change presentation only. Combat balance and story progress are not affected.</p>
        <div class="settings-grid">
          <button class="setting-card" data-pref="guide" type="button"><span><strong>TACTICAL GUIDE</strong><small>Highlights a useful response to enemy intent.</small></span><b>ON</b></button>
          <button class="setting-card" data-pref="reducedMotion" type="button"><span><strong>REDUCED MOTION</strong><small>Reduces shakes, flashes, scanlines, and looping effects.</small></span><b>OFF</b></button>
          <button class="setting-card" data-pref="largeText" type="button"><span><strong>LARGE TEXT</strong><small>Increases menu, dialogue, and battle readability.</small></span><b>OFF</b></button>
          <button class="setting-card" data-pref="highContrast" type="button"><span><strong>HIGH CONTRAST</strong><small>Strengthens borders, danger labels, and focus states.</small></span><b>OFF</b></button>
          <button class="setting-card" data-pref="compactHud" type="button"><span><strong>COMPACT HUD</strong><small>Hides secondary map/material information on the side panels.</small></span><b>OFF</b></button>
        </div>
        <div class="settings-help"><strong>QUICK COMBAT READ</strong><span>Red = incoming danger · Gold = recommended action · Blue = defense/position · Purple = party/build tools. The guide suggests choices but never makes them for you.</span></div>
      </div>
    </section>`));

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
    try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch (_) {}
  }
  function openOptions(){ $('#settingsScreen')?.classList.remove('hidden'); }
  function closeOptions(){ $('#settingsScreen')?.classList.add('hidden'); }
  $('#settingsBtn')?.addEventListener('click',openOptions); $('#mobileOptionsBtn')?.addEventListener('click',openOptions); $('#settingsCloseBtn')?.addEventListener('click',closeOptions);
  document.querySelectorAll('[data-pref]').forEach(btn=>btn.addEventListener('click',()=>{ prefs={...prefs,[btn.dataset.pref]:!prefs[btn.dataset.pref]}; applyPrefs(); }));
  document.addEventListener('keydown',e=>{ if(e.key.toLowerCase()==='o' && !e.ctrlKey && !e.metaKey){ e.preventDefault(); $('#settingsScreen')?.classList.toggle('hidden'); } if(e.key==='Escape' && !$('#settingsScreen')?.classList.contains('hidden')) closeOptions(); });

  const info={attack:'Timed weapon attack. Better timing increases damage, stagger, and Momentum.',skill1:'Job Skill I. Costs MP and uses your class identity.',skill2:'Job Skill II. Stronger MP skill with damage, healing, or status effects.',weaponTechnique:'Weapon-specific active technique. Costs Stamina and has a short cooldown.',guard:'Recover MP and Stamina, build Ward, and reduce incoming damage.',dodge:'Spend Stamina to shift range and attempt to evade the next hit.',parry:'Spend Stamina to counter a readable incoming attack.',execute:'Spend Momentum on a finisher against wounded, staggered, or broken enemies.',potion:'Consume a potion to restore HP.',bomb:'Consume a Crown Bomb for strong fire damage and stagger.',burst:'Spend full Momentum on your job-specific ultimate.',tactic:'Cycle stance to trade offense, defense, and critical chance.',inspire:'Spend Inspiration to gain advantage on the next weapon attack.',companion:'Call your companion. At Bond 20+ and 70 Momentum this becomes a stronger Covenant Surge.',reaction:'Ready your unique class reaction for the next incoming attack.',position:'Cycle CLOSE / MID / FAR range. Weapon and enemy effectiveness change with distance.',environment:'Use the battlefield feature once for damage, control, healing, or resources.',partyTactic:'Cycle Assault / Guardian / Support companion doctrine.'};
  document.querySelectorAll('[data-action]').forEach(btn=>{
    const text=info[btn.dataset.action]; if(text){btn.title=text;btn.setAttribute('aria-description',text);}
    const show=()=>{const box=$('#actionInspector');if(!box||!text)return;box.innerHTML=`<small>ACTION INFO</small><strong>${btn.textContent.trim()}</strong><span>${text}</span>`;};
    btn.addEventListener('pointerenter',show);btn.addEventListener('focus',show);btn.addEventListener('pointerdown',show);
  });
  applyPrefs();
})();
