import { describe, it, expect } from 'vitest'
import { isPointInRects, type Rect } from './hittest'

describe('isPointInRects', () => {
  const rects: Rect[] = [{ x: 100, y: 100, width: 50, height: 50 }]

  it('is true inside a rect (edges inclusive)', () => {
    expect(isPointInRects({ x: 125, y: 125 }, rects)).toBe(true)
    expect(isPointInRects({ x: 100, y: 100 }, rects)).toBe(true) // top-left
    expect(isPointInRects({ x: 150, y: 150 }, rects)).toBe(true) // bottom-right
  })

  it('is false just outside a rect', () => {
    expect(isPointInRects({ x: 99, y: 100 }, rects)).toBe(false)
    expect(isPointInRects({ x: 151, y: 151 }, rects)).toBe(false)
    expect(isPointInRects({ x: 100, y: 99 }, rects)).toBe(false)
  })

  it('is false when there are no rects', () => {
    expect(isPointInRects({ x: 0, y: 0 }, [])).toBe(false)
  })

  it('matches any of several rects', () => {
    const r: Rect[] = [
      { x: 0, y: 0, width: 10, height: 10 },
      { x: 100, y: 100, width: 10, height: 10 },
    ]
    expect(isPointInRects({ x: 5, y: 5 }, r)).toBe(true)
    expect(isPointInRects({ x: 105, y: 105 }, r)).toBe(true)
    expect(isPointInRects({ x: 50, y: 50 }, r)).toBe(false)
  })
})
