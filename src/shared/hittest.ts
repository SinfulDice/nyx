// Click-through hit-test: pure, unit-tested logic shared by the main process
// (ClickThroughController) and tests. Rects and the point must be in the same
// coordinate space (screen-relative when used from main).

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export function isPointInRects(point: { x: number; y: number }, rects: Rect[]): boolean {
  return rects.some(
    (r) =>
      point.x >= r.x &&
      point.x <= r.x + r.width &&
      point.y >= r.y &&
      point.y <= r.y + r.height,
  )
}
