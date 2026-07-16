import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AvatarEngine } from './engine'
import { validateManifest, type AvatarManifest } from './manifest'

const manifest: AvatarManifest = {
  name: 'test',
  frameSize: { w: 256, h: 256 },
  animations: {
    idle: { file: 'idle.png', frames: 2, fps: 2, loop: true },
    blink: { file: 'blink.png', frames: 1, fps: 6, loop: false, next: 'idle' },
    sit: { file: 'sit.png', frames: 1, fps: 1, loop: true },
    sleep: { file: 'sleep.png', frames: 1, fps: 1, loop: true, effect: 'breathe' },
    happy: { file: 'happy.png', frames: 2, fps: 3, loop: false, next: 'idle' },
    wave: { file: 'wave.png', frames: 2, fps: 4, loop: true },
    celebrate: { file: 'celebrate.png', frames: 2, fps: 3, loop: false, next: 'idle' }
  },
  idleActions: [
    { anim: 'blink', weight: 1 },
    { anim: 'sit', weight: 1, holdMs: 8000 }
  ]
}

describe('validateManifest', () => {
  it('accepts a valid manifest', () => {
    expect(validateManifest(manifest)).toBe(manifest)
  })
  it('rejects missing idle, bad next, unknown idle action', () => {
    expect(() => validateManifest({ ...manifest, animations: { blink: manifest.animations['blink'] } })).toThrow()
    expect(() =>
      validateManifest({
        ...manifest,
        animations: { ...manifest.animations, blink: { ...manifest.animations['blink'], next: 'nope' } }
      })
    ).toThrow()
    expect(() => validateManifest({ ...manifest, idleActions: [{ anim: 'nope', weight: 1 }] })).toThrow()
  })
})

describe('AvatarEngine', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  const make = (random = () => 0.5) => {
    const e = new AvatarEngine(manifest, { random })
    const seen: string[] = []
    e.onChange((a) => seen.push(a))
    return { e, seen }
  }

  it('starts idle', () => {
    expect(make().e.current).toBe('idle')
  })

  it('reminder-due waves and holds through animationEnded until wake', () => {
    const { e } = make()
    e.signal('reminder-due')
    expect(e.current).toBe('wave')
    e.animationEnded()
    expect(e.current).toBe('wave')
    e.signal('wake')
    expect(e.current).toBe('idle')
  })

  it('reminder-completed celebrates then returns to idle on animation end', () => {
    const { e } = make()
    e.signal('reminder-due')
    e.signal('reminder-completed')
    expect(e.current).toBe('celebrate')
    e.animationEnded()
    expect(e.current).toBe('idle')
  })

  it('interact is happy when awake, wakes when asleep', () => {
    const { e } = make()
    e.signal('interact')
    expect(e.current).toBe('happy')
    e.signal('rest')
    expect(e.current).toBe('sleep')
    e.signal('interact')
    expect(e.current).toBe('idle')
  })

  it('plays a weighted idle action after 10-45s, only from idle', () => {
    const { e } = make(() => 0) // delay = min (10s), roll picks first action (blink)
    e.start()
    vi.advanceTimersByTime(10_000)
    expect(e.current).toBe('blink')
    e.animationEnded()
    expect(e.current).toBe('idle')
    e.stop()
  })

  it('holdMs idle action returns to idle by timer', () => {
    const { e } = make(() => 0.6) // roll 1.2 of 2 -> second action (sit, holdMs 8s)... delay = 31s
    e.start()
    vi.advanceTimersByTime(31_000)
    expect(e.current).toBe('sit')
    vi.advanceTimersByTime(8_000)
    expect(e.current).toBe('idle')
    e.stop()
  })

  it('sleeps after 90s inactivity; signals reset the countdown', () => {
    const { e } = make(() => 1) // idle delay 45s, roll never picks (guarded by ?? first)... use held state instead
    e.stop()
    const e2 = new AvatarEngine(manifest, { random: () => 0.999 })
    e2.start()
    vi.advanceTimersByTime(60_000)
    e2.signal('interact') // resets sleep countdown
    vi.advanceTimersByTime(60_000)
    expect(e2.current).not.toBe('sleep')
    vi.advanceTimersByTime(30_001)
    expect(e2.current).toBe('sleep')
    e2.stop()
  })

  it('never falls asleep while holding a reminder wave', () => {
    const { e } = make()
    e.start()
    e.signal('reminder-due')
    vi.advanceTimersByTime(200_000)
    expect(e.current).toBe('wave')
    e.stop()
  })

  it('unknown state falls back to idle', () => {
    const bare = new AvatarEngine({ ...manifest, animations: { idle: manifest.animations['idle'] } })
    bare.signal('interact') // happy missing in this pack
    expect(bare.current).toBe('idle')
  })
})
