import { app, BrowserWindow, ipcMain } from 'electron'
import { createNyxWindow } from './window'
import { SettingsStore } from './settings'

let win: BrowserWindow | null = null

app.whenReady().then(() => {
  const settings = new SettingsStore()
  win = createNyxWindow(settings.getAll())

  // Renderer toggles click-through per cursor position: interactive=true means the
  // cursor is over Nyx or the bubble, so capture pointer events; false = click-through
  // (mouse moves are still forwarded so the renderer can keep tracking).
  ipcMain.on('nyx:set-interactive', (_event, interactive: boolean) => {
    if (win && !win.isDestroyed()) {
      win.setIgnoreMouseEvents(!interactive, { forward: true })
    }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      win = createNyxWindow(new SettingsStore().getAll())
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
