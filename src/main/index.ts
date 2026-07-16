import { app, BrowserWindow, Notification } from 'electron'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { openDb } from './db'
import { registerIpc } from './ipc'
import { createReminderService, startScheduler, type ReminderService } from './reminders'
import { createSettingsStore } from './settings'
import { createTray } from './tray'

let tray: Electron.Tray | null = null

function createWindow(alwaysOnTop: boolean): BrowserWindow {
  const win = new BrowserWindow({
    width: 320,
    height: 480,
    transparent: true,
    frame: false,
    resizable: false,
    alwaysOnTop,
    hasShadow: false,
    skipTaskbar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js')
    }
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
  return win
}

const SMOKE = Boolean(process.env['SMOKE'])

app.whenReady().then(() => {
  app.dock?.hide()

  if (SMOKE) app.setPath('userData', mkdtempSync(join(tmpdir(), 'sparkie-smoke-')))
  const userData = app.getPath('userData')
  const db = openDb(join(userData, 'sparkie.db'))
  const settings = createSettingsStore(userData)
  const reminders = createReminderService(db)

  const win = createWindow(settings.get().alwaysOnTop)
  registerIpc(reminders, settings, (s) => win.setAlwaysOnTop(s.alwaysOnTop))
  tray = createTray(win)

  startScheduler(
    reminders,
    (r) => {
      win.webContents.send('reminder:due', r)
      win.show()
      if (!SMOKE && Notification.isSupported()) {
        new Notification({ title: 'Sparkie', body: r.title }).show()
      }
    },
    SMOKE ? 500 : 15_000
  )

  if (SMOKE) runSmokeTest(win, reminders)
})

// End-to-end check: preload API present, due reminder flows scheduler -> IPC -> bubble in DOM.
function runSmokeTest(win: BrowserWindow, reminders: ReminderService): void {
  win.webContents.once('did-fail-load', (_e, code, desc) => {
    console.error('SMOKE_FAIL load', code, desc)
    app.exit(1)
  })
  win.webContents.once('did-finish-load', async () => {
    try {
      const apiType = await win.webContents.executeJavaScript('typeof window.sparkie')
      if (apiType !== 'object') throw new Error(`preload api missing (${apiType})`)
      reminders.create({ title: 'SMOKE_REMINDER', dueAt: new Date().toISOString() })
      for (let i = 0; i < 20; i++) {
        const found = await win.webContents.executeJavaScript(
          `document.body.innerText.includes('SMOKE_REMINDER')`
        )
        if (found) {
          const shot = process.env['SMOKE_SHOT']
          if (shot) {
            await new Promise((r) => setTimeout(r, 300)) // let compositor paint before capture
            writeFileSync(shot, (await win.capturePage()).toPNG())
          }
          console.log('SMOKE_OK tray=' + Boolean(tray))
          app.exit(0)
        }
        await new Promise((r) => setTimeout(r, 250))
      }
      throw new Error('bubble never rendered')
    } catch (err) {
      console.error('SMOKE_FAIL', err)
      app.exit(1)
    }
  })
}

app.on('window-all-closed', () => {
  app.quit()
})
