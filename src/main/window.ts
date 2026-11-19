import { BrowserWindow, screen } from 'electron'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import type { Settings } from '@shared/types'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Window footprint: big enough for Nyx (~180) hanging from the top edge plus the
// speech bubble below it. Fixed size avoids resize jank on Linux.
const WIDTH = 380
const HEIGHT = 440
const PADDING = 8

// electron-vite may emit the preload as index.js, index.mjs, or index.cjs depending
// on the ESM/CJS context; resolve whichever actually exists so dev and packaged
// builds both load the right file.
function resolvePreload(): string {
  const dir = resolve(__dirname, '../preload')
  for (const name of ['index.js', 'index.mjs', 'index.cjs']) {
    const p = resolve(dir, name)
    if (existsSync(p)) return p
  }
  return resolve(dir, 'index.js')
}

export function anchorPoint(position: Settings['position']): { x: number; y: number } {
  const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint())
  const wa = display.workArea
  const x = position.corner === 'right' ? wa.x + wa.width - WIDTH - PADDING : wa.x + PADDING
  const y = position.edge === 'top' ? wa.y + PADDING : wa.y + wa.height - HEIGHT - PADDING
  return { x: Math.round(x), y: Math.round(y) }
}

// Transparent, frameless, always-on-top, click-through window anchored to the
// configured corner (default top-right). This is the risky bit — validate on X11,
// XWayland, and Windows before building features on top of it (Phase 1 gate).
export function createNyxWindow(settings: Settings): BrowserWindow {
  const { x, y } = anchorPoint(settings.position)
  const win = new BrowserWindow({
    width: WIDTH,
    height: HEIGHT,
    x,
    y,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    resizable: false,
    movable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    show: false,
    fullscreenable: false,
    webPreferences: {
      preload: resolvePreload(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  // Start click-through everywhere; the renderer toggles this per cursor position.
  win.setIgnoreMouseEvents(true, { forward: true })

  const devUrl = process.env['ELECTRON_RENDERER_URL']
  if (devUrl) {
    void win.loadURL(devUrl)
  } else {
    void win.loadFile(resolve(__dirname, '../renderer/index.html'))
  }

  win.once('ready-to-show', () => win.show())
  return win
}
