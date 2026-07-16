import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { openDb } from './db'
import { createReminderService, startScheduler, type ReminderService } from './reminders'

const past = new Date(Date.now() - 60_000).toISOString()
const future = new Date(Date.now() + 3_600_000).toISOString()

describe('reminder service', () => {
  let svc: ReminderService

  beforeEach(() => {
    svc = createReminderService(openDb(':memory:'))
  })

  it('creates and lists upcoming', () => {
    const r = svc.create({ title: 'water plants', dueAt: future })
    expect(r.id).toBeGreaterThan(0)
    expect(r.completedAt).toBeNull()
    expect(svc.getUpcoming().map((x) => x.id)).toEqual([r.id])
  })

  it('orders upcoming by due date', () => {
    const b = svc.create({ title: 'later', dueAt: future })
    const a = svc.create({ title: 'sooner', dueAt: past })
    expect(svc.getUpcoming().map((x) => x.id)).toEqual([a.id, b.id])
  })

  it('complete removes from upcoming', () => {
    const r = svc.create({ title: 'x', dueAt: future })
    expect(svc.complete(r.id).completedAt).not.toBeNull()
    expect(svc.getUpcoming()).toEqual([])
  })

  it('update patches fields and delete removes', () => {
    const r = svc.create({ title: 'x', dueAt: future })
    expect(svc.update(r.id, { title: 'y' }).title).toBe('y')
    svc.remove(r.id)
    expect(svc.getUpcoming()).toEqual([])
  })

  it('rejects empty title and bad date', () => {
    expect(() => svc.create({ title: '  ', dueAt: future })).toThrow()
    expect(() => svc.create({ title: 'x', dueAt: 'not-a-date' })).toThrow()
  })

  it('dueNow returns only past-due unnotified, once', () => {
    const due = svc.create({ title: 'due', dueAt: past })
    svc.create({ title: 'not yet', dueAt: future })
    expect(svc.dueNow().map((x) => x.id)).toEqual([due.id])
    svc.markNotified(due.id)
    expect(svc.dueNow()).toEqual([])
  })

  it('rescheduling a notified reminder makes it fire again', () => {
    const r = svc.create({ title: 'x', dueAt: past })
    svc.markNotified(r.id)
    svc.update(r.id, { dueAt: past })
    expect(svc.dueNow().map((x) => x.id)).toEqual([r.id])
  })
})

describe('scheduler', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('fires onDue for due reminders and never twice', () => {
    const svc = createReminderService(openDb(':memory:'))
    const r = svc.create({ title: 'now', dueAt: new Date(Date.now() - 1000).toISOString() })
    const onDue = vi.fn()
    const stop = startScheduler(svc, onDue, 1000)
    expect(onDue).toHaveBeenCalledTimes(1)
    expect(onDue.mock.calls[0][0].id).toBe(r.id)
    vi.advanceTimersByTime(5000)
    expect(onDue).toHaveBeenCalledTimes(1)
    stop()
  })
})
