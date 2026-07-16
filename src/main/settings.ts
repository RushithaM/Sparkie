import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Settings } from '../shared/types'

const defaults: Settings = { alwaysOnTop: true }

export function createSettingsStore(dir: string) {
  const file = join(dir, 'settings.json')
  let cache: Settings
  try {
    cache = { ...defaults, ...JSON.parse(readFileSync(file, 'utf8')) }
  } catch {
    cache = { ...defaults }
  }
  return {
    get: (): Settings => cache,
    set(patch: Partial<Settings>): Settings {
      cache = { ...cache, ...patch }
      writeFileSync(file, JSON.stringify(cache, null, 2))
      return cache
    }
  }
}

export type SettingsStore = ReturnType<typeof createSettingsStore>
