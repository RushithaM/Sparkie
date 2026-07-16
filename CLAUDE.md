# Sparkie — Desktop Companion

Electron desktop pet: animated avatar + reminder engine. Renderer is React + Tailwind. Storage is SQLite (main process). Modules communicate via the event bus — never direct cross-module imports. See docs/adr/ for why.

## Rules

- Strict TypeScript, no `any`
- Functional React components, feature-first folders
- Architectural changes require an ADR in `docs/adr/` first. Read existing ADRs before proposing an alternative to anything they cover.
- New events go in `docs/events.md` before use (create the file with the first event)
- No new dependencies without asking

## Workflow

1. Read TODO.md, pick the top task under **Now** — only that task
2. Implement, run tests
3. Move the task to **Done**, promote the next one to **Now**, commit
4. Never leave unfinished work undocumented — note it in TODO.md
