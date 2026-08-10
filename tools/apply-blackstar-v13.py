from pathlib import Path
import re

p=Path('game.js')
s=p.read_text(encoding='utf-8')

def one(old,new,label):
    global s
    n=s.count(old)
    if n!=1:
        raise SystemExit(f'{label}: expected 1 match, found {n}')
    s=s.replace(old,new,1)

one(
"battleCombo: 0, battleMaxCombo: 0, battleMomentum: 0, battleLastAction: '', battlePerfects: 0,",
"battleCombo: 0, battleMaxCombo: 0, battleMomentum: 0, battleLastAction: '', battleFlow: 0, battleFlowReady: false, battleLastDamageType: '', battleReactionCount: 0, battlePerfects: 0,",
'initial combat flow state')

one(
"battleCombo:0,battleMaxCombo:0,battleMomentum:0,battleLastAction:'',battlePerfects:0,",
"battleCombo:0,battleMaxCombo:0,battleMomentum:0,battleLastAction:'',battleFlow:0,battleFlowReady:false,battleLastDamageType:'',battleReactionCount:0,battlePerfects:0,",
'save reset flow state')

one(
"if(![3,4,5,6,7,8,9].includes(save.version))throw new Error('old save');",
"if(![3,4,5,6,7,8,9,10].includes(save.version))throw new Error('old save');",
'load v10 saves')

one(
"localStorage.setItem(SAVE_KEY,JSON.stringify({version:9,state:saveState,world:worldSnapshot()}));",
"localStorage.setItem(SAVE_KEY,JSON.stringify({version:10,state:saveState,world:worldSnapshot()}));",
'save v10')

one(
"state.battleCombo=0;state.battleMaxCombo=0;state.battleMomentum=0;state.battleLastAction='';state.battlePerfects=0;",
"state.battleCombo=0;state.battleMaxCombo=0;state.battleMomentum=0;state.battleLastAction='';state.battleFlow=0;state.battleFlowReady=false;state.battleLastDamageType='';state.battleReactionCount=0;state.battlePerfects=0;",
'start battle flow reset')

# endBattle contains the same base reset later; replace the remaining occurrence.
old="state.battleCombo=0;state.battleMaxCombo=0;state.battleMomentum=0;state.battleLastAction='';state.battlePerfects=0;"
if s.count(old)!=1:
    raise SystemExit(f'end battle flow reset: expected 1 remaining match, found {s.count(old)}')
s=s.replace(old,"state.battleCombo=0;state.battleMaxCombo=0;state.battleMomentum=0;state.battleLastAction='';state.battleFlow=0;state.battleFlowReady=false;state.battleLastDamageType='';state.battleReactionCount=0;state.battlePerfects=0;",1)

pattern=r"  function advanceCombo\(action,bonus=0\)\{\n    const varied=state\.battleLastAction&&state\.battleLastAction!==action;\n    state\.battleCombo=varied\?Math\.min\(9,state\.battleCombo\+1\):Math\.max\(1,state\.battleCombo-\(state\.battleLastAction===action\?1:0\)\);\n    state\.battleLastAction=action;state\.battleMaxCombo=Math\.max\(state\.battleMaxCombo,state\.battleCombo\);state\.battleMomentum=Math\.min\(100,state\.battleMomentum\+8\+state\.battleCombo\*2\+bonus\+\(equippedRelic\(\)\?\.momentum\|\|0\)\+affixBonus\('momentum'\)\+\(hasTalent\('tactician'\)&&varied\?8:0\)\);\n  \}"
replacement="""  function advanceCombo(action,bonus=0){
    const varied=state.battleLastAction&&state.battleLastAction!==action;
    state.battleCombo=varied?Math.min(9,state.battleCombo+1):Math.max(1,state.battleCombo-(state.battleLastAction===action?1:0));
    state.battleLastAction=action;state.battleMaxCombo=Math.max(state.battleMaxCombo,state.battleCombo);state.battleMomentum=Math.min(100,state.battleMomentum+8+state.battleCombo*2+bonus+(equippedRelic()?.momentum||0)+affixBonus('momentum')+(hasTalent('tactician')&&varied?8:0));
    const flowGain=(varied?14+Math.min(10,state.battleCombo*2):4)+(bonus>=15?4:0);
    state.battleFlow=Math.min(100,(state.battleFlow||0)+flowGain);
    if(state.battleFlow>=100&&!state.battleFlowReady){state.battleFlowReady=true;spawnFx('word','FLOW SURGE READY');showToast('FLOW SURGE READY');}
  }"""
s,n=re.subn(pattern,replacement,s,count=1)
if n!=1: raise SystemExit(f'advanceCombo patch failed: {n}')

old="""  function applyEnemyDamage(amount,text,options={}){
    const enemy=state.battleEnemy,wasBroken=!!enemy.broken;if(options.skill&&options.prepared!==false&&state.preparedMagic){amount*=1.18;state.preparedMagic=false;showToast('PREPARED BONUS');}if(options.skill){if(state.player.job==='arcanist')amount*=1.08;if(state.player.job==='spellblade')amount*=1.05;amount*=1+(equippedRelic()?.spellPower||0)+affixBonus('skill')+(hasTalent('spellEcho')?.10:0);}const damageType=options.type||'physical',affinity=affinityMultiplier(enemy,damageType);amount*=affinity*(1+runeDamageBonus(damageType));if(sigilIs('catalyst')&&['fire','arcane','radiant','poison'].includes(damageType))amount*=1.12;if(sigilIs('reaver')&&enemy.hp/enemy.maxHp<.35)amount*=1.15;if(wasBroken)amount*=sigilIs('rupture')?1.38:1.25;if(hasTalent('bloodRush')&&state.player.hp<=state.player.maxHp*.5)amount*=1.12;let damage=Math.max(1,Math.floor(amount));
    const chainBonus=1+Math.min(.24,state.battleCombo*.03);damage=Math.floor(damage*chainBonus);"""
new="""  function applyEnemyDamage(amount,text,options={}){
    const enemy=state.battleEnemy,wasBroken=!!enemy.broken,previousType=state.battleLastDamageType||'',flowSurge=!!state.battleFlowReady;if(options.skill&&options.prepared!==false&&state.preparedMagic){amount*=1.18;state.preparedMagic=false;showToast('PREPARED BONUS');}if(options.skill){if(state.player.job==='arcanist')amount*=1.08;if(state.player.job==='spellblade')amount*=1.05;amount*=1+(equippedRelic()?.spellPower||0)+affixBonus('skill')+(hasTalent('spellEcho')?.10:0);}const damageType=options.type||'physical';let reaction='';
    if(previousType&&previousType!==damageType){const pair=[previousType,damageType].sort().join('+');if(pair==='fire+poison'){amount*=1.20;reaction='COMBUSTION';options.stagger=(options.stagger||8)+18;}else if(pair==='arcane+radiant'){amount*=1.18;reaction='VEILFLARE';options.stagger=(options.stagger||8)+14;}else if(pair==='frost+physical'){amount*=1.15;reaction='SHATTER';options.stagger=(options.stagger||8)+25;}else{amount*=1.08;reaction='CHAIN REACTION';options.stagger=(options.stagger||8)+8;}state.battleReactionCount=(state.battleReactionCount||0)+1;state.battleMomentum=Math.min(100,state.battleMomentum+8);}
    if(flowSurge){amount*=1.25;options.stagger=(options.stagger||8)+15;state.battleFlow=0;state.battleFlowReady=false;text=`FLOW SURGE! ${text}`;spawnFx('word','FLOW SURGE');}
    state.battleLastDamageType=damageType;const affinity=affinityMultiplier(enemy,damageType);amount*=affinity*(1+runeDamageBonus(damageType));if(sigilIs('catalyst')&&['fire','arcane','radiant','poison'].includes(damageType))amount*=1.12;if(sigilIs('reaver')&&enemy.hp/enemy.maxHp<.35)amount*=1.15;if(wasBroken)amount*=sigilIs('rupture')?1.38:1.25;if(hasTalent('bloodRush')&&state.player.hp<=state.player.maxHp*.5)amount*=1.12;let damage=Math.max(1,Math.floor(amount));
    const chainBonus=1+Math.min(.24,state.battleCombo*.03);damage=Math.floor(damage*chainBonus);if(reaction){text=`${reaction}! ${text}`;spawnFx('word',reaction);}"""
one(old,new,'damage reaction patch')

one(
"const hero=[];if(state.guarding)hero.push('GUARD');",
"const hero=[];if(state.battleFlowReady)hero.push('FLOW SURGE READY');else if((state.battleFlow||0)>0)hero.push(`FLOW ${Math.floor(state.battleFlow)}%`);if(state.guarding)hero.push('GUARD');",
'flow hero status')

one(
"battleMomentum: state.battleMomentum,\n        battleSurface:",
"battleMomentum: state.battleMomentum,\n        battleFlow: state.battleFlow || 0,\n        battleFlowReady: !!state.battleFlowReady,\n        battleReactionCount: state.battleReactionCount || 0,\n        battleLastDamageType: state.battleLastDamageType || '',\n        battleSurface:",
'bridge flow state')

p.write_text(s,encoding='utf-8')
print('game.js Blackstar v13 gameplay patch applied')
