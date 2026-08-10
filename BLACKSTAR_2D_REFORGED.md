# Emberfall — Blackstar 2D Reforged

Blackstar 2D Reforged converts Emberfall back to a fully 2D presentation while preserving the deeper modern action-RPG systems added in earlier editions. The runtime no longer requires Three.js or any WebGL 3D scene.

## Rendering direction
- Layered Canvas2D renderer with smooth interpolation instead of visible tile snapping.
- High-resolution procedural character, enemy, prop, terrain and battle rendering with non-pixel scaling.
- Per-biome painted color treatment, parallax silhouettes, atmospheric fog, snow, dust, embers and magical motes.
- Depth-sorted world actors and scenery, soft contact shadows, dynamic darkness masks and radial 2D lights.
- Dedicated cinematic 2D battle composition with large hero/enemy silhouettes and boss-scale staging.

## Combat presentation
- Event-driven attack lunges, dodge movement, parry flashes, executions and boss-phase presentation.
- 2D enemy intent telegraphs and persistent surface treatment on the battlefield.
- Weapon sparks, blood mist, fire, poison, frost, arcane, radiant and healing feedback.
- Floating damage/critical text, hit stop, screen flash and camera impact options.

## Responsive gameplay
- Hold WASD/arrow keys for continuous exploration movement.
- Click/tap destinations for pathfinding and contextual interaction.
- Buffered combat inputs retain commands pressed while an action is temporarily unavailable.
- Existing tactical systems remain: dodge, parry, execution, stagger/break, surfaces, environment actions, initiative, companion doctrines, Covenant Surges, Skill Sigils, Runestones, World Tiers, Hunt Chains, Nemesis enemies, boss phases and deep loot.

## UI / UX
- Modern dark-fantasy glass/metal/leather visual language replaces the heavy pixel framing.
- Clearer meters, combat categories, menus, touch targets and cinematic battle feedback.
- Existing accessibility features remain, with optional blood effects, screen flash, camera impact and combat text controls.

## PWA and compatibility
- GitHub Pages and offline PWA support remain enabled.
- Service-worker cache is `emberfall-blackstar-2d-v12`.
- Existing save data remains compatible because the new renderer reads the established campaign state instead of replacing it.
- No Windows executable, DLL, installer, BAT, CMD or PowerShell payload is required.

## Art pipeline
The current renderer establishes the modern 2D foundation using high-resolution procedural/vector-style drawing. The next asset-production step can replace individual procedural actors and backgrounds with authored sprite atlases, painted environment plates and frame-by-frame or rigged 2D animation without changing the campaign engine.
