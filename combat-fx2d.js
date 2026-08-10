(() => {
  'use strict';
  const $ = (s, root=document) => root.querySelector(s);
  const prefsKey='emberfall-fx2d-prefs';
  let prefs={blood:true,flash:true,shake:true,text:true};
  try{prefs={...prefs,...JSON.parse(localStorage.getItem(prefsKey)||'{}')}}catch(_){ }

  const overlay=document.createElement('div');overlay.id='combatFx2dOverlay';overlay.className='combat-fx2d-overlay';overlay.innerHTML='<div class="combat-fx2d-flash"></div><div class="combat-fx2d-text-layer"></div><div class="boss-cinematic-banner hidden"><small>PHASE SHIFT</small><strong></strong></div>';
  document.querySelector('.screen-wrap')?.appendChild(overlay);
  const flashEl=$('.combat-fx2d-flash',overlay),textLayer=$('.combat-fx2d-text-layer',overlay),bossBanner=$('.boss-cinematic-banner',overlay);

  function save(){try{localStorage.setItem(prefsKey,JSON.stringify(prefs))}catch(_){}}
  function pulse(cls='hit',ms=150){if(!prefs.flash||document.body.classList.contains('pref-reduced-motion'))return;flashEl.className=`combat-fx2d-flash ${cls}`;setTimeout(()=>flashEl.className='combat-fx2d-flash',ms);}
  function shake(amount=7){if(!prefs.shake||document.body.classList.contains('pref-reduced-motion'))return;window.Emberfall2D?.shake?.(amount);}
  function floatText(text,target='enemy',kind='damage'){
    if(!prefs.text)return;const el=document.createElement('div');el.className=`fx2d-float ${kind}`;el.textContent=text;el.style.left=target==='hero'?'29%':'72%';el.style.top=kind==='heal'?'48%':'43%';textLayer.appendChild(el);setTimeout(()=>el.remove(),950);
  }

  function classify(text){const t=String(text||'').toLowerCase();if(t.includes('heal')||t.includes('restore'))return{kind:'heal',color:'#7fe2a1'};if(t.includes('poison')||t.includes('venom'))return{kind:'poison',color:'#7fd56d'};if(t.includes('fire')||t.includes('burn'))return{kind:'fire',color:'#ff7548'};if(t.includes('arcane')||t.includes('rune'))return{kind:'arcane',color:'#ae82ff'};if(t.includes('radiant')||t.includes('holy'))return{kind:'radiant',color:'#ffe591'};if(t.includes('frost')||t.includes('ice'))return{kind:'frost',color:'#82dfff'};return{kind:'damage',color:'#ffd3a1'};}

  window.addEventListener('emberfall:action',e=>{
    const a=e.detail?.action||'attack';
    // No floatText here for execute/burst: game.js's own spawnFx('word', ...) already
    // shows the (job-flavored) callout for these actions at the moment they resolve.
    // Shake itself is driven solely by game.js's shakeBattle() - see renderer2d-v14.js.
    if(a==='execute')pulse('execution',260);
    else if(a==='parry')pulse('parry',120);
    else if(a==='burst')pulse('ultimate',220);
    else if(a==='dodge')pulse('dodge',110);
  });

  window.addEventListener('emberfall:enemyaction',e=>{
    const a=e.detail?.intent||'attack';
    if(a==='ultimate'){pulse('danger',240);}
    else if(a==='heavy'||a==='sweep'){pulse('danger-soft',140);}
  });

  window.addEventListener('emberfall:fx',e=>{
    const text=e.detail?.text||e.detail?.kind||'',meta=classify(text),target=String(text).toLowerCase().includes('heal')?'hero':'enemy';
    if(meta.kind==='heal'){floatText('RECOVER',target,'heal');pulse('heal',120);}else{pulse(meta.kind==='fire'?'fire':'hit',100);if(String(text).match(/critical|crit/i))floatText('CRITICAL',target,'critical');}
  });

  let lastEnemyHp=null,lastHeroHp=null,lastBossPhase=null,lastBattle=null;
  function inspect(){
    const s=window.EmberfallBridge?.snapshot?.();if(!s?.inBattle){lastEnemyHp=lastHeroHp=lastBossPhase=lastBattle=null;requestAnimationFrame(inspect);return;}
    const key=s.battleEnemy?.id||s.battleEnemy?.name;
    if(lastBattle!==key){lastBattle=key;lastEnemyHp=s.battleEnemy?.hp??null;lastHeroHp=s.player?.hp??null;lastBossPhase=s.battleEnemy?.phase??1;}
    const eh=s.battleEnemy?.hp??0,hh=s.player?.hp??0;
    // Floating damage numbers are spawned directly by game.js's spawnFx() at the moment
    // damage is applied (single source of truth) - this loop only adds the blood-particle
    // reaction and boss-phase banner below, so a hit isn't shown twice with different timing.
    if(lastEnemyHp!==null&&eh<lastEnemyHp&&prefs.blood)window.Emberfall2D?.spawnFx?.('enemy','blood','#ba3246');
    if(lastHeroHp!==null&&hh<lastHeroHp&&prefs.blood)window.Emberfall2D?.spawnFx?.('hero','blood','#ba3246');
    const phase=s.battleEnemy?.phase??1;if(s.battleEnemy?.boss&&phase!==lastBossPhase){lastBossPhase=phase;bossBanner.querySelector('strong').textContent=`${s.battleEnemy.name||'BOSS'} · PHASE ${phase}`;bossBanner.classList.remove('hidden');pulse('boss-phase',400);shake(14);setTimeout(()=>bossBanner.classList.add('hidden'),1550);}
    lastEnemyHp=eh;lastHeroHp=hh;requestAnimationFrame(inspect);
  }

  function addSettings(){
    const grid=$('.settings-grid');if(!grid||$('#fx2dBloodSetting')){if(!grid)setTimeout(addSettings,250);return;}
    const make=(id,title,desc,key)=>{const b=document.createElement('button');b.id=id;b.className='setting-card';b.type='button';b.innerHTML=`<span><strong>${title}</strong><small>${desc}</small></span><b>${prefs[key]?'ON':'OFF'}</b>`;b.addEventListener('click',()=>{prefs[key]=!prefs[key];b.querySelector('b').textContent=prefs[key]?'ON':'OFF';save();});grid.appendChild(b);};
    make('fx2dBloodSetting','BLOOD & IMPACT FX','Disable blood mist while keeping hit sparks.','blood');
    make('fx2dFlashSetting','SCREEN FLASH','Cinematic flashes for parries, ultimates and executions.','flash');
    make('fx2dShakeSetting','CAMERA IMPACT','Screen shake for heavy combat impacts.','shake');
    make('fx2dTextSetting','COMBAT TEXT','Floating damage and critical feedback.','text');
  }

  addSettings();requestAnimationFrame(inspect);
})();