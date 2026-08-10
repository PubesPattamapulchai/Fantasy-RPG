# Emberfall — Blackstar 2D Ascendant v14

## Bug fix
- Replaces the unreliable world presentation path with a fail-safe Canvas2D renderer.
- Terrain is always painted before props/actors; runtime exceptions fall back to the legacy canvas instead of leaving a blank scene.
- Keeps the game fully 2D. No Three.js or WebGL 3D runtime is used.

## Graphics
- Painterly biome palettes and much stronger visible terrain.
- Layered parallax silhouettes, roads, water, ground texture, buildings, trees, rocks and environmental props.
- Modern vector-style hero/NPC/enemy silhouettes with contact shadows, weapon glow and depth sorting.
- Cinematic battle floor, boss aura, enemy intent telegraphs and high-contrast action effects.
- Existing v13 Flow/reaction particles and UI are retained.

## Gameplay
- Faster player-to-enemy turn handoff for more responsive combat.
- Successful dodge creates advantage on the next action and builds Flow; perfect evades build more Flow and stagger dangerous attacks.
- High-stagger attacks can interrupt Mend, Heavy, Hex and Ultimate intents when the enemy posture is sufficiently pressured.
- Existing Flow Surges, elemental reactions, parry, execution, surfaces, positioning, companion tactics, world tiers and Nemesis systems remain.

## PWA
- Cache version: `emberfall-blackstar-2d-v14`.
