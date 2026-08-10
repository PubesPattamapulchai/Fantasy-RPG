(() => {
  'use strict';

  const $ = (s, root = document) => root.querySelector(s);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const damp = (a, b, speed, dt) => lerp(a, b, 1 - Math.exp(-speed * dt));
  const TAU = Math.PI * 2;

  const screen = $('.screen-wrap');
  const legacyCanvas = $('#gameCanvas');
  if (!screen || !legacyCanvas) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'modern2dCanvas';
  canvas.setAttribute('aria-label', 'Modern cinematic 2D game view');
  legacyCanvas.insertAdjacentElement('afterend', canvas);
  const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });

  const lightCanvas = document.createElement('canvas');
  const lightCtx = lightCanvas.getContext('2d');

  const state = {
    dpr: 1,
    width: 1280,
    height: 720,
    cssWidth: 640,
    cssHeight: 480,
    camera: { x: 0, y: 0, zoom: 1, shake: 0 },
    hero: { x: 0, y: 0, facing: 'down', moving: false },
    lastHeroTile: null,
    lastSnapshot: null,
    lastEnemyHp: null,
    lastHeroHp: null,
    battleKey: null,
    particles: [],
    motes: [],
    combatTexts: [],
    action: { hero: null, enemy: null },
    hitStopUntil: 0,
    bossPulse: 0,
    quality: localStorage.getItem('emberfall-2d-quality') || 'high',
    reducedMotion: false,
    time: 0,
    startedAt: performance.now()
  };

  const biome = {
    grass:   { sky:'#28362f', far:'#1a2420', ground:'#41533a', path:'#76634a', accent:'#e4bc72', fog:'rgba(181,199,184,.10)', dark:'rgba(7,10,9,.20)' },
    forest:  { sky:'#182822', far:'#101b17', ground:'#283e2f', path:'#655b45', accent:'#8acb91', fog:'rgba(142,179,152,.11)', dark:'rgba(4,8,6,.30)' },
    city:    { sky:'#30343c', far:'#191c22', ground:'#555a5f', path:'#6e675b', accent:'#e6b96f', fog:'rgba(194,202,214,.08)', dark:'rgba(9,10,13,.22)' },
    dungeon: { sky:'#12131a', far:'#090a0e', ground:'#2c2d35', path:'#484750', accent:'#9b7dff', fog:'rgba(126,111,169,.10)', dark:'rgba(2,2,5,.48)' },
    highland:{ sky:'#3d493f', far:'#242e27', ground:'#56604d', path:'#7b6c52', accent:'#edcb88', fog:'rgba(206,213,200,.10)', dark:'rgba(9,11,9,.17)' },
    marsh:   { sky:'#1c312c', far:'#10201c', ground:'#344b40', path:'#565a47', accent:'#70dfc2', fog:'rgba(126,190,171,.13)', dark:'rgba(4,10,8,.32)' },
    mine:    { sky:'#1b1715', far:'#0d0b0a', ground:'#342e2a', path:'#4e4239', accent:'#f19b59', fog:'rgba(154,128,105,.10)', dark:'rgba(4,3,3,.45)' },
    desert:  { sky:'#8a6848', far:'#55402c', ground:'#9b774b', path:'#b09266', accent:'#ffd486', fog:'rgba(234,201,156,.10)', dark:'rgba(35,22,12,.10)' },
    glass:   { sky:'#373047', far:'#1e1929', ground:'#514765', path:'#71647e', accent:'#caa9ff', fog:'rgba(178,158,215,.11)', dark:'rgba(8,6,13,.28)' },
    snow:    { sky:'#8fa5b1', far:'#627681', ground:'#b7c6c9', path:'#8c999d', accent:'#9cecff', fog:'rgba(231,246,250,.20)', dark:'rgba(22,31,35,.09)' },
    iceCave: { sky:'#173144', far:'#0b1922', ground:'#35556a', path:'#4d6f80', accent:'#71e3ff', fog:'rgba(110,194,219,.13)', dark:'rgba(2,8,12,.40)' },
    starCity:{ sky:'#302f50', far:'#171627', ground:'#464663', path:'#64627e', accent:'#a9caff', fog:'rgba(157,166,224,.10)', dark:'rgba(7,6,16,.28)' },
    sky:     { sky:'#7694ad', far:'#50677b', ground:'#707b8c', path:'#8995a5', accent:'#b8e0ff', fog:'rgba(230,244,255,.14)', dark:'rgba(18,27,34,.08)' },
    citadel: { sky:'#32191c', far:'#150b0d', ground:'#493034', path:'#654347', accent:'#ff765f', fog:'rgba(164,78,70,.10)', dark:'rgba(10,3,5,.42)' },
    core:    { sky:'#261018', far:'#0b0508', ground:'#3b202b', path:'#5b3037', accent:'#ff884c', fog:'rgba(189,82,65,.12)', dark:'rgba(8,2,5,.48)' }
  };

  function paletteFor(s) { return biome[s?.locationData?.biome] || biome.grass; }

  function resize() {
    const r = screen.getBoundingClientRect();
    state.cssWidth = Math.max(320, r.width);
    state.cssHeight = Math.max(240, r.height);
    state.dpr = Math.min(window.devicePixelRatio || 1, state.quality === 'high' ? 2 : state.quality === 'medium' ? 1.5 : 1);
    canvas.width = Math.round(state.cssWidth * state.dpr);
    canvas.height = Math.round(state.cssHeight * state.dpr);
    lightCanvas.width = canvas.width;
    lightCanvas.height = canvas.height;
    canvas.style.width = `${state.cssWidth}px`;
    canvas.style.height = `${state.cssHeight}px`;
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    lightCtx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(screen);
  resize();

  function hashNoise(x, y, seed = 0) {
    const n = Math.sin(x * 12.9898 + y * 78.233 + seed * 37.719) * 43758.5453;
    return n - Math.floor(n);
  }

  function roundRect(c, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    c.beginPath();
    c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }

  function worldMetrics(s) {
    const map = s?.locationData?.map || [];
    const rows = map.length || 10;
    const cols = map[0]?.length || 12;
    const tile = clamp(Math.min(state.cssWidth / Math.min(cols, 11.5), state.cssHeight / Math.min(rows, 8.2)), 56, 92);
    return { tile, cols, rows };
  }

  function updateCamera(s, dt) {
    const { tile, cols, rows } = worldMetrics(s);
    const targetX = (state.hero.x + .5) * tile;
    const targetY = (state.hero.y + .5) * tile;
    const worldW = cols * tile, worldH = rows * tile;
    let cx = targetX - state.cssWidth / 2;
    let cy = targetY - state.cssHeight / 2;
    cx = clamp(cx, 0, Math.max(0, worldW - state.cssWidth));
    cy = clamp(cy, 0, Math.max(0, worldH - state.cssHeight));
    state.camera.x = damp(state.camera.x, cx, state.reducedMotion ? 18 : 8.5, dt);
    state.camera.y = damp(state.camera.y, cy, state.reducedMotion ? 18 : 8.5, dt);
    state.camera.shake = Math.max(0, state.camera.shake - dt * 18);
  }

  function syncHero(s, dt) {
    if (!s?.player) return;
    if (!state.lastHeroTile || state.lastHeroTile.location !== s.location) {
      state.hero.x = s.player.x; state.hero.y = s.player.y;
      state.lastHeroTile = { x:s.player.x, y:s.player.y, location:s.location };
    }
    const dx = s.player.x - state.hero.x, dy = s.player.y - state.hero.y;
    state.hero.moving = Math.abs(dx) + Math.abs(dy) > .015;
    state.hero.x = damp(state.hero.x, s.player.x, state.reducedMotion ? 24 : 13.5, dt);
    state.hero.y = damp(state.hero.y, s.player.y, state.reducedMotion ? 24 : 13.5, dt);
    state.hero.facing = s.player.facing || state.hero.facing;
    state.lastHeroTile = { x:s.player.x, y:s.player.y, location:s.location };
  }

  function drawParallax(s, p, time) {
    const w = state.cssWidth, h = state.cssHeight;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, p.sky); g.addColorStop(.65, p.far); g.addColorStop(1, '#0a0b0d');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

    const drift = (state.camera.x * .025) % 220;
    ctx.save();
    ctx.globalAlpha = .55;
    for (let layer=0; layer<3; layer++) {
      const baseY = h * (.28 + layer * .08);
      ctx.fillStyle = layer === 0 ? 'rgba(4,6,8,.28)' : layer === 1 ? 'rgba(8,10,12,.38)' : 'rgba(10,12,13,.52)';
      ctx.beginPath(); ctx.moveTo(-40, h);
      for (let x=-120; x<w+180; x+=100) {
        const n = hashNoise(Math.floor((x + drift * (layer+1)) / 80), layer, s.location?.length || 1);
        ctx.lineTo(x - drift * (layer + 1) * .35, baseY - n * (75 + layer * 35));
      }
      ctx.lineTo(w+100,h); ctx.closePath(); ctx.fill();
    }
    ctx.restore();

    if (['starCity','sky','glass'].includes(s.locationData?.biome)) {
      ctx.save(); ctx.globalCompositeOperation='screen';
      for(let i=0;i<38;i++) {
        const x=(hashNoise(i,7)*w + time*(i%3+1)*2)%w, y=hashNoise(i,11)*h*.48;
        ctx.fillStyle=`rgba(180,210,255,${.15+hashNoise(i,9)*.35})`;ctx.beginPath();ctx.arc(x,y,hashNoise(i,3)*1.5+.4,0,TAU);ctx.fill();
      }
      ctx.restore();
    }
  }

  function drawGround(s, p, metrics) {
    const { tile } = metrics, map = s.locationData?.map || [];
    ctx.save(); ctx.translate(-state.camera.x, -state.camera.y);
    for (let y=0;y<map.length;y++) for (let x=0;x<(map[y]?.length||0);x++) {
      const ch=map[y][x], px=x*tile, py=y*tile, n=hashNoise(x,y,s.location?.length||0);
      let base=p.ground;
      if(['P','C','D'].includes(ch)) base=p.path;
      if(ch==='~') base='#263f49';
      const grad=ctx.createLinearGradient(px,py,px+tile,py+tile);
      grad.addColorStop(0,base);grad.addColorStop(1,n>.5?shade(base,-12):shade(base,10));
      ctx.fillStyle=grad;ctx.fillRect(px,py,tile+1,tile+1);
      ctx.fillStyle=`rgba(255,255,255,${.012+n*.02})`;
      for(let i=0;i<3;i++){const rx=px+hashNoise(x*3+i,y)*tile,ry=py+hashNoise(x,y*5+i)*tile;ctx.fillRect(rx,ry,1.5+n*1.5,1.5+n*1.5);}
      if(ch==='P'||ch==='C') {ctx.strokeStyle='rgba(255,225,170,.05)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(px+8,py+tile*.7);ctx.quadraticCurveTo(px+tile*.5,py+tile*.45,px+tile-8,py+tile*.62);ctx.stroke();}
    }
    ctx.restore();
  }

  function shade(hex, amt) {
    const c=hex.replace('#',''); if(c.length!==6)return hex;
    let r=parseInt(c.slice(0,2),16)+amt,g=parseInt(c.slice(2,4),16)+amt,b=parseInt(c.slice(4,6),16)+amt;
    return `rgb(${clamp(r,0,255)},${clamp(g,0,255)},${clamp(b,0,255)})`;
  }

  function drawShadow(x,y,rx,ry,alpha=.28) {
    const g=ctx.createRadialGradient(x,y,0,x,y,rx);g.addColorStop(0,`rgba(0,0,0,${alpha})`);g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.save();ctx.scale(1,ry/rx);ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y*(rx/ry),rx,0,TAU);ctx.fill();ctx.restore();
  }

  function drawTree(x,y,size,p,time) {
    drawShadow(x,y+size*.36,size*.5,size*.14,.22);
    ctx.fillStyle='#392b24';roundRect(ctx,x-size*.10,y-size*.34,size*.20,size*.67,size*.06);ctx.fill();
    const sway=Math.sin(time*1.3+x*.01)*size*.018;
    const colors=[shade(p.ground,-22),shade(p.ground,-8),shade(p.ground,9)];
    for(let i=0;i<3;i++){ctx.fillStyle=colors[i];ctx.beginPath();ctx.arc(x+sway*(i+1)+(i-1)*size*.11,y-size*(.55+i*.10),size*(.32-i*.035),0,TAU);ctx.fill();}
  }

  function drawRock(x,y,size,p,seed) {
    drawShadow(x,y+size*.18,size*.4,size*.13,.18);
    const g=ctx.createLinearGradient(x-size*.3,y-size*.4,x+size*.3,y+size*.3);g.addColorStop(0,shade(p.path,20));g.addColorStop(1,shade(p.path,-22));ctx.fillStyle=g;
    ctx.beginPath();for(let i=0;i<7;i++){const a=i/7*TAU,r=size*(.28+hashNoise(i,seed)*.14),px=x+Math.cos(a)*r,py=y+Math.sin(a)*r*.72-size*.12;if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}ctx.closePath();ctx.fill();
  }

  function drawBuilding(x,y,size,p) {
    drawShadow(x,y+size*.25,size*.52,size*.16,.24);
    const wg=ctx.createLinearGradient(x-size*.4,y-size*.5,x+size*.4,y+size*.4);wg.addColorStop(0,shade(p.path,4));wg.addColorStop(1,shade(p.path,-25));ctx.fillStyle=wg;roundRect(ctx,x-size*.38,y-size*.45,size*.76,size*.68,size*.06);ctx.fill();
    ctx.fillStyle=shade(p.far,10);ctx.beginPath();ctx.moveTo(x-size*.47,y-size*.43);ctx.lineTo(x,y-size*.72);ctx.lineTo(x+size*.47,y-size*.43);ctx.closePath();ctx.fill();
    ctx.save();ctx.shadowBlur=15;ctx.shadowColor=p.accent;ctx.fillStyle=p.accent;ctx.fillRect(x-size*.07,y-size*.16,size*.14,size*.20);ctx.restore();
  }

  function drawProp(type,x,y,size,p,time) {
    if(['brazier','flame','campfire','forge','lamp'].includes(type)){
      drawShadow(x,y+size*.15,size*.25,size*.08,.2);ctx.fillStyle='#4d4037';ctx.fillRect(x-size*.12,y-size*.12,size*.24,size*.28);
      const f=.85+Math.sin(time*8+x)*.12;ctx.save();ctx.globalCompositeOperation='screen';ctx.shadowBlur=18;ctx.shadowColor='#ff6a31';ctx.fillStyle='#ff9a43';ctx.beginPath();ctx.ellipse(x,y-size*.22,size*.12*f,size*.20*f,0,0,TAU);ctx.fill();ctx.restore();
    } else if(['crystal','obelisk','crown'].includes(type)){
      ctx.save();ctx.shadowBlur=18;ctx.shadowColor=p.accent;ctx.fillStyle=p.accent;ctx.beginPath();ctx.moveTo(x,y-size*.46);ctx.lineTo(x+size*.18,y-size*.06);ctx.lineTo(x,y+size*.18);ctx.lineTo(x-size*.18,y-size*.06);ctx.closePath();ctx.fill();ctx.restore();
    } else if(type==='well'||type==='fountain'){
      ctx.strokeStyle=shade(p.path,15);ctx.lineWidth=size*.12;ctx.beginPath();ctx.ellipse(x,y,size*.34,size*.18,0,0,TAU);ctx.stroke();ctx.fillStyle='rgba(93,185,216,.45)';ctx.beginPath();ctx.ellipse(x,y-size*.01,size*.28,size*.12,0,0,TAU);ctx.fill();
    } else if(type==='cart'){
      ctx.fillStyle='#63462f';roundRect(ctx,x-size*.34,y-size*.24,size*.68,size*.35,size*.04);ctx.fill();ctx.fillStyle='#241c18';for(const sx of[-.24,.24]){ctx.beginPath();ctx.arc(x+sx*size,y+size*.10,size*.12,0,TAU);ctx.fill();}
    } else {
      drawRock(x,y,size*.7,p,Math.floor(x+y));
    }
  }

  function heroPalette(colors) {
    const c = Array.isArray(colors) ? colors : ['#352b29','#d7a077','#405c73','#dcb469'];
    return { hair:c[0]||'#352b29', skin:c[1]||'#d7a077', cloth:c[2]||'#405c73', accent:c[3]||'#dcb469' };
  }

  function drawHumanoid(x,y,scale,colors,facing,time,moving,action=null,companion=false) {
    const c=heroPalette(colors), phase=moving?Math.sin(time*10):Math.sin(time*2.4)*.16;
    const attack=action ? Math.sin(clamp((performance.now()-action.at)/action.duration,0,1)*Math.PI) : 0;
    const dir=facing==='left'?-1:facing==='right'?1:1;
    drawShadow(x,y+scale*.30,scale*.33,scale*.10,.30);
    ctx.save();ctx.translate(x,y);if(facing==='left')ctx.scale(-1,1);
    ctx.translate(attack*scale*.16, moving?Math.abs(phase)*scale*.02:0);
    // cape
    ctx.fillStyle=shade(c.cloth,-24);ctx.beginPath();ctx.moveTo(-scale*.22,-scale*.36);ctx.quadraticCurveTo(-scale*.34,-scale*.03-phase*scale*.03,-scale*.21,scale*.30);ctx.lineTo(scale*.12,scale*.25);ctx.quadraticCurveTo(scale*.18,-scale*.04,scale*.15,-scale*.34);ctx.closePath();ctx.fill();
    // legs
    ctx.strokeStyle='#211d1d';ctx.lineWidth=scale*.12;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-scale*.09,scale*.10);ctx.lineTo(-scale*.12-phase*scale*.06,scale*.34);ctx.moveTo(scale*.09,scale*.10);ctx.lineTo(scale*.12+phase*scale*.06,scale*.34);ctx.stroke();
    // torso armor
    const tg=ctx.createLinearGradient(-scale*.2,-scale*.38,scale*.22,scale*.12);tg.addColorStop(0,shade(c.cloth,18));tg.addColorStop(1,shade(c.cloth,-22));ctx.fillStyle=tg;roundRect(ctx,-scale*.22,-scale*.37,scale*.44,scale*.48,scale*.11);ctx.fill();
    ctx.strokeStyle=c.accent;ctx.lineWidth=scale*.045;ctx.beginPath();ctx.moveTo(-scale*.15,-scale*.28);ctx.lineTo(scale*.14,scale*.02);ctx.stroke();
    // head
    ctx.fillStyle=c.skin;ctx.beginPath();ctx.arc(0,-scale*.52,scale*.17,0,TAU);ctx.fill();
    ctx.fillStyle=c.hair;ctx.beginPath();ctx.arc(-scale*.02,-scale*.57,scale*.18,Math.PI,TAU);ctx.quadraticCurveTo(scale*.10,-scale*.41,-scale*.17,-scale*.47);ctx.closePath();ctx.fill();
    // arm/weapon
    ctx.strokeStyle=shade(c.cloth,-5);ctx.lineWidth=scale*.10;ctx.beginPath();ctx.moveTo(scale*.16,-scale*.25);ctx.lineTo(scale*(.28+.12*attack),-scale*(.05+.14*attack));ctx.stroke();
    ctx.strokeStyle=c.accent;ctx.lineWidth=scale*.045;ctx.beginPath();ctx.moveTo(scale*(.27+.12*attack),-scale*(.03+.14*attack));ctx.lineTo(scale*(.52+.27*attack),-scale*(.32+.18*attack));ctx.stroke();
    ctx.fillStyle='#edf1f4';ctx.beginPath();ctx.moveTo(scale*(.50+.27*attack),-scale*(.34+.18*attack));ctx.lineTo(scale*(.59+.31*attack),-scale*(.42+.20*attack));ctx.lineTo(scale*(.54+.28*attack),-scale*(.29+.15*attack));ctx.closePath();ctx.fill();
    if(companion){ctx.save();ctx.globalCompositeOperation='screen';ctx.strokeStyle='rgba(118,212,255,.35)';ctx.lineWidth=scale*.025;ctx.beginPath();ctx.arc(0,-scale*.10,scale*.36,0,TAU);ctx.stroke();ctx.restore();}
    ctx.restore();
  }

  function drawEnemy(enemy,x,y,scale,time,action=null) {
    const name=(enemy?.name||enemy?.type||'enemy').toLowerCase();const sprite=(enemy?.sprite||enemy?.type||'').toLowerCase();
    const attack=action?Math.sin(clamp((performance.now()-action.at)/action.duration,0,1)*Math.PI):0;
    const bob=Math.sin(time*2.8+x*.01)*scale*.018;
    drawShadow(x,y+scale*.30,scale*(enemy?.boss?.48:.34),scale*.11,.34);
    ctx.save();ctx.translate(x-attack*scale*.12,y+bob);if(enemy?.boss)ctx.scale(1.18,1.18);
    let body='#77423d',accent='#ff795f';
    if(sprite.includes('slime')){body='#4b8b60';accent='#b7f38f';const g=ctx.createRadialGradient(-scale*.12,-scale*.23,scale*.02,0,0,scale*.42);g.addColorStop(0,'#7fc78a');g.addColorStop(1,body);ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-scale*.40,scale*.20);ctx.quadraticCurveTo(-scale*.42,-scale*.35,0,-scale*.43);ctx.quadraticCurveTo(scale*.42,-scale*.35,scale*.40,scale*.20);ctx.quadraticCurveTo(0,scale*.34,-scale*.40,scale*.20);ctx.fill();ctx.fillStyle='#fff1b0';for(const sx of[-.13,.13]){ctx.beginPath();ctx.arc(sx*scale,-scale*.12,scale*.045,0,TAU);ctx.fill();}}
    else {
      if(sprite.includes('wraith')||sprite.includes('mage')){body='#624a7c';accent='#c18aff';}
      else if(sprite.includes('golem')||sprite.includes('knight')||sprite.includes('guard')){body='#59616b';accent='#9fd7ff';}
      else if(sprite.includes('wolf')||sprite.includes('beast')){body='#635a50';accent='#f1c58c';}
      else if(name.includes('hydra')){body='#346e59';accent='#78e5ad';}
      else if(name.includes('malachar')||name.includes('devourer')){body='#6f2531';accent='#ff415c';}
      ctx.fillStyle=body;roundRect(ctx,-scale*.30,-scale*.43,scale*.60,scale*.68,scale*.15);ctx.fill();
      ctx.fillStyle=shade(body,12);ctx.beginPath();ctx.arc(0,-scale*.52,scale*.22,0,TAU);ctx.fill();
      ctx.fillStyle='#d2c3aa';for(const sx of[-.16,.16]){ctx.beginPath();ctx.moveTo(sx*scale,-scale*.67);ctx.lineTo((sx+(sx>0?.08:-.08))*scale,-scale*.91);ctx.lineTo((sx+(sx>0?.14:-.14))*scale,-scale*.63);ctx.closePath();ctx.fill();}
      ctx.save();ctx.shadowBlur=16;ctx.shadowColor=accent;ctx.fillStyle=accent;ctx.beginPath();ctx.arc(0,-scale*.49,scale*.055,0,TAU);ctx.fill();ctx.restore();
      ctx.strokeStyle=shade(body,-18);ctx.lineWidth=scale*.11;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-scale*.25,-scale*.18);ctx.lineTo(-scale*(.43+.17*attack),scale*.08);ctx.moveTo(scale*.25,-scale*.18);ctx.lineTo(scale*(.43+.17*attack),scale*.08);ctx.stroke();
    }
    if(enemy?.boss){ctx.save();ctx.globalCompositeOperation='screen';ctx.strokeStyle=accent;ctx.globalAlpha=.28+.14*Math.sin(time*5);ctx.lineWidth=scale*.035;ctx.beginPath();ctx.arc(0,-scale*.14,scale*.58,0,TAU);ctx.stroke();ctx.restore();}
    ctx.restore();
  }

  function gatherWorldDrawables(s, p, metrics, time) {
    const { tile }=metrics, loc=s.locationData, items=[];
    (loc.map||[]).forEach((row,y)=>[...row].forEach((ch,x)=>{
      const wx=(x+.5)*tile, wy=(y+.72)*tile;
      if(ch==='T')items.push({y:wy,draw:()=>drawTree(wx-state.camera.x,wy-state.camera.y,tile*.95,p,time)});
      else if(['W','M','R','L'].includes(ch))items.push({y:wy,draw:()=>drawRock(wx-state.camera.x,wy-state.camera.y,tile*(ch==='L'?.92:.70),p,x+y*9)});
      else if(ch==='B')items.push({y:wy,draw:()=>drawBuilding(wx-state.camera.x,wy-state.camera.y,tile*.95,p)});
    }));
    (loc.decor||[]).forEach((d,i)=>{const wx=(d.x+.5)*tile,wy=(d.y+.68)*tile;items.push({y:wy,draw:()=>drawProp(d.type,wx-state.camera.x,wy-state.camera.y,tile*.70,p,time+i*.2)});});
    (loc.npcs||[]).forEach(n=>{const wx=(n.x+.5)*tile,wy=(n.y+.78)*tile;items.push({y:wy,draw:()=>drawHumanoid(wx-state.camera.x,wy-state.camera.y,tile*.72,n.colors,'down',time,false,null,true)});});
    (loc.enemies||[]).filter(e=>!e.defeated).forEach(e=>{const wx=(e.x+.5)*tile,wy=(e.y+.78)*tile;items.push({y:wy,draw:()=>drawEnemy({name:e.type,sprite:e.type},wx-state.camera.x,wy-state.camera.y,tile*.68,time)});});
    const hx=(state.hero.x+.5)*tile,hy=(state.hero.y+.78)*tile;items.push({y:hy,draw:()=>drawHumanoid(hx-state.camera.x,hy-state.camera.y,tile*.78,s.heroColors,state.hero.facing,time,state.hero.moving,state.action.hero,false)});
    return items.sort((a,b)=>a.y-b.y);
  }

  function drawWorld(s, dt, time) {
    const p=paletteFor(s), metrics=worldMetrics(s);
    syncHero(s,dt);updateCamera(s,dt);
    drawParallax(s,p,time);drawGround(s,p,metrics);
    gatherWorldDrawables(s,p,metrics,time).forEach(it=>it.draw());
    drawWorldAtmosphere(s,p,time);
    drawLighting(s,p,metrics,time,false);
  }

  function drawWorldAtmosphere(s,p,time){
    const w=state.cssWidth,h=state.cssHeight,bi=s.locationData?.biome;
    ctx.save();
    if(['forest','marsh','dungeon','mine','iceCave','citadel','core'].includes(bi)){
      for(let i=0;i<5;i++){const y=h*(.15+i*.19)+(Math.sin(time*.18+i)*14);const g=ctx.createLinearGradient(0,y-35,0,y+40);g.addColorStop(0,'rgba(210,225,220,0)');g.addColorStop(.5,p.fog);g.addColorStop(1,'rgba(210,225,220,0)');ctx.fillStyle=g;ctx.fillRect(0,y-40,w,85);}
    }
    if(['snow','desert','marsh','starCity','sky','citadel','core'].includes(bi)){
      const count=state.quality==='high'?90:state.quality==='medium'?50:24;
      for(let i=0;i<count;i++){
        const speed=(i%7+2)*(bi==='snow'?6:10),x=(hashNoise(i,3)*w + time*speed)%w,y=(hashNoise(i,5)*h + time*(bi==='snow'?22:8)*(i%3+1))%h;
        ctx.fillStyle=bi==='snow'?'rgba(235,249,255,.55)':bi==='desert'?'rgba(231,191,124,.24)':bi==='marsh'?'rgba(130,244,191,.23)':'rgba(255,131,82,.28)';ctx.beginPath();ctx.arc(x,y,bi==='snow'?1.5:.9,0,TAU);ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawLighting(s,p,metrics,time,battle){
    const w=state.cssWidth,h=state.cssHeight;
    lightCtx.clearRect(0,0,w,h);lightCtx.fillStyle=battle?'rgba(4,4,7,.36)':p.dark;lightCtx.fillRect(0,0,w,h);
    lightCtx.globalCompositeOperation='destination-out';
    const lights=[];
    if(!battle){
      const {tile}=metrics;
      (s.locationData?.decor||[]).filter(d=>['brazier','flame','campfire','forge','lamp','crystal','obelisk'].includes(d.type)).forEach(d=>lights.push({x:(d.x+.5)*tile-state.camera.x,y:(d.y+.5)*tile-state.camera.y,r:tile*1.7,color:p.accent}));
      lights.push({x:(state.hero.x+.5)*tile-state.camera.x,y:(state.hero.y+.45)*tile-state.camera.y,r:tile*1.15,color:'#f0cf9b'});
    } else {
      lights.push({x:w*.28,y:h*.46,r:180,color:'#87cfff'},{x:w*.72,y:h*.44,r:190,color:p.accent});
    }
    for(const l of lights){const g=lightCtx.createRadialGradient(l.x,l.y,0,l.x,l.y,l.r);g.addColorStop(0,'rgba(0,0,0,.92)');g.addColorStop(.62,'rgba(0,0,0,.38)');g.addColorStop(1,'rgba(0,0,0,0)');lightCtx.fillStyle=g;lightCtx.beginPath();lightCtx.arc(l.x,l.y,l.r,0,TAU);lightCtx.fill();}
    lightCtx.globalCompositeOperation='source-over';ctx.drawImage(lightCanvas,0,0,w,h);
    ctx.save();ctx.globalCompositeOperation='screen';for(const l of lights){const g=ctx.createRadialGradient(l.x,l.y,0,l.x,l.y,l.r*.72);g.addColorStop(0,colorAlpha(l.color,.18));g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(l.x,l.y,l.r*.72,0,TAU);ctx.fill();}ctx.restore();
  }

  function colorAlpha(hex,a){if(!hex.startsWith('#'))return `rgba(255,210,150,${a})`;const c=hex.slice(1),r=parseInt(c.slice(0,2),16),g=parseInt(c.slice(2,4),16),b=parseInt(c.slice(4,6),16);return `rgba(${r},${g},${b},${a})`;}

  function battleBackdrop(s,p,time){
    const w=state.cssWidth,h=state.cssHeight;const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,p.sky);g.addColorStop(.58,p.far);g.addColorStop(1,'#08090c');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
    ctx.save();ctx.globalAlpha=.38;ctx.fillStyle='#050609';for(let i=0;i<9;i++){const x=i*w/8 + Math.sin(time*.1+i)*18;ctx.beginPath();ctx.moveTo(x-100,h*.64);ctx.lineTo(x,h*(.22+hashNoise(i,3)*.18));ctx.lineTo(x+120,h*.64);ctx.closePath();ctx.fill();}ctx.restore();
    const floor=ctx.createRadialGradient(w*.5,h*.73,20,w*.5,h*.73,w*.48);floor.addColorStop(0,shade(p.ground,8));floor.addColorStop(.65,shade(p.ground,-15));floor.addColorStop(1,'#0b0b0e');ctx.fillStyle=floor;ctx.beginPath();ctx.ellipse(w*.5,h*.74,w*.48,h*.26,0,0,TAU);ctx.fill();
    ctx.strokeStyle=colorAlpha(p.accent,.22);ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(w*.5,h*.74,w*.34,h*.17,0,0,TAU);ctx.stroke();
  }

  function battleActionOffset(action, enemy=false){if(!action)return {x:0,y:0};const t=clamp((performance.now()-action.at)/action.duration,0,1),pulse=Math.sin(t*Math.PI);if(t>=1)return {x:0,y:0};if(action.type==='dodge')return{x:(enemy?1:-1)*70*pulse,y:-18*pulse};if(action.type==='guard'||action.type==='parry')return{x:(enemy?1:-1)*10*pulse,y:0};return{x:(enemy?-1:1)*(action.type==='execute'?120:78)*pulse,y:-8*pulse};}

  function drawTelegraph(s,p,time){
    const intent=s.battleEnemy?.intent||'attack',danger=['ultimate','heavy','sweep','hex'].includes(intent),w=state.cssWidth,h=state.cssHeight,x=w*.72,y=h*.68;let col='#efaa68';if(intent==='ultimate')col='#ff354f';else if(intent==='hex')col='#b76aff';else if(intent==='brace')col='#78c8ff';else if(intent==='mend')col='#76df9e';
    ctx.save();ctx.globalCompositeOperation='screen';ctx.strokeStyle=colorAlpha(col,.65);ctx.lineWidth=danger?4:2;const pulse=1+Math.sin(time*(intent==='ultimate'?8:5))*(danger?.08:.035);ctx.beginPath();ctx.ellipse(x,y,82*pulse,28*pulse,0,0,TAU);ctx.stroke();ctx.fillStyle=colorAlpha(col,intent==='ultimate'?.12:.055);ctx.beginPath();ctx.ellipse(x,y,76*pulse,24*pulse,0,0,TAU);ctx.fill();ctx.restore();
  }

  function drawBattle(s,dt,time){
    const p=paletteFor(s),w=state.cssWidth,h=state.cssHeight;battleBackdrop(s,p,time);drawTelegraph(s,p,time);
    if(s.battleSurface){ctx.save();ctx.globalCompositeOperation='screen';const t=(s.battleSurface.type||s.battleSurface.kind||'').toLowerCase();const col=t.includes('fire')?'#ff6338':t.includes('poison')?'#62d06f':t.includes('arcane')?'#8e72ff':t.includes('radiant')?'#ffe181':'#6e93ff';ctx.fillStyle=colorAlpha(col,.055+.018*Math.sin(time*4));ctx.beginPath();ctx.ellipse(w*.5,h*.73,w*.38,h*.19,0,0,TAU);ctx.fill();ctx.restore();}
    const heroOff=battleActionOffset(state.action.hero,false),enemyOff=battleActionOffset(state.action.enemy,true);
    drawHumanoid(w*.27+heroOff.x,h*.67+heroOff.y,132,s.heroColors,'right',time,false,state.action.hero,false);
    if(s.companion)drawHumanoid(w*.15,h*.70,94,['#2b303a','#cfa17b','#45627c','#8bd9ec'],'right',time,false,null,true);
    drawEnemy(s.battleEnemy,w*.73+enemyOff.x,h*.66+enemyOff.y,s.battleEnemy?.boss?154:132,time,state.action.enemy);
    drawParticles(dt,time);drawLighting(s,p,null,time,true);
    if(s.battleEnemy?.boss){const vign=ctx.createRadialGradient(w*.5,h*.48,w*.2,w*.5,h*.48,w*.68);vign.addColorStop(0,'rgba(0,0,0,0)');vign.addColorStop(1,'rgba(74,4,18,.28)');ctx.fillStyle=vign;ctx.fillRect(0,0,w,h);}
  }

  function spawnParticleBurst(x,y,color,count=18,speed=160,kind='spark'){
    count=Math.min(count,state.quality==='high'?52:state.quality==='medium'?28:16);
    for(let i=0;i<count;i++){const a=Math.random()*TAU,v=speed*(.35+Math.random()*.8);state.particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-(kind==='blood'?20:50),life:.35+Math.random()*.55,max:.85,size:2+Math.random()*5,color,kind,rot:Math.random()*TAU});}
  }

  function drawParticles(dt){
    state.particles=state.particles.filter(p=>{p.life-=dt;if(p.life<=0)return false;p.vy+=220*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;const a=clamp(p.life/p.max,0,1);ctx.save();ctx.globalCompositeOperation=p.kind==='blood'?'source-over':'screen';ctx.globalAlpha=a;ctx.fillStyle=p.color;ctx.translate(p.x,p.y);ctx.rotate(p.rot);if(p.kind==='slash'){ctx.fillRect(-p.size*5,-p.size*.35,p.size*10,p.size*.7);}else{ctx.beginPath();ctx.arc(0,0,p.size*(.5+a*.5),0,TAU);ctx.fill();}ctx.restore();return true;});
  }

  function fxAt(target,type,color){
    const w=state.cssWidth,h=state.cssHeight,x=target==='hero'?w*.28:w*.72,y=h*.53;const count=type==='ultimate'||type==='execute'?46:22;spawnParticleBurst(x,y,color,count,type==='ultimate'?260:180,type==='blood'?'blood':'spark');if(type==='slash'){for(let i=0;i<5;i++)state.particles.push({x:x-20+i*8,y:y-20+i*4,vx:65,vy:-20,life:.18,max:.18,size:3+i*.7,color,kind:'slash',rot:-.65});}state.camera.shake=Math.max(state.camera.shake,type==='ultimate'||type==='execute'?12:5);}

  function eventColor(text){const t=(text||'').toLowerCase();if(t.includes('fire')||t.includes('burn'))return'#ff673e';if(t.includes('arcane')||t.includes('rune')||t.includes('star'))return'#a77cff';if(t.includes('radiant')||t.includes('holy'))return'#ffe58a';if(t.includes('poison')||t.includes('venom')||t.includes('miasma'))return'#77d86f';if(t.includes('frost')||t.includes('ice'))return'#79dcff';if(t.includes('heal'))return'#77e2a0';return'#ffd09a';}

  window.addEventListener('emberfall:action',e=>{const type=e.detail?.action||'attack';state.action.hero={type,at:performance.now(),duration:type==='execute'?650:type==='burst'?600:360};fxAt('hero',type,eventColor(type));});
  window.addEventListener('emberfall:enemyaction',e=>{const type=e.detail?.intent||'attack';state.action.enemy={type,at:performance.now(),duration:type==='ultimate'?760:430};fxAt('enemy',type,eventColor(type));});
  window.addEventListener('emberfall:fx',e=>{const text=e.detail?.text||e.detail?.kind||'';const lower=text.toLowerCase();fxAt(lower.includes('heal')?'hero':'enemy',lower.includes('execution')?'execute':lower.includes('ultimate')?'ultimate':'slash',eventColor(text));});

  function inferCombatFx(s){
    if(!s?.inBattle){state.lastEnemyHp=null;state.lastHeroHp=null;state.battleKey=null;return;}
    const key=s.battleEnemy?.id||s.battleEnemy?.name||'battle';if(state.battleKey!==key){state.battleKey=key;state.lastEnemyHp=s.battleEnemy?.hp??null;state.lastHeroHp=s.player?.hp??null;state.bossPulse=0;return;}
    const eh=s.battleEnemy?.hp??0,hh=s.player?.hp??0;
    if(state.lastEnemyHp!==null&&eh<state.lastEnemyHp){fxAt('enemy','slash','#ffd09a');state.hitStopUntil=performance.now()+45;}
    if(state.lastHeroHp!==null&&hh<state.lastHeroHp){fxAt('hero','blood','#cf3548');state.hitStopUntil=performance.now()+55;}
    state.lastEnemyHp=eh;state.lastHeroHp=hh;
  }

  function applyCameraShake(){if(!state.camera.shake||state.reducedMotion)return;ctx.translate((Math.random()-.5)*state.camera.shake,(Math.random()-.5)*state.camera.shake*.65);}

  let last=performance.now();
  function loop(now){
    const dt=clamp((now-last)/1000,0,.05);last=now;state.time=now/1000;state.reducedMotion=document.body.classList.contains('pref-reduced-motion');
    const s=window.EmberfallBridge?.snapshot?.();state.lastSnapshot=s||state.lastSnapshot;
    ctx.setTransform(state.dpr,0,0,state.dpr,0,0);ctx.clearRect(0,0,state.cssWidth,state.cssHeight);
    ctx.save();applyCameraShake();
    if(!s?.started){ctx.fillStyle='#080b10';ctx.fillRect(0,0,state.cssWidth,state.cssHeight);}else if(s.inBattle){inferCombatFx(s);drawBattle(s,dt,state.time);}else{inferCombatFx(s);drawWorld(s,dt,state.time);drawParticles(dt,state.time);}
    ctx.restore();
    requestAnimationFrame(loop);
  }

  window.Emberfall2D={
    canvas,
    ready:()=>true,
    quality:()=>state.quality,
    setQuality:q=>{state.quality=['low','medium','high'].includes(q)?q:'high';localStorage.setItem('emberfall-2d-quality',state.quality);resize();},
    snapshot:()=>state.lastSnapshot,
    camera:()=>({...state.camera}),
    screenToTile:(clientX,clientY)=>{
      const s=window.EmberfallBridge?.snapshot?.();if(!s?.started||s.inBattle)return null;const r=canvas.getBoundingClientRect(),m=worldMetrics(s);const x=(clientX-r.left)*(state.cssWidth/r.width)+state.camera.x,y=(clientY-r.top)*(state.cssHeight/r.height)+state.camera.y;return{x:Math.floor(x/m.tile),y:Math.floor(y/m.tile)};
    },
    spawnFx:(target,type,color)=>fxAt(target,type,color||eventColor(type)),
    shake:amount=>{state.camera.shake=Math.max(state.camera.shake,amount||6);}
  };

  document.body.classList.add('modern2d-active');
  requestAnimationFrame(loop);
})();