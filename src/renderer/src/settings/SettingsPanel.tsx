import { useEffect, useState, type FormEvent } from 'react'
import type { Reminder, Settings } from '../../../shared/types'

export function SettingsPanel({ onReminderCompleted }: { onReminderCompleted: () => void }) {
  const [upcoming, setUpcoming] = useState<Reminder[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)
  const [title, setTitle] = useState('')
  const [dueAt, setDueAt] = useState('')

  const refresh = () => window.sparkie.reminders.getUpcoming().then(setUpcoming)

  useEffect(() => {
    refresh()
    window.sparkie.settings.get().then(setSettings)
  }, [])

  const add = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !dueAt) return
    await window.sparkie.reminders.create({ title, dueAt: new Date(dueAt).toISOString() })
    setTitle('')
    setDueAt('')
    refresh()
  }

  const complete = async (id: number) => {
    await window.sparkie.reminders.complete(id)
    onReminderCompleted()
    refresh()
  }

  const remove = async (id: number) => {
    await window.sparkie.reminders.remove(id)
    refresh()
  }

  const toggleOnTop = async () => {
    if (!settings) return
    setSettings(await window.sparkie.settings.set({ alwaysOnTop: !settings.alwaysOnTop }))
  }

  return (
    <div className="no-drag mx-auto w-72 rounded-2xl bg-white/95 p-3 text-sm shadow-xl">
      <form onSubmit={add} className="flex flex-col gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Remind me to…"
          className="rounded-lg border border-gray-300 px-2 py-1 outline-none focus:border-orange-400"
        />
        <div className="flex gap-2">
          <input
            type="datetime-local"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-gray-300 px-2 py-1 outline-none focus:border-orange-400"
          />
          <button
            type="submit"
            className="rounded-lg bg-orange-400 px-3 py-1 font-semibold text-white hover:bg-orange-500"
          >
            Add
          </button>
        </div>
      </form>

      <ul className="mt-3 flex max-h-40 flex-col gap-1 overflow-y-auto">
        {upcoming.length === 0 && <li className="text-xs text-gray-400">No reminders yet</li>}
        {upcoming.map((r) => (
          <li key={r.id} className="flex items-center gap-2 rounded-lg bg-gray-50 px-2 py-1">
            <div className="min-w-0 flex-1">
              <p className="truncate text-gray-800">{r.title}</p>
              <p className="text-[10px] text-gray-400">{new Date(r.dueAt).toLocaleString()}</p>
            </div>
            <button onClick={() => complete(r.id)} title="Done" className="text-emerald-500 hover:scale-110">
              ✓
            </button>
            <button onClick={() => remove(r.id)} title="Delete" className="text-gray-400 hover:text-red-400">
              ✕
            </button>
          </li>
        ))}
      </ul>

      <label className="mt-3 flex items-center gap-2 text-xs text-gray-600">
        <input type="checkbox" checked={settings?.alwaysOnTop ?? true} onChange={toggleOnTop} />
        Always on top
      </label>
    </div>
  )
}
