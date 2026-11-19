import { BrowserWindow, screen } from 'electron'
import { isPointInRects, type Rect } from '@shared/hittest'

// Cross-platform click-through that does NOT depend on forwarded mousemove events.
// (Electron's { forward: true } only forwards mouse moves on macOS/Windows, not
// Linux — so a mousemove-driven approach leaves interactive regions click-through on
// Linux.) Instead, the renderer reports the window-relative rects of every
// [data-interactive] element; main polls the cursor and toggles setIgnoreMouseEvents
// only on transitions.
export class ClickThroughController {
  private readonly win: BrowserWindow
  private windowRelative: Rect[] = []
  private interactive = false
  private intervalMs: number
  private timer: ReturnType<typeof setInterval> | null = null

  constructor(win: BrowserWindow, intervalMs = 33) {
    this.win = win
    this.intervalMs = intervalMs
  }

  /** rects are relative to the window's top-left, as reported by the renderer. */
  setRects(rects: Rect[]): void {
    this.windowRelative = Array.isArray(rects) ? rects : []
  }

  /** Change the poll rate (e.g. slower while Nyx is sleeping). Restarts the timer. */
  setPollInterval(ms: number): void {
    this.intervalMs = ms
    if (this.timer) {
      this.stop()
      this.start()
    }
  }

  start(): void {
    if (this.timer) return
    this.timer = setInterval(() => this.tick(), this.intervalMs)
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  private tick(): void {
    if (this.win.isDestroyed()) {
      this.stop()
      return
    }
    const [wx, wy] = this.win.getPosition()
    const screenRects: Rect[] = this.windowRelative.map((r) => ({
      x: r.x + wx,
      y: r.y + wy,
      width: r.width,
      height: r.height,
    }))
    const next = isPointInRects(screen.getCursorScreenPoint(), screenRects)
    if (next !== this.interactive) {
      this.interactive = next
      this.win.setIgnoreMouseEvents(!next, { forward: true })
    }
  }
}
