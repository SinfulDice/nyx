import { app, BrowserWindow } from 'electron'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// electron-vite may emit the preload as index.js, index.mjs, or index.cjs
// depending on the ESM/CJS context; resolve whichever actually exists so dev and
// packaged builds both load the right file.
function resolvePreload(): string {
  const dir = resolve(__dirname, '../preload')
  for (const name of ['index.js', 'index.mjs', 'index.cjs']) {
    const p = resolve(dir, name)
    if (existsSync(p)) return p
  }
  return resolve(dir, 'index.js')
}

function createWindow(): void {
  const win = new BrowserWindow({
    width: 360,
    height: 480,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: resolvePreload(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  const devUrl = process.env['ELECTRON_RENDERER_URL']
  if (devUrl) {
    void win.loadURL(devUrl)
  } else {
    void win.loadFile(resolve(__dirname, '../renderer/index.html'))
  }

  win.once('ready-to-show', () => win.show())
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
