import type { Reminder } from '../../../shared/types'

export function Bubble({
  reminder,
  onComplete,
  onSnooze,
  onDismiss
}: {
  reminder: Reminder
  onComplete: () => void
  onSnooze: () => void
  onDismiss: () => void
}) {
  return (
    <div className="no-drag relative mx-auto w-64 rounded-2xl bg-white/95 p-3 shadow-xl">
      <p className="text-sm font-medium text-gray-800">{reminder.title}</p>
      <p className="text-xs text-gray-500">{new Date(reminder.dueAt).toLocaleString()}</p>
      <div className="mt-2 flex gap-2">
        <button
          onClick={onComplete}
          className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-600"
        >
          Done
        </button>
        <button
          onClick={onSnooze}
          className="rounded-lg bg-sky-500 px-3 py-1 text-xs font-semibold text-white hover:bg-sky-600"
        >
          Snooze 5m
        </button>
        <button
          onClick={onDismiss}
          className="rounded-lg bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-300"
        >
          Dismiss
        </button>
      </div>
      {/* tail */}
      <div className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 bg-white/95" />
    </div>
  )
}
