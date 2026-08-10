(() => {
  'use strict';

  const PREF_KEY = 'emberfall-modern3d-v1';
  const defaults = { mode: 'cinematic', quality: 'high', camera: 'smooth', fx: 'full' };
  let prefs = { ...defaults };
  try { prefs = { ...defaults, ...(JSON.parse(localStorage.getItem(PREF_KEY) || '{}')) }; } catch (_) {}

  const $ = (s, root = document) => root.querySelector(s);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const damp = (a, b, speed, dt) => lerp(a, b, 1 - Math.exp(-speed * dt));

  const screen = $('.screen-wrap');
  const legacyCanvas = $('#gameCanvas');
  if (!screen || !legacyCanvas) return;

  const stage = document.createElement('div');
  stage.id = 'cinematic3dStage';
  stage.innerHTML = '<canvas id="cinematic3dCanvas" aria-label="Cinematic 3D game view"></canvas><div class="cinematic-grade" aria-hidden="true"></div><div id="renderBadge" class="render-badge">3D ENGINE · STARTING</div>';
  legacyCanvas.insertAdjacentElement('afterend', stage);

  const canvas = $('#cinematic3dCanvas');
  const badge = $('#renderBadge');
  let THREE = window.THREE;
  let renderer, scene, camera, clock;
  let worldRoot, actorRoot, battleRoot, fxRoot;
  let heroModel, battleHero, battleEnemy, battleCompanion;
  let currentLocationId = null;
  let currentBattleKey = null;
  let lastSnapshot = null;
  let lastEnemyHp = null;
  let lastHeroHp = null;
  let lastBattleLog = '';
  let legacyMode = false;
  let particles = [];
  let pulseLights = [];
  let groundMaterial = null;
  let sunLight, rimLight, hemiLight;
  let lastFrame = performance.now();
  let resizeObserver;

  const palette = {
    grass: { ground: 0x263829, stone: 0x4d5148, accent: 0xe8b862, fog: 0x101815, sky: 0x18251e },
    forest: { ground: 0x182a20, stone: 0x3f4a42, accent: 0x7bd58a, fog: 0x0b1410, sky: 0x142019 },
    city: { ground: 0x2f3339, stone: 0x59606b, accent: 0xe3ad65, fog: 0x15171c, sky: 0x1d2026 },
    dungeon: { ground: 0x20242b, stone: 0x3f454f, accent: 0x8b75ff, fog: 0x090a0e, sky: 0x101117 },
    highland: { ground: 0x3a443b, stone: 0x62675f, accent: 0xf0c77a, fog: 0x171b18, sky: 0x2a312b },
    marsh: { ground: 0x24342e, stone: 0x3c4a44, accent: 0x63e6c6, fog: 0x0b1512, sky: 0x15221e },
    mine: { ground: 0x2b2724, stone: 0x544a43, accent: 0xff9e52, fog: 0x0c0a09, sky: 0x17120f },
    desert: { ground: 0x6e5234, stone: 0x8e7355, accent: 0xffd37a, fog: 0x35271b, sky: 0x8c6543 },
    glass: { ground: 0x373044, stone: 0x625b75, accent: 0xcaa9ff, fog: 0x17131e, sky: 0x262032 },
    snow: { ground: 0x9db2bb, stone: 0x6f7d88, accent: 0x8eeaff, fog: 0x52636d, sky: 0x718792 },
    iceCave: { ground: 0x253849, stone: 0x40596e, accent: 0x6fe6ff, fog: 0x0c1720, sky: 0x142936 },
    starCity: { ground: 0x2c2b42, stone: 0x54536f, accent: 0x9fc6ff, fog: 0x11101c, sky: 0x1d1b31 },
    sky: { ground: 0x4d5363, stone: 0x777f91, accent: 0xa4d8ff, fog: 0x4a5667, sky: 0x6a829c },
    citadel: { ground: 0x272021, stone: 0x4f3d3e, accent: 0xff6b52, fog: 0x10090a, sky: 0x241417 },
    core: { ground: 0x241821, stone: 0x493441, accent: 0xff7a42, fog: 0x0b0609, sky: 0x1b0e16 }
  };

  function savePrefs() {
    try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch (_) {}
    window.dispatchEvent(new CustomEvent('emberfall:renderprefs', { detail: { ...prefs } }));
  }

  function addModernOptions() {
    const grid = $('.settings-grid');
    if (!grid || $('#graphicsModeSetting')) return;
    const insert = (html) => { const t=document.createElement('template');t.innerHTML=html.trim();grid.appendChild(t.content.firstElementChild); };
    insert(`<button id="graphicsModeSetting" class="setting-card modern-setting" type="button"><span><strong>3D PRESENTATION</strong><small>Cinematic WebGL view or legacy canvas fallback.</small></span><b>${prefs.mode==='cinematic'?'CINEMATIC':'LEGACY'}</b></button>`);
    insert(`<button id="graphicsQualitySetting" class="setting-card modern-setting" type="button"><span><strong>GRAPHICS QUALITY</strong><small>Controls shadows, particles, pixel ratio, and scene density.</small></span><b>${prefs.quality.toUpperCase()}</b></button>`);
    insert(`<button id="cameraSetting" class="setting-card modern-setting" type="button"><span><strong>CAMERA FEEL</strong><small>Smooth cinematic follow or tighter responsive tracking.</small></span><b>${prefs.camera.toUpperCase()}</b></button>`);
    insert(`<button id="fxSetting" class="setting-card modern-setting" type="button"><span><strong>COMBAT EFFECTS</strong><small>Full spell particles or softer effects for readability/performance.</small></span><b>${prefs.fx.toUpperCase()}</b></button>`);
    $('#graphicsModeSetting').addEventListener('click', () => { prefs.mode = prefs.mode === 'cinematic' ? 'legacy' : 'cinematic'; $('#graphicsModeSetting b').textContent = prefs.mode==='cinematic'?'CINEMATIC':'LEGACY'; applyMode(); savePrefs(); });
    $('#graphicsQualitySetting').addEventListener('click', () => { const order=['low','medium','high'];prefs.quality=order[(order.indexOf(prefs.quality)+1)%order.length];$('#graphicsQualitySetting b').textContent=prefs.quality.toUpperCase();applyQuality();savePrefs(); });
    $('#cameraSetting').addEventListener('click', () => { prefs.camera=prefs.camera==='smooth'?'tight':'smooth';$('#cameraSetting b').textContent=prefs.camera.toUpperCase();savePrefs(); });
    $('#fxSetting').addEventListener('click', () => { prefs.fx=prefs.fx==='full'?'soft':'full';$('#fxSetting b').textContent=prefs.fx.toUpperCase();savePrefs(); });
  }

  function applyMode() {
    legacyMode = prefs.mode !== 'cinematic' || !renderer;
    document.body.classList.toggle('modern3d-active', !legacyMode);
    document.body.classList.toggle('modern3d-legacy', legacyMode);
    stage.classList.toggle('hidden', legacyMode);
    legacyCanvas.setAttribute('aria-hidden', String(!legacyMode));
    if (badge) badge.textContent = legacyMode ? 'LEGACY VIEW' : 'CINEMATIC 3D';
  }

  function applyQuality() {
    if (!renderer) return;
    const ratio = prefs.quality === 'high' ? Math.min(devicePixelRatio, 1.8) : prefs.quality === 'medium' ? Math.min(devicePixelRatio, 1.3) : 1;
    renderer.setPixelRatio(ratio);
    renderer.shadowMap.enabled = prefs.quality !== 'low';
    if (sunLight) sunLight.castShadow = prefs.quality !== 'low';
    resize();
  }

  function webglAvailable() {
    try { const c=document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (_) { return false; }
  }

  function initRenderer() {
    THREE = window.THREE;
    if (!THREE || !webglAvailable()) {
      prefs.mode='legacy'; legacyMode=true; applyMode();
      if (badge) badge.textContent='2D FALLBACK · WEBGL UNAVAILABLE';
      return false;
    }
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x11151a);
    scene.fog = new THREE.FogExp2(0x101318, 0.03);
    camera = new THREE.PerspectiveCamera(48, 4/3, 0.1, 120);
    camera.position.set(7, 8, 9);
    worldRoot = new THREE.Group(); actorRoot = new THREE.Group(); battleRoot = new THREE.Group(); fxRoot = new THREE.Group();
    scene.add(worldRoot, actorRoot, battleRoot, fxRoot);
    battleRoot.visible = false;
    hemiLight = new THREE.HemisphereLight(0x9bb8d8, 0x18110f, 1.2); scene.add(hemiLight);
    sunLight = new THREE.DirectionalLight(0xffe4bd, 3.1); sunLight.position.set(8, 13, 6); sunLight.castShadow=true; sunLight.shadow.mapSize.set(2048,2048); sunLight.shadow.camera.left=-16;sunLight.shadow.camera.right=16;sunLight.shadow.camera.top=16;sunLight.shadow.camera.bottom=-16;scene.add(sunLight);
    rimLight = new THREE.DirectionalLight(0x769cff, 1.2); rimLight.position.set(-8, 6, -9); scene.add(rimLight);
    clock = new THREE.Clock();
    resizeObserver = new ResizeObserver(resize); resizeObserver.observe(screen);
    applyQuality(); applyMode();
    requestAnimationFrame(loop);
    return true;
  }

  function resize() {
    if (!renderer || !camera) return;
    const r=screen.getBoundingClientRect(); const w=Math.max(2,r.width),h=Math.max(2,r.height);
    renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();
  }

  function clearGroup(group) {
    while (group.children.length) {
      const obj=group.children.pop();
      obj.traverse?.(node=>{ if(node.geometry)node.geometry.dispose?.(); if(node.material){const ms=Array.isArray(node.material)?node.material:[node.material];ms.forEach(m=>m.dispose?.());} });
    }
  }

  function mat(color, opts={}) {
    return new THREE.MeshStandardMaterial({ color, roughness: opts.roughness ?? .72, metalness: opts.metalness ?? .08, emissive: opts.emissive ?? 0x000000, emissiveIntensity: opts.emissiveIntensity ?? 0, transparent: !!opts.transparent, opacity: opts.opacity ?? 1 });
  }

  function mesh(geo, material, cast=true, receive=true) {
    const m=new THREE.Mesh(geo,material);m.castShadow=cast;m.receiveShadow=receive;return m;
  }

  function createHumanoid(colors=[0x332a26,0xd8a071,0x475a72,0xd6a85b], scale=1) {
    const g=new THREE.Group(); g.userData.kind='humanoid';
    const cloth=mat(new THREE.Color(colors[2] || '#485c72'),{roughness:.58,metalness:.12});
    const accent=mat(new THREE.Color(colors[3] || '#d6aa62'),{roughness:.42,metalness:.36});
    const skin=mat(new THREE.Color(colors[1] || '#d4a176'),{roughness:.68});
    const hair=mat(new THREE.Color(colors[0] || '#3b2c26'),{roughness:.8});
    const boot=mat(0x1a1717,{roughness:.9});
    const torso=mesh(new THREE.CapsuleGeometry(.34,.62,5,10),cloth);torso.position.y=1.22;g.add(torso);
    const chest=mesh(new THREE.BoxGeometry(.72,.32,.34),accent);chest.position.set(0,1.36,.02);g.add(chest);
    const head=mesh(new THREE.SphereGeometry(.27,18,14),skin);head.position.y=1.92;g.add(head);
    const hairCap=mesh(new THREE.SphereGeometry(.285,16,10,0,Math.PI*2,0,Math.PI*.58),hair);hairCap.position.set(0,1.99,0);g.add(hairCap);
    const armGeo=new THREE.CapsuleGeometry(.11,.5,4,8);const legGeo=new THREE.CapsuleGeometry(.13,.56,4,8);
    const leftArm=mesh(armGeo,cloth);leftArm.position.set(-.46,1.28,0);leftArm.rotation.z=.12;g.add(leftArm);
    const rightArm=mesh(armGeo,cloth);rightArm.position.set(.46,1.28,0);rightArm.rotation.z=-.12;g.add(rightArm);
    const leftLeg=mesh(legGeo,boot);leftLeg.position.set(-.18,.55,0);g.add(leftLeg);
    const rightLeg=mesh(legGeo,boot);rightLeg.position.set(.18,.55,0);g.add(rightLeg);
    const weapon=mesh(new THREE.BoxGeometry(.08,.9,.08),accent);weapon.position.set(.55,1.02,.08);weapon.rotation.z=-.28;g.add(weapon);
    g.userData.parts={leftArm,rightArm,leftLeg,rightLeg,torso,weapon};
    g.scale.setScalar(scale);return g;
  }

  function createEnemyModel(enemy) {
    const name=(enemy?.name||'').toLowerCase(), sprite=(enemy?.sprite||'').toLowerCase();
    const boss=!!enemy?.boss; const group=new THREE.Group(); group.userData.kind='enemy';
    let color=0x7a4038, emissive=0x180000;
    if(sprite.includes('slime'))color=0x4f8b5c;
    else if(sprite.includes('wolf')||sprite.includes('beast'))color=0x625a51;
    else if(sprite.includes('wraith')||sprite.includes('mage')){color=0x6b4b86;emissive=0x25143a;}
    else if(sprite.includes('golem')||sprite.includes('knight')||sprite.includes('guard'))color=0x545c69;
    else if(sprite.includes('bird'))color=0x516a86;
    else if(name.includes('hydra'))color=0x396f5d;
    else if(name.includes('devourer')||name.includes('malachar')){color=0x6f2630;emissive=0x3d0711;}
    const bodyMat=mat(color,{roughness:.52,metalness:.22,emissive,emissiveIntensity:.8});
    if(sprite.includes('slime')){
      const body=mesh(new THREE.SphereGeometry(.72,24,18),bodyMat);body.scale.y=.72;body.position.y=.72;group.add(body);
      const eyeMat=mat(0xffd17c,{emissive:0xff8a2e,emissiveIntensity:2});[-.24,.24].forEach(x=>{const e=mesh(new THREE.SphereGeometry(.07,10,8),eyeMat,false,false);e.position.set(x,.82,.62);group.add(e);});
    } else if(sprite.includes('bird')) {
      const body=mesh(new THREE.CapsuleGeometry(.34,.85,5,12),bodyMat);body.rotation.z=Math.PI/2;body.position.y=1.05;group.add(body);
      const wingGeo=new THREE.BoxGeometry(1.5,.08,.45);[-1,1].forEach(s=>{const w=mesh(wingGeo,bodyMat);w.position.set(0,1.2,s*.32);w.rotation.y=s*.15;group.add(w);});
    } else if(sprite.includes('golem')) {
      const torso=mesh(new THREE.BoxGeometry(1.15,1.4,.8),bodyMat);torso.position.y=1.25;group.add(torso);
      const head=mesh(new THREE.BoxGeometry(.62,.55,.58),bodyMat);head.position.y=2.18;group.add(head);
      const core=mesh(new THREE.OctahedronGeometry(.18,1),mat(0x88c8ff,{emissive:0x2a8cff,emissiveIntensity:2.4,metalness:.3}));core.position.set(0,1.32,.43);group.add(core);
    } else {
      const torso=mesh(new THREE.CapsuleGeometry(.46,.85,5,12),bodyMat);torso.position.y=1.25;group.add(torso);
      const head=mesh(new THREE.SphereGeometry(.34,18,14),bodyMat);head.position.y=2.15;group.add(head);
      const armGeo=new THREE.CapsuleGeometry(.15,.66,4,8);[-1,1].forEach(s=>{const a=mesh(armGeo,bodyMat);a.position.set(s*.58,1.3,0);a.rotation.z=-s*.18;group.add(a);});
      const hornMat=mat(0xb8a38e,{roughness:.7});[-1,1].forEach(s=>{const h=mesh(new THREE.ConeGeometry(.10,.55,10),hornMat);h.position.set(s*.22,2.48,0);h.rotation.z=s*.28;group.add(h);});
    }
    if (boss) group.scale.setScalar(1.3);
    return group;
  }

  function makeTree(x,z,p,seed=0) {
    const g=new THREE.Group();
    const trunk=mesh(new THREE.CylinderGeometry(.12,.18,1.25,8),mat(0x3d2c23,{roughness:.95}));trunk.position.y=.62;g.add(trunk);
    const crown=mesh(new THREE.ConeGeometry(.62,1.45,9),mat(p.ground,{roughness:.95}));crown.position.y=1.65;crown.rotation.y=seed*.7;g.add(crown);
    g.position.set(x,0,z);return g;
  }

  function makeRock(x,z,p,seed=0) {
    const r=mesh(new THREE.DodecahedronGeometry(.5+((seed%3)*.08),0),mat(p.stone,{roughness:.92,metalness:.03}));r.position.set(x,.34,z);r.rotation.set(seed*.2,seed*.6,seed*.1);r.scale.y=.7;return r;
  }

  function makeBuilding(x,z,p) {
    const g=new THREE.Group();const wall=mesh(new THREE.BoxGeometry(.95,.9,.95),mat(p.stone,{roughness:.82}));wall.position.y=.45;g.add(wall);
    const roof=mesh(new THREE.ConeGeometry(.78,.58,4),mat(0x352c2b,{roughness:.78}));roof.position.y=1.18;roof.rotation.y=Math.PI/4;g.add(roof);
    const glow=mesh(new THREE.PlaneGeometry(.16,.24),mat(p.accent,{emissive:p.accent,emissiveIntensity:1.5}));glow.position.set(0,.48,.481);g.add(glow);
    g.position.set(x,0,z);return g;
  }

  function makeDecor(d,p) {
    const x=d.x-.5,z=d.y-.5; const g=new THREE.Group();g.position.set(x,0,z);
    const type=d.type||'';
    if(['brazier','flame','campfire','forge','lamp'].includes(type)){
      const base=mesh(new THREE.CylinderGeometry(.18,.25,.35,12),mat(0x39312f,{metalness:.4}));base.position.y=.18;g.add(base);
      const fire=mesh(new THREE.SphereGeometry(.16,12,10),mat(0xff8a38,{emissive:0xff5b1f,emissiveIntensity:3}));fire.position.y=.48;g.add(fire);
      if(prefs.quality!=='low'){const l=new THREE.PointLight(0xff8a42,2.5,4);l.position.y=.65;g.add(l);pulseLights.push({light:l,base:2.5,phase:Math.random()*6});}
    } else if(['crystal','obelisk','crown'].includes(type)){
      const c=mesh(new THREE.OctahedronGeometry(type==='crown'?.38:.28,1),mat(p.accent,{metalness:.28,roughness:.25,emissive:p.accent,emissiveIntensity:2.2}));c.position.y=.55;g.add(c);
    } else if(type==='statue'){
      const s=createHumanoid(['#3b4148','#71777d','#535b64','#7a828b'],.7);g.add(s);
    } else if(type==='cart'){
      const c=mesh(new THREE.BoxGeometry(.75,.28,.45),mat(0x5c3b24,{roughness:.9}));c.position.y=.32;g.add(c);
    } else if(['fountain','well'].includes(type)){
      const ring=mesh(new THREE.CylinderGeometry(.48,.48,.28,18,1,true),mat(p.stone,{roughness:.75}));ring.position.y=.18;g.add(ring);
      const water=mesh(new THREE.CylinderGeometry(.4,.4,.03,20),mat(0x3e8aa3,{roughness:.2,metalness:.05,transparent:true,opacity:.78}));water.position.y=.31;g.add(water);
    } else {
      const prop=mesh(new THREE.BoxGeometry(.38,.32,.38),mat(p.stone,{roughness:.85}));prop.position.y=.16;prop.rotation.y=(d.x+d.y)*.3;g.add(prop);
    }
    return g;
  }

  function rebuildWorld(snap) {
    if (!scene || !snap?.locationData) return;
    clearGroup(worldRoot); clearGroup(actorRoot); pulseLights=[];
    currentLocationId=snap.location;
    const loc=snap.locationData,p=palette[loc.biome]||palette.grass;
    scene.background=new THREE.Color(p.sky); scene.fog.color.setHex(p.fog); scene.fog.density=['dungeon','mine','citadel','core','iceCave'].includes(loc.biome)?.055:.028;
    hemiLight.color.setHex(['snow','iceCave','sky','starCity'].includes(loc.biome)?0xb9d9ff:0xb4c5ba);hemiLight.groundColor.setHex(0x181210);
    sunLight.color.setHex(['desert','citadel','core'].includes(loc.biome)?0xffb477:0xffe2bd); rimLight.color.setHex(['marsh','glass','iceCave','starCity'].includes(loc.biome)?0x7fdfff:0x7999ff);
    groundMaterial=mat(p.ground,{roughness:.88});
    const tileGeo=new THREE.BoxGeometry(.98,.12,.98);
    const stoneMat=mat(p.stone,{roughness:.82});
    (loc.map||[]).forEach((row,y)=>[...row].forEach((ch,x)=>{
      const material=(ch==='P'||ch==='C'||ch==='D')?stoneMat:groundMaterial;
      const t=mesh(tileGeo,material,false,true);t.position.set(x-.5,-.06,y-.5);worldRoot.add(t);
      const seed=(x*17+y*31)%11;
      if(ch==='T')worldRoot.add(makeTree(x-.5,y-.5,p,seed));
      else if(['W','M','R','L'].includes(ch)){const o=makeRock(x-.5,y-.5,p,seed);o.scale.setScalar(ch==='L'?1.35:1);worldRoot.add(o);}
      else if(ch==='B') worldRoot.add(makeBuilding(x-.5,y-.5,p));
    }));
    (loc.decor||[]).slice(0,prefs.quality==='low'?14:36).forEach(d=>worldRoot.add(makeDecor(d,p)));
    (loc.exits||[]).forEach(e=>{const ring=mesh(new THREE.TorusGeometry(.38,.05,10,24),mat(p.accent,{emissive:p.accent,emissiveIntensity:2.4,metalness:.35}));ring.rotation.x=Math.PI/2;ring.position.set(e.x-.5,.06,e.y-.5);worldRoot.add(ring);});
    if(loc.shrine){const base=mesh(new THREE.CylinderGeometry(.42,.52,.22,18),stoneMat);base.position.set(loc.shrine.x-.5,.1,loc.shrine.y-.5);worldRoot.add(base);const s=mesh(new THREE.OctahedronGeometry(.22,1),mat(0x79d7ff,{emissive:0x2aa8ff,emissiveIntensity:2.5}));s.position.set(loc.shrine.x-.5,.68,loc.shrine.y-.5);worldRoot.add(s);}
    heroModel=createHumanoid(snap.heroColors, .78);actorRoot.add(heroModel);
    (loc.npcs||[]).forEach(n=>{const m=createHumanoid(n.colors,.68);m.position.set(n.x-.5,0,n.y-.5);m.userData.id=n.id;actorRoot.add(m);});
    (loc.enemies||[]).filter(e=>!e.defeated).forEach(e=>{const m=createEnemyModel({name:e.type,sprite:e.type,boss:false});m.scale.multiplyScalar(.58);m.position.set(e.x-.5,0,e.y-.5);m.userData.id=e.id;actorRoot.add(m);});
    addAtmosphere(loc,p);
  }

  function addAtmosphere(loc,p) {
    if (prefs.quality==='low') return;
    const count=prefs.quality==='high'?90:45; const pos=new Float32Array(count*3); const col=new Float32Array(count*3);const c=new THREE.Color(p.accent);
    for(let i=0;i<count;i++){pos[i*3]=Math.random()*16-1;pos[i*3+1]=Math.random()*4+.2;pos[i*3+2]=Math.random()*12-1;col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('color',new THREE.BufferAttribute(col,3));
    const pts=new THREE.Points(geo,new THREE.PointsMaterial({size:.035,vertexColors:true,transparent:true,opacity:.42,depthWrite:false,blending:THREE.AdditiveBlending}));worldRoot.add(pts);
  }

  function rebuildBattle(snap) {
    clearGroup(battleRoot); currentBattleKey=snap.battleEnemy?.id||snap.battleEnemy?.name||'battle';
    worldRoot.visible=false;actorRoot.visible=false;battleRoot.visible=true;
    const p=palette[snap.locationData?.biome]||palette.citadel;
    const floor=mesh(new THREE.CylinderGeometry(5.8,6.4,.35,48),mat(0x1a181b,{roughness:.64,metalness:.16}));floor.position.y=-.18;battleRoot.add(floor);
    const rune=mesh(new THREE.TorusGeometry(3.5,.025,8,80),mat(p.accent,{emissive:p.accent,emissiveIntensity:2.2,transparent:true,opacity:.55}),false,false);rune.rotation.x=Math.PI/2;rune.position.y=.03;battleRoot.add(rune);
    battleHero=createHumanoid(snap.heroColors,1.05);battleHero.position.set(-2.25,0,.4);battleHero.rotation.y=.28;battleRoot.add(battleHero);
    battleEnemy=createEnemyModel(snap.battleEnemy);battleEnemy.position.set(2.2,0,-.15);battleEnemy.rotation.y=-.32;battleRoot.add(battleEnemy);
    if(snap.companion){battleCompanion=createHumanoid(['#2f3138','#cda077','#486079','#86d6e8'],.78);battleCompanion.position.set(-3.15,0,-1.1);battleCompanion.rotation.y=.45;battleRoot.add(battleCompanion);} else battleCompanion=null;
    const key=new THREE.PointLight(p.accent,4.2,10);key.position.set(0,4,1.5);battleRoot.add(key);
    const enemyRim=new THREE.PointLight(snap.battleEnemy?.boss?0xff4238:0xa26dff,snap.battleEnemy?.boss?5:3,8);enemyRim.position.set(2.6,2.6,-1.8);battleRoot.add(enemyRim);
    const heroRim=new THREE.PointLight(0x79c7ff,3.4,8);heroRim.position.set(-2.8,2.5,-1.8);battleRoot.add(heroRim);
    scene.fog.density=.024;lastEnemyHp=snap.battleEnemy?.hp??null;lastHeroHp=snap.player?.hp??null;lastBattleLog='';
  }

  function exitBattle() { currentBattleKey=null; clearGroup(battleRoot);battleRoot.visible=false;worldRoot.visible=true;actorRoot.visible=true;lastEnemyHp=null;lastHeroHp=null; }

  function spawnParticles(origin,color=0xffaa66,count=18,power=2.2) {
    if (!renderer || prefs.fx==='soft') count=Math.max(6,Math.floor(count*.45));
    const max=prefs.quality==='low'?12:prefs.quality==='medium'?28:50; count=Math.min(count,max);
    for(let i=0;i<count;i++){
      const m=mesh(new THREE.SphereGeometry(.035+Math.random()*.035,6,5),mat(color,{emissive:color,emissiveIntensity:2.5,roughness:.25}),false,false);
      m.position.copy(origin);fxRoot.add(m);particles.push({mesh:m,vel:new THREE.Vector3((Math.random()-.5)*power,Math.random()*power*.8+.4,(Math.random()-.5)*power),life:.45+Math.random()*.55,max:.8});
    }
  }

  function spawnSlash(target='enemy', color=0xffd18a) {
    if(!battleRoot.visible)return;const x=target==='hero'?-2.2:2.2;const slash=mesh(new THREE.TorusGeometry(.55,.035,6,26,Math.PI*1.4),mat(color,{emissive:color,emissiveIntensity:3,transparent:true,opacity:.9}),false,false);slash.position.set(x,1.2,.6);slash.rotation.set(.2,.4,-.7);fxRoot.add(slash);particles.push({mesh:slash,vel:new THREE.Vector3(0,.25,0),life:.26,max:.26,fade:true,spin:4});
  }

  function battleEffectFromText(text) {
    const t=(text||'').toLowerCase();let color=0xffb26b;
    if(t.includes('arcane')||t.includes('rune')||t.includes('star'))color=0xa57cff;
    else if(t.includes('radiant')||t.includes('holy')||t.includes('dawn'))color=0xffe68c;
    else if(t.includes('poison')||t.includes('venom')||t.includes('miasma'))color=0x77d66d;
    else if(t.includes('fire')||t.includes('burn')||t.includes('flame')||t.includes('bomb'))color=0xff693d;
    else if(t.includes('frost')||t.includes('ice'))color=0x77d8ff;
    const target=t.includes('restores')||t.includes('heal')?'hero':'enemy';const pos=new THREE.Vector3(target==='hero'?-2.2:2.2,1.15,.25);spawnParticles(pos,color,t.includes('ultimate')||t.includes('execution')?42:20,t.includes('ultimate')?4:2.4);if(!t.includes('heal'))spawnSlash(target,color);
  }

  function updateParticles(dt) {
    particles=particles.filter(p=>{p.life-=dt;if(p.life<=0){fxRoot.remove(p.mesh);p.mesh.geometry?.dispose?.();p.mesh.material?.dispose?.();return false;}p.mesh.position.addScaledVector(p.vel,dt);p.vel.y-=2.2*dt;if(p.spin)p.mesh.rotation.z+=p.spin*dt;if(p.fade&&p.mesh.material)p.mesh.material.opacity=clamp(p.life/p.max,0,1);return true;});
  }

  function updateHumanoid(model,t,walking=false,attackPulse=0) {
    if(!model?.userData?.parts)return;const p=model.userData.parts;const swing=walking?Math.sin(t*8)*.45:Math.sin(t*2)*.04;
    p.leftArm.rotation.x=swing-attackPulse*.6;p.rightArm.rotation.x=-swing-attackPulse*1.1;p.leftLeg.rotation.x=-swing*.8;p.rightLeg.rotation.x=swing*.8;p.torso.rotation.z=Math.sin(t*2.3)*.012;model.position.y=(walking?Math.abs(Math.sin(t*8))*.035:Math.sin(t*2)*.012);
  }

  function updateFromSnapshot(snap,dt,time) {
    if (!snap?.started) return;
    if(currentLocationId!==snap.location) rebuildWorld(snap);
    if(snap.inBattle){
      const key=snap.battleEnemy?.id||snap.battleEnemy?.name||'battle';if(currentBattleKey!==key)rebuildBattle(snap);
      const enemyHp=snap.battleEnemy?.hp??0, heroHp=snap.player?.hp??0;
      if(lastEnemyHp!==null&&enemyHp<lastEnemyHp)battleEffectFromText(snap.battleLog||'attack');
      if(lastHeroHp!==null&&heroHp<lastHeroHp){spawnParticles(new THREE.Vector3(-2.2,1.15,.3),0xff4e5a,20,2.6);spawnSlash('hero',0xff4e5a);}
      if(snap.battleLog&&snap.battleLog!==lastBattleLog&&(snap.battleLog.includes('VICTORY')||snap.battleLog.includes('EXECUTION')))battleEffectFromText(snap.battleLog);
      lastEnemyHp=enemyHp;lastHeroHp=heroHp;lastBattleLog=snap.battleLog||lastBattleLog;
      updateBattleCamera(snap,dt,time);updateHumanoid(battleHero,time,false,document.body.classList.contains('combat-action-pulse')?1:0);updateHumanoid(battleCompanion,time,false,0);
      if(battleEnemy){battleEnemy.position.y=Math.sin(time*2.4)*.025;battleEnemy.rotation.y=-.32+Math.sin(time*.8)*.035;}
    } else {
      if(currentBattleKey)exitBattle();updateWorldCamera(snap,dt,time);
      if(heroModel){const tx=snap.player.x-.5,tz=snap.player.y-.5;const beforeX=heroModel.position.x,beforeZ=heroModel.position.z;heroModel.position.x=damp(heroModel.position.x,tx,prefs.camera==='tight'?18:11,dt);heroModel.position.z=damp(heroModel.position.z,tz,prefs.camera==='tight'?18:11,dt);const moving=Math.hypot(heroModel.position.x-beforeX,heroModel.position.z-beforeZ)>.0005;updateHumanoid(heroModel,time,moving,0);const facing=snap.player.facing;const angle=facing==='up'?Math.PI:facing==='left'?-Math.PI/2:facing==='right'?Math.PI/2:0;heroModel.rotation.y=damp(heroModel.rotation.y,angle,12,dt);}
    }
    pulseLights.forEach(p=>p.light.intensity=p.base*(.82+Math.sin(time*5+p.phase)*.18));
  }

  function updateWorldCamera(snap,dt) {
    const px=heroModel?.position.x??(snap.player.x-.5),pz=heroModel?.position.z??(snap.player.y-.5);const smooth=prefs.camera==='smooth'?4.2:8.5;
    const desired=new THREE.Vector3(px+5.8,6.8,pz+7.4);camera.position.x=damp(camera.position.x,desired.x,smooth,dt);camera.position.y=damp(camera.position.y,desired.y,smooth,dt);camera.position.z=damp(camera.position.z,desired.z,smooth,dt);camera.lookAt(new THREE.Vector3(px,.7,pz));
  }

  function updateBattleCamera(snap,dt) {
    const cinematic=$('#battleScreen')?.classList.contains('execution-cinematic');const shake=$('#battleScreen')?.classList.contains('camera-shake');const boss=snap.battleEnemy?.boss;
    const desired=new THREE.Vector3(cinematic?.1:0,cinematic?2.45:3.05,cinematic?5.55:7.25);camera.position.x=damp(camera.position.x,desired.x,6,dt);camera.position.y=damp(camera.position.y,desired.y,6,dt);camera.position.z=damp(camera.position.z,desired.z,6,dt);
    if(shake&&prefs.fx==='full'&&!document.body.classList.contains('pref-reduced-motion')){camera.position.x+=(Math.random()-.5)*.11;camera.position.y+=(Math.random()-.5)*.07;}camera.lookAt(new THREE.Vector3(0,boss?1.05:.95,0));
  }

  function loop(now) {
    if(!renderer)return;const dt=clamp((now-lastFrame)/1000,0,.05);lastFrame=now;const time=now/1000;const snap=window.EmberfallBridge?.snapshot?.();lastSnapshot=snap||lastSnapshot;if(!legacyMode&&snap)updateFromSnapshot(snap,dt,time);updateParticles(dt);if(!legacyMode)renderer.render(scene,camera);requestAnimationFrame(loop);
  }

  window.addEventListener('emberfall:fx',e=>{if(legacyMode||!battleRoot?.visible)return;const d=e.detail||{};battleEffectFromText(d.text||d.kind||'');});
  window.addEventListener('emberfall:action',e=>{if(legacyMode||!battleRoot?.visible)return;const a=e.detail?.action||'';document.body.classList.add('combat-action-pulse');setTimeout(()=>document.body.classList.remove('combat-action-pulse'),180);const color=a.includes('skill')?0xa778ff:a==='guard'||a==='parry'||a==='dodge'?0x72c9ff:a==='companion'?0xf5d06f:0xffa666;spawnParticles(new THREE.Vector3(-2.1,1.25,.2),color,14,1.7);});
  window.addEventListener('emberfall:enemyaction',e=>{if(legacyMode||!battleRoot?.visible)return;const intent=e.detail?.intent||'attack';const color=intent==='ultimate'?0xff3048:intent==='hex'?0xb65cff:0xff8a5d;spawnParticles(new THREE.Vector3(2.1,1.4,.1),color,intent==='ultimate'?38:16,intent==='ultimate'?3.8:1.8);});

  // Public renderer interaction bridge for the modern action-RPG control/presentation layer.
  window.Emberfall3D = {
    canvas,
    stage,
    ready: () => !!renderer && !legacyMode,
    quality: () => prefs.quality,
    scene: () => scene,
    camera: () => camera,
    renderer: () => renderer,
    worldRoot: () => worldRoot,
    actorRoot: () => actorRoot,
    battleRoot: () => battleRoot,
    fxRoot: () => fxRoot,
    actors: () => ({ heroModel, battleHero, battleEnemy, battleCompanion }),
    screenToGround: (clientX, clientY) => {
      if (!renderer || !camera || !THREE) return null;
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;
      const point = new THREE.Vector2(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(point, camera);
      const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const hit = new THREE.Vector3();
      return raycaster.ray.intersectPlane(ground, hit) ? { x: hit.x, y: hit.y, z: hit.z } : null;
    }
  };

  const waitForOptions=()=>{addModernOptions();if(!$('#graphicsModeSetting'))setTimeout(waitForOptions,250);};
  waitForOptions();
  if(!initRenderer())applyMode();
})();