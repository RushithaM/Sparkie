# TODO

One task in **Now** at a time. Finished tasks move to **Done** with the date.

## Now

- Package/distribute (electron-builder) when ready to ship

## Next
- Avatar pack picker in settings (packs already swappable by folder)
- Screen-roaming walk (window.setPosition), look-at-cursor

## Later (v2 — do not build yet)

- Outlook / Teams integration
- AI features
- Plugins

## Done

- 2026-07-16 — Scaffold Electron app (electron-vite, React, TypeScript strict)
- 2026-07-16 — Transparent, frameless, always-on-top, draggable window
- 2026-07-16 — Tailwind v4 setup
- 2026-07-16 — Typed IPC bridge via contextBridge (`window.sparkie`)
- 2026-07-16 — System tray (show/hide, quit, generated template icon)
- 2026-07-16 — SQLite (better-sqlite3) in main process
- 2026-07-16 — Avatar state machine (idle/wave/happy/sleep) + tests
- 2026-07-16 — Reminder engine (create/update/delete/getUpcoming/complete + 15s scheduler) + tests
- 2026-07-16 — Speech bubble UI (Done/Dismiss)
- 2026-07-16 — Settings: in-window panel (not separate window) + JSON persistence + tests
- 2026-07-16 — Snooze 5m button on bubble (reuses update + notified_at reset)
- 2026-07-16 — Avatar idle personality (CSS-only: tilt, squish, blinking eyes)
- 2026-07-16 — Avatar system: manifest-driven packs, AvatarEngine + 9 tests, steps() sprite player, placeholder cat pack (docs/avatar-system.md)
- 2026-07-17 — Reminder count badge on avatar head (persists through sleep); snooze puts cat to sleep + transient "Snoozed 5m" pill

## Notes

- `npm test` runs vitest under Electron's Node (`ELECTRON_RUN_AS_NODE`) — better-sqlite3 is compiled for Electron's ABI, system Node can't load it. After `npm install`, run `npm run rebuild` once.
- `SMOKE=1 npx electron .` = e2e check (preload API → due reminder → bubble in DOM). `SMOKE_SHOT=/path.png` additionally captures a screenshot.
