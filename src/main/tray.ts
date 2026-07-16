import { app, BrowserWindow, Menu, nativeImage, Tray } from 'electron'
import { join } from 'node:path'

export function createTray(win: BrowserWindow): Tray {
  const icon = nativeImage.createFromPath(join(app.getAppPath(), 'assets/trayTemplate.png'))
  icon.setTemplateImage(true)
  const tray = new Tray(icon)
  tray.setToolTip('Sparkie')
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: 'Show / Hide', click: () => (win.isVisible() ? win.hide() : win.show()) },
      { type: 'separator' },
      { label: 'Quit Sparkie', click: () => app.quit() }
    ])
  )
  return tray
}
