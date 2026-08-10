from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')

s = s.replace(
    'Emberfall: Blackstar Ascendant 3D Edition — an original cinematic WebGL fantasy action RPG with dynamic 3D environments, smooth camera movement, reactive tactical combat, modern lighting, particles, party systems, deep loot, and a three-hour campaign.',
    'Emberfall: Blackstar 2D Reforged — an original cinematic dark-fantasy action RPG with layered high-detail 2D environments, fluid movement, reactive tactical combat, dynamic lighting, particles, party systems, deep loot, and a three-hour campaign.'
)
s = s.replace('<title>Emberfall: Blackstar Ascendant 3D Edition</title>', '<title>Emberfall: Blackstar 2D Reforged</title>')
s = s.replace('  <link rel="stylesheet" href="modern3d.css" />\n', '')
s = s.replace('  <link rel="stylesheet" href="actionrpg-plus.css" />\n', '')
if 'modern2d.css' not in s:
    s = s.replace('  <link rel="stylesheet" href="reforged.css" />\n', '  <link rel="stylesheet" href="reforged.css" />\n  <link rel="stylesheet" href="modern2d.css" />\n')

s = s.replace('BLACKSTAR ASCENDANT 3D · CINEMATIC ACTION-RPG CAMPAIGN', 'BLACKSTAR 2D REFORGED · CINEMATIC DARK-FANTASY ACTION RPG')
s = s.replace(
    '18 maps · cinematic WebGL 3D · click-to-move pathfinding · buffered combat inputs · dynamic telegraphs · dense environments/weather · reactive enemies · 7 jobs · 4 companions · Hunt Chains · deep loot · 29 weapons.',
    '18 maps · cinematic layered 2D · smooth movement · tap/click pathfinding · buffered combat · dynamic lighting/fog · reactive enemies · 7 jobs · 4 companions · Hunt Chains · deep loot · 29 weapons.'
)

for line in [
    '  <script src="https://cdn.jsdelivr.net/npm/three@0.159.0/build/three.min.js" crossorigin="anonymous"></script>\n',
    '  <script src="modern3d.js"></script>\n',
    '  <script src="actionrpg-plus.js"></script>\n',
]:
    s = s.replace(line, '')

if 'renderer2d.js' not in s:
    s = s.replace(
        '  <script src="mobile.js"></script>\n',
        '  <script src="mobile.js"></script>\n  <script src="renderer2d.js"></script>\n  <script src="combat-fx2d.js"></script>\n  <script src="actionrpg2d.js"></script>\n'
    )

assert 'three@' not in s.lower()
assert 'modern3d.js' not in s
assert 'modern3d.css' not in s
assert 'actionrpg-plus.js' not in s
assert 'actionrpg-plus.css' not in s
for required in ['modern2d.css','renderer2d.js','combat-fx2d.js','actionrpg2d.js']:
    assert required in s, required

p.write_text(s, encoding='utf-8')
