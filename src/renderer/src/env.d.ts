/// <reference types="vite/client" />

declare global {
  interface Window {
    nyx: {
      version: string
      reportInteractiveRects: (rects: { x: number; y: number; width: number; height: number }[]) => void
    }
  }
}

export {}
