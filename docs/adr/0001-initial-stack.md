# 0001 — Initial stack

Date: 2026-07-16

## Context

Desktop companion app: always-on-top animated avatar, local reminders, must run offline on macOS/Windows.

## Decision

- **Electron** — transparent frameless windows, tray, cross-platform, mature
- **React + Tailwind** in the renderer
- **SQLite** in the main process for storage (not IndexedDB — main-process access, easy backup, survives renderer resets)
- **Event bus** between modules (avatar, reminders, storage, notifications) — no direct cross-module imports

## Consequences

- Larger binary than Tauri; accepted for ecosystem maturity
- Renderer never touches SQLite directly — all data access via typed IPC
- Event names are the public contract between modules; documented in docs/events.md

## Alternatives considered

- Tauri: smaller binary, but weaker transparent-window/tray story and less AI-tool familiarity
- IndexedDB: renderer-bound, awkward for main-process scheduling of reminders
