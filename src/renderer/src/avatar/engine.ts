import type { AvatarManifest } from './manifest'

export type AvatarSignal = 'reminder-due' | 'reminder-completed' | 'interact' | 'rest' | 'wake'

export interface EngineOptions {
  random?: () => number
  minIdleMs?: number
  maxIdleMs?: number
  sleepAfterMs?: number
}

type Timer = ReturnType<typeof setTimeout>

export class AvatarEngine {
  private state = 'idle'
  private held = false // signal-driven state that loops until released (wave)
  private listeners = new Set<(anim: string) => void>()
  private idleTimer: Timer | null = null
  private holdTimer: Timer | null = null
  private sleepTimer: Timer | null = null
  private readonly random: () => number
  private readonly minIdleMs: number
  private readonly maxIdleMs: number
  private readonly sleepAfterMs: number

  constructor(
    private manifest: AvatarManifest,
    opts: EngineOptions = {}
  ) {
    this.random = opts.random ?? Math.random
    this.minIdleMs = opts.minIdleMs ?? 10_000
    this.maxIdleMs = opts.maxIdleMs ?? 45_000
    this.sleepAfterMs = opts.sleepAfterMs ?? 90_000
  }

  get current(): string {
    return this.state
  }

  onChange(cb: (anim: string) => void): () => void {
    this.listeners.add(cb)
    return () => this.listeners.delete(cb)
  }

  start(): void {
    this.scheduleIdle()
    this.scheduleSleep()
  }

  stop(): void {
    for (const t of [this.idleTimer, this.holdTimer, this.sleepTimer]) if (t) clearTimeout(t)
    this.idleTimer = this.holdTimer = this.sleepTimer = null
  }

  signal(s: AvatarSignal): void {
    this.scheduleSleep() // any activity resets the sleep countdown
    switch (s) {
      case 'reminder-due':
        this.held = true
        this.setState('wave')
        break
      case 'reminder-completed':
        this.held = false
        this.setState('celebrate')
        break
      case 'interact':
        this.held = false
        this.setState(this.state === 'sleep' ? 'idle' : 'happy')
        break
      case 'wake':
        this.held = false
        this.setState('idle')
        break
      case 'rest':
        this.held = false
        this.setState('sleep')
        break
    }
  }

  // Called by the sprite player when a non-looping animation finishes.
  animationEnded(): void {
    if (this.held) return
    const def = this.manifest.animations[this.state]
    if (def && !def.loop) this.setState(def.next ?? 'idle')
  }

  private setState(anim: string): void {
    if (this.holdTimer) clearTimeout(this.holdTimer)
    this.holdTimer = null
    if (!this.manifest.animations[anim]) anim = 'idle'
    if (anim === this.state) {
      // re-notify so the player restarts a held animation (e.g. second reminder)
      this.listeners.forEach((cb) => cb(anim))
      return
    }
    this.state = anim
    this.listeners.forEach((cb) => cb(anim))
  }

  private scheduleIdle(): void {
    if (this.idleTimer) clearTimeout(this.idleTimer)
    const delay = this.minIdleMs + this.random() * (this.maxIdleMs - this.minIdleMs)
    this.idleTimer = setTimeout(() => {
      if (this.state === 'idle') this.playIdleAction()
      this.scheduleIdle()
    }, delay)
  }

  private playIdleAction(): void {
    const actions = this.manifest.idleActions
    if (actions.length === 0) return
    const total = actions.reduce((s, a) => s + a.weight, 0)
    let roll = this.random() * total
    const action = actions.find((a) => (roll -= a.weight) < 0) ?? actions[0]
    this.setState(action.anim)
    if (action.holdMs) {
      this.holdTimer = setTimeout(() => {
        if (this.state === action.anim) this.setState('idle')
      }, action.holdMs)
    }
  }

  private scheduleSleep(): void {
    if (this.sleepTimer) clearTimeout(this.sleepTimer)
    this.sleepTimer = setTimeout(() => {
      if (!this.held) this.setState('sleep')
    }, this.sleepAfterMs)
  }
}
