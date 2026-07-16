import { ipcMain } from 'electron'
import type { Settings } from '../shared/types'
import type { ReminderService } from './reminders'
import type { SettingsStore } from './settings'

export function registerIpc(
  reminders: ReminderService,
  settings: SettingsStore,
  applySettings: (s: Settings) => void
): void {
  ipcMain.handle('reminders:create', (_e, input) => reminders.create(input))
  ipcMain.handle('reminders:update', (_e, id, patch) => reminders.update(id, patch))
  ipcMain.handle('reminders:delete', (_e, id) => reminders.remove(id))
  ipcMain.handle('reminders:getUpcoming', () => reminders.getUpcoming())
  ipcMain.handle('reminders:complete', (_e, id) => reminders.complete(id))
  ipcMain.handle('settings:get', () => settings.get())
  ipcMain.handle('settings:set', (_e, patch) => {
    const s = settings.set(patch)
    applySettings(s)
    return s
  })
}
