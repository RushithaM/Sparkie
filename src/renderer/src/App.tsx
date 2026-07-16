import { useCallback, useEffect, useRef, useState } from 'react'
import rawManifest from '../../../assets/avatars/cat/manifest.json'
import type { Reminder } from '../../shared/types'
import { Avatar } from './avatar/Avatar'
import { validateManifest, type AvatarManifest } from './avatar/manifest'
import { useAvatar } from './avatar/useAvatar'
import { Bubble } from './bubble/Bubble'
import { SettingsPanel } from './settings/SettingsPanel'

const manifest = validateManifest(rawManifest as unknown as AvatarManifest)

const SNOOZE_LABEL_MS = 4000

export default function App() {
  const { anim, engine } = useAvatar(manifest)
  const [due, setDue] = useState<Reminder | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [snoozed, setSnoozed] = useState(false)
  const snoozeLabelTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const refreshCount = useCallback(
    () => window.sparkie.reminders.getUpcoming().then((rs) => setPendingCount(rs.length)),
    []
  )

  useEffect(() => {
    refreshCount()
    return () => {
      if (snoozeLabelTimer.current) clearTimeout(snoozeLabelTimer.current)
    }
  }, [refreshCount])

  useEffect(
    () =>
      window.sparkie.onReminderDue((r) => {
        setDue(r)
        setSnoozed(false)
        engine.signal('reminder-due')
        refreshCount()
      }),
    [engine, refreshCount]
  )

  const complete = async () => {
    if (!due) return
    await window.sparkie.reminders.complete(due.id)
    setDue(null)
    engine.signal('reminder-completed')
    refreshCount()
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
    engine.signal('rest') // cat naps until the snooze is up (or the user pokes it)
    setSnoozed(true)
    if (snoozeLabelTimer.current) clearTimeout(snoozeLabelTimer.current)
    snoozeLabelTimer.current = setTimeout(() => setSnoozed(false), SNOOZE_LABEL_MS)
    refreshCount()
  }

  return (
    <div className="drag flex h-screen flex-col items-center justify-end gap-3 pb-6">
      {panelOpen && (
        <SettingsPanel
          onReminderCompleted={() => engine.signal('reminder-completed')}
          onRemindersChanged={refreshCount}
        />
      )}
      {due && !panelOpen && (
        <Bubble reminder={due} onComplete={complete} onSnooze={snooze} onDismiss={dismiss} />
      )}
      {snoozed && !due && !panelOpen && (
        <div className="no-drag rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-gray-600 shadow-xl">
          Snoozed 5m
        </div>
      )}
      <Avatar
        manifest={manifest}
        anim={anim}
        badge={pendingCount}
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
