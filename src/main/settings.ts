import Store from 'electron-store'
import { z } from 'zod'
import { DEFAULT_SETTINGS, type Settings } from '@shared/types'

const SettingsSchema = z.object({
  llm: z.object({
    provider: z.enum(['ollama', 'openai', 'custom']),
    baseURL: z.string(),
    model: z.string(),
    apiKey: z.string().optional(),
  }),
  triggers: z.object({
    clipboard: z.object({ enabled: z.boolean(), pollIntervalMs: z.number().int().positive() }),
    errorPatterns: z.array(z.string()),
  }),
  hotkey: z.string(),
  position: z.object({ edge: z.enum(['top', 'bottom']), corner: z.enum(['left', 'right']) }),
  snoozeUntil: z.number().optional(),
  muted: z.boolean(),
})

// Lazily created: electron-store needs Electron's userData path, available after
// app.whenReady(). Construct via SettingsStore.create() from the main process.
export class SettingsStore {
  private store: Store<Settings>

  constructor() {
    this.store = new Store<Settings>({ defaults: DEFAULT_SETTINGS })
  }

  getAll(): Settings {
    const parsed = SettingsSchema.safeParse(this.store.store)
    return parsed.success ? (parsed.data as Settings) : { ...DEFAULT_SETTINGS }
  }

  get<K extends keyof Settings>(key: K): Settings[K] {
    return this.getAll()[key]
  }

  set<K extends keyof Settings>(key: K, value: Settings[K]): void {
    this.store.set(key, value as unknown)
  }

  patch(partial: Partial<Settings>): void {
    const next = { ...this.getAll(), ...partial }
    const parsed = SettingsSchema.safeParse(next)
    if (parsed.success) this.store.store = parsed.data as Settings
  }
}
