import type { Database } from 'better-sqlite3'
import type { Reminder, ReminderInput } from '../shared/types'

interface Row {
  id: number
  title: string
  due_at: string
  completed_at: string | null
  notified_at: string | null
  created_at: string
}

const toReminder = (r: Row): Reminder => ({
  id: r.id,
  title: r.title,
  dueAt: r.due_at,
  completedAt: r.completed_at,
  createdAt: r.created_at
})

function validate(input: Partial<ReminderInput>): void {
  if (input.title !== undefined && (typeof input.title !== 'string' || input.title.trim() === '')) {
    throw new Error('Reminder title must be a non-empty string')
  }
  if (input.dueAt !== undefined && Number.isNaN(Date.parse(input.dueAt))) {
    throw new Error('Reminder dueAt must be a valid ISO date')
  }
}

export function createReminderService(db: Database) {
  const get = (id: number): Reminder => {
    const row = db.prepare('SELECT * FROM reminders WHERE id = ?').get(id) as Row | undefined
    if (!row) throw new Error(`Reminder ${id} not found`)
    return toReminder(row)
  }

  return {
    get,
    create(input: ReminderInput): Reminder {
      validate(input)
      if (input.title === undefined || input.dueAt === undefined) throw new Error('title and dueAt are required')
      const { lastInsertRowid } = db
        .prepare('INSERT INTO reminders (title, due_at, created_at) VALUES (?, ?, ?)')
        .run(input.title.trim(), new Date(input.dueAt).toISOString(), new Date().toISOString())
      return get(Number(lastInsertRowid))
    },
    update(id: number, patch: Partial<ReminderInput>): Reminder {
      validate(patch)
      const cur = get(id)
      // reset notified_at so a rescheduled reminder fires again
      db.prepare('UPDATE reminders SET title = ?, due_at = ?, notified_at = NULL WHERE id = ?').run(
        patch.title?.trim() ?? cur.title,
        patch.dueAt ? new Date(patch.dueAt).toISOString() : cur.dueAt,
        id
      )
      return get(id)
    },
    remove(id: number): void {
      db.prepare('DELETE FROM reminders WHERE id = ?').run(id)
    },
    complete(id: number): Reminder {
      db.prepare('UPDATE reminders SET completed_at = ? WHERE id = ?').run(new Date().toISOString(), id)
      return get(id)
    },
    getUpcoming(): Reminder[] {
      const rows = db
        .prepare('SELECT * FROM reminders WHERE completed_at IS NULL ORDER BY due_at')
        .all() as Row[]
      return rows.map(toReminder)
    },
    dueNow(): Reminder[] {
      const rows = db
        .prepare('SELECT * FROM reminders WHERE completed_at IS NULL AND notified_at IS NULL AND due_at <= ?')
        .all(new Date().toISOString()) as Row[]
      return rows.map(toReminder)
    },
    markNotified(id: number): void {
      db.prepare('UPDATE reminders SET notified_at = ? WHERE id = ?').run(new Date().toISOString(), id)
    }
  }
}

export type ReminderService = ReturnType<typeof createReminderService>

export function startScheduler(
  svc: ReminderService,
  onDue: (r: Reminder) => void,
  intervalMs = 15_000
): () => void {
  const tick = () => {
    for (const r of svc.dueNow()) {
      svc.markNotified(r.id)
      onDue(r)
    }
  }
  tick()
  // ponytail: 15s poll; switch to setTimeout-to-next-due if second-level precision ever matters
  const timer = setInterval(tick, intervalMs)
  return () => clearInterval(timer)
}
