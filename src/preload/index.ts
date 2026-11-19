import { contextBridge } from 'electron'

// Phase 0: minimal bridge. The full typed API (state updates, actions, settings)
// is layered in during Phases 5–8.
const nyxApi = {
  version: '0.1.0',
}

contextBridge.exposeInMainWorld('nyx', nyxApi)

export type NyxApi = typeof nyxApi
