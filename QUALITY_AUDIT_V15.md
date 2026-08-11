# Emberfall — Blackstar 2D Ascendant v15 Quality Audit

This pass follows a bug-first approach: repair root causes and regressions before adding more visual layers. The game remains fully 2D.

## Root causes fixed

- **Redundant render work:** the hidden legacy pixel canvas was still repainting the entire world every animation frame while the modern Canvas2D renderer was active. It is now throttled to a low-frequency fallback/minimap refresh and resumes full rendering only if the modern renderer fails.
- **Fallback regression:** the modern renderer could mark itself healthy again after a fatal render exception even though its canvas had already been hidden. Renderer failure is now sticky for the session, the modern-active flag is removed, and the legacy renderer takes over cleanly.
- **Duplicate effects loop:** `cinematic2d-v13.js` duplicated ambient particles, attack effects, boss grading, telegraphs, and a full RAF loop. It is removed from runtime. Its useful Flow/reaction UI is now event-driven inside `combat-fx2d.js`.
- **Hidden DOM rebuilds:** Gear and Character Sheet content was rebuilt on every HUD refresh, including combat and silent saves. Hidden menus now render only when visible/opened.
- **Blocked click destinations:** pathfinding previously accepted the destination before validating terrain, so a wall/tree/building could become an impossible final path node. Terrain is now validated first.
- **Click interaction mismatch:** clicking enemies/exits incorrectly stopped adjacent and pressed Interact, although those systems trigger by stepping onto their tiles. Enemies/exits now path directly; NPCs/chests/nodes path adjacent and interact.
- **Inaccurate click marker:** movement pings used a second approximate tile-size calculation. They now use the renderer's exact tile projection.
- **Over-eager input buffer:** disabled skills could be queued even when unavailable because of cost/cooldown. Buffering now applies only during temporary battle/timing locks and clears if the action remains unavailable once control returns.
- **False combat VFX:** `emberfall:action` was emitted before battle-lock/resource validation. Presentation events now fire only after an action is accepted.
- **Unsafe save failure:** malformed primary saves were deleted immediately. v15 keeps a last-known-good backup, supports recovery, and preserves old save versions.
- **Audio-node cleanup:** short WebAudio nodes now fade out, disconnect on completion, and safely resume a suspended context.
- **Refresh-rate particles:** battle particles used a fixed `0.016` timestep. They now use real frame delta and have a hard transient particle cap.

## Gameplay / AI upgrades

- Enemy families now use distinct tactical intent profiles: casters prefer hex/drain and defensive spacing, armored foes favor brace/heavy pressure, flying enemies use sweep pressure, and beasts favor close-range aggression.
- Bosses cannot randomly chain ultimate into ultimate, and repeated mending is prevented, creating deliberate recovery windows.
- v14's Perfect Evade counter-openings, posture interrupts, Flow Surges, elemental reactions, Perfect Parry, executions, surfaces, party doctrines, companion commands, World Tiers, Hunt Chains and Nemesis enemies remain intact.

## Graphics / camera upgrades

- 2D camera gains subtle facing-based look-ahead while remaining clamped to map bounds.
- Enemy rendering now has distinct 2D silhouettes for slimes, beasts, birds, casters and armored enemies instead of one shared humanoid body.
- Boss/elite aura, painterly terrain, parallax depth, shadows, fog, telegraphs and combat effects remain fully 2D.

## Save compatibility

- Payload schema: **v11**.
- Loads versions **3–11**.
- The historic `emberfall-save-v3` storage key is intentionally retained to avoid orphaning existing player saves.
- Backup key: `emberfall-save-backup-v15`.

## Performance

- Removed one full-screen Canvas2D RAF layer.
- Removed one 60fps combat-state inspector.
- Throttled hidden legacy rendering.
- Stopped rebuilding hidden Gear/Sheet DOM on every HUD refresh.
- Removed per-tile unused gradient allocation.
- Capped transient renderer particles.

## Still intentionally preserved

The existing campaign, 18 maps, seven jobs, companions, quests, loot, inventory/equipment, save migration, tactical intent system, battle surfaces, reactions, boss phases, mobile controls and PWA/offline support are preserved.
