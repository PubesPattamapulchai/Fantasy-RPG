---
name: emberfall-art-direction
description: Start or steer Emberfall's Phase 3 visual direction — palette rules, silhouette language, one fully-realized reference asset — before any bulk art/VFX production. Use at the start of Phase 3, or if new visual content risks drifting from the established look.
---

Dispatch to the `emberfall-art-director` agent (model: opus — this is a creative-direction and
long-horizon-consistency judgment call, the highest-stakes wrong-answer in Phase 3 since it's
what every later sub-pass gets checked against) via the `Agent` tool.

This should generally run **once, before** dispatching any `emberfall-feature-builder` work
for Phase 3's combat-feedback/spell/lighting/boss/environment/character/UI sub-passes — those
are meant to be checked against whatever direction note and reference example this agent
produces, not improvised independently per sub-pass (that's exactly the drift §76 warns about).

Confirm with the user which of Phase 3's 7 sub-passes are actually in scope for this round
before dispatching — the roadmap deliberately doesn't commit to attempting all of them in one
go, and how much to attempt is a real go/no-go decision, not something to assume.
