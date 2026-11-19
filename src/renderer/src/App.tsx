import { useEffect, useState } from 'react'

// Phase 1 spike: a transparent, frameless, always-on-top, click-through window.
// - Empty areas are click-through (input reaches the app behind Nyx).
// - [data-interactive] regions (Nyx placeholder + the test button) capture clicks.
// The mousemove handler hit-tests via elementFromPoint and tells the main process
// whether to ignore mouse events.
export default function App() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
      const interactive = !!el?.closest('[data-interactive]')
      window.nyx.setInteractive(interactive)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
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
