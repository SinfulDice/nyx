// Canonical types shared across main, preload, renderer, and the nyx CLI.
// Single source of truth — never duplicate these shapes elsewhere.

export type NyxState = 'sleeping' | 'waking' | 'helping' | 'yawning'

export type HelpContext =
  | { kind: 'failed-command'; command: string; exitCode: number; snippet: string }
  | { kind: 'clipboard-error'; snippet: string }
  | { kind: 'question'; question: string; withClipboardContext: boolean }

export type WakeSource = 'cli-run' | 'clipboard' | 'user-click' | 'hotkey'

export interface WakeEvent {
  source: WakeSource
  context: HelpContext
}

export interface Settings {
  llm: {
    provider: 'ollama' | 'openai' | 'custom'
    baseURL: string
    model: string
    apiKey?: string
  }
  triggers: {
    clipboard: { enabled: boolean; pollIntervalMs: number }
    errorPatterns: string[]
  }
  hotkey: string
  position: { edge: 'top' | 'bottom'; corner: 'left' | 'right' }
  snoozeUntil?: number
  muted: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  llm: {
    provider: 'ollama',
    baseURL: 'http://localhost:11434/v1',
    model: 'qwen2.5-coder:7b',
  },
  triggers: {
    clipboard: { enabled: true, pollIntervalMs: 2000 },
    errorPatterns: [],
  },
  hotkey: 'Ctrl+Shift+N',
  position: { edge: 'top', corner: 'right' },
  muted: false,
}
