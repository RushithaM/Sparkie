# Events

The IPC channels are the contract between main and renderer. Preload exposes them as `window.sparkie`.

## Renderer → main (invoke/handle)

| Channel | Args | Returns |
|---|---|---|
| `reminders:create` | `ReminderInput` | `Reminder` |
| `reminders:update` | `id, Partial<ReminderInput>` | `Reminder` |
| `reminders:delete` | `id` | — |
| `reminders:getUpcoming` | — | `Reminder[]` |
| `reminders:complete` | `id` | `Reminder` |
| `settings:get` | — | `Settings` |
| `settings:set` | `Partial<Settings>` | `Settings` |

## Main → renderer (send/on)

| Channel | Payload | When |
|---|---|---|
| `reminder:due` | `Reminder` | Scheduler finds a due, unnotified reminder |

Types live in `src/shared/types.ts`.
