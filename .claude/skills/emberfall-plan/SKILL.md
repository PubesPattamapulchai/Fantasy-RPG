---
name: emberfall-plan
description: Emberfall project planner and dispatcher — the entry point for "what's next", "work the roadmap", "plan Phase N", or any Emberfall task whose right owner isn't already obvious. Reads PC_POLISH_ROADMAP.md, decides what's actionable now, and either does small work directly or dispatches to the right specialized agent (playtester, bugfixer, feature-builder, release-builder, art-director, narrative-writer). Use this first when unsure which Emberfall skill applies.
---

# Emberfall pipeline — planner

You are the top of the Emberfall agent pipeline. Full pipeline reference, model choices, and
rationale: `AGENT_PIPELINE.md` at the repo root — read it once per session if you haven't
already, it's short. This skill is the thing that reads the roadmap and decides what runs
next; it is not itself a worker — real work goes to the specialized agents below via the
`Agent` tool.

## Step 1 — orient

1. Read `PC_POLISH_ROADMAP.md` top to bottom (`Already done`, `What's left`, and whichever
   Phase section is currently active). It is kept up to date after every session — trust its
   `[x]`/`[ ]` state and its "Findings" sections over your own assumptions about what's done.
2. Read `git status`/`git log -3` to see whether the last session's changes were committed —
   `PC_POLISH_ROADMAP.md`'s "What's left" section says explicitly if there's an uncommitted
   pile from last time, which should usually get committed (ask the user) before starting new
   work on top of it.
3. If the user gave a specific ask ("fix X", "add Y", "playtest Z", "build the exe"), match it
   to a phase/owner below rather than re-deriving from scratch. If the ask is open-ended
   ("what's next", "keep going"), the next actionable item is whatever `PC_POLISH_ROADMAP.md`'s
   own "What's left" section lists first.

## Step 2 — route

| Situation | Owner | Model |
|---|---|---|
| Need to verify something actually works in the running game — bug hunt, edge cases, resolution sweep, boss fight, memory check | `Agent(subagent_type: "emberfall-playtester")` | sonnet |
| A specific bug is already described/reproduced (by the user or by the playtester) and needs a root-cause fix | `Agent(subagent_type: "emberfall-bugfixer")` | opus |
| A concrete, already-decided feature/setting/UI addition | `Agent(subagent_type: "emberfall-feature-builder")` | sonnet |
| Cutting a build — cache version, files list, electron-builder, artifact check | `Agent(subagent_type: "emberfall-release-builder")` | haiku |
| Starting or steering Phase 3 visual direction | `Agent(subagent_type: "emberfall-art-director")` | opus |
| Dialogue, lore, quest text, flavor copy | `Agent(subagent_type: "emberfall-narrative-writer")` | fable |
| Pure housekeeping (commit, doc update, roadmap edit) | do it yourself, no agent needed | — |

Dispatch with a specific, self-contained prompt — the agent starts with no memory of this
conversation. Give it: what to do, any relevant file:line pointers you already have, and what
"done" looks like. Don't dispatch vague asks like "look into Phase 1" — resolve that down to
concrete checklist items first (the roadmap already has them itemized).

For a whole phase's worth of independent checklist items (e.g. re-running Phase 1's remaining
hands-on items), it's fine to dispatch several agent calls — but only in parallel when the
items are genuinely independent (don't run two `emberfall-bugfixer` calls against the same
file concurrently; do run `emberfall-playtester` sweeps against different features
concurrently if they don't share game state you're mutating).

## Step 3 — after an agent reports back

1. Update `PC_POLISH_ROADMAP.md` to reflect what actually happened — check off the item, add
   a dated one-line note, and add any new Finding the agent surfaced (bug found, environment
   limitation hit, follow-up needed). This is the single most important habit in this
   pipeline: the roadmap is what makes the *next* session (or the next dispatch) fast instead
   of re-discovering the same ground. Don't let an agent's findings live only in chat output.
2. If the agent found something outside its own lane (the playtester found a real bug — as
   happened twice already this project, once in Phase 1 and once in Phase 2), route it to
   `emberfall-bugfixer` rather than letting the original agent improvise a fix outside its
   described scope, unless the fix is small and already verified (use judgment — both
   real-world instances so far were fixed inline by the finding agent because they were small,
   well-understood, single-rule CSS fixes; a bigger or riskier fix should go to the
   bugfixer specifically).
3. Tell the user plainly what's done, what's still open, and what (if anything) needs a
   hands-on check this environment can't automate (a real Electron window, a real alt-tab,
   anything needing a GUI this session doesn't have) — don't claim something is verified that
   was only reasoned about from source.

## Guiding rules (apply to every dispatch, inherited from the roadmap itself)

1. Stay fully 2D — no 3D conversion, ever.
2. Fix root causes, not symptoms; don't touch working systems while chasing polish.
3. Critical/High severity gameplay bugs outrank cosmetic work — if a playtest or feature pass
   surfaces one, it jumps the queue ahead of whatever was originally planned.
4. Don't leave placeholder art in a state presented as final.
5. Graphics changes must never make combat harder to read.
6. Test the real built `.exe`, not just the editor/dev window, before calling anything done —
   and say clearly when that hasn't happened yet, since this session's tooling usually can't
   do it for you.
