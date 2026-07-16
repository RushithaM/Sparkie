import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { createSettingsStore } from './settings'

describe('settings store', () => {
  it('defaults, persists, and survives reload', () => {
    const dir = mkdtempSync(join(tmpdir(), 'sparkie-test-'))
    const store = createSettingsStore(dir)
    expect(store.get()).toEqual({ alwaysOnTop: true })

    store.set({ alwaysOnTop: false })
    expect(createSettingsStore(dir).get()).toEqual({ alwaysOnTop: false })
  })

  it('falls back to defaults on missing/corrupt file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'sparkie-test-'))
    expect(createSettingsStore(dir).get()).toEqual({ alwaysOnTop: true })
  })
})
