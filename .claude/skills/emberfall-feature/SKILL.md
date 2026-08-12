---
name: emberfall-feature
description: Add a concrete, already-decided Emberfall feature — a new Options/settings control, a new rebindable action, a new Electron IPC capability, a new UI panel. Use for well-scoped feature asks, not open-ended design (that needs a plan/decision first).
---

Dispatch to the `emberfall-feature-builder` agent (model: sonnet) via the `Agent` tool. Give
it the concrete feature spec — if the ask is still fuzzy ("make settings better"), narrow it
to specific controls/behavior first (ask the user if needed) rather than handing the agent an
open-ended design problem.

The agent already knows where each concern lives (prefs in `reforged-ui.js`, rebinds in
`keybinds.js`, Electron capability in `preload.js`/`main.js`, shake/particle choke points) —
you don't need to re-point it there, just say what the feature should do.

After it reports back, update `PC_POLISH_ROADMAP.md` if the feature closes or advances a
roadmap checklist item.
