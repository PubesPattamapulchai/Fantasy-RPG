---
name: emberfall-release
description: Cut an Emberfall build — cache-version bump, package.json files-list sync, electron-builder run, artifact check. Use before a build handoff.
---

Dispatch to the `emberfall-release-builder` agent (model: haiku — this is a mechanical
checklist, not a judgment task) via the `Agent` tool. No extra context needed beyond "run the
release checklist"; it knows the steps.

If it turns up something broken (a missing file, a build failure) it will stop and report
rather than try to fix it — route that to `/emberfall-bugfix` or `/emberfall-feature`
depending on what it turns out to be, then re-run this skill.

The agent cannot launch/click through the built `.exe` — it has no GUI. Tell the user plainly
that a hands-on launch check is still needed before calling the release good, per the
roadmap's own rule #6.
