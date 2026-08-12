---
name: emberfall-content
description: Write or edit Emberfall narrative content — NPC dialogue, lore tablets, quest text, road-event copy, item/relic flavor lines. Use for narrative asks, not code/UI work.
---

Dispatch to the `emberfall-narrative-writer` agent (model: fable — this is prose/voice work,
not engineering) via the `Agent` tool. Give it where the content goes (which quest stage,
which location/NPC, which item) and any constraints on length/tone beyond its own defaults.

This agent only writes text in the exact shape the call site expects — it does not wire new
dialogue triggers, add new quest stages, or touch game logic. If the ask needs new structure
(a new quest stage, a new road event slot) rather than just new copy for an existing slot,
that's `/emberfall-feature` first, then this skill for the content that fills it.
