from pathlib import Path
import re


def read(p): return Path(p).read_text(encoding='utf-8')
def write(p,s): Path(p).write_text(s,encoding='utf-8')
def one(s,old,new,label):
    n=s.count(old)
    if n!=1: raise SystemExit(f'{label}: expected 1 match, found {n}')
    return s.replace(old,new,1)

# game.js — battle button truthfulness and pure-heal guard.
g=read('game.js')
old_set="""  function setBattleButtons(disabled){
    document.querySelectorAll('[data-action]').forEach(button=>{
      const action=button.dataset.action;
      const burstLocked=action==='burst'&&state.battleMomentum<100;
      const dodgeLocked=action==='dodge'&&(state.player.stamina||0)<dodgeCost();
      const parryLocked=action==='parry'&&((state.player.stamina||0)<parryCost()||state.parryCooldown>0||state.parryPrimed);
      const executeLocked=action==='execute'&&!executeReady();
      const techniqueLocked=action==='weaponTechnique'&&((state.player.stamina||0)<currentTechnique().cost||state.weaponTechniqueCooldown>0);
      const environmentLocked=action==='environment'&&state.environmentUsed;
      const companionLocked=action==='companion'&&state.companionCooldown>0;
      const reactionLocked=action==='reaction'&&state.reactionUsed;
      const locked=disabled||burstLocked||dodgeLocked||parryLocked||executeLocked||techniqueLocked||environmentLocked||companionLocked||reactionLocked;
      button.disabled=locked;button.style.opacity=locked?'.55':'1';
    });
    ui.burstBtn.classList.toggle('ready',state.battleMomentum>=100&&!disabled);
    if(ui.executeBtn)ui.executeBtn.classList.toggle('ready',executeReady()&&!disabled);
    if(ui.parryBtn)ui.parryBtn.classList.toggle('ready',state.parryPrimed);
    updateFriendlyUi();
  }"""
new_set="""  function setBattleButtons(disabled){
    const p=state.player,job=state.player.job?currentJob():null;
    document.querySelectorAll('[data-action]').forEach(button=>{
      const action=button.dataset.action;
      const skill1Locked=action==='skill1'&&(!job||p.mp<job.skills[0].cost);
      const skill2Locked=action==='skill2'&&(!job||p.mp<job.skills[1].cost||(p.job==='cleric'&&p.hp>=p.maxHp));
      const burstLocked=action==='burst'&&state.battleMomentum<100;
      const dodgeLocked=action==='dodge'&&(p.stamina||0)<dodgeCost();
      const parryLocked=action==='parry'&&((p.stamina||0)<parryCost()||state.parryCooldown>0||state.parryPrimed);
      const executeLocked=action==='execute'&&!executeReady();
      const techniqueLocked=action==='weaponTechnique'&&((p.stamina||0)<currentTechnique().cost||state.weaponTechniqueCooldown>0);
      const environmentLocked=action==='environment'&&state.environmentUsed;
      const companionLocked=action==='companion'&&(state.companionCooldown>0||!state.companion);
      const reactionLocked=action==='reaction'&&state.reactionUsed;
      const potionLocked=action==='potion'&&(p.potions<1||p.hp>=p.maxHp);
      const bombLocked=action==='bomb'&&p.bombs<1;
      const inspireLocked=action==='inspire'&&state.inspiration<1;
      const locked=disabled||skill1Locked||skill2Locked||burstLocked||dodgeLocked||parryLocked||executeLocked||techniqueLocked||environmentLocked||companionLocked||reactionLocked||potionLocked||bombLocked||inspireLocked;
      let reason='';
      if(disabled)reason='WAIT FOR TURN';else if(skill1Locked||skill2Locked)reason=(p.job==='cleric'&&action==='skill2'&&p.hp>=p.maxHp)?'HP ALREADY FULL':'NOT ENOUGH MP';else if(potionLocked)reason=p.potions<1?'NO POTIONS':'HP ALREADY FULL';else if(bombLocked)reason='NO BOMBS';else if(inspireLocked)reason='NO INSPIRATION';else if(burstLocked)reason='NEEDS 100 MOMENTUM';else if(dodgeLocked||parryLocked||techniqueLocked)reason='RESOURCE / COOLDOWN';else if(executeLocked)reason='NO EXECUTION OPENING';else if(environmentLocked)reason='ENVIRONMENT SPENT';else if(companionLocked)reason='COMPANION RECHARGING';else if(reactionLocked)reason='REACTION SPENT';
      button.disabled=locked;button.style.opacity=locked?'.55':'1';if(reason)button.title=reason;else button.removeAttribute('title');
    });
    ui.burstBtn.classList.toggle('ready',state.battleMomentum>=100&&!disabled);
    if(ui.executeBtn)ui.executeBtn.classList.toggle('ready',executeReady()&&!disabled);
    if(ui.parryBtn)ui.parryBtn.classList.toggle('ready',state.parryPrimed);
    updateFriendlyUi();
  }"""
g=one(g,old_set,new_set,'truthful battle buttons')

g=one(g,
"    ui.skill1.textContent = job.skills[0].name; ui.skill2.textContent = job.skills[1].name;",
"    ui.skill1.textContent = `${job.skills[0].name} · ${job.skills[0].cost} MP`; ui.skill2.textContent = `${job.skills[1].name} · ${job.skills[1].cost} MP`;",
'skill cost visibility')

g=one(g,
"  function useJobSkill(slot){const p=state.player,enemy=state.battleEnemy,jobId=p.job,skill=currentJob().skills[slot-1];if(!spendMp(skill.cost))return false;const atk=effectiveAttack();let damage=0;",
"  function useJobSkill(slot){const p=state.player,enemy=state.battleEnemy,jobId=p.job,skill=currentJob().skills[slot-1];if(jobId==='cleric'&&slot===2&&p.hp>=p.maxHp){ui.battleLog.textContent='Your HP is already full.';beep(90);return false;}if(!spendMp(skill.cost))return false;const atk=effectiveAttack();let damage=0;",
'pure heal full HP guard')
write('game.js',g)

# mobile.js — Build and Options must own the screen like every other modal.
m=read('mobile.js')
m=one(m,
"    document.body.classList.toggle('menu-active', visible('gearScreen') || visible('sheetScreen') || visible('campScreen') || visible('shopScreen') || visible('eventScreen') || visible('companionScreen'));",
"    document.body.classList.toggle('menu-active', visible('gearScreen') || visible('sheetScreen') || visible('campScreen') || visible('shopScreen') || visible('eventScreen') || visible('companionScreen') || visible('buildScreen') || visible('settingsScreen'));",
'mobile modal ownership')
m=one(m,
"  ['titleScreen', 'jobScreen', 'companionScreen', 'battleScreen', 'gearScreen', 'sheetScreen', 'campScreen', 'shopScreen', 'eventScreen', 'dialogueBox', 'endingScreen'].forEach(id => {",
"  ['titleScreen', 'jobScreen', 'companionScreen', 'battleScreen', 'gearScreen', 'sheetScreen', 'campScreen', 'shopScreen', 'eventScreen', 'buildScreen', 'settingsScreen', 'dialogueBox', 'endingScreen'].forEach(id => {",
'mobile modal observers')
write('mobile.js',m)

# Small visual affordance for disabled state reasons / resource costs.
css=read('cinematic2d-v14.css')
if 'v15.3 — truthful combat controls' not in css:
    css+='''\n/* v15.3 — truthful combat controls */\n.battle-actions .pixel-button:disabled{cursor:not-allowed!important;filter:saturate(.38) brightness(.72)!important}.battle-actions .pixel-button[title]:disabled{border-style:dashed!important}.battle-actions [data-action="skill1"],.battle-actions [data-action="skill2"]{font-variant-numeric:tabular-nums}.mobile-device.menu-active .mobile-controls{pointer-events:none!important;opacity:.12!important}.mobile-device.menu-active #modern2dCanvas{pointer-events:none!important}\n'''
write('cinematic2d-v14.css',css)

sw=read('service-worker.js');sw=re.sub(r"const CACHE = '[^']+';","const CACHE = 'emberfall-blackstar-2d-v15-3';",sw,count=1);write('service-worker.js',sw)

p=Path('QUALITY_AUDIT_V15.md');notes=p.read_text(encoding='utf-8');notes+='''\n## v15.3 combat UX and mobile state ownership\n\n- Combat buttons now reflect real availability: MP costs, pure-heal-at-full-HP, potion stock/full HP, bomb stock, Inspiration, Stamina/cooldowns, Momentum, Execution openings, environment use, companion recharge, and reaction use.\n- Job skill buttons show their actual MP cost during play.\n- Cleric Greater Heal can no longer consume MP/turn while HP is already full.\n- Build and Options overlays now enter mobile `menu-active` mode and are observed for state changes, preventing movement controls/world pointer input from remaining active underneath them.\n''';p.write_text(notes,encoding='utf-8')
print('Blackstar v15.3 UX/mobile patch applied')
