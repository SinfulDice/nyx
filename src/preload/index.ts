import { contextBridge, ipcRenderer } from 'electron'

// Phase 1: window control API. The full typed API (state updates, actions, settings)
// is layered in during Phases 5–8.
const nyxApi = {
  version: '0.1.0',
  // Tell main whether the cursor is over an interactive region (Nyx/bubble) so it can
  // toggle click-through. interactive=true => capture clicks; false => click-through.
  setInteractive: (interactive: boolean): void => ipcRenderer.send('nyx:set-interactive', interactive),
}

contextBridge.exposeInMainWorld('nyx', nyxApi)

export type NyxApi = typeof nyxApi
