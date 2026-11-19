import { contextBridge, ipcRenderer } from 'electron'
import type { Rect } from '@shared/hittest'

// Phase 1: window control API. The renderer reports the rects of interactive
// elements so main can toggle click-through by polling the cursor (cross-platform,
// not relying on forwarded mousemove). The full typed API (state updates, actions,
// settings) is layered in during Phases 5–8.
const nyxApi = {
  version: '0.1.0',
  reportInteractiveRects: (rects: Rect[]): void => ipcRenderer.send('nyx:report-rects', rects),
}

contextBridge.exposeInMainWorld('nyx', nyxApi)

export type NyxApi = typeof nyxApi
