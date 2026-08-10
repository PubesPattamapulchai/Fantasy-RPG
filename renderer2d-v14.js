(() => {
  'use strict';

  const screen=document.querySelector('.screen-wrap');
  const legacy=document.getElementById('gameCanvas');
  if(!screen||!legacy)return;

  const canvas=document.createElement('canvas');
  canvas.id='modern2dCanvas';
  canvas.setAttribute('aria-label','Emberfall cinematic 2D world');
  legacy.insertAdjacentElement('afterend',canvas);
  let ctx=canvas.getContext('2d',{alpha:false,desynchronized:true})||canvas.getContext('2d');
  if(!ctx){legacy.style.opacity='1';return;}

  const TAU=Math.PI*2;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const lerp=(a,b,t)=>a+(b-a)*t;
  const damp=(a,b,s,dt)=>lerp(a,b,1-Math.exp(-s*dt));
  const state={w:640,h:480,dpr:1,heroX:0,heroY:0,camX:0,camY:0,shake:0,lastLocation:'',lastSnapshot:null,heroAction:null,enemyAction:null,particles:[],error:false};

  const palettes={
    grass:{sky:'#182233',far:'#26354a',ground:'#41523c',path:'#7e694d',water:'#263f50',accent:'#e8bd72',fog:'#b9c8bd'},
    forest:{sky:'#101b23',far:'#172b2a',ground:'#283e31',path:'#675a43',water:'#1b3940',accent:'#8bd197',fog:'#95b5a6'},
    city:{sky:'#202635',far:'#343b48',ground:'#54585d',path:'#786d5d',water:'#314653',accent:'#e7bb74',fog:'#c7ccd5'},
    dungeon:{sky:'#0b0d14',far:'#171925',ground:'#2b2d35',path:'#4c4850',water:'#172938',accent:'#a884ff',fog:'#82769b'},
    highland:{sky:'#25303a',far:'#3b493f',ground:'#56604d',path:'#806f51',water:'#38505a',accent:'#efcb83',fog:'#c8d1c6'},
    marsh:{sky:'#10201f',far:'#1c3430',ground:'#344b40',path:'#5c5d49',water:'#244845',accent:'#73e0c2',fog:'#7faaa0'},
    mine:{sky:'#100e0e',far:'#211b19',ground:'#352f2a',path:'#53463b',water:'#1d3036',accent:'#f0a05f',fog:'#8e7869'},
    desert:{sky:'#5e4938',far:'#846345',ground:'#9b774b',path:'#b59469',water:'#46636b',accent:'#ffd38a',fog:'#d7b990'},
    glass:{sky:'#241f37',far:'#3c3450',ground:'#514765',path:'#756784',water:'#34455f',accent:'#c9a9ff',fog:'#a596bd'},
    snow:{sky:'#617988',far:'#869ba5',ground:'#b7c6c9',path:'#929da0',water:'#52798a',accent:'#9deaff',fog:'#e7f4f6'},
    iceCave:{sky:'#0c1d2a',far:'#18374a',ground:'#35566a',path:'#507485',water:'#17465e',accent:'#74e5ff',fog:'#6eb3cb'},
    starCity:{sky:'#1b1c34',far:'#343652',ground:'#474762',path:'#66647d',water:'#334a68',accent:'#abcaff',fog:'#9fa8d8'},
    sky:{sky:'#506a82',far:'#7694ad',ground:'#707c8d',path:'#8e99a7',water:'#5b87a2',accent:'#bee4ff',fog:'#e5f3ff'},
    citadel:{sky:'#1c1018',far:'#3a1f25',ground:'#493034',path:'#68464a',water:'#361e2d',accent:'#ff775f',fog:'#94524d'},
    core:{sky:'#160913',far:'#331421',ground:'#3d202b',path:'#603238',water:'#2c1730',accent:'#ff884e',fog:'#9e5148'}
  };
  const palette=s=>palettes[s?.locationData?.biome]||palettes.grass;

  function resize(){
    const r=screen.getBoundingClientRect();
    state.w=Math.max(320,Math.round(r.width));state.h=Math.max(240,Math.round(r.height));
    state.dpr=Math.min(window.devicePixelRatio||1,1.75);
    canvas.width=Math.round(state.w*state.dpr);canvas.height=Math.round(state.h*state.dpr);
    canvas.style.width=state.w+'px';canvas.style.height=state.h+'px';
    ctx.setTransform(state.dpr,0,0,state.dpr,0,0);ctx.imageSmoothingEnabled=true;
  }
  new ResizeObserver(resize).observe(screen);resize();

  function hash(x,y,z=0){const n=Math.sin(x*12.9898+y*78.233+z*37.719)*43758.5453;return n-Math.floor(n);}
  function rgba(hex,a){if(!hex||hex[0]!=='#')return `rgba(255,210,150,${a})`;const c=hex.slice(1),r=parseInt(c.slice(0,2),16),g=parseInt(c.slice(2,4),16),b=parseInt(c.slice(4,6),16);return `rgba(${r},${g},${b},${a})`;}
  function roundRect(c,x,y,w,h,r){r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}

  function metrics(s){
    const map=s?.locationData?.map||[];const rows=Math.max(1,map.length),cols=Math.max(1,map[0]?.length||16);
    const tile=clamp(Math.max(48,Math.min(state.w/Math.min(cols,12),state.h/Math.min(rows,8.4))),52,90);
    return{map,rows,cols,tile,worldW:cols*tile,worldH:rows*tile};
  }

  function sync(s,dt,m){
    if(state.lastLocation!==s.location){state.lastLocation=s.location;state.heroX=s.player?.x||0;state.heroY=s.player?.y||0;state.camX=0;state.camY=0;}
    state.heroX=damp(state.heroX,s.player?.x||0,15,dt);state.heroY=damp(state.heroY,s.player?.y||0,15,dt);
    const tx=(state.heroX+.5)*m.tile-state.w*.5,ty=(state.heroY+.55)*m.tile-state.h*.5;
    state.camX=damp(state.camX,clamp(tx,0,Math.max(0,m.worldW-state.w)),10,dt);
    state.camY=damp(state.camY,clamp(ty,0,Math.max(0,m.worldH-state.h)),10,dt);
    state.shake=Math.max(0,state.shake-dt*20);
  }

  function drawSky(s,p,time){
    const g=ctx.createLinearGradient(0,0,0,state.h);g.addColorStop(0,p.sky);g.addColorStop(.55,p.far);g.addColorStop(1,'#090b10');ctx.fillStyle=g;ctx.fillRect(0,0,state.w,state.h);
    ctx.save();
    for(let layer=0;layer<3;layer++){
      const y0=state.h*(.25+layer*.085),off=(state.camX*(.035+layer*.025))%180;ctx.fillStyle=`rgba(5,8,12,${.18+layer*.12})`;ctx.beginPath();ctx.moveTo(-100,state.h);
      for(let x=-160;x<state.w+220;x+=110){const n=hash(Math.floor((x+off)/90),layer,s.location?.length||1);ctx.lineTo(x-off,y0-n*(70+layer*32));}
      ctx.lineTo(state.w+120,state.h);ctx.closePath();ctx.fill();
    }
    if(['starCity','sky','glass'].includes(s.locationData?.biome))for(let i=0;i<38;i++){const x=(hash(i,8)*state.w+time*(3+i%4))%state.w,y=hash(i,11)*state.h*.46;ctx.fillStyle=`rgba(206,222,255,${.12+hash(i,5)*.38})`;ctx.beginPath();ctx.arc(x,y,.5+hash(i,2)*1.4,0,TAU);ctx.fill();}
    ctx.restore();
  }

  function tileColor(ch,p){if(ch==='~')return p.water;if(['P','C','D','S'].includes(ch))return p.path;return p.ground;}
  function drawTerrain(s,p,m){
    const map=m.map;
    ctx.save();ctx.translate(-state.camX,-state.camY);
    if(!map.length){ctx.fillStyle=p.ground;ctx.fillRect(0,0,m.worldW,m.worldH);}
    for(let y=0;y<map.length;y++)for(let x=0;x<(map[y]?.length||0);x++){
      const ch=map[y][x],px=x*m.tile,py=y*m.tile,base=tileColor(ch,p),n=hash(x,y,s.location?.length||0);
      const g=ctx.createLinearGradient(px,py,px+m.tile,py+m.tile);g.addColorStop(0,base);g.addColorStop(1,rgba('#000000',.08));ctx.fillStyle=base;ctx.fillRect(px,py,m.tile+1,m.tile+1);
      ctx.fillStyle=n>.5?'rgba(255,255,255,.025)':'rgba(0,0,0,.035)';ctx.fillRect(px,py,m.tile+1,m.tile+1);
      if(ch==='~'){
        ctx.strokeStyle='rgba(171,225,239,.16)';ctx.lineWidth=1.5;for(let k=0;k<2;k++){ctx.beginPath();ctx.moveTo(px+8,py+m.tile*(.35+k*.28));ctx.quadraticCurveTo(px+m.tile*.48,py+m.tile*(.28+k*.28)+Math.sin((x+y+k)*2)*3,px+m.tile-8,py+m.tile*(.35+k*.28));ctx.stroke();}
      }else if(['P','C','D','S'].includes(ch)){
        ctx.strokeStyle='rgba(245,218,166,.075)';ctx.beginPath();ctx.moveTo(px+8,py+m.tile*.7);ctx.quadraticCurveTo(px+m.tile*.46,py+m.tile*.52,px+m.tile-8,py+m.tile*.64);ctx.stroke();
      }else{
        for(let k=0;k<3;k++){const rx=px+hash(x*7+k,y)*m.tile,ry=py+hash(x,y*9+k)*m.tile;ctx.fillStyle='rgba(235,226,190,.045)';ctx.beginPath();ctx.arc(rx,ry,1+hash(k,x+y)*1.5,0,TAU);ctx.fill();}
      }
    }
    ctx.restore();
  }

  function shadow(x,y,rx,ry,a=.32){ctx.save();ctx.translate(x,y);ctx.scale(1,ry/rx);const g=ctx.createRadialGradient(0,0,0,0,0,rx);g.addColorStop(0,`rgba(0,0,0,${a})`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,rx,0,TAU);ctx.fill();ctx.restore();}
  function drawTree(x,y,z,p,time){shadow(x,y+z*.18,z*.42,z*.1,.27);ctx.fillStyle='#3b2b23';roundRect(ctx,x-z*.07,y-z*.35,z*.14,z*.54,z*.04);ctx.fill();const sway=Math.sin(time*1.2+x*.01)*z*.018;for(let i=0;i<3;i++){ctx.fillStyle=i===0?'#182c24':i===1?'#254334':'#315640';ctx.beginPath();ctx.arc(x+sway*(i+1)+(i-1)*z*.08,y-z*(.48+i*.11),z*(.28-i*.02),0,TAU);ctx.fill();}}
  function drawRock(x,y,z,p,seed){shadow(x,y+z*.15,z*.32,z*.09,.22);const g=ctx.createLinearGradient(x-z*.25,y-z*.34,x+z*.28,y+z*.18);g.addColorStop(0,'rgba(210,205,195,.38)');g.addColorStop(1,'rgba(34,34,39,.65)');ctx.fillStyle=g;ctx.beginPath();for(let i=0;i<7;i++){const a=i/7*TAU,r=z*(.22+hash(i,seed)*.12),px=x+Math.cos(a)*r,py=y+Math.sin(a)*r*.68-z*.1;i?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.closePath();ctx.fill();}
  function drawBuilding(x,y,z,p){shadow(x,y+z*.3,z*.48,z*.13,.3);const w=z*.72,h=z*.58;const g=ctx.createLinearGradient(x-w*.5,y-h,x+w*.5,y);g.addColorStop(0,'#555056');g.addColorStop(1,'#2b2b31');ctx.fillStyle=g;roundRect(ctx,x-w*.5,y-h*.62,w,h*.62,5);ctx.fill();ctx.fillStyle='#282029';ctx.beginPath();ctx.moveTo(x-w*.62,y-h*.58);ctx.lineTo(x,y-h);ctx.lineTo(x+w*.62,y-h*.58);ctx.closePath();ctx.fill();ctx.fillStyle=rgba(p.accent,.42);ctx.fillRect(x-w*.18,y-h*.37,w*.12,h*.16);}
  function drawProp(type,x,y,z,p,time){const t=String(type||'').toLowerCase();if(t.includes('tree'))return drawTree(x,y,z,p,time);if(t.includes('rock')||t.includes('ore'))return drawRock(x,y,z,p,t.length);shadow(x,y+z*.18,z*.28,z*.08,.24);if(t.includes('brazier')||t.includes('flame')||t.includes('campfire')||t.includes('forge')){ctx.fillStyle='#4a3930';ctx.fillRect(x-z*.08,y-z*.22,z*.16,z*.30);ctx.save();ctx.shadowBlur=24;ctx.shadowColor=p.accent;ctx.fillStyle='#ffb35d';ctx.beginPath();ctx.moveTo(x,y-z*.55-Math.sin(time*7)*z*.04);ctx.quadraticCurveTo(x-z*.18,y-z*.26,x,y-z*.16);ctx.quadraticCurveTo(x+z*.18,y-z*.26,x,y-z*.55-Math.sin(time*7)*z*.04);ctx.fill();ctx.restore();}else if(t.includes('crystal')||t.includes('obelisk')){ctx.save();ctx.shadowBlur=18;ctx.shadowColor=p.accent;ctx.fillStyle=rgba(p.accent,.8);ctx.beginPath();ctx.moveTo(x,y-z*.62);ctx.lineTo(x+z*.17,y-z*.18);ctx.lineTo(x,y);ctx.lineTo(x-z*.17,y-z*.18);ctx.closePath();ctx.fill();ctx.restore();}else{ctx.fillStyle='#62574c';ctx.beginPath();ctx.arc(x,y-z*.16,z*.18,0,TAU);ctx.fill();}}

  function drawHumanoid(x,y,z,colors,time,action,hero=false){
    const c=colors?.length?colors:['#2d3646','#d2a179','#526a85','#82c7ef'];const t=action?clamp((performance.now()-action.at)/action.duration,0,1):0,pulse=action?Math.sin(t*Math.PI):0;const bob=Math.sin(time*3+x*.01)*z*.012;
    shadow(x,y+z*.18,z*.3,z*.08,.34);ctx.save();ctx.translate(x+(action?.type==='dodge'?-60*pulse:action?55*pulse:0),y+bob-pulse*5);
    const body=ctx.createLinearGradient(-z*.2,-z*.58,z*.22,z*.16);body.addColorStop(0,c[2]||'#526a85');body.addColorStop(1,c[0]||'#273244');ctx.fillStyle=body;roundRect(ctx,-z*.20,-z*.52,z*.40,z*.58,z*.11);ctx.fill();
    ctx.fillStyle=c[1]||'#d2a179';ctx.beginPath();ctx.arc(0,-z*.66,z*.15,0,TAU);ctx.fill();
    ctx.fillStyle=c[0]||'#252c38';ctx.beginPath();ctx.arc(-z*.02,-z*.70,z*.16,Math.PI,TAU);ctx.fill();
    ctx.strokeStyle='#161a20';ctx.lineWidth=z*.07;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-z*.10,z*.01);ctx.lineTo(-z*.14,z*.30);ctx.moveTo(z*.10,z*.01);ctx.lineTo(z*.14,z*.30);ctx.stroke();
    const weapon=c[3]||'#9dd8ff';ctx.save();ctx.translate(z*.24,-z*.28);ctx.rotate(-.62-pulse*.8);ctx.strokeStyle=weapon;ctx.lineWidth=z*.032;ctx.shadowBlur=hero?10:5;ctx.shadowColor=weapon;ctx.beginPath();ctx.moveTo(0,z*.18);ctx.lineTo(0,-z*.34);ctx.stroke();ctx.restore();
    if(hero){ctx.strokeStyle=rgba(c[3]||'#9dd8ff',.28);ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,z*.23,z*.28,z*.09,0,0,TAU);ctx.stroke();}
    ctx.restore();
  }

  function drawEnemy(e,x,y,z,time,action){
    const boss=!!e?.boss,elite=!!e?.elite||!!e?.elite2,name=String(e?.name||e?.type||'').toLowerCase();const pulse=action?Math.sin(clamp((performance.now()-action.at)/action.duration,0,1)*Math.PI):0;let body='#6c3a3d',accent='#ff765f';if(name.includes('wolf')||name.includes('beast')){body='#5e584f';accent='#e9bd84';}if(name.includes('wraith')||name.includes('mage')){body='#59436f';accent='#c18aff';}if(name.includes('golem')||name.includes('guard')||name.includes('knight')){body='#545e68';accent='#91cfee';}if(name.includes('hydra')){body='#2d6652';accent='#79e3ad';}
    shadow(x,y+z*.22,z*(boss?.48:.36),z*.10,.4);ctx.save();ctx.translate(x-pulse*z*.16,y);if(boss)ctx.scale(1.16,1.16);const g=ctx.createLinearGradient(-z*.25,-z*.55,z*.25,z*.15);g.addColorStop(0,body);g.addColorStop(1,'#241d24');ctx.fillStyle=g;roundRect(ctx,-z*.27,-z*.54,z*.54,z*.65,z*.13);ctx.fill();ctx.fillStyle=body;ctx.beginPath();ctx.arc(0,-z*.66,z*.19,0,TAU);ctx.fill();ctx.save();ctx.shadowBlur=18;ctx.shadowColor=accent;ctx.fillStyle=accent;ctx.beginPath();ctx.arc(0,-z*.64,z*.045,0,TAU);ctx.fill();ctx.restore();ctx.strokeStyle='#211b22';ctx.lineWidth=z*.075;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-z*.21,-z*.2);ctx.lineTo(-z*(.38+.16*pulse),z*.05);ctx.moveTo(z*.21,-z*.2);ctx.lineTo(z*(.38+.16*pulse),z*.05);ctx.stroke();if(boss||elite){ctx.strokeStyle=rgba(accent,boss?.52:.32);ctx.lineWidth=boss?3:2;ctx.beginPath();ctx.ellipse(0,z*.18,z*(boss?.48:.38),z*.11,0,0,TAU);ctx.stroke();}ctx.restore();
  }

  function worldDrawables(s,p,m,time){const a=[];const add=(wy,fn)=>a.push({wy,fn});(m.map||[]).forEach((row,y)=>[...row].forEach((ch,x)=>{const wx=(x+.5)*m.tile,wy=(y+.76)*m.tile;if(ch==='T')add(wy,()=>drawTree(wx-state.camX,wy-state.camY,m.tile*.98,p,time));else if(['W','M','R','L'].includes(ch))add(wy,()=>drawRock(wx-state.camX,wy-state.camY,m.tile*.72,p,x+y*17));else if(ch==='B')add(wy,()=>drawBuilding(wx-state.camX,wy-state.camY,m.tile,p));}));(s.locationData?.decor||[]).forEach((d,i)=>{const wx=(d.x+.5)*m.tile,wy=(d.y+.75)*m.tile;add(wy,()=>drawProp(d.type,wx-state.camX,wy-state.camY,m.tile*.72,p,time+i*.1));});(s.locationData?.npcs||[]).forEach(n=>{const wx=(n.x+.5)*m.tile,wy=(n.y+.82)*m.tile;add(wy,()=>drawHumanoid(wx-state.camX,wy-state.camY,m.tile*.72,n.colors,time,null,false));});(s.locationData?.enemies||[]).forEach(e=>{const wx=(e.x+.5)*m.tile,wy=(e.y+.82)*m.tile;add(wy,()=>drawEnemy(e,wx-state.camX,wy-state.camY,m.tile*.70,time,null));});const hx=(state.heroX+.5)*m.tile,hy=(state.heroY+.84)*m.tile;add(hy,()=>drawHumanoid(hx-state.camX,hy-state.camY,m.tile*.80,s.heroColors,time,state.heroAction,true));return a.sort((x,y)=>x.wy-y.wy);}

  function drawAtmosphere(s,p,time){ctx.save();const bi=s.locationData?.biome,count=document.body.classList.contains('pref-reduced-motion')?8:30;for(let i=0;i<count;i++){const x=(hash(i,2)*state.w+time*(4+i%6))%(state.w+30)-15,y=(hash(i,5)*state.h+time*(2+i%3))%(state.h+30)-15;let col=p.fog;if(['citadel','core','mine'].includes(bi))col='#ff8c58';ctx.fillStyle=rgba(col,.05+(i%4)*.018);ctx.beginPath();ctx.arc(x,y,.8+(i%3)*.6,0,TAU);ctx.fill();}const v=ctx.createRadialGradient(state.w*.5,state.h*.46,state.w*.2,state.w*.5,state.h*.48,state.w*.72);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.30)');ctx.fillStyle=v;ctx.fillRect(0,0,state.w,state.h);ctx.restore();}

  function drawWorld(s,dt,time){const p=palette(s),m=metrics(s);sync(s,dt,m);drawSky(s,p,time);drawTerrain(s,p,m);worldDrawables(s,p,m,time).forEach(o=>o.fn());drawAtmosphere(s,p,time);}

  function drawBattle(s,time){const p=palette(s),w=state.w,h=state.h;const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,p.sky);g.addColorStop(.55,p.far);g.addColorStop(1,'#08090d');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);ctx.fillStyle='rgba(5,6,9,.45)';for(let i=0;i<8;i++){const x=i*w/7;ctx.beginPath();ctx.moveTo(x-110,h*.68);ctx.lineTo(x,h*(.22+hash(i,5)*.2));ctx.lineTo(x+120,h*.68);ctx.closePath();ctx.fill();}const floor=ctx.createRadialGradient(w*.5,h*.73,10,w*.5,h*.73,w*.5);floor.addColorStop(0,rgba(p.ground,.95));floor.addColorStop(.65,'rgba(22,23,27,.88)');floor.addColorStop(1,'#08090c');ctx.fillStyle=floor;ctx.beginPath();ctx.ellipse(w*.5,h*.74,w*.48,h*.25,0,0,TAU);ctx.fill();const intent=s.battleEnemy?.intent||'attack';let ic='#e9a56a';if(intent==='ultimate')ic='#ff4057';else if(intent==='hex')ic='#b877ff';else if(intent==='mend')ic='#72dc99';else if(intent==='brace')ic='#7dc8ff';ctx.save();ctx.globalCompositeOperation='screen';ctx.strokeStyle=rgba(ic,.68);ctx.lineWidth=intent==='ultimate'?5:3;const q=1+Math.sin(time*(intent==='ultimate'?9:5))*.07;ctx.beginPath();ctx.ellipse(w*.72,h*.70,92*q,29*q,0,0,TAU);ctx.stroke();ctx.restore();drawHumanoid(w*.27,h*.67,138,s.heroColors,time,state.heroAction,true);if(s.companion)drawHumanoid(w*.15,h*.70,94,['#303743','#cfa17b','#4d6680','#8bd9ec'],time,null,false);drawEnemy(s.battleEnemy,w*.73,h*.66,s.battleEnemy?.boss?164:136,time,state.enemyAction);if(s.battleEnemy?.boss){const v=ctx.createRadialGradient(w*.72,h*.46,20,w*.72,h*.46,w*.43);v.addColorStop(0,rgba('#ff5360',.10+.03*Math.sin(time*4)));v.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=v;ctx.fillRect(0,0,w,h);}drawParticles(.016);drawAtmosphere(s,p,time);}

  function burst(target,color,count=24){const x=state.w*(target==='hero'?.28:.72),y=state.h*.50;for(let i=0;i<count;i++){const a=Math.random()*TAU,v=80+Math.random()*180;state.particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-30,life:.25+Math.random()*.45,max:.7,size:1+Math.random()*4,color});}}
  function drawParticles(dt){state.particles=state.particles.filter(p=>{p.life-=dt;if(p.life<=0)return false;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=160*dt;ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=clamp(p.life/p.max,0,1);ctx.fillStyle=p.color;ctx.shadowBlur=10;ctx.shadowColor=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,TAU);ctx.fill();ctx.restore();return true;});}
  function actionDuration(type){return type==='execute'||type==='burst'?650:type==='dodge'?460:380;}
  window.addEventListener('emberfall:action',e=>{const type=e.detail?.action||'attack';state.heroAction={type,at:performance.now(),duration:actionDuration(type)};burst('enemy',type==='parry'?'#82d9ff':type==='burst'?'#ff8a51':'#f1bd7f',type==='burst'?40:20);state.shake=Math.max(state.shake,type==='execute'||type==='burst'?10:4);});
  window.addEventListener('emberfall:enemyaction',e=>{const type=e.detail?.intent||'attack';state.enemyAction={type,at:performance.now(),duration:type==='ultimate'?720:430};burst('hero',type==='hex'?'#b678ff':type==='ultimate'?'#ff4b56':'#efb47c',type==='ultimate'?38:18);state.shake=Math.max(state.shake,type==='ultimate'?11:5);});
  window.addEventListener('emberfall:fx',e=>{const t=String(e.detail?.text||e.detail?.kind||'').toLowerCase();const target=t.includes('heal')?'hero':'enemy',color=t.includes('fire')?'#ff6c3f':t.includes('poison')?'#75d36c':t.includes('frost')?'#78dcff':t.includes('arcane')?'#ab7cff':t.includes('radiant')?'#ffe083':'#f0bd81';burst(target,color,t.includes('critical')||t.includes('execution')?36:18);});

  let last=performance.now();
  function frame(now){const dt=clamp((now-last)/1000,0,.05);last=now;const s=window.EmberfallBridge?.snapshot?.();state.lastSnapshot=s||state.lastSnapshot;try{ctx.setTransform(state.dpr,0,0,state.dpr,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.clearRect(0,0,state.w,state.h);ctx.save();if(state.shake&&!document.body.classList.contains('pref-reduced-motion'))ctx.translate((Math.random()-.5)*state.shake,(Math.random()-.5)*state.shake*.6);if(!s?.started){ctx.fillStyle='#090c12';ctx.fillRect(0,0,state.w,state.h);}else if(s.inBattle)drawBattle(s,now/1000);else{drawWorld(s,dt,now/1000);drawParticles(dt);}ctx.restore();state.error=false;}catch(err){console.error('Emberfall 2D renderer v14 fallback',err);state.error=true;canvas.style.display='none';legacy.style.opacity='1';legacy.style.pointerEvents='auto';}requestAnimationFrame(frame);}

  window.Emberfall2D={canvas,ready:()=>!state.error,snapshot:()=>state.lastSnapshot,camera:()=>({x:state.camX,y:state.camY,shake:state.shake}),screenToTile:(clientX,clientY)=>{const s=window.EmberfallBridge?.snapshot?.();if(!s?.started||s.inBattle)return null;const r=canvas.getBoundingClientRect(),m=metrics(s),x=(clientX-r.left)*(state.w/r.width)+state.camX,y=(clientY-r.top)*(state.h/r.height)+state.camY;return{x:Math.floor(x/m.tile),y:Math.floor(y/m.tile)};},spawnFx:(target,type,color)=>burst(target,color||'#efb873',type==='ultimate'||type==='execute'?40:20),shake:n=>{state.shake=Math.max(state.shake,n||6);}};
  document.body.classList.add('modern2d-active','blackstar-v14');requestAnimationFrame(frame);
})();
