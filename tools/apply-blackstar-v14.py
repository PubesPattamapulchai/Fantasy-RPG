from pathlib import Path
import json, re

# --- Core gameplay ---------------------------------------------------------
p=Path('game.js')
s=p.read_text(encoding='utf-8')

def one(old,new,label):
    global s
    n=s.count(old)
    if n!=1:
        raise SystemExit(f'{label}: expected 1 match, found {n}')
    s=s.replace(old,new,1)

one(
"state.battleLocked=true;setBattleButtons(true);setTimeout(victory,560);return;}\n    state.battleLocked=true;setBattleButtons(true);setTimeout(enemyTurn,560);",
"state.battleLocked=true;setBattleButtons(true);setTimeout(victory,430);return;}\n    state.battleLocked=true;setBattleButtons(true);setTimeout(enemyTurn,390);",
'combat turn responsiveness')

old="""if(state.dodgePrimed){const dodgeRoll=rollD20(),dodgeTotal=dodgeRoll+abilityMod('dex')+Math.floor(p.level/4),dodgeDC=10+Math.floor(enemy.attack/6)+(intent==='ultimate'?3:intent==='heavy'?2:0);showBattleRoll('DODGE',dodgeRoll,abilityMod('dex')+Math.floor(p.level/4),dodgeTotal);state.dodgePrimed=false;if(dodgeRoll===20||(dodgeRoll!==1&&dodgeTotal>=dodgeDC)){ui.battleLog.textContent=`Perfect footwork! You evade ${enemy.name}'s ${intentInfo(intent)[0].toLowerCase()} and gain Momentum.`;state.battleMomentum=Math.min(100,state.battleMomentum+22);spawnFx('word','EVADE!');animateClass(ui.battleHero,'dodge-anim',520);chooseEnemyIntent();state.battleActiveActor='hero';state.battleRound+=1;p.stamina=Math.min(p.maxStamina,p.stamina+24+(hasTalent('ironPulse')?6:0));state.battleLocked=false;setBattleButtons(false);updateBattleUi();return;}ui.battleLog.textContent=`Dodge check ${dodgeTotal} vs DC ${dodgeDC}: you are clipped as you move.`;}"""
new="""if(state.dodgePrimed){const dodgeRoll=rollD20(),dodgeTotal=dodgeRoll+abilityMod('dex')+Math.floor(p.level/4),dodgeDC=10+Math.floor(enemy.attack/6)+(intent==='ultimate'?3:intent==='heavy'?2:0);showBattleRoll('DODGE',dodgeRoll,abilityMod('dex')+Math.floor(p.level/4),dodgeTotal);state.dodgePrimed=false;if(dodgeRoll===20||(dodgeRoll!==1&&dodgeTotal>=dodgeDC)){const perfect=dodgeRoll===20||dodgeTotal>=dodgeDC+5;ui.battleLog.textContent=`${perfect?'PERFECT EVADE!':'Perfect footwork!'} You slip ${enemy.name}'s ${intentInfo(intent)[0].toLowerCase()} and create a counter-opening.`;state.battleMomentum=Math.min(100,state.battleMomentum+(perfect?30:22));state.advantageNext=true;state.battleFlow=Math.min(100,(state.battleFlow||0)+(perfect?22:14));if(state.battleFlow>=100&&!state.battleFlowReady){state.battleFlowReady=true;spawnFx('word','FLOW SURGE READY');}if(['heavy','sweep','ultimate'].includes(intent))enemy.stagger=Math.min(100,(enemy.stagger||0)+(perfect?24:12));spawnFx('word',perfect?'PERFECT EVADE':'EVADE!');animateClass(ui.battleHero,'dodge-anim',440);chooseEnemyIntent();state.battleActiveActor='hero';state.battleRound+=1;p.stamina=Math.min(p.maxStamina,p.stamina+26+(hasTalent('ironPulse')?6:0));state.battleLocked=false;setBattleButtons(false);updateBattleUi();return;}ui.battleLog.textContent=`Dodge check ${dodgeTotal} vs DC ${dodgeDC}: you are clipped as you move.`;}"""
one(old,new,'dodge counter-opening')

needle="""enemy.stagger=Math.min(100,(enemy.stagger||0)+(options.stagger||8)+affixBonus('stagger')+(sigilIs('rupture')&&damageType==='physical'?12:0)+Math.floor(damage/enemy.maxHp*32));
    if(affinity>1){"""
replacement="""enemy.stagger=Math.min(100,(enemy.stagger||0)+(options.stagger||8)+affixBonus('stagger')+(sigilIs('rupture')&&damageType==='physical'?12:0)+Math.floor(damage/enemy.maxHp*32));
    const interruptible=['mend','heavy','hex','ultimate'].includes(enemy.intent),interruptNeed=enemy.intent==='ultimate'?60:enemy.intent==='heavy'?42:enemy.intent==='hex'?34:24;
    if(interruptible&&enemy.hp>0&&(options.stagger||0)>=interruptNeed&&enemy.stagger>=60){state.battleMomentum=Math.min(100,state.battleMomentum+14);text=`INTERRUPTED! ${text}`;spawnFx('word','INTERRUPT');enemy.intent='attack';enemy.nextIntent=rollEnemyIntent(enemy);}
    if(affinity>1){"""
one(needle,replacement,'intent interrupt mechanic')

# --- Runtime wiring --------------------------------------------------------
p=Path('index.html');h=p.read_text(encoding='utf-8')
if 'cinematic2d-v14.css' not in h:
    h=h.replace('<link rel="stylesheet" href="cinematic2d-v13.css" />','<link rel="stylesheet" href="cinematic2d-v13.css" />\n  <link rel="stylesheet" href="cinematic2d-v14.css" />')
h=h.replace('<script src="renderer2d.js"></script>','<script src="renderer2d-v14.js"></script>')
h=h.replace('Emberfall: Blackstar 2D Ascendant','Emberfall: Blackstar 2D Ascendant v14')
h=h.replace('cinematic layered 2D · Flow Surges · elemental reactions · smooth movement','painterly layered 2D · Flow Surges · interrupts · elemental reactions · smooth movement')
p.write_text(h,encoding='utf-8')

p=Path('service-worker.js');sw=p.read_text(encoding='utf-8')
sw=re.sub(r"const CACHE = '[^']+';","const CACHE = 'emberfall-blackstar-2d-v14';",sw,count=1)
sw=sw.replace("  './renderer2d.js',","  './renderer2d-v14.js',")
if "'./cinematic2d-v14.css'" not in sw:
    sw=sw.replace("  './cinematic2d-v13.css',","  './cinematic2d-v13.css',\n  './cinematic2d-v14.css',")
p.write_text(sw,encoding='utf-8')

p=Path('manifest.webmanifest');m=json.loads(p.read_text(encoding='utf-8'))
m['name']='Emberfall: Blackstar 2D Ascendant v14'
m['description']='A painterly cinematic 2D dark-fantasy action RPG with responsive movement, Flow Surges, elemental reactions, tactical interrupts, reactive enemy intent, boss phases, party systems, deep loot, accessibility options, and offline play.'
p.write_text(json.dumps(m,indent=2)+'\n',encoding='utf-8')

# --- Permanent validation update -----------------------------------------
p=Path('.github/workflows/validate-2d.yml');v=p.read_text(encoding='utf-8')
v=v.replace('node --check renderer2d.js','node --check renderer2d-v14.js\n          node --check cinematic2d-v13.js')
v=v.replace("required=['modern2d.css','renderer2d.js','combat-fx2d.js','actionrpg2d.js']","required=['modern2d.css','cinematic2d-v14.css','renderer2d-v14.js','combat-fx2d.js','actionrpg2d.js','cinematic2d-v13.js']")
v=v.replace("assert 'emberfall-blackstar-2d-v12' in sw","assert 'emberfall-blackstar-2d-v14' in sw")
p.write_text(v,encoding='utf-8')

# --- Edition notes --------------------------------------------------------
Path('BLACKSTAR_2D_ASCENDANT_V14.md').write_text('''# Emberfall — Blackstar 2D Ascendant v14\n\n## Bug fix\n- Replaces the unreliable world presentation path with a fail-safe Canvas2D renderer.\n- Terrain is always painted before props/actors; runtime exceptions fall back to the legacy canvas instead of leaving a blank scene.\n- Keeps the game fully 2D. No Three.js or WebGL 3D runtime is used.\n\n## Graphics\n- Painterly biome palettes and much stronger visible terrain.\n- Layered parallax silhouettes, roads, water, ground texture, buildings, trees, rocks and environmental props.\n- Modern vector-style hero/NPC/enemy silhouettes with contact shadows, weapon glow and depth sorting.\n- Cinematic battle floor, boss aura, enemy intent telegraphs and high-contrast action effects.\n- Existing v13 Flow/reaction particles and UI are retained.\n\n## Gameplay\n- Faster player-to-enemy turn handoff for more responsive combat.\n- Successful dodge creates advantage on the next action and builds Flow; perfect evades build more Flow and stagger dangerous attacks.\n- High-stagger attacks can interrupt Mend, Heavy, Hex and Ultimate intents when the enemy posture is sufficiently pressured.\n- Existing Flow Surges, elemental reactions, parry, execution, surfaces, positioning, companion tactics, world tiers and Nemesis systems remain.\n\n## PWA\n- Cache version: `emberfall-blackstar-2d-v14`.\n''',encoding='utf-8')

print('Blackstar v14 bugfix/gameplay/runtime patch applied')
