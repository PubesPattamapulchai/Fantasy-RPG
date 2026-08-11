from pathlib import Path
import json, re


def read(path):
    return Path(path).read_text(encoding='utf-8')

def write(path, text):
    Path(path).write_text(text, encoding='utf-8')

def one(text, old, new, label):
    count=text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 match, found {count}')
    return text.replace(old,new,1)

def sub_one(text, pattern, replacement, label):
    text2,count=re.subn(pattern,replacement,text,count=1,flags=re.S)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 match, found {count}')
    return text2

# ---------------------------------------------------------------------------
# game.js — root fixes: bridge, save safety, hidden work, action correctness,
# enemy behavior variety/fairness, camera fallback performance, audio cleanup.
# ---------------------------------------------------------------------------
g=read('game.js')

g=one(g,
"  const SAVE_KEY = 'emberfall-save-v3';",
"  // Keep the historic key so existing players are not stranded by a storage-key rename.\n  const SAVE_KEY = 'emberfall-save-v3';\n  const SAVE_BACKUP_KEY = 'emberfall-save-backup-v15';",
'save backup key')

g=one(g,
"  let lastClockSecond = -1;\n  let pendingDifficulty = 'adventurer';",
"  let lastClockSecond = -1;\n  let lastLegacyMapFrame = 0;\n  let pendingDifficulty = 'adventurer';",
'legacy renderer throttle state')

g=g.replace('// Public read-only presentation bridge used by the optional cinematic WebGL renderer.','// Public read-only presentation bridge used by the modern 2D renderer and input layer.')

g=one(g,
"          exits: (loc.exits || []).map(e => ({ x:e.x, y:e.y, label:e.label, target:e.target })),\n          shrine: loc.shrine ? { ...loc.shrine } : null",
"          exits: (loc.exits || []).map(e => ({ x:e.x, y:e.y, label:e.label, target:e.target })),\n          chests: (loc.chests || []).filter(c => !c.opened).map(c => ({ id:c.id, x:c.x, y:c.y })),\n          nodes: (loc.nodes || []).filter(isNodeVisible).map(n => ({ id:n.id, x:n.x, y:n.y, type:n.type })),\n          shrine: loc.shrine ? { ...loc.shrine } : null",
'bridge interactables')

g=one(g,
"        inBattle: !!state.inBattle,\n        companion: state.companion,",
"        inBattle: !!state.inBattle,\n        battleLocked: !!state.battleLocked,\n        timingActive: !!state.timingActive,\n        companion: state.companion,",
'bridge lock state')

old_beep="""  function beep(freq = 440, duration = 0.06, type = 'square', volume = 0.035) {
    if (!state.soundOn) return;
    try {
      audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type; osc.frequency.value = freq; gain.gain.value = volume;
      osc.connect(gain); gain.connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + duration);
    } catch (_) {}
  }"""
new_beep="""  function beep(freq = 440, duration = 0.06, type = 'square', volume = 0.035) {
    if (!state.soundOn) return;
    try {
      audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
      if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});
      const osc=audioCtx.createOscillator(),gain=audioCtx.createGain(),now=audioCtx.currentTime,end=now+Math.max(.025,duration);
      osc.type=type;osc.frequency.setValueAtTime(freq,now);
      gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),Math.min(end,now+.008));gain.gain.exponentialRampToValueAtTime(.0001,end);
      osc.connect(gain);gain.connect(audioCtx.destination);osc.onended=()=>{try{osc.disconnect();gain.disconnect();}catch(_){}};osc.start(now);osc.stop(end+.01);
    } catch (_) {}
  }"""
g=one(g,old_beep,new_beep,'audio node lifecycle')

g=one(g,
"    ui.continueBtn.disabled = !localStorage.getItem(SAVE_KEY); ui.continueBtn.style.opacity = ui.continueBtn.disabled ? '.45' : '1';",
"    ui.continueBtn.disabled = !localStorage.getItem(SAVE_KEY) && !localStorage.getItem(SAVE_BACKUP_KEY); ui.continueBtn.style.opacity = ui.continueBtn.disabled ? '.45' : '1';",
'backup continue availability')

g=one(g,
"    ui.loreText.textContent = `${state.counters.lore} / ${TOTAL_LORE}`;if(ui.armorClassText)ui.armorClassText.textContent=heroAC();if(ui.inspireBtn)ui.inspireBtn.textContent=`INSPIRATION ${state.inspiration}`;renderGear();renderSheet();",
"    ui.loreText.textContent = `${state.counters.lore} / ${TOTAL_LORE}`;if(ui.armorClassText)ui.armorClassText.textContent=heroAC();if(ui.inspireBtn)ui.inspireBtn.textContent=`INSPIRATION ${state.inspiration}`;\n    // Hidden menus used to be rebuilt on every HUD refresh. Render them only while visible.\n    if(!ui.gear.classList.contains('hidden'))renderGear();\n    if(!ui.sheet.classList.contains('hidden'))renderSheet();",
'hidden menu rebuild')

old_anim="""  function animate(){if(state.started&&!state.inBattle&&!menusOpen()&&ui.ending.classList.contains('hidden')){drawWorld();updateMiniMap();}const sec=currentPlaySeconds();if(sec!==lastClockSecond){lastClockSecond=sec;ui.playTime.textContent=formatTime(sec);}requestAnimationFrame(animate);}"""
new_anim="""  function animate(now=performance.now()){
    if(state.started&&!state.inBattle&&!menusOpen()&&ui.ending.classList.contains('hidden')){
      const modernReady=!!(window.Emberfall2D?.ready?.()&&document.body.classList.contains('modern2d-active'));
      // The legacy canvas remains a real fallback/minimap source, but no longer burns a full
      // render pass every frame while the modern 2D renderer is healthy.
      if(!modernReady||now-lastLegacyMapFrame>=250){drawWorld();updateMiniMap();lastLegacyMapFrame=now;}
    }
    const sec=currentPlaySeconds();if(sec!==lastClockSecond){lastClockSecond=sec;ui.playTime.textContent=formatTime(sec);}requestAnimationFrame(animate);
  }"""
g=one(g,old_anim,new_anim,'legacy renderer throttle')

save_block="""  function saveGame(silent=false){if(!state.started||!state.player.job)return;const elapsed=currentPlaySeconds();const saveState={...state,playSeconds:elapsed,dialogueQueue:[],inBattle:false,battleEnemy:null,battleLocked:false,activeEnemyId:null,activeShop:null,activeRoadEvent:null,eventFailed:false,timingActive:false,timingStartedAt:0,timingFrame:0,battleCombo:0,battleMaxCombo:0,battleMomentum:0,battleLastAction:'',battleFlow:0,battleFlowReady:false,battleLastDamageType:'',battleReactionCount:0,battlePerfects:0,battleDamageTaken:0,battleTurns:0,companionCooldown:0,reactionUsed:false,reactionReadied:false,battleRound:1,battlePhase:1,battleEnvironment:null,environmentUsed:false,dodgePrimed:false,parryPrimed:false,parryCooldown:0,weaponTechniqueCooldown:0,battleSurface:null,initiativeOrder:[],battleActiveActor:'hero',disadvantageNext:false};localStorage.setItem(SAVE_KEY,JSON.stringify({version:10,state:saveState,world:worldSnapshot()}));updateHud();if(!silent){showToast('ADVENTURE SAVED');beep(660);}}
  function loadGame(){const raw=localStorage.getItem(SAVE_KEY);if(!raw)return;try{const save=JSON.parse(raw);if(![3,4,5,6,7,8,9,10].includes(save.version))throw new Error('old save');resetWorld();restoreWorld(save.world);const fresh=initialState();state={...fresh,...save.state,player:{...fresh.player,...(save.state?.player||{}),talents:{...fresh.player.talents,...(save.state?.player?.talents||{})},runestones:[...new Set([...(fresh.player.runestones||[]),...(save.state?.player?.runestones||[])])],skillSigils:[...new Set([...(fresh.player.skillSigils||[]),...(save.state?.player?.skillSigils||[])])]},counters:{...fresh.counters,...(save.state?.counters||{})},keyItems:{...fresh.keyItems,...(save.state?.keyItems||{})},sideQuests:{...initialSideQuests(),...(save.state?.sideQuests||{})},started:true,inBattle:false,battleEnemy:null,battleLocked:false,dialogueQueue:[],activeEnemyId:null,activeShop:null};if(!locations[state.location])state.location='moonmere';if(!JOBS[state.player.job])throw new Error('invalid job');if(!COMPANIONS[state.companion])state.companion={vanguard:'brann',arcanist:'lyss',ranger:'pip',paladin:'mara',rogue:'pip',cleric:'mara',spellblade:'lyss'}[state.player.job]||'brann';if(save.version<6){state.player.talentPoints=Math.max(state.player.talentPoints||0,Math.floor(state.player.level/2));state.player.talents={};}sessionStartedAt=Date.now();ui.title.classList.add('hidden');ui.jobScreen.classList.add('hidden');ui.dialogue.classList.add('hidden');ui.battle.classList.add('hidden');ui.gear.classList.add('hidden');ui.sheet.classList.add('hidden');ui.camp.classList.add('hidden');ui.build.classList.add('hidden');ui.companionScreen.classList.add('hidden');ui.eventScreen.classList.add('hidden');ui.shop.classList.add('hidden');ui.ending.classList.add('hidden');addLog('Your long road continues.',true);updateHud();drawWorld();chord([440,554,660]);}catch(_){localStorage.removeItem(SAVE_KEY);showToast('SAVE FORMAT WAS OUTDATED');}}"""
new_save_block="""  function saveGame(silent=false){
    if(!state.started||!state.player.job)return false;
    const elapsed=currentPlaySeconds();
    const saveState={...state,playSeconds:elapsed,dialogueQueue:[],inBattle:false,battleEnemy:null,battleLocked:false,activeEnemyId:null,activeShop:null,activeRoadEvent:null,eventFailed:false,timingActive:false,timingStartedAt:0,timingFrame:0,battleCombo:0,battleMaxCombo:0,battleMomentum:0,battleLastAction:'',battleFlow:0,battleFlowReady:false,battleLastDamageType:'',battleReactionCount:0,battlePerfects:0,battleDamageTaken:0,battleTurns:0,companionCooldown:0,reactionUsed:false,reactionReadied:false,battleRound:1,battlePhase:1,battleEnvironment:null,environmentUsed:false,dodgePrimed:false,parryPrimed:false,parryCooldown:0,weaponTechniqueCooldown:0,battleSurface:null,initiativeOrder:[],battleActiveActor:'hero',disadvantageNext:false};
    const payload=JSON.stringify({version:11,state:saveState,world:worldSnapshot()});
    try{
      const previous=localStorage.getItem(SAVE_KEY);
      if(previous){try{const parsed=JSON.parse(previous);if(parsed&&parsed.state&&parsed.world)localStorage.setItem(SAVE_BACKUP_KEY,previous);}catch(_){}}
      localStorage.setItem(SAVE_KEY,payload);
    }catch(err){console.warn('Emberfall save failed',err);if(!silent)showToast('SAVE FAILED · STORAGE UNAVAILABLE');return false;}
    updateHud();if(!silent){showToast('ADVENTURE SAVED');beep(660);}return true;
  }

  function applyLoadedSave(save){
    if(!save||![3,4,5,6,7,8,9,10,11].includes(save.version)||!save.state?.player?.job||!JOBS[save.state.player.job])throw new Error('unsupported or incomplete save');
    resetWorld();restoreWorld(save.world||{});const fresh=initialState();
    state={...fresh,...save.state,player:{...fresh.player,...(save.state?.player||{}),talents:{...fresh.player.talents,...(save.state?.player?.talents||{})},runestones:[...new Set([...(fresh.player.runestones||[]),...(save.state?.player?.runestones||[])])],skillSigils:[...new Set([...(fresh.player.skillSigils||[]),...(save.state?.player?.skillSigils||[])])]},counters:{...fresh.counters,...(save.state?.counters||{})},keyItems:{...fresh.keyItems,...(save.state?.keyItems||{})},sideQuests:{...initialSideQuests(),...(save.state?.sideQuests||{})},started:true,inBattle:false,battleEnemy:null,battleLocked:false,dialogueQueue:[],activeEnemyId:null,activeShop:null};
    if(!locations[state.location])state.location='moonmere';
    if(!COMPANIONS[state.companion])state.companion={vanguard:'brann',arcanist:'lyss',ranger:'pip',paladin:'mara',rogue:'pip',cleric:'mara',spellblade:'lyss'}[state.player.job]||'brann';
    if(save.version<6){state.player.talentPoints=Math.max(state.player.talentPoints||0,Math.floor(state.player.level/2));state.player.talents={};}
    sessionStartedAt=Date.now();ui.title.classList.add('hidden');ui.jobScreen.classList.add('hidden');ui.dialogue.classList.add('hidden');ui.battle.classList.add('hidden');ui.gear.classList.add('hidden');ui.sheet.classList.add('hidden');ui.camp.classList.add('hidden');ui.build.classList.add('hidden');ui.companionScreen.classList.add('hidden');ui.eventScreen.classList.add('hidden');ui.shop.classList.add('hidden');ui.ending.classList.add('hidden');addLog('Your long road continues.',true);updateHud();drawWorld();chord([440,554,660]);
  }

  function loadGame(){
    const candidates=[['primary',localStorage.getItem(SAVE_KEY)],['backup',localStorage.getItem(SAVE_BACKUP_KEY)]];let lastError=null;
    for(const [kind,raw] of candidates){if(!raw)continue;try{const save=JSON.parse(raw);applyLoadedSave(save);if(kind==='backup'){try{localStorage.setItem(SAVE_KEY,raw);}catch(_){}showToast('RECOVERED BACKUP SAVE');}return;}catch(err){lastError=err;resetWorld();state=initialState();}}
    console.warn('Emberfall save recovery failed',lastError);showToast('SAVE COULD NOT BE RECOVERED');
  }"""
g=one(g,save_block,new_save_block,'save backup and recovery')

# Enemy decision profiles and boss recovery windows.
g=sub_one(g,
r"  function rollEnemyIntent\(enemy\)\{.*?\n  \}\n  function chooseEnemyIntent\(\)\{.*?\n  \}",
"""  function rollEnemyIntent(enemy){
    const roll=Math.random(),hp=enemy.hp/enemy.maxHp,p=state.player,heroHp=p.hp/p.maxHp,range=state.battleRange,archetype=String(enemy.sprite||'').split(' ')[0];
    // Shared reactive rules: wounded enemies, boss pressure, and player defenses matter first.
    if(hp<.27&&roll<.18)return'mend';
    if(enemy.boss&&enemy.phase>=2&&state.battleMomentum>=70&&roll<.46)return'ultimate';
    if(enemy.boss&&heroHp<.35&&roll<.40)return'ultimate';
    if((p.barrier||0)>0&&roll<.22)return'drain';
    if(state.guarding&&roll<.25)return'hex';
    if(state.parryPrimed&&roll<.24)return'brace';
    // Archetype profiles keep enemy families from feeling like the same random table.
    if(['mage','wraith'].includes(archetype)){if(range==='close'&&roll<.28)return'brace';if(roll<.50)return'hex';if(roll<.68)return'drain';if(roll<.80)return'heavy';return'attack';}
    if(['golem','knight','guard'].includes(archetype)){if(roll<.24)return'brace';if(roll<.58)return'heavy';if(range==='close'&&roll<.75)return'sweep';return'attack';}
    if(archetype==='bird'){if(range==='close'&&roll<.44)return'sweep';if(roll<.62)return'heavy';if(roll<.72)return'brace';return'attack';}
    if(['beast','wolf','rat','slime'].includes(archetype)){if(range==='close'&&roll<.48)return'sweep';if(roll<.68)return'heavy';if(heroHp<.35&&roll<.78)return'attack';return roll<.84?'hex':'attack';}
    if(range==='close'&&roll<.35)return'sweep';if(range==='far'&&roll<.30)return'heavy';if(heroHp<.32&&roll<.34)return'heavy';if(enemy.boss&&roll<.24)return'ultimate';if(roll<.40)return'heavy';if(roll<.54)return'sweep';if(roll<.65)return'hex';if(roll<.75)return'drain';if(roll<.84)return'brace';return'attack';
  }
  function chooseEnemyIntent(){
    const enemy=state.battleEnemy;if(!enemy)return;enemy.intent=enemy.nextIntent||rollEnemyIntent(enemy);let next=rollEnemyIntent(enemy);
    // Boss ultimates and heals always expose a readable recovery window rather than chaining unfairly.
    if(enemy.intent==='ultimate'&&next==='ultimate')next=enemy.hp/enemy.maxHp<.40?'brace':'attack';
    if(enemy.intent==='mend'&&next==='mend')next='attack';
    enemy.nextIntent=next;
  }""",
'enemy behavior profiles')

# Emit action presentation only after the gameplay action is actually accepted.
g=sub_one(g,
r"  function battleAction\(action\)\{.*?\n  \}\n\n  function enemyTurn\(\)\{",
"""  function battleAction(action){
    if(!state.inBattle||!state.battleEnemy||state.battleLocked||state.timingActive)return;
    const p=state.player;let acted=false;
    const commitAction=()=>{rewardTacticalRead(action);window.dispatchEvent(new CustomEvent('emberfall:action',{detail:{action}}));};
    state.guarding=false;state.battleActiveActor='hero';
    if(action==='attack'){commitAction();startTimingAttack();return;}
    if(action==='skill1'){acted=useJobSkill(1);if(acted)advanceCombo('skill1',8);}
    if(action==='skill2'){acted=useJobSkill(2);if(acted)advanceCombo('skill2',12);}
    if(action==='weaponTechnique'){acted=useWeaponTechnique();}
    if(action==='guard'){state.guarding=true;p.mp=Math.min(p.maxMp,p.mp+4+(equippedRelic()?.guardMp||0)+(hasTalent('channeler')?2:0));p.stamina=Math.min(p.maxStamina,p.stamina+18);const ward=gainBarrier(p.maxHp*(sigilIs('bulwark')?.18:.08),'GUARD WARD');advanceCombo('guard',5);ui.battleLog.textContent=`You brace, recover ${4+(equippedRelic()?.guardMp||0)+(hasTalent('channeler')?2:0)} MP, 18 Stamina${ward?`, and ${ward} Ward`:''}.`;beep(260,.08,'square',.03);animateClass(ui.battleHero,'guard-anim');acted=true;}
    if(action==='dodge'){acted=useDodge();}
    if(action==='parry'){acted=useParry();}
    if(action==='execute'){acted=useExecution();}
    if(action==='environment'){acted=useEnvironment();}
    if(action==='potion'){if(p.potions<1){ui.battleLog.textContent='Your potion pouch is empty.';beep(90);return;}if(p.hp>=p.maxHp){ui.battleLog.textContent='Your HP is already full.';beep(90);return;}p.potions-=1;const healed=Math.min(Math.floor((30+p.level*3)*(1+(runestone().healing||0))),p.maxHp-p.hp);p.hp+=healed;advanceCombo('potion',2);ui.battleLog.textContent=`You recover ${healed} HP.`;spawnFx('heal',`+${healed}`,'hero');chord([523,659]);acted=true;}
    if(action==='bomb'){if(p.bombs<1){ui.battleLog.textContent='You have no Crown Bombs.';beep(90);return;}p.bombs-=1;advanceCombo('bomb',15);const damage=34+p.level*5+randomBetween(0,10);applyEnemyDamage(damage,'The Crown Bomb explodes for {damage} piercing damage!',{stagger:32,flash:true,slash:false,type:'fire'});spawnFx('burst');chord([110,165,82]);acted=true;}
    if(action==='burst')acted=useBurst();
    if(action==='companion'){if(useCompanionAssist())commitAction();return;}
    if(action==='partyTactic'){if(cyclePartyTactic())commitAction();return;}
    if(action==='reaction'){if(readyReaction())commitAction();return;}
    if(action==='position'){const order=['close','mid','far'];state.battleRange=order[(order.indexOf(state.battleRange)+1)%order.length];ui.battleLog.textContent=`You reposition to ${state.battleRange.toUpperCase()} range. Weapon damage modifier: ${Math.round(rangeDamageMultiplier()*100)}%.`;spawnFx('word',state.battleRange.toUpperCase());updateBattleUi();commitAction();return;}
    if(action==='tactic'){const order=['balanced','bold','warded','cunning'];state.battleStance=order[(order.indexOf(state.battleStance)+1)%order.length];ui.battleLog.textContent=`You shift into ${state.battleStance.toUpperCase()} stance. AC ${heroAC()}.`;spawnFx('word',state.battleStance.toUpperCase());updateBattleUi();commitAction();return;}
    if(action==='inspire'){if(state.inspiration<1){ui.battleLog.textContent='You have no Inspiration available.';beep(90);return;}state.inspiration-=1;state.advantageNext=true;state.battleMomentum=Math.min(100,state.battleMomentum+18);ui.battleLog.textContent='You spend Inspiration. Your next weapon attack rolls with advantage.';spawnFx('word','INSPIRED!');updateBattleUi();commitAction();return;}
    if(acted){commitAction();finishPlayerTurn();}
  }

  function enemyTurn(){""",
'accepted action event')

# Explicit battle lifecycle events let visual modules stop polling the whole state at 60fps.
g=one(g,
"    setBattleTheme();ui.battle.classList.remove('phase-1','phase-2','phase-3','nemesis-battle');",
"    window.dispatchEvent(new CustomEvent('emberfall:battlestart',{detail:{enemy:state.battleEnemy.name,boss:state.battleEnemy.boss}}));\n    setBattleTheme();ui.battle.classList.remove('phase-1','phase-2','phase-3','nemesis-battle');",
'battle start event')

g=one(g,
"  function endBattle(){cancelAnimationFrame(state.timingFrame);state.timingActive=false;state.inBattle=false;",
"  function endBattle(){cancelAnimationFrame(state.timingFrame);state.timingActive=false;window.dispatchEvent(new CustomEvent('emberfall:battleend'));state.inBattle=false;",
'battle end event')

write('game.js',g)

# ---------------------------------------------------------------------------
# actionrpg2d.js — pathfinding correctness, exact marker coordinates,
# contextual click interaction, and buffer only during temporary locks.
# ---------------------------------------------------------------------------
a=read('actionrpg2d.js')
a=one(a,
"  function flushQueue(){\n    if(!runtime.queued)return;const s=snap();if(!s?.inBattle||performance.now()-runtime.queuedAt>2600){clearQueue();return;}\n    const btn=visibleButton(runtime.queued);if(btn&&!btn.disabled){const action=runtime.queued;clearQueue();btn.click();window.dispatchEvent(new CustomEvent('emberfall:bufferedaction',{detail:{action}}));}\n  }",
"  function flushQueue(){\n    if(!runtime.queued)return;const s=snap();if(!s?.inBattle||performance.now()-runtime.queuedAt>2200){clearQueue();return;}\n    const btn=visibleButton(runtime.queued);if(btn&&!btn.disabled){const action=runtime.queued;clearQueue();btn.click();window.dispatchEvent(new CustomEvent('emberfall:bufferedaction',{detail:{action}}));return;}\n    // If the turn is available again but the button is still disabled, the action is genuinely\n    // unavailable (cost/cooldown/etc.) and must not unexpectedly fire later.\n    if(!s.battleLocked&&!s.timingActive)clearQueue();\n  }",
'input buffer flush')
a=one(a,
"    if(s?.inBattle&&actionKeys[key]){const action=actionKeys[key],btn=visibleButton(action);if(!btn||btn.disabled){queueAction(action);e.preventDefault();e.stopImmediatePropagation();return;}}",
"    if(s?.inBattle&&actionKeys[key]){const action=actionKeys[key],btn=visibleButton(action);if((!btn||btn.disabled)&&(s.battleLocked||s.timingActive)){queueAction(action);e.preventDefault();e.stopImmediatePropagation();return;}}",
'keyboard buffer lock condition')
a=one(a,
"  document.addEventListener('pointerdown',e=>{const btn=e.target?.closest?.('[data-action]');if(!btn||!snap()?.inBattle||!btn.disabled)return;queueAction(btn.dataset.action);e.preventDefault();},true);",
"  document.addEventListener('pointerdown',e=>{const btn=e.target?.closest?.('[data-action]'),s=snap();if(!btn||!s?.inBattle||!btn.disabled||(!s.battleLocked&&!s.timingActive))return;queueAction(btn.dataset.action);e.preventDefault();},true);",
'pointer buffer lock condition')
a=one(a,
"    const map=s?.locationData?.map||[];if(y<0||y>=map.length||x<0||x>=(map[y]?.length||0))return false;if(goal&&goal.x===x&&goal.y===y)return true;\n    if(blockedTiles.has(map[y][x]))return false;",
"    const map=s?.locationData?.map||[];if(y<0||y>=map.length||x<0||x>=(map[y]?.length||0))return false;\n    // Terrain validity is checked before the goal exception, so clicking a wall/tree/building\n    // cannot create a path whose final step is impossible.\n    if(blockedTiles.has(map[y][x]))return false;if(goal&&goal.x===x&&goal.y===y)return true;",
'blocked destination order')
a=one(a,
"    const all=[...(s.locationData?.npcs||[]).map(o=>({...o,kind:'npc'})),...(s.locationData?.enemies||[]).filter(e=>!e.defeated).map(o=>({...o,kind:'enemy'})),...(s.locationData?.exits||[]).map(o=>({...o,kind:'exit'}))];",
"    const all=[...(s.locationData?.npcs||[]).map(o=>({...o,kind:'npc'})),...(s.locationData?.chests||[]).map(o=>({...o,kind:'chest'})),...(s.locationData?.nodes||[]).map(o=>({...o,kind:'node'})),...(s.locationData?.enemies||[]).filter(e=>!e.defeated).map(o=>({...o,kind:'enemy'})),...(s.locationData?.exits||[]).map(o=>({...o,kind:'exit'}))];",
'click interactables')
a=one(a,
"    if(actor){const adj=bestAdjacent(s,actor);if(!adj)return;path=adj.path;target=adj.target;interact=true;}else path=pathfind(s,tile);",
"    if(actor&&['npc','chest','node'].includes(actor.kind)){const adj=bestAdjacent(s,actor);if(!adj)return;path=adj.path;target=adj.target;interact=true;}else path=pathfind(s,tile);",
'enemy exit direct path')
a=sub_one(a,
r"  function showPing\(tile,kind\)\{.*?\n  \}",
"""  function showPing(tile,kind){
    const canvas=window.Emberfall2D?.canvas;if(!canvas)return;const point=window.Emberfall2D?.tileToScreen?.(tile.x,tile.y);if(!point)return;
    const ping=document.createElement('div');ping.className=`modern2d-ping ${kind}`;ping.style.left=`${point.x}px`;ping.style.top=`${point.y}px`;canvas.parentElement?.appendChild(ping);setTimeout(()=>ping.remove(),620);
  }""",
'exact click marker')
write('actionrpg2d.js',a)

# ---------------------------------------------------------------------------
# renderer2d-v14.js — fix fallback state, refresh-rate dependent particles,
# cap transient particles, exact tile projection, camera look-ahead, richer enemy silhouettes.
# ---------------------------------------------------------------------------
r=read('renderer2d-v14.js')
r=one(r,"  const TAU=Math.PI*2;","  const TAU=Math.PI*2;\n  const MAX_PARTICLES=180;",'particle cap constant')
r=one(r,
"    const tx=(state.heroX+.5)*m.tile-state.w*.5,ty=(state.heroY+.55)*m.tile-state.h*.5;",
"    const facing=s.player?.facing||'down',lookX=facing==='left'?-m.tile*.34:facing==='right'?m.tile*.34:0,lookY=facing==='up'?-m.tile*.24:facing==='down'?m.tile*.24:0;\n    const tx=(state.heroX+.5)*m.tile-state.w*.5+lookX,ty=(state.heroY+.55)*m.tile-state.h*.5+lookY;",
'camera look ahead')
r=one(r,
"      const g=ctx.createLinearGradient(px,py,px+m.tile,py+m.tile);g.addColorStop(0,base);g.addColorStop(1,rgba('#000000',.08));ctx.fillStyle=base;ctx.fillRect(px,py,m.tile+1,m.tile+1);",
"      ctx.fillStyle=base;ctx.fillRect(px,py,m.tile+1,m.tile+1);",
'unused tile gradient')

r=sub_one(r,
r"  function drawEnemy\(e,x,y,z,time,action\)\{.*?\n  \}\n\n  function worldDrawables",
"""  function drawEnemy(e,x,y,z,time,action){
    const boss=!!e?.boss,elite=!!e?.elite||!!e?.elite2,name=String(e?.name||e?.type||'').toLowerCase(),sprite=String(e?.sprite||'').toLowerCase();
    const pulse=action?Math.sin(clamp((performance.now()-action.at)/action.duration,0,1)*Math.PI):0,scale=boss?1.18:1;
    let body='#6c3a3d',accent='#ff765f';if(name.includes('wolf')||name.includes('beast')||name.includes('rat')){body='#5e584f';accent='#e9bd84';}if(name.includes('wraith')||name.includes('mage')){body='#59436f';accent='#c18aff';}if(name.includes('golem')||name.includes('guard')||name.includes('knight')){body='#545e68';accent='#91cfee';}if(name.includes('hydra')){body='#2d6652';accent='#79e3ad';}
    const isSlime=name.includes('slime')||name.includes('sludge'),isBird=name.includes('harpy')||name.includes('roc')||name.includes('bat')||sprite.includes('bird'),isBeast=name.includes('wolf')||name.includes('rat')||name.includes('wyrm')||name.includes('hydra')||name.includes('toad')||name.includes('crawler')||sprite.includes('beast'),isCaster=name.includes('wraith')||name.includes('mage')||sprite.includes('wraith')||sprite.includes('mage'),isArmored=name.includes('golem')||name.includes('guard')||name.includes('knight')||name.includes('sentinel')||sprite.includes('golem')||sprite.includes('knight')||sprite.includes('guard');
    shadow(x,y+z*.20,z*(boss?.52:.38),z*.11,.42);ctx.save();ctx.translate(x-pulse*z*.16,y);ctx.scale(scale,scale);
    const grad=ctx.createLinearGradient(-z*.35,-z*.62,z*.28,z*.18);grad.addColorStop(0,body);grad.addColorStop(1,'#211a22');ctx.fillStyle=grad;
    if(isSlime){ctx.beginPath();ctx.moveTo(-z*.34,z*.08);ctx.quadraticCurveTo(-z*.38,-z*.43,0,-z*.48);ctx.quadraticCurveTo(z*.40,-z*.40,z*.34,z*.08);ctx.quadraticCurveTo(0,z*.22,-z*.34,z*.08);ctx.fill();}
    else if(isBird){ctx.beginPath();ctx.moveTo(-z*.06,-z*.42);ctx.lineTo(-z*.56,-z*(.22+.12*pulse));ctx.lineTo(-z*.22,z*.02);ctx.lineTo(0,-z*.14);ctx.lineTo(z*.22,z*.02);ctx.lineTo(z*.56,-z*(.22+.12*pulse));ctx.lineTo(z*.06,-z*.42);ctx.closePath();ctx.fill();ctx.beginPath();ctx.arc(0,-z*.50,z*.13,0,TAU);ctx.fill();}
    else if(isBeast){roundRect(ctx,-z*.38,-z*.32,z*.65,z*.38,z*.13);ctx.fill();ctx.beginPath();ctx.arc(z*.28,-z*.36,z*.17,0,TAU);ctx.fill();ctx.strokeStyle='#231d20';ctx.lineWidth=z*.055;ctx.beginPath();for(const lx of [-.26,-.04,.18]){ctx.moveTo(lx*z,z*.01);ctx.lineTo((lx-.03)*z,z*.28);}ctx.stroke();}
    else if(isCaster){ctx.beginPath();ctx.moveTo(0,-z*.70);ctx.quadraticCurveTo(-z*.33,-z*.45,-z*.28,z*.14);ctx.lineTo(0,z*.02);ctx.lineTo(z*.28,z*.14);ctx.quadraticCurveTo(z*.33,-z*.45,0,-z*.70);ctx.fill();ctx.beginPath();ctx.arc(0,-z*.64,z*.15,0,TAU);ctx.fill();}
    else {const width=isArmored?z*.64:z*.54;roundRect(ctx,-width*.5,-z*.56,width,z*.68,z*.12);ctx.fill();ctx.beginPath();ctx.arc(0,-z*.68,isArmored?z*.20:z*.18,0,TAU);ctx.fill();if(isArmored){ctx.fillStyle='rgba(205,224,235,.15)';ctx.fillRect(-z*.28,-z*.42,z*.56,z*.10);}}
    ctx.save();ctx.shadowBlur=boss?24:elite?16:10;ctx.shadowColor=accent;ctx.fillStyle=accent;ctx.beginPath();ctx.arc(isBeast?z*.31:0,isBeast?-z*.39:-z*.62,z*.045,0,TAU);ctx.fill();ctx.restore();
    if(!isSlime&&!isBird&&!isBeast){ctx.strokeStyle='#211b22';ctx.lineWidth=z*.07;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-z*.20,-z*.18);ctx.lineTo(-z*(.38+.16*pulse),z*.05);ctx.moveTo(z*.20,-z*.18);ctx.lineTo(z*(.38+.16*pulse),z*.05);ctx.stroke();}
    if(boss||elite){ctx.strokeStyle=rgba(accent,boss?.58:.35);ctx.lineWidth=boss?3:2;ctx.beginPath();ctx.ellipse(0,z*.18,z*(boss?.52:.40),z*.12,0,0,TAU);ctx.stroke();}ctx.restore();
  }

  function worldDrawables""",
'enemy silhouette redesign')
r=one(r,'  function drawBattle(s,time){','  function drawBattle(s,dt,time){','battle dt signature')
r=one(r,'drawParticles(.016);drawAtmosphere(s,p,time);','drawParticles(dt);drawAtmosphere(s,p,time);','refresh independent particles')
r=one(r,
"  function burst(target,color,count=24){const x=state.w*(target==='hero'?.28:.72),y=state.h*.50;for(let i=0;i<count;i++){const a=Math.random()*TAU,v=80+Math.random()*180;state.particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-30,life:.25+Math.random()*.45,max:.7,size:1+Math.random()*4,color});}}",
"  function burst(target,color,count=24){const x=state.w*(target==='hero'?.28:.72),y=state.h*.50;count=Math.max(0,Math.min(count,MAX_PARTICLES-state.particles.length));for(let i=0;i<count;i++){const a=Math.random()*TAU,v=80+Math.random()*180;state.particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-30,life:.25+Math.random()*.45,max:.7,size:1+Math.random()*4,color});}}",
'particle pool cap')
old_frame="""  function frame(now){const dt=clamp((now-last)/1000,0,.05);last=now;const s=window.EmberfallBridge?.snapshot?.();state.lastSnapshot=s||state.lastSnapshot;try{ctx.setTransform(state.dpr,0,0,state.dpr,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.clearRect(0,0,state.w,state.h);ctx.save();if(state.shake&&!document.body.classList.contains('pref-reduced-motion'))ctx.translate((Math.random()-.5)*state.shake,(Math.random()-.5)*state.shake*.6);if(!s?.started){ctx.fillStyle='#090c12';ctx.fillRect(0,0,state.w,state.h);}else if(s.inBattle)drawBattle(s,now/1000);else{drawWorld(s,dt,now/1000);drawParticles(dt);}ctx.restore();state.error=false;}catch(err){console.error('Emberfall 2D renderer v14 fallback',err);state.error=true;canvas.style.display='none';legacy.style.opacity='1';legacy.style.pointerEvents='auto';}requestAnimationFrame(frame);}"""
new_frame="""  function frame(now){
    if(state.error)return;const dt=clamp((now-last)/1000,0,.05);last=now;const s=window.EmberfallBridge?.snapshot?.();state.lastSnapshot=s||state.lastSnapshot;
    try{ctx.setTransform(state.dpr,0,0,state.dpr,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.clearRect(0,0,state.w,state.h);ctx.save();if(state.shake&&!document.body.classList.contains('pref-reduced-motion'))ctx.translate((Math.random()-.5)*state.shake,(Math.random()-.5)*state.shake*.6);if(!s?.started){ctx.fillStyle='#090c12';ctx.fillRect(0,0,state.w,state.h);}else if(s.inBattle)drawBattle(s,dt,now/1000);else{drawWorld(s,dt,now/1000);drawParticles(dt);}ctx.restore();requestAnimationFrame(frame);}catch(err){console.error('Emberfall 2D renderer v15 fallback',err);state.error=true;canvas.style.display='none';legacy.style.opacity='1';legacy.style.pointerEvents='auto';document.body.classList.remove('modern2d-active');document.body.classList.add('modern2d-fallback');}
  }"""
r=one(r,old_frame,new_frame,'permanent safe fallback')
r=one(r,
"screenToTile:(clientX,clientY)=>{const s=window.EmberfallBridge?.snapshot?.();if(!s?.started||s.inBattle)return null;const r=canvas.getBoundingClientRect(),m=metrics(s),x=(clientX-r.left)*(state.w/r.width)+state.camX,y=(clientY-r.top)*(state.h/r.height)+state.camY;return{x:Math.floor(x/m.tile),y:Math.floor(y/m.tile)};},spawnFx:",
"screenToTile:(clientX,clientY)=>{const s=window.EmberfallBridge?.snapshot?.();if(!s?.started||s.inBattle)return null;const r=canvas.getBoundingClientRect(),m=metrics(s),x=(clientX-r.left)*(state.w/r.width)+state.camX,y=(clientY-r.top)*(state.h/r.height)+state.camY;return{x:Math.floor(x/m.tile),y:Math.floor(y/m.tile)};},tileToScreen:(tileX,tileY)=>{const s=window.EmberfallBridge?.snapshot?.();if(!s?.started)return null;const m=metrics(s);return{x:(tileX+.5)*m.tile-state.camX,y:(tileY+.5)*m.tile-state.camY,tile:m.tile};},spawnFx:",
'exact tile projection API')
r=r.replace("document.body.classList.add('modern2d-active','blackstar-v14')","document.body.classList.add('modern2d-active','blackstar-v15')")
write('renderer2d-v14.js',r)

# ---------------------------------------------------------------------------
# combat-fx2d.js — retire the 60fps inspector and absorb the useful Flow /
# reaction UI from the redundant cinematic v13 canvas in an event-driven way.
# ---------------------------------------------------------------------------
c=read('combat-fx2d.js')
c=one(c,
"  const overlay=document.createElement('div');overlay.id='combatFx2dOverlay';overlay.className='combat-fx2d-overlay';overlay.innerHTML='<div class=\"combat-fx2d-flash\"></div><div class=\"combat-fx2d-text-layer\"></div><div class=\"boss-cinematic-banner hidden\"><small>PHASE SHIFT</small><strong></strong></div>';",
"  const overlay=document.createElement('div');overlay.id='combatFx2dOverlay';overlay.className='combat-fx2d-overlay';overlay.innerHTML='<div class=\"combat-fx2d-flash\"></div><div class=\"combat-fx2d-text-layer\"></div><div id=\"flowSurgeChip\" class=\"flow-surge-chip hidden\"><small>COMBAT FLOW</small><span><i></i></span><strong>0%</strong></div><div id=\"reactionBanner2d\" class=\"reaction-banner-2d hidden\"><small>ELEMENTAL REACTION</small><strong></strong></div><div class=\"boss-cinematic-banner hidden\"><small>PHASE SHIFT</small><strong></strong></div>';",
'flow and reaction UI host')
c=one(c,
"  const flashEl=$('.combat-fx2d-flash',overlay),textLayer=$('.combat-fx2d-text-layer',overlay),bossBanner=$('.boss-cinematic-banner',overlay);",
"  const flashEl=$('.combat-fx2d-flash',overlay),textLayer=$('.combat-fx2d-text-layer',overlay),bossBanner=$('.boss-cinematic-banner',overlay),flowChip=$('#flowSurgeChip',overlay),reactionBanner=$('#reactionBanner2d',overlay);",
'flow refs')

old_fx="""  window.addEventListener('emberfall:fx',e=>{
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
  }"""
new_fx="""  function syncFlow(){
    const s=window.EmberfallBridge?.snapshot?.();if(!s?.inBattle){flowChip.classList.add('hidden');return;}flowChip.classList.remove('hidden');const flow=Math.max(0,Math.min(100,Number(s.battleFlow||0)));flowChip.querySelector('i').style.width=`${flow}%`;flowChip.querySelector('strong').textContent=s.battleFlowReady?'SURGE READY':`${Math.floor(flow)}%`;flowChip.classList.toggle('ready',!!s.battleFlowReady);
  }
  function showReaction(name){reactionBanner.querySelector('strong').textContent=name.toUpperCase();reactionBanner.classList.remove('hidden');clearTimeout(showReaction.timer);showReaction.timer=setTimeout(()=>reactionBanner.classList.add('hidden'),900);}

  window.addEventListener('emberfall:fx',e=>{
    const detail=e.detail||{},text=detail.text||detail.kind||'',meta=classify(text),target=detail.target||((meta.kind==='heal')?'hero':'enemy'),kind=detail.kind||'';
    if(meta.kind==='heal'){floatText('RECOVER',target,'heal');pulse('heal',120);}else{pulse(meta.kind==='fire'?'fire':'hit',100);if(String(text).match(/critical|crit/i))floatText('CRITICAL',target,'critical');}
    if(kind==='number'&&String(text).startsWith('-')&&prefs.blood)window.Emberfall2D?.spawnFx?.(target,'blood','#ba3246');
    const reaction=String(text).match(/COMBUSTION|VEILFLARE|SHATTER|CHAIN REACTION|FLOW SURGE/i);if(reaction)showReaction(reaction[0]);
    if(String(text).match(/BOSS PHASE/i)){const s=window.EmberfallBridge?.snapshot?.();if(s?.battleEnemy?.boss){bossBanner.querySelector('strong').textContent=`${s.battleEnemy.name||'BOSS'} · PHASE ${s.battleEnemy.phase||1}`;bossBanner.classList.remove('hidden');pulse('boss-phase',400);shake(14);setTimeout(()=>bossBanner.classList.add('hidden'),1550);}}
    syncFlow();
  });
  window.addEventListener('emberfall:action',syncFlow);window.addEventListener('emberfall:enemyaction',syncFlow);window.addEventListener('emberfall:battlestart',syncFlow);window.addEventListener('emberfall:battleend',()=>flowChip.classList.add('hidden'));"""
c=one(c,old_fx,new_fx,'event driven combat fx')
c=one(c,"  addSettings();requestAnimationFrame(inspect);","  addSettings();syncFlow();",'remove combat inspector raf')
write('combat-fx2d.js',c)

# ---------------------------------------------------------------------------
# Runtime/PWA metadata: remove duplicate cinematic v13 JS canvas, keep its CSS
# because it owns useful UI styling now reused by combat-fx2d.
# ---------------------------------------------------------------------------
h=read('index.html')
h=h.replace('<script src="cinematic2d-v13.js"></script>\n','')
h=h.replace('Blackstar 2D Ascendant v14','Blackstar 2D Ascendant v15')
h=h.replace('painterly layered 2D · Flow Surges · interrupts · elemental reactions · smooth movement','audited painterly 2D · responsive combat · tactical AI · safe saves · optimized rendering')
write('index.html',h)

sw=read('service-worker.js')
sw=re.sub(r"const CACHE = '[^']+';","const CACHE = 'emberfall-blackstar-2d-v15';",sw,count=1)
sw=sw.replace("  './cinematic2d-v13.js',\n",'')
write('service-worker.js',sw)

m=json.loads(read('manifest.webmanifest'))
m['name']='Emberfall: Blackstar 2D Ascendant v15'
m['description']='A stabilized, painterly cinematic 2D dark-fantasy action RPG with responsive movement, tactical enemy archetypes, fair boss recovery windows, Flow Surges, elemental reactions, safer save recovery, optimized layered rendering, deep loot, party systems, and offline play.'
write('manifest.webmanifest',json.dumps(m,indent=2)+'\n')

Path('QUALITY_AUDIT_V15.md').write_text('''# Emberfall — Blackstar 2D Ascendant v15 Quality Audit\n\nThis pass follows a bug-first approach: repair root causes and regressions before adding more visual layers. The game remains fully 2D.\n\n## Root causes fixed\n\n- **Redundant render work:** the hidden legacy pixel canvas was still repainting the entire world every animation frame while the modern Canvas2D renderer was active. It is now throttled to a low-frequency fallback/minimap refresh and resumes full rendering only if the modern renderer fails.\n- **Fallback regression:** the modern renderer could mark itself healthy again after a fatal render exception even though its canvas had already been hidden. Renderer failure is now sticky for the session, the modern-active flag is removed, and the legacy renderer takes over cleanly.\n- **Duplicate effects loop:** `cinematic2d-v13.js` duplicated ambient particles, attack effects, boss grading, telegraphs, and a full RAF loop. It is removed from runtime. Its useful Flow/reaction UI is now event-driven inside `combat-fx2d.js`.\n- **Hidden DOM rebuilds:** Gear and Character Sheet content was rebuilt on every HUD refresh, including combat and silent saves. Hidden menus now render only when visible/opened.\n- **Blocked click destinations:** pathfinding previously accepted the destination before validating terrain, so a wall/tree/building could become an impossible final path node. Terrain is now validated first.\n- **Click interaction mismatch:** clicking enemies/exits incorrectly stopped adjacent and pressed Interact, although those systems trigger by stepping onto their tiles. Enemies/exits now path directly; NPCs/chests/nodes path adjacent and interact.\n- **Inaccurate click marker:** movement pings used a second approximate tile-size calculation. They now use the renderer's exact tile projection.\n- **Over-eager input buffer:** disabled skills could be queued even when unavailable because of cost/cooldown. Buffering now applies only during temporary battle/timing locks and clears if the action remains unavailable once control returns.\n- **False combat VFX:** `emberfall:action` was emitted before battle-lock/resource validation. Presentation events now fire only after an action is accepted.\n- **Unsafe save failure:** malformed primary saves were deleted immediately. v15 keeps a last-known-good backup, supports recovery, and preserves old save versions.\n- **Audio-node cleanup:** short WebAudio nodes now fade out, disconnect on completion, and safely resume a suspended context.\n- **Refresh-rate particles:** battle particles used a fixed `0.016` timestep. They now use real frame delta and have a hard transient particle cap.\n\n## Gameplay / AI upgrades\n\n- Enemy families now use distinct tactical intent profiles: casters prefer hex/drain and defensive spacing, armored foes favor brace/heavy pressure, flying enemies use sweep pressure, and beasts favor close-range aggression.\n- Bosses cannot randomly chain ultimate into ultimate, and repeated mending is prevented, creating deliberate recovery windows.\n- v14's Perfect Evade counter-openings, posture interrupts, Flow Surges, elemental reactions, Perfect Parry, executions, surfaces, party doctrines, companion commands, World Tiers, Hunt Chains and Nemesis enemies remain intact.\n\n## Graphics / camera upgrades\n\n- 2D camera gains subtle facing-based look-ahead while remaining clamped to map bounds.\n- Enemy rendering now has distinct 2D silhouettes for slimes, beasts, birds, casters and armored enemies instead of one shared humanoid body.\n- Boss/elite aura, painterly terrain, parallax depth, shadows, fog, telegraphs and combat effects remain fully 2D.\n\n## Save compatibility\n\n- Payload schema: **v11**.\n- Loads versions **3–11**.\n- The historic `emberfall-save-v3` storage key is intentionally retained to avoid orphaning existing player saves.\n- Backup key: `emberfall-save-backup-v15`.\n\n## Performance\n\n- Removed one full-screen Canvas2D RAF layer.\n- Removed one 60fps combat-state inspector.\n- Throttled hidden legacy rendering.\n- Stopped rebuilding hidden Gear/Sheet DOM on every HUD refresh.\n- Removed per-tile unused gradient allocation.\n- Capped transient renderer particles.\n\n## Still intentionally preserved\n\nThe existing campaign, 18 maps, seven jobs, companions, quests, loot, inventory/equipment, save migration, tactical intent system, battle surfaces, reactions, boss phases, mobile controls and PWA/offline support are preserved.\n''',encoding='utf-8')

print('Blackstar 2D v15 quality patch applied')
