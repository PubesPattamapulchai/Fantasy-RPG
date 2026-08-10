(() => {
  'use strict';

  const $ = (s, root = document) => root.querySelector(s);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const apiReady = () => window.Emberfall3D && window.EmberfallBridge && window.THREE;
  const snap = () => window.EmberfallBridge?.snapshot?.();

  const runtime = {
    queuedAction: null,
    queueAt: 0,
    heldMove: new Map(),
    path: [],
    pathTimer: 0,
    pathGoal: null,
    interactAtEnd: false,
    lastPathPosition: null,
    detailRoot: null,
    battleOverlayRoot: null,
    telegraph: null,
    telegraphFill: null,
    surfaceDisc: null,
    weather: null,
    currentLocation: null,
    currentBattle: null,
    motions: [],
    lastFrame: performance.now(),
    initialized: false
  };

  const moveKeys = new Set(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright']);
  const actionKeys = {
    '1':'attack','2':'skill1','3':'skill2','4':'guard','5':'potion','6':'bomb','7':'burst','8':'tactic','9':'inspire','0':'dodge',
    'q':'weaponTechnique','p':'parry','x':'execute','e':'environment','t':'partyTactic'
  };
  const dirKey = (dx,dy) => dx===1?'ArrowRight':dx===-1?'ArrowLeft':dy===1?'ArrowDown':'ArrowUp';
  const blockedTiles = new Set(['#','T','B','W','M','R','L','~']);

  function visibleButton(action) {
    return [...document.querySelectorAll(`[data-action="${action}"]`)].find(btn => btn.offsetParent !== null) || null;
  }

  function ensureQueueHud() {
    const battle = $('#battleScreen');
    if (!battle || $('#actionQueueChip')) return;
    const chip = document.createElement('div');
    chip.id = 'actionQueueChip';
    chip.className = 'action-queue-chip hidden';
    chip.innerHTML = '<span>INPUT BUFFER</span><strong>READY</strong>';
    battle.appendChild(chip);
  }

  function showQueue(action) {
    ensureQueueHud();
    const chip = $('#actionQueueChip');
    if (!chip) return;
    chip.classList.remove('hidden');
    chip.querySelector('strong').textContent = action.replace(/([A-Z])/g,' $1').toUpperCase();
  }

  function clearQueue() {
    runtime.queuedAction = null;
    $('#actionQueueChip')?.classList.add('hidden');
  }

  function queueAction(action) {
    runtime.queuedAction = action;
    runtime.queueAt = performance.now();
    showQueue(action);
  }

  function flushQueuedAction() {
    if (!runtime.queuedAction) return;
    const s = snap();
    if (!s?.inBattle) { clearQueue(); return; }
    if (performance.now() - runtime.queueAt > 2600) { clearQueue(); return; }
    const btn = visibleButton(runtime.queuedAction);
    if (btn && !btn.disabled) {
      const action = runtime.queuedAction;
      clearQueue();
      btn.click();
      flashStage('queued-fire');
      window.dispatchEvent(new CustomEvent('emberfall:bufferedaction',{detail:{action}}));
    }
  }

  function installInputBuffer() {
    document.addEventListener('keydown', event => {
      if (!event.isTrusted || event.ctrlKey || event.metaKey || event.altKey) return;
      const s = snap();
      const key = event.key.toLowerCase();
      if (s?.inBattle && actionKeys[key]) {
        const btn = visibleButton(actionKeys[key]);
        if (!btn || btn.disabled) {
          queueAction(actionKeys[key]);
          event.preventDefault();
          event.stopImmediatePropagation();
          return;
        }
      }
      if (!s?.inBattle && s?.started && moveKeys.has(key) && !event.repeat) startHeldMove(event.key);
    }, true);

    document.addEventListener('keyup', event => stopHeldMove(event.key), true);
    window.addEventListener('blur', stopAllHeldMove);
    document.addEventListener('visibilitychange', () => { if (document.hidden) stopAllHeldMove(); });

    document.addEventListener('pointerdown', event => {
      const btn = event.target?.closest?.('[data-action]');
      if (!btn || !snap()?.inBattle || !btn.disabled) return;
      queueAction(btn.dataset.action);
      event.preventDefault();
    }, true);
  }

  function startHeldMove(key) {
    const lower = key.toLowerCase();
    if (!moveKeys.has(lower) || runtime.heldMove.has(lower)) return;
    const record = { timeout: null, interval: null, original: key };
    record.timeout = setTimeout(() => {
      record.interval = setInterval(() => {
        const s = snap();
        if (!s?.started || s.inBattle || document.querySelector('.menu-overlay:not(.hidden), .dialogue:not(.hidden)')) return;
        document.dispatchEvent(new KeyboardEvent('keydown',{key:record.original,bubbles:true,cancelable:true}));
      }, 78);
    }, 125);
    runtime.heldMove.set(lower, record);
  }

  function stopHeldMove(key) {
    const lower = String(key||'').toLowerCase();
    const record = runtime.heldMove.get(lower);
    if (!record) return;
    clearTimeout(record.timeout); clearInterval(record.interval); runtime.heldMove.delete(lower);
  }

  function stopAllHeldMove() {
    [...runtime.heldMove.keys()].forEach(stopHeldMove);
  }

  function isPassable(s, x, y, goal = null) {
    const map = s?.locationData?.map || [];
    if (y < 0 || y >= map.length || x < 0 || x >= (map[y]?.length || 0)) return false;
    if (goal && goal.x === x && goal.y === y) return true;
    const ch = map[y][x];
    if (blockedTiles.has(ch)) return false;
    const occupied = [...(s.locationData.npcs||[]), ...(s.locationData.enemies||[]).filter(e=>!e.defeated)]
      .some(o => o.x===x && o.y===y);
    return !occupied;
  }

  function findPath(s, target) {
    const start = {x:s.player.x,y:s.player.y};
    if (start.x===target.x && start.y===target.y) return [];
    const q = [start], seen = new Map([[`${start.x},${start.y}`,null]]);
    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    for (let qi=0; qi<q.length && qi<600; qi++) {
      const cur=q[qi];
      for (const [dx,dy] of dirs) {
        const nx=cur.x+dx,ny=cur.y+dy,key=`${nx},${ny}`;
        if (seen.has(key) || !isPassable(s,nx,ny,target)) continue;
        seen.set(key,cur);q.push({x:nx,y:ny});
        if (nx===target.x&&ny===target.y) {
          const out=[];let p={x:nx,y:ny};
          while (p.x!==start.x||p.y!==start.y) { out.push(p); p=seen.get(`${p.x},${p.y}`); }
          return out.reverse();
        }
      }
    }
    return null;
  }

  function nearestInteractionTarget(s, target) {
    const actors = [
      ...(s.locationData.npcs||[]).map(o=>({...o,kind:'npc'})),
      ...(s.locationData.enemies||[]).filter(e=>!e.defeated).map(o=>({...o,kind:'enemy'})),
      ...(s.locationData.exits||[]).map(o=>({...o,kind:'exit'}))
    ];
    return actors.find(o => Math.abs(o.x-target.x)+Math.abs(o.y-target.y)===0) || null;
  }

  function bestAdjacent(s, actor) {
    const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
    const candidates=dirs.map(([dx,dy])=>({x:actor.x+dx,y:actor.y+dy}))
      .filter(p=>isPassable(s,p.x,p.y));
    candidates.sort((a,b)=>Math.abs(a.x-s.player.x)+Math.abs(a.y-s.player.y)-Math.abs(b.x-s.player.x)-Math.abs(b.y-s.player.y));
    for(const c of candidates){const path=findPath(s,c);if(path)return {target:c,path};}
    return null;
  }

  function startPathTo(tile) {
    const s=snap();if(!s?.started||s.inBattle)return;
    const actor=nearestInteractionTarget(s,tile);
    let target=tile,path=null,interact=false;
    if(actor){const choice=bestAdjacent(s,actor);if(!choice)return;target=choice.target;path=choice.path;interact=true;}
    else path=findPath(s,target);
    if(!path)return;
    runtime.path=path;runtime.pathGoal=target;runtime.interactAtEnd=interact;runtime.pathTimer=0;runtime.lastPathPosition={x:s.player.x,y:s.player.y};
    flashStage('path-ping');
    showGroundPing(tile,actor?'interact':'move');
  }

  function updatePath(dt) {
    if (!runtime.path.length) return;
    const s=snap();
    if(!s?.started||s.inBattle){runtime.path=[];return;}
    runtime.pathTimer-=dt;
    if(runtime.pathTimer>0)return;
    const next=runtime.path[0],px=s.player.x,py=s.player.y;
    const dx=next.x-px,dy=next.y-py;
    if(Math.abs(dx)+Math.abs(dy)!==1){runtime.path=[];return;}
    document.dispatchEvent(new KeyboardEvent('keydown',{key:dirKey(dx,dy),bubbles:true,cancelable:true}));
    runtime.pathTimer=.095;
    setTimeout(()=>{
      const now=snap();if(!now||!runtime.path.length)return;
      if(now.player.x===next.x&&now.player.y===next.y){runtime.path.shift();runtime.lastPathPosition={x:next.x,y:next.y};if(!runtime.path.length&&runtime.interactAtEnd){setTimeout(()=>document.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true})),90);runtime.interactAtEnd=false;}}
      else {runtime.path=[];runtime.interactAtEnd=false;}
    },76);
  }

  function installClickMove() {
    const canvas=window.Emberfall3D?.canvas;
    if(!canvas)return;
    let down=null;
    canvas.style.pointerEvents='auto';
    canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;down={x:e.clientX,y:e.clientY,t:performance.now()};});
    canvas.addEventListener('pointerup',e=>{
      if(!down)return;const dist=Math.hypot(e.clientX-down.x,e.clientY-down.y),age=performance.now()-down.t;down=null;
      if(dist>10||age>650||snap()?.inBattle)return;
      const hit=window.Emberfall3D?.screenToGround?.(e.clientX,e.clientY);if(!hit)return;
      const tile={x:Math.round(hit.x+.5),y:Math.round(hit.z+.5)};startPathTo(tile);
    });
  }

  function flashStage(cls) {
    const stage=window.Emberfall3D?.stage;if(!stage)return;stage.classList.remove(cls);void stage.offsetWidth;stage.classList.add(cls);setTimeout(()=>stage.classList.remove(cls),260);
  }

  function showGroundPing(tile,kind='move') {
    const api=window.Emberfall3D,THREE=window.THREE,world=api?.worldRoot?.();if(!world||!THREE)return;
    const mat=new THREE.MeshBasicMaterial({color:kind==='interact'?0xf3c876:0x79cfff,transparent:true,opacity:.82,depthWrite:false,side:THREE.DoubleSide});
    const ring=new THREE.Mesh(new THREE.RingGeometry(.18,.28,28),mat);ring.rotation.x=-Math.PI/2;ring.position.set(tile.x-.5,.025,tile.y-.5);world.add(ring);
    const born=performance.now();
    const tick=()=>{const t=(performance.now()-born)/500;if(t>=1){world.remove(ring);ring.geometry.dispose();mat.dispose();return;}ring.scale.setScalar(1+t*2.4);mat.opacity=.82*(1-t);requestAnimationFrame(tick);};tick();
  }

  function seeded(n) { const x=Math.sin(n*12.9898+78.233)*43758.5453; return x-Math.floor(x); }

  function disposeRoot(root) {
    if(!root)return;root.parent?.remove(root);root.traverse(o=>{o.geometry?.dispose?.();if(o.material){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.dispose?.());}});
  }

  function biomeColors(biome) {
    const map={
      forest:[0x38583c,0x20352a],grass:[0x506a3a,0x2c442f],city:[0x5f615d,0x353a40],dungeon:[0x4a4856,0x24232c],highland:[0x657157,0x39443a],marsh:[0x426457,0x203e37],mine:[0x6b4b34,0x30251f],desert:[0x9a7440,0x62452b],glass:[0x75658f,0x403954],snow:[0xd4e1df,0x8ea7aa],iceCave:[0x6cb4c9,0x2c5368],starCity:[0x6d7094,0x363854],sky:[0xa6bfd1,0x6e7d91],citadel:[0x6f3b35,0x342124],core:[0x71352f,0x301922]
    };return map[biome]||map.grass;
  }

  function rebuildDetail(s) {
    const api=window.Emberfall3D,THREE=window.THREE,world=api?.worldRoot?.();if(!world||!s?.locationData)return;
    disposeRoot(runtime.detailRoot);runtime.weather=null;
    const root=new THREE.Group();root.name='ActionRPGDetail';world.add(root);runtime.detailRoot=root;
    const biome=s.locationData.biome||'grass',[c1,c2]=biomeColors(biome),map=s.locationData.map||[],h=map.length,w=map[0]?.length||12;
    const outdoor=!['dungeon','mine','iceCave','core'].includes(biome);
    const density=document.body.classList.contains('pref-reduced-motion')?0.55:1;
    const quality=window.Emberfall3D?.quality?.()||'high';
    const clutterCount=Math.floor((quality==='high'?230:quality==='medium'?120:55)*density);
    const bladeGeo=new THREE.BoxGeometry(.025,.22,.055),bladeMat=new THREE.MeshStandardMaterial({color:c1,roughness:.95,metalness:0});
    const blades=new THREE.InstancedMesh(bladeGeo,bladeMat,clutterCount);blades.castShadow=false;blades.receiveShadow=true;
    const dummy=new THREE.Object3D();let used=0;
    for(let i=0;i<clutterCount*3&&used<clutterCount;i++){
      const rx=seeded(i*7.13+3),ry=seeded(i*5.71+8),x=Math.floor(rx*w),y=Math.floor(ry*h),ch=map[y]?.[x];
      if(!ch||blockedTiles.has(ch)||['P','C','D'].includes(ch))continue;
      dummy.position.set(x-.95+seeded(i*2.1)*.9,.1,y-.95+seeded(i*9.3)*.9);dummy.rotation.set(0,seeded(i*4.4)*Math.PI,seeded(i*3.7)*.12-.06);const sc=.65+seeded(i*8.9)*.9;dummy.scale.set(sc,sc,sc);dummy.updateMatrix();blades.setMatrixAt(used++,dummy.matrix);
    }
    blades.count=used;root.add(blades);

    const rockCount=quality==='high'?42:quality==='medium'?24:10,rockGeo=new THREE.DodecahedronGeometry(.11,0),rockMat=new THREE.MeshStandardMaterial({color:c2,roughness:.92,metalness:.03}),rocks=new THREE.InstancedMesh(rockGeo,rockMat,rockCount);used=0;
    for(let i=0;i<rockCount*2&&used<rockCount;i++){const x=seeded(i*11+1)*w-.5,z=seeded(i*17+4)*h-.5;dummy.position.set(x,.08,z);dummy.rotation.set(seeded(i)*2,seeded(i+2)*3,seeded(i+4));const sc=.6+seeded(i+8)*1.5;dummy.scale.set(sc,sc*.7,sc);dummy.updateMatrix();rocks.setMatrixAt(used++,dummy.matrix);}rocks.count=used;root.add(rocks);

    if(outdoor&&quality!=='low'){
      const bg=new THREE.Color(window.Emberfall3D.scene()?.background||0x171b20).multiplyScalar(.52);
      const mountainMat=new THREE.MeshStandardMaterial({color:bg,roughness:1,metalness:0});
      for(let i=0;i<11;i++){const m=new THREE.Mesh(new THREE.ConeGeometry(2.8+seeded(i)*2.7,4.5+seeded(i+2)*4.5,7),mountainMat);const ang=(i/11)*Math.PI*2,radius=Math.max(w,h)*.9+10;m.position.set(w/2+Math.cos(ang)*radius,1.4,h/2+Math.sin(ang)*radius);m.rotation.y=seeded(i+5)*Math.PI;m.scale.y=.75;m.receiveShadow=true;root.add(m);}
    }

    if(['snow','desert','marsh','sky','starCity','citadel','core'].includes(biome)&&quality!=='low') createWeather(root,s,biome);
    addSkyDome(root,s,biome);
  }

  function addSkyDome(root,s,biome) {
    const THREE=window.THREE,scene=window.Emberfall3D.scene(),base=new THREE.Color(scene.background||0x151a22),top=base.clone().offsetHSL(0,.05,.16),bottom=base.clone().multiplyScalar(.38);
    const geo=new THREE.SphereGeometry(52,28,18);
    const mat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{top:{value:top},bottom:{value:bottom}},vertexShader:'varying float vY; void main(){vY=normalize(position).y;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'uniform vec3 top;uniform vec3 bottom;varying float vY;void main(){float t=smoothstep(-0.25,0.85,vY);gl_FragColor=vec4(mix(bottom,top,t),1.0);}'});
    const dome=new THREE.Mesh(geo,mat);dome.position.set((s.locationData.map[0]?.length||12)/2,0,(s.locationData.map.length||10)/2);root.add(dome);
  }

  function createWeather(root,s,biome) {
    const THREE=window.THREE,count=biome==='snow'?170:100,pos=new Float32Array(count*3),vel=new Float32Array(count),w=s.locationData.map[0]?.length||12,h=s.locationData.map.length||10;
    for(let i=0;i<count;i++){pos[i*3]=Math.random()*w;pos[i*3+1]=Math.random()*7+.3;pos[i*3+2]=Math.random()*h;vel[i]=.45+Math.random()*1.15;}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    let color=0xd7f3ff,size=.045,opacity=.65;
    if(biome==='desert'){color=0xe7bc75;size=.035;opacity=.36;}else if(biome==='marsh'){color=0x9bf5ca;size=.025;opacity=.42;}else if(['citadel','core'].includes(biome)){color=0xff734b;size=.032;opacity=.5;}else if(['sky','starCity'].includes(biome)){color=0xa8caff;size=.03;opacity=.48;}
    const pts=new THREE.Points(geo,new THREE.PointsMaterial({color,size,transparent:true,opacity,depthWrite:false,blending:THREE.AdditiveBlending}));root.add(pts);runtime.weather={points:pts,vel,w,h,biome};
  }

  function updateWeather(dt) {
    const w=runtime.weather;if(!w)return;const attr=w.points.geometry.attributes.position;
    for(let i=0;i<w.vel.length;i++){let y=attr.getY(i)-w.vel[i]*dt;let x=attr.getX(i);if(w.biome==='desert'){x+=dt*(.45+w.vel[i]*.18);}if(y<0){y=6+Math.random()*2;x=Math.random()*w.w;attr.setZ(i,Math.random()*w.h);}if(x>w.w)x=0;attr.setY(i,y);attr.setX(i,x);}attr.needsUpdate=true;
  }

  function ensureBattleOverlay(s) {
    const api=window.Emberfall3D,THREE=window.THREE,battle=api?.battleRoot?.();if(!battle)return;
    const key=s.battleEnemy?.id||s.battleEnemy?.name;
    if(runtime.currentBattle===key&&runtime.battleOverlayRoot?.parent)return;
    disposeRoot(runtime.battleOverlayRoot);runtime.currentBattle=key;
    const root=new THREE.Group();root.name='EncounterTelegraphs';battle.add(root);runtime.battleOverlayRoot=root;
    const ringMat=new THREE.MeshBasicMaterial({color:0xff8b58,transparent:true,opacity:.68,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
    const ring=new THREE.Mesh(new THREE.RingGeometry(.82,1.03,48),ringMat);ring.rotation.x=-Math.PI/2;ring.position.set(2.2,.035,-.15);root.add(ring);runtime.telegraph=ring;
    const fillMat=new THREE.MeshBasicMaterial({color:0xff5a4c,transparent:true,opacity:.08,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
    const fill=new THREE.Mesh(new THREE.CircleGeometry(1.02,48),fillMat);fill.rotation.x=-Math.PI/2;fill.position.set(2.2,.03,-.15);root.add(fill);runtime.telegraphFill=fill;
    const surfaceMat=new THREE.MeshBasicMaterial({color:0x6c7eff,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
    const surface=new THREE.Mesh(new THREE.CircleGeometry(4.3,64),surfaceMat);surface.rotation.x=-Math.PI/2;surface.position.y=.012;root.add(surface);runtime.surfaceDisc=surface;
  }

  function intentColor(intent) {
    return intent==='ultimate'?0xff243f:intent==='heavy'?0xff6a45:intent==='sweep'?0xff9b55:intent==='hex'?0xb765ff:intent==='drain'?0x786eff:intent==='brace'?0x67b9ff:intent==='mend'?0x72df9b:0xf4b16d;
  }

  function surfaceColor(surface) {
    const t=(surface?.type||surface?.kind||'').toLowerCase();
    if(t.includes('fire'))return 0xff6138;if(t.includes('poison')||t.includes('miasma'))return 0x62cf70;if(t.includes('arcane')||t.includes('veil'))return 0x8b6dff;if(t.includes('radiant')||t.includes('holy'))return 0xffdc79;if(t.includes('frost')||t.includes('ice'))return 0x72d8ff;return 0x6c7eff;
  }

  function updateBattleOverlay(s,time) {
    if(!s?.inBattle)return;ensureBattleOverlay(s);if(!runtime.telegraph)return;
    const intent=s.battleEnemy?.intent||'attack',c=intentColor(intent),danger=['ultimate','heavy','sweep','hex'].includes(intent);
    runtime.telegraph.material.color.setHex(c);runtime.telegraphFill.material.color.setHex(c);
    const pulse=1+Math.sin(time*(intent==='ultimate'?8:5))*(danger?.08:.035);runtime.telegraph.scale.setScalar(pulse);runtime.telegraph.material.opacity=danger?.82:.52;runtime.telegraphFill.material.opacity=intent==='ultimate'?.19:danger?.11:.055;
    if(runtime.surfaceDisc){const active=!!s.battleSurface;runtime.surfaceDisc.material.opacity=active?.07:0;if(active)runtime.surfaceDisc.material.color.setHex(surfaceColor(s.battleSurface));}
  }

  function actor(which) { const a=window.Emberfall3D?.actors?.();return a?.[which]||null; }

  function tweenActor(model, keyframes, duration=.28) {
    if(!model)return;const start={x:model.position.x,y:model.position.y,z:model.position.z,ry:model.rotation.y,sx:model.scale.x,sy:model.scale.y,sz:model.scale.z};runtime.motions.push({model,start,keyframes,duration,age:0});
  }

  function updateMotions(dt) {
    runtime.motions=runtime.motions.filter(m=>{m.age+=dt;const t=clamp(m.age/m.duration,0,1),pulse=Math.sin(t*Math.PI),k=m.keyframes;m.model.position.x=m.start.x+(k.x||0)*pulse;m.model.position.z=m.start.z+(k.z||0)*pulse;m.model.rotation.y=m.start.ry+(k.ry||0)*pulse;const sc=1+(k.scale||0)*pulse;m.model.scale.set(m.start.sx*sc,m.start.sy*sc,m.start.sz*sc);return t<1;});
  }

  function combatMotion(action,enemy=false) {
    const model=actor(enemy?'battleEnemy':'battleHero');if(!model)return;
    if(enemy){tweenActor(model,{x:-.72,ry:.16,scale:.035},action==='ultimate'?.58:.34);return;}
    if(['attack','weaponTechnique','execute'].includes(action))tweenActor(model,{x:.9,ry:-.12,scale:.035},action==='execute'?.48:.28);
    else if(['skill1','skill2','burst'].includes(action))tweenActor(model,{x:.34,z:-.18,scale:.07},action==='burst'?.62:.4);
    else if(action==='dodge')tweenActor(model,{x:-.6,z:.7,ry:.35},.34);
    else if(['guard','parry'].includes(action))tweenActor(model,{x:-.12,scale:.025},.26);
  }

  function installCombatMotion() {
    window.addEventListener('emberfall:action',e=>{combatMotion(e.detail?.action||'attack',false);flashStage(['burst','execute'].includes(e.detail?.action)?'impact-major':'impact-minor');});
    window.addEventListener('emberfall:enemyaction',e=>{combatMotion(e.detail?.intent||'attack',true);if(e.detail?.intent==='ultimate')flashStage('danger-flash');});
    window.addEventListener('emberfall:fx',e=>{const text=(e.detail?.text||'').toLowerCase();if(text.includes('perfect')||text.includes('critical')||text.includes('execution'))flashStage('impact-major');});
  }

  function addControlHint() {
    const stage=window.Emberfall3D?.stage;if(!stage||$('#modernControlHint'))return;
    const hint=document.createElement('div');hint.id='modernControlHint';hint.className='modern-control-hint';hint.textContent='CLICK TO MOVE · HOLD WASD · INPUT BUFFER ACTIVE';stage.appendChild(hint);
    setTimeout(()=>hint.classList.add('fade'),7000);
  }

  function frame(now) {
    const dt=clamp((now-runtime.lastFrame)/1000,0,.05);runtime.lastFrame=now;const s=snap();
    if(s?.started&&window.Emberfall3D?.ready?.()){
      if(runtime.currentLocation!==s.location&&!s.inBattle){runtime.currentLocation=s.location;setTimeout(()=>rebuildDetail(s),0);}
      if(s.inBattle)updateBattleOverlay(s,now/1000);else {runtime.currentBattle=null;if(runtime.battleOverlayRoot){disposeRoot(runtime.battleOverlayRoot);runtime.battleOverlayRoot=null;}}
      updateWeather(dt);updatePath(dt);updateMotions(dt);flushQueuedAction();
    }
    requestAnimationFrame(frame);
  }

  function init() {
    if(runtime.initialized)return;runtime.initialized=true;
    installInputBuffer();installClickMove();installCombatMotion();ensureQueueHud();addControlHint();requestAnimationFrame(frame);
  }

  const wait=()=>{if(apiReady()&&window.Emberfall3D?.canvas)init();else setTimeout(wait,180);};wait();
})();