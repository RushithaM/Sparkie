import { contextBridge, ipcRenderer } from 'electron'
import type { Reminder, SparkieApi } from '../shared/types'

const api: SparkieApi = {
  reminders: {
    create: (input) => ipcRenderer.invoke('reminders:create', input),
    update: (id, patch) => ipcRenderer.invoke('reminders:update', id, patch),
    remove: (id) => ipcRenderer.invoke('reminders:delete', id),
    getUpcoming: () => ipcRenderer.invoke('reminders:getUpcoming'),
    complete: (id) => ipcRenderer.invoke('reminders:complete', id)
  },
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    set: (patch) => ipcRenderer.invoke('settings:set', patch)
  },
  onReminderDue(cb) {
    const listener = (_e: unknown, r: Reminder) => cb(r)
    ipcRenderer.on('reminder:due', listener)
    return () => ipcRenderer.removeListener('reminder:due', listener)
  }
}

contextBridge.exposeInMainWorld('sparkie', api)
