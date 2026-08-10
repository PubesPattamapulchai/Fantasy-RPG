# Emberfall — Modern Action RPG Evolution

This pass builds on Blackstar Ascendant 3D and focuses on responsiveness, encounter readability, world density, and modern control feel.

## Gameplay feel
- Hold WASD / arrow keys for continuous exploration movement.
- Click or tap the 3D world to pathfind toward a destination.
- Clicking an NPC, visible enemy, or exit paths to a nearby tile and attempts interaction.
- Combat input buffering remembers a requested hotkey while the turn is resolving and fires it as soon as the action becomes available.
- Existing tactical systems remain intact: enemy intents, Ward, parry, dodge, execution, stagger/break, surfaces, environmental actions, party doctrines, Covenant Surges, World Tiers, Hunt Chains, Nemesis enemies, Skill Sigils, Runestones, affixes, boss phases, and loot progression.

## 3D presentation
- Renderer interaction bridge exposes safe read-only scene/camera helpers to the presentation layer.
- Per-biome dense instanced ground detail and rock scatter.
- Distant mountain silhouettes for outdoor maps.
- Gradient sky dome driven by each scene palette.
- Dynamic biome weather/ambient particles for snow, desert, marsh, sky, star-city, citadel, and core environments.
- 3D enemy intent telegraph rings and battlefield-surface visualization.
- Event-driven hero and enemy lunges, dodge movement, spell surges, execution emphasis, impact flashes, and danger flashes.
- Stronger full-screen cinematic grading and modern action-button feedback.

## UX
- Visible input-buffer indicator during combat.
- Click/tap destination ping and interaction ping.
- Short first-run control hint for click-to-move, hold-to-move, and input buffering.
- Mobile remains supported with the existing large touch controls plus tap-to-move in the 3D view.
- Reduced Motion and High Contrast preferences continue to affect the new presentation layer.

## Compatibility and safety
- Existing local saves remain compatible.
- WebGL fallback remains available.
- PWA cache updated to `emberfall-actionrpg-v11`.
- No Windows executable, MSI, DLL, BAT, CMD, or PowerShell payload is required.
