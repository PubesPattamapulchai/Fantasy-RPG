from pathlib import Path
import re

def one(text,old,new,label):
    n=text.count(old)
    if n!=1: raise SystemExit(f'{label}: expected 1, found {n}')
    return text.replace(old,new,1)

g=Path('game.js').read_text(encoding='utf-8')
g=one(g,
"enemy.phase=next;state.battlePhase=next;enemy.attack+=2*jumps;enemy.armor+=jumps;enemy.intent='ultimate';state.battleMomentum",
"enemy.phase=next;state.battlePhase=next;enemy.attack+=2*jumps;enemy.armor+=jumps;enemy.intent='ultimate';enemy.nextIntent='brace';state.battleMomentum",
'boss phase recovery intent')
g=one(g,
"  function chooseEnemyIntent(){\n    const enemy=state.battleEnemy;if(!enemy)return;enemy.intent=enemy.nextIntent||rollEnemyIntent(enemy);let next=rollEnemyIntent(enemy);\n    // Boss ultimates and heals always expose a readable recovery window rather than chaining unfairly.\n    if(enemy.intent==='ultimate'&&next==='ultimate')next=enemy.hp/enemy.maxHp<.40?'brace':'attack';\n    if(enemy.intent==='mend'&&next==='mend')next='attack';\n    enemy.nextIntent=next;\n  }",
"  function chooseEnemyIntent(){\n    const enemy=state.battleEnemy;if(!enemy)return;const previous=enemy.intent;let current=enemy.nextIntent||rollEnemyIntent(enemy);\n    // Protect the recovery window even when an Ultimate/Mend was already queued before a forced phase action.\n    if(previous==='ultimate'&&current==='ultimate')current='brace';\n    if(previous==='mend'&&current==='mend')current='attack';\n    enemy.intent=current;let next=rollEnemyIntent(enemy);\n    if(enemy.intent==='ultimate'&&next==='ultimate')next=enemy.hp/enemy.maxHp<.40?'brace':'attack';\n    if(enemy.intent==='mend'&&next==='mend')next='attack';\n    enemy.nextIntent=next;\n  }",
'boss queued recovery')
g=one(g,
"function resetGame(){if(!confirm('Erase your local Emberfall save and restart the campaign?'))return;localStorage.removeItem(SAVE_KEY);resetWorld();",
"function resetGame(){if(!confirm('Erase your local Emberfall save and restart the campaign?'))return;localStorage.removeItem(SAVE_KEY);localStorage.removeItem(SAVE_BACKUP_KEY);resetWorld();",
'reset backup save')
Path('game.js').write_text(g,encoding='utf-8')

r=Path('renderer2d-v14.js').read_text(encoding='utf-8')
r=one(r,
"document.body.classList.add('modern2d-active','blackstar-v15')",
"document.body.classList.add('modern2d-active','blackstar-v14','blackstar-v15')",
'cinematic css compatibility class')
Path('renderer2d-v14.js').write_text(r,encoding='utf-8')

sw=Path('service-worker.js').read_text(encoding='utf-8')
sw=re.sub(r"const CACHE = '[^']+';","const CACHE = 'emberfall-blackstar-2d-v15-1';",sw,count=1)
Path('service-worker.js').write_text(sw,encoding='utf-8')

p=Path('QUALITY_AUDIT_V15.md')
text=p.read_text(encoding='utf-8')
text += '''\n## v15.1 regression review\n\n- Restored the `blackstar-v14` compatibility class alongside `blackstar-v15` so the existing cinematic stylesheet remains active while the codebase transitions versions.\n- Reset now clears both the primary and backup campaign save, so an intentionally erased campaign cannot reappear through recovery.\n- Forced boss phase Ultimates now queue Brace as the recovery action, and intent selection also checks the previous action to prevent a pre-queued Ultimate/Mend from bypassing the recovery rule.\n'''
p.write_text(text,encoding='utf-8')
print('Blackstar v15.1 regression hotfix applied')
