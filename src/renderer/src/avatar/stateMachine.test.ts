import { describe, expect, it } from 'vitest'
import { next, type AvatarEvent, type AvatarState } from './stateMachine'

describe('avatar state machine', () => {
  const cases: Array<[AvatarState, AvatarEvent, AvatarState]> = [
    ['idle', 'reminder-due', 'wave'],
    ['sleep', 'reminder-due', 'wave'],
    ['idle', 'reminder-completed', 'happy'],
    ['wave', 'animation-done', 'idle'],
    ['happy', 'animation-done', 'idle'],
    ['sleep', 'animation-done', 'sleep'],
    ['idle', 'animation-done', 'idle'],
    ['idle', 'idle-timeout', 'sleep'],
    ['wave', 'idle-timeout', 'wave'],
    ['sleep', 'interact', 'idle'],
    ['wave', 'interact', 'idle']
  ]

  it.each(cases)('%s + %s -> %s', (from, event, to) => {
    expect(next(from, event)).toBe(to)
  })
})
