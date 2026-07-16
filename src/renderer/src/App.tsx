import { useEffect, useState } from 'react'
import rawManifest from '../../../assets/avatars/cat/manifest.json'
import type { Reminder } from '../../shared/types'
import { Avatar } from './avatar/Avatar'
import { validateManifest, type AvatarManifest } from './avatar/manifest'
import { useAvatar } from './avatar/useAvatar'
import { Bubble } from './bubble/Bubble'
import { SettingsPanel } from './settings/SettingsPanel'

const manifest = validateManifest(rawManifest as unknown as AvatarManifest)

export default function App() {
  const { anim, engine } = useAvatar(manifest)
  const [due, setDue] = useState<Reminder | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)

  useEffect(
    () =>
      window.sparkie.onReminderDue((r) => {
        setDue(r)
        engine.signal('reminder-due')
      }),
    [engine]
  )

  const complete = async () => {
    if (!due) return
    await window.sparkie.reminders.complete(due.id)
    setDue(null)
    engine.signal('reminder-completed')
  }

  const dismiss = () => {
    setDue(null)
    engine.signal('wake')
  }

  const snooze = async () => {
    if (!due) return
    // update() clears notified_at, so the scheduler re-fires it in 5 minutes
    await window.sparkie.reminders.update(due.id, {
      dueAt: new Date(Date.now() + 5 * 60_000).toISOString()
    })
    setDue(null)
    engine.signal('wake')
  }

  return (
    <div className="drag flex h-screen flex-col items-center justify-end gap-3 pb-6">
      {panelOpen && <SettingsPanel onReminderCompleted={() => engine.signal('reminder-completed')} />}
      {due && !panelOpen && (
        <Bubble reminder={due} onComplete={complete} onSnooze={snooze} onDismiss={dismiss} />
      )}
      <Avatar
        manifest={manifest}
        anim={anim}
        onClick={() => engine.signal('interact')}
        onEnded={() => engine.animationEnded()}
      />
      <button
        onClick={() => setPanelOpen((o) => !o)}
        className="no-drag rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-gray-600 shadow hover:bg-white"
      >
        {panelOpen ? 'Close' : 'Reminders'}
      </button>
    </div>
  )
}
