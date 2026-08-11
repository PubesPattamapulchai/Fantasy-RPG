from pathlib import Path
import re


def read(path): return Path(path).read_text(encoding='utf-8')
def write(path,text): Path(path).write_text(text,encoding='utf-8')
def one(text,old,new,label):
    n=text.count(old)
    if n!=1: raise SystemExit(f'{label}: expected 1 match, found {n}')
    return text.replace(old,new,1)
def sub_one(text,pattern,repl,label):
    out,n=re.subn(pattern,repl,text,count=1,flags=re.S)
    if n!=1: raise SystemExit(f'{label}: expected 1 regex match, found {n}')
    return out

# ---------------------------------------------------------------------------
# game.js: expose real world interaction state and improve item comparison UX.
# ---------------------------------------------------------------------------
g=read('game.js')
g=one(g,
"          exits: (loc.exits || []).map(e => ({ x:e.x, y:e.y, label:e.label, target:e.target })),",
"          exits: (loc.exits || []).map(e => ({ x:e.x, y:e.y, label:e.label, target:e.target, minStage:e.minStage||0, unlocked:state.questStage>=(e.minStage||0) })),",
'exit state bridge')

# Add compact data-driven comparison helpers before renderGear.
needle="""  function renderGear() {
    if(!state.started||!state.player.job)return;"""
replacement="""  function gearDeltaLabel(delta,unit='POWER'){
    if(!Number.isFinite(delta)||delta===0)return '<span class="gear-compare equal">SAME '+unit+'</span>';
    return `<span class="gear-compare ${delta>0?'better':'worse'}">${delta>0?'▲ +':'▼ '}${delta} ${unit}</span>`;
  }
  function weaponRangeHint(type){if(['bow','staff'].includes(type))return'FAR RANGE SPECIALIST';if(['dagger','rapier'].includes(type))return'CLOSE RANGE FINESSE';return'CLOSE RANGE POWER';}

  function renderGear() {
    if(!state.started||!state.player.job)return;"""
g=one(g,needle,replacement,'gear comparison helpers')

old_weapon_card="""      return `<div class="weapon-card ${equipped?'equipped':''} ${aff.length?'affixed':''}"><h4>${escapeHtml(w.name)} ${equipped?'· EQUIPPED':''}</h4><p>${escapeHtml(w.type.toUpperCase())} · +${w.power} power${aff.length?` · ${aff.length} affix${aff.length>1?'es':''}`:''}<br>${escapeHtml(w.desc)}${aff.length?`<br><em>${aff.map(a=>escapeHtml(a.name)).join(' · ')}</em>`:''}</p><button class="pixel-button compact" data-equip="${id}" type="button" ${equipped?'disabled':''}>${equipped?'EQUIPPED':'EQUIP'}</button></div>`;"""
new_weapon_card="""      const delta=w.power-equippedWeapon().power,compare=equipped?'<span class="gear-compare equipped-label">CURRENT</span>':gearDeltaLabel(delta,'POWER');
      return `<div class="weapon-card ${equipped?'equipped':''} ${aff.length?'affixed':''}"><div class="gear-card-head"><h4>${escapeHtml(w.name)} ${equipped?'· EQUIPPED':''}</h4>${compare}</div><p><strong>${escapeHtml(w.type.toUpperCase())} · +${w.power} POWER</strong> · ${weaponRangeHint(w.type)}${aff.length?` · ${aff.length} AFFIX${aff.length>1?'ES':''}`:''}<br>${escapeHtml(w.desc)}${aff.length?`<br><em>${aff.map(a=>escapeHtml(a.name)).join(' · ')}</em>`:''}</p><button class="pixel-button compact" data-equip="${id}" type="button" ${equipped?'disabled':''}>${equipped?'EQUIPPED':'EQUIP'}</button></div>`;"""
g=one(g,old_weapon_card,new_weapon_card,'weapon card comparison')

old_armor="""    ui.armorGrid.innerHTML=Object.entries(ARMORS).filter(([id,a])=>state.questStage>=a.minStage||state.player.armors.includes(id)).map(([id,a])=>{const owned=state.player.armors.includes(id),equipped=state.player.equippedArmor===id;return`<button class="equipment-card ${equipped?'equipped':''}" data-armor="${id}" type="button"><strong>${escapeHtml(a.name)}</strong><span>AC +${a.bonus} · ${owned?(equipped?'EQUIPPED':'OWNED'):`${a.price}G`}</span><small>${escapeHtml(a.desc)}</small></button>`}).join('');"""
new_armor="""    const currentArmor=equippedArmor();
    ui.armorGrid.innerHTML=Object.entries(ARMORS).filter(([id,a])=>state.questStage>=a.minStage||state.player.armors.includes(id)).map(([id,a])=>{const owned=state.player.armors.includes(id),equipped=state.player.equippedArmor===id,delta=a.bonus-currentArmor.bonus,compare=equipped?'<span class="gear-compare equipped-label">CURRENT</span>':gearDeltaLabel(delta,'AC');return`<button class="equipment-card ${equipped?'equipped':''}" data-armor="${id}" type="button"><span class="gear-card-head"><strong>${escapeHtml(a.name)}</strong>${compare}</span><span>AC +${a.bonus} · ${owned?(equipped?'EQUIPPED':'OWNED'):`${a.price}G`}</span><small>${escapeHtml(a.desc)}</small></button>`}).join('');"""
g=one(g,old_armor,new_armor,'armor comparison')

old_shop="""      ui.shopItems.innerHTML=ids.length?ids.map(id=>{const w=WEAPONS[id],owned=p.weapons.includes(id);return `<div class="shop-item"><div><h4>${escapeHtml(w.name)} · +${w.power} POWER</h4><p>${escapeHtml(w.desc)}<br>${escapeHtml(w.type.toUpperCase())}</p></div><button class="pixel-button compact" data-buy-weapon="${id}" type="button" ${owned?'disabled':''}>${owned?'OWNED':`${w.price} GOLD`}</button></div>`;}).join(''):'<div class="record-card">No compatible new weapons are available yet.</div>';"""
new_shop="""      ui.shopItems.innerHTML=ids.length?ids.map(id=>{const w=WEAPONS[id],owned=p.weapons.includes(id),equipped=id===p.equippedWeapon,delta=w.power-equippedWeapon().power,compare=equipped?'<span class="gear-compare equipped-label">CURRENT</span>':gearDeltaLabel(delta,'POWER');return `<div class="shop-item"><div><div class="gear-card-head"><h4>${escapeHtml(w.name)} · +${w.power} POWER</h4>${compare}</div><p>${escapeHtml(w.desc)}<br><strong>${escapeHtml(w.type.toUpperCase())}</strong> · ${weaponRangeHint(w.type)}</p></div><button class="pixel-button compact" data-buy-weapon="${id}" type="button" ${owned?'disabled':''}>${owned?'OWNED':`${w.price} GOLD`}</button></div>`;}).join(''):'<div class="record-card">No compatible new weapons are available yet.</div>';"""
g=one(g,old_shop,new_shop,'shop weapon comparison')

# Remove known hidden menu rebuilds in mutually exclusive screens.
g=g.replace("renderGear();renderSheet();updateHud();saveGame(true);","renderGear();updateHud();saveGame(true);")
g=g.replace("chord([294,392,494,659]);renderCamp();renderSheet();updateHud();saveGame(true);return;","chord([294,392,494,659]);renderCamp();updateHud();saveGame(true);return;")
write('game.js',g)

# ---------------------------------------------------------------------------
# renderer: decode the actual map vocabulary and draw gameplay interactables.
# ---------------------------------------------------------------------------
r=read('renderer2d-v14.js')
old_tile="""  function tileColor(ch,p){if(ch==='~')return p.water;if(['P','C','D','S'].includes(ch))return p.path;return p.ground;}
  function drawTerrain(s,p,m){
    const map=m.map;
    ctx.save();ctx.translate(-state.camX,-state.camY);
    if(!map.length){ctx.fillStyle=p.ground;ctx.fillRect(0,0,m.worldW,m.worldH);}
    for(let y=0;y<map.length;y++)for(let x=0;x<(map[y]?.length||0);x++){
      const ch=map[y][x],px=x*m.tile,py=y*m.tile,base=tileColor(ch,p),n=hash(x,y,s.location?.length||0);
      ctx.fillStyle=base;ctx.fillRect(px,py,m.tile+1,m.tile+1);
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
  }"""
new_tile="""  function solidWallBiome(s){return ['dungeon','mine','iceCave','citadel','core','glass'].includes(s?.locationData?.biome);}
  function tileColor(s,ch,p){
    const biome=s?.locationData?.biome;
    if(ch==='W')return solidWallBiome(s)?p.far:biome==='sky'?'#b8d5e8':p.water;
    if(ch==='L')return'#7c251f';if(ch==='I')return'#78b9cb';if(ch==='N')return'#c4d7dc';if(ch==='H')return'#66503a';
    if(['P','C','D','S'].includes(ch))return p.path;return p.ground;
  }
  function drawTerrain(s,p,m){
    const map=m.map,biome=s?.locationData?.biome;
    ctx.save();ctx.translate(-state.camX,-state.camY);
    if(!map.length){ctx.fillStyle=p.ground;ctx.fillRect(0,0,m.worldW,m.worldH);}
    for(let y=0;y<map.length;y++)for(let x=0;x<(map[y]?.length||0);x++){
      const ch=map[y][x],px=x*m.tile,py=y*m.tile,base=tileColor(s,ch,p),n=hash(x,y,s.location?.length||0);
      ctx.fillStyle=base;ctx.fillRect(px,py,m.tile+1,m.tile+1);
      ctx.fillStyle=n>.5?'rgba(255,255,255,.025)':'rgba(0,0,0,.035)';ctx.fillRect(px,py,m.tile+1,m.tile+1);
      const openWater=ch==='W'&&!solidWallBiome(s)&&biome!=='sky';
      if(openWater){
        ctx.strokeStyle='rgba(171,225,239,.19)';ctx.lineWidth=1.5;for(let k=0;k<2;k++){ctx.beginPath();ctx.moveTo(px+8,py+m.tile*(.35+k*.28));ctx.quadraticCurveTo(px+m.tile*.48,py+m.tile*(.28+k*.28)+Math.sin((x+y+k)*2)*3,px+m.tile-8,py+m.tile*(.35+k*.28));ctx.stroke();}
      }else if(ch==='W'&&biome==='sky'){
        ctx.fillStyle='rgba(245,252,255,.34)';ctx.beginPath();ctx.ellipse(px+m.tile*.50,py+m.tile*.52,m.tile*.36,m.tile*.17,0,0,TAU);ctx.fill();
      }else if(ch==='H'){
        ctx.strokeStyle='rgba(229,195,137,.23)';ctx.lineWidth=2;for(let k=1;k<5;k++){ctx.beginPath();ctx.moveTo(px+5,py+m.tile*k/5);ctx.lineTo(px+m.tile-5,py+m.tile*k/5);ctx.stroke();}
      }else if(ch==='L'){
        ctx.save();ctx.globalCompositeOperation='screen';ctx.fillStyle='rgba(255,102,49,.18)';ctx.fillRect(px+3,py+3,m.tile-6,m.tile-6);ctx.strokeStyle='rgba(255,188,77,.32)';ctx.beginPath();ctx.moveTo(px+5,py+m.tile*.35);ctx.bezierCurveTo(px+m.tile*.30,py+m.tile*.1,px+m.tile*.55,py+m.tile*.75,px+m.tile-5,py+m.tile*.44);ctx.stroke();ctx.restore();
      }else if(['P','C','D','S'].includes(ch)){
        ctx.strokeStyle='rgba(245,218,166,.075)';ctx.beginPath();ctx.moveTo(px+8,py+m.tile*.7);ctx.quadraticCurveTo(px+m.tile*.46,py+m.tile*.52,px+m.tile-8,py+m.tile*.64);ctx.stroke();
      }else if(ch!=='W'){
        for(let k=0;k<3;k++){const rx=px+hash(x*7+k,y)*m.tile,ry=py+hash(x,y*9+k)*m.tile;ctx.fillStyle='rgba(235,226,190,.045)';ctx.beginPath();ctx.arc(rx,ry,1+hash(k,x+y)*1.5,0,TAU);ctx.fill();}
      }
    }
    ctx.restore();
  }"""
r=one(r,old_tile,new_tile,'terrain vocabulary')

# Insert interactive drawing primitives after drawProp.
marker="""  function drawHumanoid(x,y,z,colors,time,action,hero=false){"""
interactive="""  function drawChest2d(x,y,z,p){shadow(x,y+z*.12,z*.28,z*.07,.30);const g=ctx.createLinearGradient(x-z*.25,y-z*.32,x+z*.25,y);g.addColorStop(0,'#a56f32');g.addColorStop(1,'#4f2f1e');ctx.fillStyle=g;roundRect(ctx,x-z*.28,y-z*.28,z*.56,z*.30,z*.05);ctx.fill();ctx.strokeStyle='#d6a657';ctx.lineWidth=Math.max(1.5,z*.025);ctx.stroke();ctx.fillStyle='#f2ce72';ctx.fillRect(x-z*.035,y-z*.18,z*.07,z*.12);}
  function drawNode2d(node,x,y,z,p,time){const t=String(node?.type||'').toLowerCase();shadow(x,y+z*.12,z*.22,z*.06,.22);ctx.save();const pulse=.72+Math.sin(time*4+x*.01)*.16;ctx.shadowBlur=18;ctx.shadowColor=t.includes('ore')||t.includes('crystal')?'#76dfff':t.includes('lore')?'#c8a6ff':p.accent;
    if(t==='herb'){ctx.strokeStyle='#65be7c';ctx.lineWidth=z*.045;for(const dx of [-.10,0,.10]){ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+z*dx,y-z*.20,x+z*dx*1.5,y-z*.38);ctx.stroke();}}
    else if(t.includes('ore')||t.includes('crystal')){ctx.fillStyle='#78d8ee';ctx.globalAlpha=pulse;for(const dx of [-.13,0,.14]){ctx.beginPath();ctx.moveTo(x+z*dx,y);ctx.lineTo(x+z*(dx+.08),y-z*(.25+Math.abs(dx)));ctx.lineTo(x+z*(dx+.15),y);ctx.closePath();ctx.fill();}}
    else if(t==='lore'){ctx.fillStyle='#8d78a8';roundRect(ctx,x-z*.20,y-z*.40,z*.40,z*.42,z*.04);ctx.fill();ctx.strokeStyle='#e1c5ff';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x,y-z*.20,z*.08,0,TAU);ctx.stroke();}
    else {ctx.strokeStyle=p.accent;ctx.lineWidth=2;ctx.globalAlpha=pulse;ctx.beginPath();ctx.arc(x,y-z*.18,z*.19,0,TAU);ctx.stroke();ctx.beginPath();ctx.moveTo(x,y-z*.42);ctx.lineTo(x+z*.18,y-z*.08);ctx.lineTo(x-z*.18,y-z*.08);ctx.closePath();ctx.stroke();}
    ctx.restore();}
  function drawShrine2d(x,y,z,p,time){shadow(x,y+z*.14,z*.30,z*.08,.28);ctx.fillStyle='#59616c';ctx.fillRect(x-z*.10,y-z*.34,z*.20,z*.38);ctx.fillStyle='#8793a2';ctx.fillRect(x-z*.20,y,z*.40,z*.08);ctx.save();ctx.globalCompositeOperation='screen';ctx.shadowBlur=26;ctx.shadowColor='#70ddff';ctx.fillStyle=`rgba(112,221,255,${.55+Math.sin(time*3)*.12})`;ctx.beginPath();ctx.moveTo(x,y-z*.66);ctx.lineTo(x+z*.09,y-z*.34);ctx.lineTo(x,y-z*.20);ctx.lineTo(x-z*.09,y-z*.34);ctx.closePath();ctx.fill();ctx.restore();}
  function drawExit2d(exit,x,y,z,p,time){ctx.save();ctx.globalCompositeOperation='screen';const col=exit?.unlocked?'#75d9ff':'#ff626e',pulse=1+Math.sin(time*4+x*.01)*.07;ctx.strokeStyle=rgba(col,exit?.unlocked?.52:.32);ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,y,z*.34*pulse,z*.13*pulse,0,0,TAU);ctx.stroke();ctx.fillStyle=rgba(col,exit?.unlocked?.08:.045);ctx.beginPath();ctx.ellipse(x,y,z*.29*pulse,z*.10*pulse,0,0,TAU);ctx.fill();ctx.restore();}

  function drawHumanoid(x,y,z,colors,time,action,hero=false){"""
r=one(r,marker,interactive,'interactive render primitives')

# Replace worldDrawables function with one that understands wall/water semantics and interactables.
r=sub_one(r,
r"  function worldDrawables\(s,p,m,time\)\{.*?return a\.sort\(\(x,y\)=>x\.wy-y\.wy\);\}",
"""  function worldDrawables(s,p,m,time){
    const a=[];const add=(wy,fn)=>a.push({wy,fn}),wallBiome=solidWallBiome(s);
    (m.map||[]).forEach((row,y)=>[...row].forEach((ch,x)=>{const wx=(x+.5)*m.tile,wy=(y+.76)*m.tile;if(ch==='T')add(wy,()=>drawTree(wx-state.camX,wy-state.camY,m.tile*.98,p,time));else if(ch==='B')add(wy,()=>drawBuilding(wx-state.camX,wy-state.camY,m.tile,p));else if(ch==='W'&&wallBiome)add(wy,()=>drawRock(wx-state.camX,wy-state.camY,m.tile*.78,p,x+y*17));else if(['M','R'].includes(ch))add(wy,()=>drawRock(wx-state.camX,wy-state.camY,m.tile*.72,p,x+y*17));}));
    (s.locationData?.exits||[]).forEach(e=>{const wx=(e.x+.5)*m.tile,wy=(e.y+.55)*m.tile;add(wy-.01,()=>drawExit2d(e,wx-state.camX,wy-state.camY,m.tile,p,time));});
    (s.locationData?.decor||[]).forEach((d,i)=>{const wx=(d.x+.5)*m.tile,wy=(d.y+.75)*m.tile;add(wy,()=>drawProp(d.type,wx-state.camX,wy-state.camY,m.tile*.72,p,time+i*.1));});
    if(s.locationData?.shrine){const sh=s.locationData.shrine,wx=(sh.x+.5)*m.tile,wy=(sh.y+.78)*m.tile;add(wy,()=>drawShrine2d(wx-state.camX,wy-state.camY,m.tile*.72,p,time));}
    (s.locationData?.chests||[]).forEach(c=>{const wx=(c.x+.5)*m.tile,wy=(c.y+.78)*m.tile;add(wy,()=>drawChest2d(wx-state.camX,wy-state.camY,m.tile*.70,p));});
    (s.locationData?.nodes||[]).forEach(n=>{const wx=(n.x+.5)*m.tile,wy=(n.y+.78)*m.tile;add(wy,()=>drawNode2d(n,wx-state.camX,wy-state.camY,m.tile*.70,p,time));});
    (s.locationData?.npcs||[]).forEach(n=>{const wx=(n.x+.5)*m.tile,wy=(n.y+.82)*m.tile;add(wy,()=>drawHumanoid(wx-state.camX,wy-state.camY,m.tile*.72,n.colors,time,null,false));});
    (s.locationData?.enemies||[]).forEach(e=>{const wx=(e.x+.5)*m.tile,wy=(e.y+.82)*m.tile;add(wy,()=>drawEnemy(e,wx-state.camX,wy-state.camY,m.tile*.70,time,null));});
    const hx=(state.heroX+.5)*m.tile,hy=(state.heroY+.84)*m.tile;add(hy,()=>drawHumanoid(hx-state.camX,hy-state.camY,m.tile*.80,s.heroColors,time,state.heroAction,true));return a.sort((x,y)=>x.wy-y.wy);
  }""",
'world interactables and tile blockers')
write('renderer2d-v14.js',r)

# ---------------------------------------------------------------------------
# UI styling: readable comparison labels and stronger interactive-card hierarchy.
# ---------------------------------------------------------------------------
css=read('cinematic2d-v14.css')
addition='''\n/* v15.2 — comparison-first gear UX */\n.gear-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.gear-card-head h4,.gear-card-head strong{margin:0;min-width:0}.gear-compare{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;padding:4px 7px;border-radius:999px;border:1px solid rgba(220,198,156,.18);font:800 8px/1 ui-sans-serif,system-ui,sans-serif;letter-spacing:.07em;white-space:nowrap}.gear-compare.better{color:#b9efc6;background:rgba(47,118,72,.18);border-color:rgba(111,211,139,.30)}.gear-compare.worse{color:#f2b6aa;background:rgba(127,49,43,.18);border-color:rgba(229,111,91,.28)}.gear-compare.equal{color:#d2c8b3;background:rgba(255,255,255,.035)}.gear-compare.equipped-label{color:#f0d493;background:rgba(178,128,50,.16);border-color:rgba(237,196,112,.32)}.weapon-card p,.equipment-card small,.shop-item p{line-height:1.48!important}.weapon-card.affixed{box-shadow:inset 3px 0 rgba(173,126,235,.34),0 10px 24px rgba(0,0,0,.16)!important}.weapon-card.equipped,.equipment-card.equipped{border-color:rgba(239,201,126,.38)!important;background:linear-gradient(180deg,rgba(222,180,105,.065),rgba(255,255,255,.018))!important}@media(max-width:600px){.gear-card-head{gap:6px}.gear-compare{font-size:7px;padding:4px 6px}}\n'''
if 'v15.2 — comparison-first gear UX' not in css: css+=addition
write('cinematic2d-v14.css',css)

# PWA version bump.
sw=read('service-worker.js')
sw=re.sub(r"const CACHE = '[^']+';","const CACHE = 'emberfall-blackstar-2d-v15-2';",sw,count=1)
write('service-worker.js',sw)

# Extend audit record.
p=Path('QUALITY_AUDIT_V15.md');notes=p.read_text(encoding='utf-8')
notes+='''\n## v15.2 world readability and gear UX\n\n- Modern renderer now decodes the existing map vocabulary instead of treating every `W` tile as a rock: outdoor `W` is water, enclosed-map `W` is solid wall terrain, sky `W` is cloud, `H` is plank/bridge terrain, and `L` is lava.\n- Unopened chests, gathering/story nodes, shrines and exits are now visible in the modern 2D renderer. Locked/unlocked exits have distinct telegraph colors.\n- Equipment and shop cards now compare weapon Power and armor AC directly against currently equipped gear with text + icon labels, so comparison does not rely only on color.\n- Weapon cards explicitly communicate their existing range identity (close power, close finesse, or far specialist) without inventing unsupported stats.\n- Removed additional hidden Character Sheet rebuilds from Gear/Camp-only actions.\n'''
p.write_text(notes,encoding='utf-8')
print('Blackstar v15.2 world/UI patch applied')
