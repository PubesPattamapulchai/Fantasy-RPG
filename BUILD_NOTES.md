# Build validation

Eclipse Roads Edition was validated with:

- JavaScript syntax checks for `game.js`, `mobile.js`, and `service-worker.js`.
- Startup smoke execution against a simulated browser DOM.
- Feature smoke testing for all seven jobs, including Stamina Dodge, interactive battlefield use, and weapon-affix awakening.
- Static verification that every JavaScript `getElementById` reference exists in `index.html`.
- PWA manifest parsing and offline-cache asset existence checks.
- Antivirus-oriented file scan confirming no Windows executables, DLLs, installers, or command/script payloads are included.
- `.gitignore` rules continue to block `update_task.exe` and executable/script file types from accidental commits.
