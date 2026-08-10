(() => {
  'use strict';

  const screen = document.querySelector('.screen-wrap');
  if (!screen) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'cinematic2dV13';
  canvas.setAttribute('aria-hidden', 'true');
  screen.appendChild(canvas);
  const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });

  const flowChip = document.createElement('div');
  flowChip.id = 'flowSurgeChip';
  flowChip.className = 'flow-surge-chip hidden';
  flowChip.innerHTML = '<small>COMBAT FLOW</small><span><i></i></span><strong>0%</strong>';
  document.getElementById('battleScreen')?.appendChild(flowChip);

  const reactionBanner = document.createElement('div');
  reactionBanner.id = 'reactionBanner2d';
  reactionBanner.className = 'reaction-banner-2d hidden';
  reactionBanner.innerHTML = '<small>ELEMENTAL REACTION</small><strong>CHAIN REACTION</strong>';
  document.getElementById('battleScreen')?.appendChild(reactionBanner);

  let cssW = 640, cssH = 480, dpr = 1;
  let last = performance.now();
  let particles = [];
  let rings = [];
  let slashes = [];
  let lastLog = '';
  let lastBattle = null;
  let lastPhase = 1;
  let flash = 0;
  let flashColor = '255,170,110';
  const TAU = Math.PI * 2;
  const reduced = () => document.body.classList.contains('pref-reduced-motion');

  function resize() {
    const r = screen.getBoundingClientRect();
    cssW = Math.max(320, r.width); cssH = Math.max(240, r.height);
    dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.width = `${cssW}px`; canvas.style.height = `${cssH}px`;
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  new ResizeObserver(resize).observe(screen); resize();

  function colorFor(text='') {
    const t=String(text).toLowerCase();
    if(t.includes('fire')||t.includes('combust')) return '#ff6a3d';
    if(t.includes('poison')||t.includes('venom')) return '#77d463';
    if(t.includes('frost')||t.includes('ice')||t.includes('shatter')) return '#7ad8ff';
    if(t.includes('arcane')||t.includes('veil')) return '#aa79ff';
    if(t.includes('radiant')||t.includes('holy')) return '#ffe083';
    if(t.includes('heal')) return '#79e3a2';
    return '#efb873';
  }

  function burst(x,y,color,count=24,power=220,gravity=160) {
    const n = reduced() ? Math.ceil(count*.35) : count;
    for(let i=0;i<n;i++){
      const a=Math.random()*TAU, v=power*(.3+Math.random()*.85);
      particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v*.68-35,life:.35+Math.random()*.55,max:.9,size:1.5+Math.random()*4.5,color,gravity});
    }
  }
  function ring(x,y,color,r=20,max=150,life=.5){rings.push({x,y,color,r,max,life,maxLife:life});}
  function slash(x,y,color,dir=1,heavy=false){slashes.push({x,y,color,dir,life:heavy?.42:.28,max:heavy?.42:.28,heavy});}

  function actionFx(action, enemy=false) {
    const x=cssW*(enemy?.73:.27), y=cssH*.52;
    const targetX=cssW*(enemy?.29:.71), targetY=cssH*.49;
    const heavy=['burst','execute','ultimate','weaponTechnique'].includes(action);
    const defensive=['guard','parry','dodge'].includes(action);
    const color=action.includes('skill')?'#a97aff':action==='parry'?'#83d9ff':action==='execute'?'#ffcf7b':action==='burst'?'#ff8b52':'#f2b67a';
    if(defensive){ring(x,y,color,18,defensive&&action==='parry'?130:90,.38);burst(x,y,color,10,110,70);}
    else {slash((x+targetX)/2,(y+targetY)/2,color,enemy?-1:1,heavy);burst(targetX,targetY,color,heavy?38:20,heavy?300:210,170);ring(targetX,targetY,color,12,heavy?190:105,heavy?.6:.36);}
    flash=Math.max(flash,heavy?.34:.14); flashColor=color.replace('#','').match(/../g)?.map(h=>parseInt(h,16)).join(',')||'255,170,110';
  }

  window.addEventListener('emberfall:action', e=>actionFx(e.detail?.action||'attack',false));
  window.addEventListener('emberfall:enemyaction', e=>actionFx(e.detail?.intent||'attack',true));
  window.addEventListener('emberfall:fx', e=>{
    const text=e.detail?.text||e.detail?.kind||'';
    const c=colorFor(text); const heal=String(text).toLowerCase().includes('heal');
    burst(cssW*(heal?.28:.72),cssH*.48,c,heal?18:20,180,heal?-80:140);
  });

  function drawAmbient(s,time) {
    const biome=s?.locationData?.biome||'grass';
    ctx.save();
    const amount=reduced()?8:22;
    let col='220,210,180';
    if(['forest','marsh'].includes(biome)) col='130,220,170';
    if(['snow','iceCave','sky'].includes(biome)) col='190,230,255';
    if(['citadel','core','mine'].includes(biome)) col='255,120,70';
    if(['starCity','glass'].includes(biome)) col='180,150,255';
    for(let i=0;i<amount;i++){
      const seed=(i*92821)%997, speed=4+(i%6)*2;
      const x=((seed*.73 + time*speed*2)% (cssW+80))-40;
      const y=((seed*.31 + time*(i%3+1)*3)% (cssH+80))-40;
      const a=.035+(i%5)*.012;
      ctx.fillStyle=`rgba(${col},${a})`;ctx.beginPath();ctx.arc(x,y,1+(i%3)*.5,0,TAU);ctx.fill();
    }
    const vign=ctx.createRadialGradient(cssW*.5,cssH*.45,cssW*.18,cssW*.5,cssH*.48,cssW*.72);
    vign.addColorStop(0,'rgba(0,0,0,0)');vign.addColorStop(1,'rgba(0,0,0,.22)');ctx.fillStyle=vign;ctx.fillRect(0,0,cssW,cssH);
    ctx.restore();
  }

  function drawBattleGrade(s,time) {
    const enemy=s.battleEnemy; if(!enemy)return;
    const intent=enemy.intent||'attack';
    const danger=['ultimate','heavy','sweep','hex'].includes(intent);
    const c=colorFor(intent==='hex'?'arcane':intent==='ultimate'?'fire':'physical');
    ctx.save();
    if(enemy.boss){
      const pulse=.09+Math.sin(time*3.1)*.025;
      const g=ctx.createRadialGradient(cssW*.73,cssH*.44,20,cssW*.73,cssH*.44,cssW*.4);
      g.addColorStop(0,`${hexA(c,.11+pulse)}`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,cssW,cssH);
    }
    if(danger){
      ctx.strokeStyle=hexA(c,intent==='ultimate'?.55:.32);ctx.lineWidth=intent==='ultimate'?5:3;
      const pulse=1+Math.sin(time*(intent==='ultimate'?9:5))*.07;
      ctx.beginPath();ctx.ellipse(cssW*.73,cssH*.69,cssW*.14*pulse,cssH*.055*pulse,0,0,TAU);ctx.stroke();
    }
    if(s.battleSurface){
      const sc=colorFor(s.battleSurface.type||'');
      const g=ctx.createRadialGradient(cssW*.5,cssH*.74,10,cssW*.5,cssH*.74,cssW*.36);
      g.addColorStop(0,hexA(sc,.075));g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,cssH*.43,cssW,cssH*.48);
    }
    ctx.restore();
  }

  function hexA(hex,a){
    const c=hex.replace('#','');const r=parseInt(c.slice(0,2),16),g=parseInt(c.slice(2,4),16),b=parseInt(c.slice(4,6),16);return `rgba(${r},${g},${b},${a})`;
  }

  function updateFx(dt){
    particles=particles.filter(p=>{p.life-=dt;if(p.life<=0)return false;p.vy+=p.gravity*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.pow(.985,dt*60);return true;});
    rings=rings.filter(r=>{r.life-=dt;return r.life>0;});
    slashes=slashes.filter(s=>{s.life-=dt;return s.life>0;});
    flash=Math.max(0,flash-dt*2.6);
  }

  function drawFx(){
    ctx.save();ctx.globalCompositeOperation='screen';
    for(const r of rings){const t=1-r.life/r.maxLife,rad=r.r+(r.max-r.r)*t;ctx.globalAlpha=(1-t)*.7;ctx.strokeStyle=r.color;ctx.lineWidth=3*(1-t)+1;ctx.beginPath();ctx.arc(r.x,r.y,rad,0,TAU);ctx.stroke();}
    for(const s of slashes){const t=1-s.life/s.max;ctx.globalAlpha=(1-t)*.9;ctx.strokeStyle=s.color;ctx.lineWidth=s.heavy?9:5;ctx.lineCap='round';ctx.shadowBlur=s.heavy?22:12;ctx.shadowColor=s.color;ctx.beginPath();const span=s.heavy?130:88;ctx.arc(s.x,s.y,span,(-.7+t*.25)*s.dir,(.65+t*.25)*s.dir,s.dir<0);ctx.stroke();}
    for(const p of particles){const a=Math.max(0,p.life/p.max);ctx.globalAlpha=a;ctx.fillStyle=p.color;ctx.shadowBlur=8;ctx.shadowColor=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size*(.4+a*.6),0,TAU);ctx.fill();}
    ctx.restore();ctx.shadowBlur=0;ctx.globalAlpha=1;
    if(flash>0){ctx.fillStyle=`rgba(${flashColor},${Math.min(.18,flash)})`;ctx.fillRect(0,0,cssW,cssH);}
  }

  function syncUi(s){
    if(!s?.inBattle){flowChip.classList.add('hidden');return;}
    flowChip.classList.remove('hidden');
    const flow=Math.max(0,Math.min(100,Number(s.battleFlow||0)));
    flowChip.querySelector('i').style.width=`${flow}%`;
    flowChip.querySelector('strong').textContent=s.battleFlowReady?'SURGE READY':`${Math.floor(flow)}%`;
    flowChip.classList.toggle('ready',!!s.battleFlowReady);

    const log=String(s.battleLog||'');
    if(log!==lastLog){
      const match=log.match(/(COMBUSTION|VEILFLARE|SHATTER|CHAIN REACTION|FLOW SURGE)/i);
      if(match){reactionBanner.querySelector('strong').textContent=match[1].toUpperCase();reactionBanner.classList.remove('hidden');setTimeout(()=>reactionBanner.classList.add('hidden'),900);ring(cssW*.5,cssH*.5,colorFor(match[1]),20,220,.65);}
      lastLog=log;
    }
    const key=s.battleEnemy?.id||s.battleEnemy?.name;
    if(key!==lastBattle){lastBattle=key;lastPhase=s.battleEnemy?.phase||1;}
    const phase=s.battleEnemy?.phase||1;
    if(s.battleEnemy?.boss&&phase!==lastPhase){lastPhase=phase;flash=.42;flashColor='255,70,70';burst(cssW*.72,cssH*.45,'#ff5b5b',48,320,90);ring(cssW*.72,cssH*.48,'#ff5b5b',30,260,.8);}
  }

  function frame(now){
    const dt=Math.min(.05,(now-last)/1000);last=now;
    ctx.clearRect(0,0,cssW,cssH);
    const s=window.EmberfallBridge?.snapshot?.();
    if(s?.started){if(s.inBattle)drawBattleGrade(s,now/1000);else drawAmbient(s,now/1000);syncUi(s);}
    updateFx(dt);drawFx();requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();