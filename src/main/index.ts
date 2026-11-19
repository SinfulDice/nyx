import { app, BrowserWindow, ipcMain } from 'electron'
import { createNyxWindow } from './window'
import { SettingsStore } from './settings'
import { ClickThroughController } from './clickthrough'
import type { Rect } from '@shared/hittest'

let win: BrowserWindow | null = null
let clickThrough: ClickThroughController | null = null

function launch(): void {
  const w = createNyxWindow(new SettingsStore().getAll())
  win = w
  clickThrough = new ClickThroughController(w)
  clickThrough.start()
  w.on('closed', () => {
    clickThrough?.stop()
    clickThrough = null
    win = null
  })
}

app.whenReady().then(() => {
  launch()

  // Renderer reports window-relative rects of [data-interactive] elements; main polls
  // the cursor and toggles click-through. Cross-platform — does not rely on forwarded
  // mousemove, which Electron only forwards on macOS/Windows, not Linux.
  ipcMain.on('nyx:report-rects', (_event, rects: Rect[]) => {
    if (Array.isArray(rects)) clickThrough?.setRects(rects)
  })

  app.on('activate', () => {
    if (!win) launch()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
