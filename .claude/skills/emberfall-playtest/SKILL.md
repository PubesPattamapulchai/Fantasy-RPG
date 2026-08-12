---
name: emberfall-playtest
description: Live-playtest Emberfall against the real running build — a specific scenario, a reported symptom, or a PC_POLISH_ROADMAP.md checklist item. Use for "playtest X", "does Y work", "reproduce this", boss fights, edge cases, resolution/window-size checks.
---

Dispatch to the `emberfall-playtester` agent (model: sonnet) via the `Agent` tool with a
specific, self-contained scenario to run — it starts with no memory of this conversation, so
give it exactly what to test and what "pass" looks like. It already knows this project's
launch steps, its input-tooling quirks, and the save-mutation fast-travel technique; you don't
need to re-explain those.

If the result surfaces a confirmed bug that's more than a small single-rule fix, follow up
with `/emberfall-bugfix` rather than asking the same agent to improvise a fix outside its
described scope. Either way, update `PC_POLISH_ROADMAP.md` with what was found — see
`AGENT_PIPELINE.md` for why that matters and `emberfall-plan`'s Step 3 for the exact habit.
