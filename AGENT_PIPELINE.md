# Emberfall Agent Pipeline

A set of project-specific Claude Code skills + subagents for this repo, built 2026-08-12 out of
what Phases 1–2 of `PC_POLISH_ROADMAP.md` actually needed: a way to playtest the *real running
game* instead of reasoning from source, a way to root-cause bugs in a codebase with a five-deep
CSS cascade and load-order-dependent scripts, and a way to keep doing both without re-deriving
the same hard-won lessons (the autosave-clobber race, the CDP input flakiness, the
short-viewport-vs-narrow-viewport breakpoint gap) from scratch each session.

Skills live in `.claude/skills/*/SKILL.md` (routing — no model of their own, they run inline
in whatever model the session is already using). Subagents live in `.claude/agents/*.md` (the
actual worker definitions — this is where `model:` is set, since only agent frontmatter
supports it). A skill's job is deciding *which* agent, and with what prompt; an agent's job is
doing the work.

## The shape

```
                    ┌─────────────────────────────┐
                    │   /emberfall-plan  (opus*)   │   ← the big one. Entry point.
                    │  reads PC_POLISH_ROADMAP.md, │     Reads state, decides what's
                    │  decides what's next, routes │     next, dispatches, then writes
                    │  to a worker, updates the    │     the result back to the roadmap
                    │  roadmap when work returns   │     so the NEXT session is fast.
                    └───────────────┬───────────────┘
                                    │ Agent tool, subagent_type: <name>
          ┌──────────────┬──────────────┬───────────────┬────────────────┬─────────────────┐
          ▼              ▼              ▼               ▼                ▼                 ▼
 emberfall-        emberfall-     emberfall-       emberfall-       emberfall-        emberfall-
 playtester        bugfixer       feature-builder  release-builder art-director      narrative-writer
 (sonnet)          (opus)         (sonnet)         (haiku)         (opus)            (fable)
    │                  │                │                │                │                │
 drives the      root-causes a    adds a well-      cache version,   Phase 3 palette/  dialogue, lore,
 real running    CONFIRMED bug    scoped feature    files-list,      silhouette rules  quest text,
 build via       (5-deep CSS      or setting        electron-        + one reference   flavor copy —
 browser          cascade, load-  following         builder, .exe    example asset —   prose only,
 automation;      order traps —   established       artifact         BEFORE any bulk   no logic/UI
 finds &          see its own     patterns, not      check.          Phase 3 asset      wiring.
 confirms real    file for the    a parallel one.                    production.
 bugs vs.         specific traps                       cannot
 tooling noise    this project                        launch/click
                  has hit)                             the .exe —
                                                        no GUI here

* /emberfall-plan itself has no fixed model — it inherits whatever the session is running.
  Opus is recommended for it (see below) but it's the routing skill, not an agent, so there's
  nothing to pin.
```

Any of the six workers can also be invoked directly — `/emberfall-playtest`,
`/emberfall-bugfix`, `/emberfall-feature`, `/emberfall-release`, `/emberfall-art-direction`,
`/emberfall-content` — when you already know exactly which lane the task is in and don't need
`/emberfall-plan` to route it for you. Each of those thin skills just points at its matching
agent with a one-line reminder of the handoff etiquette (verify before trusting, update the
roadmap after).

## Why each model was picked

These aren't defaults — they're picked from what this project's actual work required this
session:

| Agent | Model | Why |
|---|---|---|
| `emberfall-playtester` | **Sonnet** | Tool-heavy (browser automation, JS injection, screenshot triage) with real but bounded reasoning — distinguishing a genuine repro from tooling flakiness, diagnosing the autosave-clobber race. Sonnet handled all of Phase 1 and Phase 2's playtesting, including finding two real bugs, without needing to escalate. |
| `emberfall-bugfixer` | **Opus** | The two real bugs found this session both needed multi-file reasoning under ambiguity — CSS specificity/source-order tie-breaks across six stylesheets, and (for the pointer-events bug) figuring out *which* of several plausible-looking rules was actually winning before touching anything. That's exactly where the stronger model earns its cost; a fix that "looks right" but targets the wrong layer in this cascade is worse than no fix. |
| `emberfall-feature-builder` | **Sonnet** | Pattern-following, well-scoped work (a new slider, a new IPC call) once the shape of the feature is already decided — this is what built all of Phase 2's settings UI successfully. |
| `emberfall-release-builder` | **Haiku** | A checklist, not a judgment call. Cheap and fast is correct here; if it ever finds something ambiguous it's instructed to stop and hand off rather than improvise. |
| `emberfall-art-director` | **Opus** | Highest blast radius of any wrong call in Phase 3 — every subsequent sub-pass gets checked against whatever direction this sets, so drift here compounds across ~7 sub-passes of asset work. Worth the strongest available judgment. |
| `emberfall-narrative-writer` | **Fable** | Prose/voice work, not engineering — matching an established narrative tone is a different skill than reasoning about CSS cascades, and Fable is the model built for that. |

If a `emberfall-playtester` run can't find the root cause of something after a couple of
genuine attempts, that's the signal to hand off to `emberfall-bugfixer` (opus) rather than
grinding — the routing table above already encodes this, but it's worth remembering the
*reason*: cost-effective triage first, strong reasoning only once triage says it's needed.

## How this maps onto `PC_POLISH_ROADMAP.md`

- **Phase 1 (bug sweep)** and **Phase 2 (settings/rebinding)**: already done, using exactly
  this playtester → (bugfixer | inline fix) → roadmap-update loop, before this pipeline existed
  as reusable files. It's now written down so the next phase doesn't rebuild the same
  know-how from scratch.
- **Phase 3 (graphics/visual overhaul)**: start with `/emberfall-art-direction`, then
  `/emberfall-feature` for the renderer/CSS hooks each sub-pass needs, `/emberfall-content` for
  any accompanying text, and `/emberfall-playtest` after each sub-pass lands (the roadmap
  already sequences Phase 3 so each piece gets playtested immediately, e.g. boss visuals tying
  back into Phase 1's boss-fight testing).
- **Phase 4 (performance)**: `/emberfall-playtest` for the profiling pass itself (it already
  knows how to drive the real build), `/emberfall-bugfix` for whatever the profile turns up.
- **Phase 5 (final QA/release)**: `/emberfall-playtest` for the full-checklist re-run,
  `/emberfall-release` for the final artifact build.

## The one habit that makes this work across sessions

**Every dispatch ends with `PC_POLISH_ROADMAP.md` getting updated** — what was tried, what was
found, what's now `[x]` vs. still `[ ]`, and any new Finding. Agents don't carry memory between
sessions; the roadmap file is the only thing that does. `/emberfall-plan`'s Step 3 exists
specifically to enforce this — don't skip it because the chat output already says what
happened. The chat output disappears; the file doesn't.
