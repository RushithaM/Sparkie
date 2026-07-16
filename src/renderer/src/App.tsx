import { useEffect, useState } from 'react'
import type { Reminder } from '../../shared/types'
import { Avatar } from './avatar/Avatar'
import { useAvatar } from './avatar/useAvatar'
import { Bubble } from './bubble/Bubble'
import { SettingsPanel } from './settings/SettingsPanel'

export default function App() {
  const [avatarState, dispatch] = useAvatar()
  const [due, setDue] = useState<Reminder | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)

  useEffect(
    () =>
      window.sparkie.onReminderDue((r) => {
        setDue(r)
        dispatch('reminder-due')
      }),
    [dispatch]
  )

  const complete = async () => {
    if (!due) return
    await window.sparkie.reminders.complete(due.id)
    setDue(null)
    dispatch('reminder-completed')
  }

  const dismiss = () => {
    setDue(null)
    dispatch('interact')
  }

  return (
    <div className="drag flex h-screen flex-col items-center justify-end gap-3 pb-6">
      {panelOpen && <SettingsPanel onReminderCompleted={() => dispatch('reminder-completed')} />}
      {due && !panelOpen && <Bubble reminder={due} onComplete={complete} onDismiss={dismiss} />}
      <Avatar state={avatarState} onClick={() => dispatch('interact')} />
      <button
        onClick={() => setPanelOpen((o) => !o)}
        className="no-drag rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-gray-600 shadow hover:bg-white"
      >
        {panelOpen ? 'Close' : 'Reminders'}
      </button>
    </div>
  )
}
