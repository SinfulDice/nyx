import { useLayoutEffect, useState } from 'react'
import type { Rect } from '@shared/hittest'

// Collect the window-relative rects of every [data-interactive] element.
function collectRects(): Rect[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-interactive]')).map((el) => {
    const r = el.getBoundingClientRect()
    return {
      x: Math.round(r.x),
      y: Math.round(r.y),
      width: Math.round(r.width),
      height: Math.round(r.height),
    }
  })
}

// Phase 1 spike: transparent, frameless, always-on-top, click-through window.
// The renderer reports interactive rects to main; main polls the cursor and toggles
// setIgnoreMouseEvents. This does NOT rely on forwarded mousemove (Electron only
// forwards moves on macOS/Windows, not Linux).
export default function App() {
  const [count, setCount] = useState(0)

  // Report rects after every render so hit-testing stays accurate as the layout
  // changes (mount + any state/layout change).
  useLayoutEffect(() => {
    window.nyx.reportInteractiveRects(collectRects())
  })

  // Also re-report on resize (covers size changes that don't trigger a React render).
  useLayoutEffect(() => {
    const ro = new ResizeObserver(() => window.nyx.reportInteractiveRects(collectRects()))
    ro.observe(document.body)
    return () => ro.disconnect()
  }, [])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: 'transparent' }}>
      {/* Nyx placeholder (real procedural SVG arrives in Phase 3) */}
      <div
        data-interactive
        title="Nyx placeholder"
        onClick={() => setCount((c) => c + 1)}
        style={{
          position: 'absolute',
          top: 6,
          right: 6,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: '#2A2238',
          border: '2px solid #4B3A6B',
          display: 'grid',
          placeItems: 'center',
          color: '#FFD27A',
          fontFamily: 'monospace',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        Nyx
      </div>

      {/* Click-through test region — clicking should increment the counter */}
      <div
        data-interactive
        onClick={() => setCount((c) => c + 1)}
        style={{
          position: 'absolute',
          bottom: 14,
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '8px 14px',
          background: '#FFF6CC',
          border: '2px solid #1B1726',
          borderRadius: 10,
          color: '#1B1726',
          fontFamily: 'monospace',
          cursor: 'pointer',
          userSelect: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        click me — click-through test ({count})
      </div>

      <div
        style={{
          position: 'absolute',
          top: 140,
          right: 10,
          color: '#EEEAF7',
          fontFamily: 'monospace',
          fontSize: 12,
          opacity: 0.7,
        }}
      >
        transparent spike
      </div>
    </div>
  )
}
