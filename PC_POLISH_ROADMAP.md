# Emberfall — PC Release & Graphics Polish Roadmap

Status snapshot as of 2026-08-12. This picks up where `PC - WINDOWS EXECUTABLE + FINAL GRAPHICS & POLISH UPGRADE.md`
(the original 80-point request) left off. It reorganizes the remaining work into ordered,
actionable phases instead of a flat checklist, so each phase can be picked up as its own
session without re-deriving scope.

**Working this roadmap?** See `AGENT_PIPELINE.md` for the project's skill/subagent set —
`/emberfall-plan` is the entry point that reads this file and routes work to the right
specialized agent (playtest, bugfix, feature, release, art-direction, narrative).

## Already done (do not redo)

- Static + live audit pass: fixed an off-screen dialogue/battle-menu softlock on short
  desktop viewports (`styles.css` `.screen-wrap` height clamp), and a legacy render-loop
  crash-on-exception bug (`game.js` `animate()`).
- Live-playtested the core loop end to end: new game → dialogue → movement → GEAR/SHEET
  menus → save → reload → continue → combat → victory. Zero console errors observed.
- Standalone Windows build: Electron wrapper (`electron/main.js`, `electron/preload.js`),
  `package.json` build config, produces a portable `.exe` and an NSIS installer. Both were
  built and launched for real (not just `npm start` dev mode) and confirmed working,
  including save persistence at `%APPDATA%\Emberfall`.
- Desktop shortcut to the portable build.
- **Phase 1 (bug sweep) — done.** Multi-phase boss fight, inventory/equipment stress,
  §73 edge cases, overworld enemy-density stress, and a light memory check all passed live.
  Found + fixed one Medium bug (environment card overlapping the hero name at short window
  heights). Two items still need a hands-on pass in the built `.exe` (see "What's left" below).
  Full detail and evidence: Phase 1 section.
- **Phase 2 (settings & key rebinding) — done.** Options screen gained Display & Performance
  controls (window mode, resolution, FPS cap, UI scale, brightness, shake/effects intensity)
  and a full key-rebinding UI (`keybinds.js` + `game.js` keydown refactor), all verified live.
  Also found + fixed a pre-existing **Critical** bug outside Phase 2's own scope: mouse clicks
  on every battle action button were being silently swallowed by an invisible FX overlay
  (`modern2d.css` pointer-events layering) — keyboard shortcuts masked it, which is likely why
  it shipped unnoticed. Full detail and evidence: Phase 2 section.
- All Phase 1 + Phase 2 changes are made on disk but **not yet committed to git** — see
  "What's left" below.

## Guiding rules carried over from the original spec

1. Stay fully 2D — no 3D conversion, ever.
2. Fix root causes, not symptoms; don't touch working systems while chasing polish.
3. Critical/High severity gameplay bugs outrank cosmetic work.
4. Don't leave placeholder art in a state presented as final.
5. Graphics changes must never make combat harder to read.
6. Test the real built `.exe`, not just the editor/dev window, before calling anything done.

---

## Phase 1 — Finish the bug sweep (§71–74)

Goal: stop finding bugs by playing, not by guessing. This phase is cheap relative to the
graphics phases and should run first since Phase 3 art changes are much more expensive to
redo if they land on top of a still-buggy interaction.

- [x] Full boss fight: at least one multi-phase boss end to end (phase transitions, forced
      ultimates, death sequence, victory/loot screen at the same short-viewport size that
      exposed the dialogue bug — confirm the fix holds under real boss UI, not just trash mobs).
      **Done 2026-08-12.** Fought the Sewer Tyrant (Vanguard, level 6→8) via browser automation
      against the live `game.js`/`renderer2d-v14.js` build. Phase 1→2→3 transitions fired
      correctly on HP thresholds, the timed-strike minigame resolved correctly, victory/loot/EXP
      awarded correctly, and a forced death (HP driven to 1, then killed) respawned cleanly with
      the correct gold penalty and no stuck state. **Found a real bug — see Findings below.**
- [x] Inventory/equipment stress: fill inventory to capacity, swap equipment mid-battle,
      confirm no item loss/duplication.
      **Done.** Granted the full owned set (6 weapons / 4 armors / 4 relics) via a save-file
      edit, opened GEAR — renders correctly via internal scroll, no overlap, no dupes
      (verified array uniqueness). Equip-swap in the overworld works and updates stats/log
      correctly. Mid-battle, GEAR/SHEET/BUILD/CAMP all correctly refuse to open
      (`state.inBattle` guard in each `open*()` function) — equipment swapping is entirely
      blocked during combat by design, so the "no loss/duplication mid-battle" case is
      structurally impossible, not just untested.
- [x] Edge-case pass from §73: spam attack/dodge input, open menus during combat, die during
      an interaction and during a boss phase transition, save at unusual times, rapid scene
      transitions, zero-resource skill use, out-of-range interact.
      **Done, all passed.** Mashing attack/dodge/confirm during the locked timing-attack window
      no-ops safely (`battleAction()` bails on `battleLocked`/`timingActive`); menus verified
      blocked during battle; forced death mid-battle resolved cleanly (see above); zero-MP skill
      use is guarded in `spendMp()` (log message, beep, no state corruption — confirmed MP
      floor at low values); rapid exit-crossing between Greymoor City ↔ Sewers correctly
      triggered and resolved a random road event without desync.
- [x] Large-combat stress test (§74): multiple enemies + full VFX on screen at once — watch
      for FPS drop, particle overload, AI freeze, collision instability.
      **Note:** battles in this codebase are strictly 1-vs-1 (`state.battleEnemy` is a single
      object, no multi-enemy battle state exists), so "large combat" doesn't apply to the
      battle screen itself. Tested the closest real equivalent — the Greymoor Sewers overworld
      tile, which has 8 enemies + decor + particle bursts rendered simultaneously — with no
      console errors, no hang, and DOM/heap stayed flat afterward.
- [x] Alt-tab / focus loss during battle and during a timed-strike window specifically (the
      timing minigame is the most likely place for a stuck state after regaining focus).
      **Partially verified — code review only, not empirically reproduced.** The automation
      environment can't force a real OS-level background/blur on the driven tab, so this was
      static analysis instead of a live repro: **`game.js` has no `blur`/`visibilitychange`
      listeners at all.** The timing minigame (`startTimingAttack()`) drives its cursor purely
      from `requestAnimationFrame` + `performance.now() - timingStartedAt`. Chrome pauses rAF in
      backgrounded tabs, so on refocus `elapsed` will jump far past `timingDuration` and the very
      next frame auto-resolves via `confirmTimingAttack(true)` — i.e. it should read as an
      auto-miss, not a softlock. This is a reasonable-looking safety net but it was never
      purpose-built for this case; **recommend a manual real-alt-tab check in the actual `.exe`**
      before fully closing this item out.
- [x] Resolution/window-size sweep inside the Electron shell: 1280×720, 1600×900, 1920×1080,
      2560×1440, plus at least one ultrawide and one very short window — re-verify the
      dialogue/battle-menu fix and check GEAR/SHEET/BUILD/CAMP overlays at each size.
      **Partially done — environment-limited.** The browser-automation harness used for this
      session couldn't be resized past ~1254×568 CSS px regardless of requested size (host
      display limitation, not a game issue), so the full resolution matrix above was **not**
      exercised against the real Electron window. What *was* confirmed at ~1254×568 (a valid
      "short window" case) is the bug below. **Recommend re-running the full resolution matrix
      by hand in the built `.exe`**, since that's the one thing this pass couldn't cover.
- [x] Long-session memory check: leave the game running through several battles/zone changes,
      watch for climbing memory (particle pooling, damage-number pooling already exist per
      `QUALITY_AUDIT_V15.md` — confirm they're still effective, not regressed).
      **Lightly checked, not a full long-session run.** Across the boss fight + several trash
      fights + death/respawn + a road event, `performance.memory.usedJSHeapSize` stayed at
      5–6 MB (no climb), and no orphaned battle-fx DOM nodes were left behind after combat ended.
      This is a good sign but was a ~10-minute session, not the extended real-time soak the
      checklist item asks for — recommend a genuine long soak (leave it running through a full
      campaign act) before marking this fully closed.

### Findings

1. **Bug — environment/battlefield card overlaps the hero name in the battle screen at short
   window heights. FIXED 2026-08-12.** Reproduced at a ~1254×568 CSS-px viewport (fresh window,
   no manual zoom). `.screen-wrap` is clamped via `max-height: calc(100vh - 230px)` with
   `aspect-ratio: 4/3` (`styles.css`), so under ~830px of viewport height the whole battle
   stage — including the 3-column `hero-column` / `battle-center` / `enemy-wrap` flex row —
   shrinks well below the size its content was designed for. The `#environmentCard`
   ("Crumbling Pillar" etc.) then rendered on top of the hero's name label (`.fighter-name`)
   instead of in its own space, and the card's own description text was clipped ("...mage and
   massive" instead of the full sentence). Root cause: the codebase already had a proven
   compaction rule for this exact overflow (`.battle-center{min-width:0}` etc.) but it was
   gated on `@media(max-width:760px)` only — a *narrow-width* breakpoint — while this bug is
   driven by the viewport being *short*, which shrinks `.screen-wrap`'s width indirectly via
   its height-locked aspect-ratio without ever tripping a width breakpoint (the outer browser
   viewport was 1254px wide, well above 760px, even though the game box itself was only
   ~451px wide). Fix: OR'd `(max-height:900px)` onto that existing media query so the same
   proven compaction applies in both cases, plus a small height-specific rule
   (`.battle-scene{min-height:0;align-items:center}`) removing the `align-items:end` bottom
   -anchor that was pushing tall content up past the visible top edge. Verified post-fix at a
   695px-tall viewport (still under the 900px breakpoint): hero name, environment card, and
   enemy name/HP bar all render with zero pairwise overlap and the card's description text is
   no longer clipped (confirmed both visually and via `getBoundingClientRect()` overlap
   checks). Changed file: `styles.css` (near the existing narrow-width battle breakpoints).
2. **Testing-methodology note, not a game bug:** synthetic CDP mouse clicks and key events
   intermittently stopped reaching this page's listeners partway through the session (real
   `element.click()` / `document.dispatchEvent(...)` from in-page JS always worked). Likely an
   artifact of the automation harness losing OS-level input focus on the driven tab, not
   anything in `game.js`. Flagging so a future session doesn't mistake it for an input bug.

Exit criterion: no reproducible Critical/High bug found in a full campaign-start-to-first-boss
playthrough at three different window sizes. **Status: one Medium-severity visual bug found
(#1 above, not Critical/High — doesn't block play, just overlaps text); the window-size matrix
and the real alt-tab case still need a hands-on pass in the built `.exe` to fully close this
phase.**

---

## Phase 2 — In-game PC settings & controls (§35, §36, §38–40)

**Status: done 2026-08-12**, verified live via browser automation against the real
`game.js`/`reforged-ui.js` build (Electron-only pieces verified by code path + IPC contract,
not a live Electron window — see note at the bottom).

- [x] **Settings screen additions**, extending the existing Options overlay in
      `reforged-ui.js` (no second overlay built):
  - [x] Windowed / Borderless-fullscreen / Fullscreen selector. `electron/main.js` gained
        `emberfall:set-window-mode` (validated against a `['windowed','borderless','fullscreen']`
        allow-list) using `win.setFullScreen`/`win.setSimpleFullScreen` exactly as scoped.
  - [x] Resolution presets (1280×720 up to 2560×1440), applied via a new narrow
        `contextBridge` API in `electron/preload.js` (`window.emberfallDesktop`) calling
        `emberfall:set-resolution` in the main process, which clamps to sane bounds and
        switches to windowed mode first (Electron ignores `setSize` while fullscreen).
  - [x] Frame-rate cap (Uncapped/30/60/120). Implemented as a small `makeFrameLimiter()`
        factory on the new `window.EmberfallPrefs` bridge; `game.js`'s legacy `animate()` loop
        and `renderer2d-v14.js`'s canvas `frame()` loop each get their **own** limiter instance
        (they're independent rAF chains — sharing one clock would desync one loop's delta-time
        math whenever the other one throttled).
  - [x] UI scale slider (85–125%). Uses `document.body.style.zoom`, not `transform: scale` —
        `zoom` is a real layout-level zoom so `getBoundingClientRect()` and pointer/click
        coordinates stay consistent after scaling (this is what the §37 mouse re-check below
        was checking for).
  - [x] Brightness slider (70–130%) via `filter: brightness()` on `.screen-wrap`, so it covers
        the canvas and every overlay uniformly.
  - [x] Screen-shake intensity and effects-intensity sliders (0–150% each), wired at the
        existing single choke points rather than at every call site: `shakeBattle()` in
        `game.js` (already the sole trigger for both DOM and canvas shake per its own comment)
        multiplies by the shake pref; `burst()` in `renderer2d-v14.js` (the sole particle
        spawner) multiplies its count by the effects pref.
  - All of the above persist in the existing `emberfall-ui-prefs-v1` localStorage key
        alongside the original accessibility toggles, and re-apply on load (including
        re-issuing the Electron window-mode/resolution IPC calls on launch).
- [x] **Key rebinding UI** — new `keybinds.js` (loaded first, before `reforged-ui.js` and
      `game.js`) owns the action→key model:
  1. 25 actions (movement, interact/sound, 4 menu opens, 15 battle actions) default to the
     exact literal keys `game.js` used to hardcode. Arrow keys and Enter stay on permanently
     as fixed aliases alongside whatever the primary key is rebound to, so a rebind can never
     strand a player without a way to move or confirm; Escape is reserved and can't be
     rebound or assigned.
  2. `game.js`'s `keydown` listener now resolves every keypress through
     `window.EmberfallKeybinds.resolve(key)` instead of matching literal strings (with a
     small hardcoded `LEGACY_KEYMAP` fallback if keybinds.js somehow fails to load, so input
     never goes fully dead).
  3. The rebind UI (in `reforged-ui.js`, inside the same Options overlay) does
     listen-for-next-keypress per row. Conflicts auto-swap the two actions' keys rather than
     blocking (a toast confirms the swap) — no extra confirmation step, and an action is never
     left with no key. The capture listener runs in the **capture phase**
     (`stopImmediatePropagation`), which pre-empts every bubble-phase listener including
     `game.js`'s regardless of script load order, so pressing "1" to rebind Attack doesn't also
     swing Attack.
  - Verified live: rebound Dodge to a new key and confirmed both the UI and
    `EmberfallKeybinds.get()` updated; forced a conflict (Parry → an Execution key) and
    confirmed the auto-swap + toast; ran a full fresh playthrough afterward (movement, GEAR/
    SHEET open+close via Escape, a real battle with Attack→timing-minigame→confirm) to check
    for regressions from the refactor — all identical to pre-refactor behavior.
- [x] Re-verified §37 mouse items. UI-scale change confirmed not to desync click coordinates
      (see zoom note above) — but this check surfaced a real, **pre-existing, unrelated**
      bug, fixed alongside this work since it's Critical-severity and cheap to fix. See
      Findings below.

### Findings

1. **Bug (Critical, pre-existing, not introduced by Phase 1 or 2) — mouse clicks on every
   battle action button were silently swallowed. FIXED 2026-08-12.** `modern2d.css` has
   `.battle{pointer-events:none}` / `.battle>*{pointer-events:auto}` to let clicks pass through
   the battle overlay's empty space while keeping its children clickable. But `.battle`'s
   direct children include four purely decorative, `aria-hidden="true"` full-screen layers
   (`.battle-sky`, `.battle-flash`, `.battle-fx`, `.nightfall-lens`) that `styles.css` gives
   `pointer-events:none` — and the `.battle>*` rule (same specificity, later in cascade order)
   overrides that back to `auto`. `#battleFx` in particular sits at `z-index:9`, `inset:0`
   (covering the *entire* battle screen including the button grid), with no click handler — so
   `document.elementFromPoint()` at any battle button's coordinates returned `.battle-fx`, and
   a dispatched click there never reached the button underneath. Confirmed with a real
   `MouseEvent` dispatch at a button's exact center before and after the fix (reached `.battle-
   fx` before, reached the actual `pixel-button` — and the game state changed — after).
   Likely went unnoticed because keyboard shortcuts (1–9, 0, e/q/p/x/t) fully cover battle
   actions and are the faster way to play, so mouse-only battle input may never have been
   specifically exercised. Fix: `modern2d.css` gained one rule restoring `pointer-events:none`
   on exactly those four decorative layers (same specificity as `.battle>*`, placed after it,
   so it wins on source order — no `!important` needed, no change to any interactive element).
2. **Electron-specific pieces (window mode, resolution presets) were verified by code
   review + a manual IPC contract check, not a live Electron window.** This session's browser
   automation can only drive a Chrome tab, not the packaged/`npm start` Electron app,  and
   this environment's window resize tool couldn't be used to validate the real OS-level
   window at various sizes either (see Phase 1 notes on the same limitation). Recommend
   running `npm start` and clicking through Windowed/Borderless/Fullscreen and each resolution
   preset by hand before calling this fully closed — the renderer-side code (prefs, IPC calls,
   UI) is exercised and correct; the main-process window-mode transitions themselves are not
   yet confirmed on a real window.

Exit criterion: every setting in §38 exists in the Options screen, persists across restarts
(existing `localStorage` prefs pattern, extended), and none of them break layout at the
resolutions tested in Phase 1 — confirmed at the short-viewport case Phase 1 already exercises
(the Options window now scrolls internally by design, same fix pattern as the Phase 1 battle
overlap bug, so it doesn't overflow now that it holds far more controls). Full-resolution-matrix
and real-Electron-window confirmation still pending a hands-on pass per the note above.

---

## Phase 3 — Graphics & visual overhaul (§42–58)

This is the bulk of the original document and is a fundamentally different kind of work from
Phases 1–2: it is mostly **new art/VFX assets**, not bug fixes. Code changes alone cannot
deliver "premium 2D dark-fantasy" — the renderer (`renderer2d-v14.js`) already supports
layered rendering, dynamic lighting, and particles per `QUALITY_AUDIT_V15.md`; what's missing
is higher-fidelity *content* to feed it. Sequence this as its own multi-session arc, ordered
by what's most visible to the player first:

1. **Combat feedback pass (§52)** — hit flash, weapon trails, stagger/hit-stop, damage
   numbers, camera shake tuning. Highest player-visible impact per unit of effort, and it's
   mostly VFX/timing code rather than new sprites, so it's the natural bridge from Phase 2.
2. **Spell effects (§51)** — every job's two starting skills need a distinct cast/travel/
   impact identity. Start with the 7 jobs' base kit (14 skills) before touching Ultimates.
3. **Lighting pass (§47, §49)** — dynamic light sources (torches, spell glow, moonlight),
   contact shadows. The renderer already has a lighting layer per the audit notes; this is
   about populating it with more light sources and tuning falloff/color.
4. **Boss visual pass (§55)** — unique silhouette/intro/phase-change/death per boss, done one
   boss at a time, playtested immediately after each (ties back into Phase 1's boss-fight
   testing).
5. **Environment/biome pass (§44, §45, §46)** — architectural detail, decor density,
   parallax layers per biome. Do the biomes in campaign order so early-game first impressions
   improve first.
6. **Character/enemy readability pass (§54)** — silhouette and color-coding so
   basic/ranged/tank/caster/elite/boss are identifiable without reading text.
7. **UI/typography/icon pass (§42 UI bullet, §58)** — last, once the gameplay-visible pieces
   above are stable, since UI chrome is what "premium vs. prototype" gets judged on last but
   changes the most files.

Each of the above needs actual art direction decisions (palette, silhouette language) made
once and then applied consistently — recommend a short art-direction note (mood references,
color rules per §77, one example enemy/spell fully realized as a template) before mass-
producing assets, so #2–#7 don't drift into inconsistent styles per §76.

---

## Phase 4 — Performance (§59–63)

Do this *after* Phase 3 adds real content to profile against — profiling against the current
lightweight art doesn't predict where the new particle/lighting work will actually cost.

- [ ] Profile actual gameplay (enemy spawn, large fights, boss abilities, particle systems,
      inventory open, map change, save, GC pauses) with the new Phase 3 content in place.
- [ ] Re-check object pooling still covers everything Phase 3 adds (new particle types, new
      light sources, new damage-number variants).
- [ ] Texture/asset optimization pass on whatever new art Phase 3 produced (atlas packing,
      duplicate-asset check, compression without visible quality loss).
- [ ] Re-run the Phase 1 large-combat stress test with Phase 3 content active.

---

## Phase 5 — Final QA & release checklist (§75, §78–80)

- [ ] Full visual-consistency pass across every area touched in Phase 3 (§75, §76): flag any
      area that still looks like old 8-bit-era art next to the new work.
- [ ] Readability pass under combat load specifically (§78): can the player still track
      themselves, enemies, projectiles, dangerous AoE, and loot when everything from Phase 3
      is on screen at once.
- [ ] Re-run the entire §80 checklist against the built `.exe` (not dev mode) one more time,
      end to end, including a full campaign playthrough if time allows rather than spot
      checks.
- [ ] Rebuild the installer + portable `.exe` as the final artifact once the above is clean.

---

## What's left

Everything below is what remains as of 2026-08-12, now that Phases 1 and 2 are done.

**Housekeeping (do first, costs nothing):**
- Commit the Phase 1 + Phase 2 changes. Nothing from either phase has been committed yet —
  `git status` still shows `game.js`, `reforged-ui.js`, `styles.css`, `modern2d.css`,
  `reforged.css`, `electron/main.js`, `electron/preload.js`, `index.html`, `package.json`,
  `service-worker.js` modified and `keybinds.js` new.

**Hands-on `.exe` pass (cheap, but needs a real window — couldn't be automated this session):**
- Alt-tab away during a live timed-strike window and confirm it auto-resolves as a miss
  instead of sticking (Phase 1 finding #1 — code review says it should be fine, never
  empirically reproduced).
- Full resolution sweep — 1280×720, 1600×900, 1920×1080, 2560×1440, one ultrawide, one very
  short window — re-checking both the Phase 1 battle-overlap fix and the Phase 2 Options
  screen at each size. The browser-automation viewport in this environment was capped around
  1254×568 the whole time, so only the "short window" end of that matrix has actually been
  seen.
- Click through Options → Window Mode (Windowed/Borderless/Fullscreen) and each Resolution
  preset. The renderer-side code and IPC contract are verified; the actual main-process
  window transitions on a real OS window are not.
- A genuine long-session soak (leave the game running through a full campaign act, not just
  ~10 minutes) to properly close out the memory-check item.

**Phase 3 — Graphics & visual overhaul.** Not started. This is where the project stops being
something that moves forward on its own between sessions: it needs a real go/no-go
conversation first — how much of the 7-part sequence (combat feedback → spell effects →
lighting → boss visuals → environment/biome → character readability → UI/typography) to
attempt, and a short art-direction note (palette, silhouette language, one fully-realized
example) agreed before any assets get mass-produced. Phases 4 (Performance) and 5 (Final QA)
both depend on Phase 3 landing first, so nothing after Phase 2 can be picked up piecemeal the
way Phases 1–2 could.
