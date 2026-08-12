---
name: emberfall-bugfix
description: Root-cause and fix a specific, already-described Emberfall bug. Use once a symptom is confirmed/reproduced — not for open-ended bug hunting (that's emberfall-playtest).
---

Dispatch to the `emberfall-bugfixer` agent (model: opus — this codebase's real bugs so far
have needed multi-file CSS-cascade or script-load-order reasoning, worth the stronger model)
via the `Agent` tool. Give it the exact symptom, how to reproduce it, and any file:line
pointers already known (from `emberfall-playtest` or the user's own report). If you don't have
a confirmed repro yet, get one first — dispatch to `emberfall-playtester` or reproduce it
yourself before asking for a fix; the bugfixer's whole value is not fixing what it hasn't
watched fail.

After it reports back: verify its "verified live" claims aren't just source-reading, then
update `PC_POLISH_ROADMAP.md`'s relevant Findings section with the root cause and fix so the
next session doesn't re-diagnose the same thing.
