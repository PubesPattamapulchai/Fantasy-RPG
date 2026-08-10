# Emberfall — Blackstar Ascendant 3D Edition

Blackstar Ascendant 3D is a major presentation and gameplay redesign. The original campaign, world, jobs, companions, build systems, and save data remain the game foundation, but the presentation is no longer constrained to the old 8-bit canvas.

## 3D presentation
- Real WebGL 3D renderer powered by Three.js.
- Perspective camera with smooth or tight follow modes.
- Stylized 3D humanoid heroes, NPCs, companions, enemy archetypes, bosses, buildings, trees, rocks, shrines, portals, crystals, braziers, wells, carts, fountains, statues, and biome props.
- Per-biome material, sky, fog, rim-light, and accent palettes.
- ACES filmic tone mapping, dynamic hemisphere/directional/point lights, soft shadow maps, emissive materials, cinematic grading, fog, and atmospheric motes.
- Animated character limbs, walk bob, idle movement, camera interpolation, boss staging, battle arena composition, execution camera pushes, and camera shake.
- Dynamic combat particles and slash effects that react to physical, fire, arcane, radiant, poison, frost, healing, execution, and ultimate events.
- 3D world and battle scenes are driven by the real campaign state through a read-only EmberfallBridge instead of being a disconnected background.

## Gameplay feel
- Faster movement response and faster combat turn handoff.
- Shorter timed-attack window for a more responsive action feel.
- Enemy intent selection is now state-aware: enemies can react to low hero health, hero Ward, Guard, Parry preparation, battlefield range, player Momentum, enemy health, and boss phase instead of using only a flat random table.
- Existing parry, dodge, execution, stagger/break, surfaces, environmental actions, initiative, party doctrines, Covenant Surges, Skill Sigils, Runestones, World Tiers, Hunt Chains, Nemesis enemies, boss phases, and loot systems remain integrated.

## Modern UI / UX
- The old pixel framing is visually de-emphasized in favor of glassy dark-fantasy panels, softer radii, depth, blur, clearer meter hierarchy, modern typography, categorized combat buttons, and layered battle HUDs.
- Existing accessibility features remain: Tactical Guide, Reduced Motion, Large Text, High Contrast, and Compact HUD.
- New graphics options: Cinematic 3D / Legacy, Low / Medium / High graphics quality, Smooth / Tight camera, and Full / Soft combat effects.
- Mobile combat keeps large touch targets and a two-column action layout.

## Compatibility
- GitHub Pages and PWA support remain enabled.
- Existing save format remains compatible because the 3D renderer reads game state rather than replacing campaign data.
- If WebGL or the Three.js runtime is unavailable, the game automatically falls back to the legacy 2D renderer instead of becoming unplayable.
- No Windows executable, installer, DLL, BAT, CMD, or PowerShell payload is required.

## Scope note
This is a genuine browser-based 3D conversion with procedural stylized assets and modern lighting/effects. It is not a photorealistic AAA asset pack or a replacement for a full Unreal/Unity production pipeline, but it removes the 8-bit presentation restriction and establishes a real 3D foundation that can later accept authored GLTF characters, environment models, animation clips, textures, post-processing, voice/cinematics, and larger maps.
