import { z } from 'zod'

// IPC message schemas (zod), validated at both ends of every trust boundary.

export const RunResultSchema = z.object({
  source: z.literal('cli-run'),
  command: z.string(),
  exitCode: z.number().int(),
  stdout: z.string(),
  stderr: z.string(),
  ts: z.number(),
})
export type RunResult = z.infer<typeof RunResultSchema>

export const NyxActionSchema = z.object({
  action: z.enum(['explain', 'suggest', 'dismiss', 'send', 'open-settings', 'snooze', 'mute']),
  payload: z.unknown().optional(),
})
export type NyxAction = z.infer<typeof NyxActionSchema>

export const StateUpdateSchema = z.object({
  state: z.enum(['sleeping', 'waking', 'helping', 'yawning']),
  context: z.unknown().optional(),
})
export type StateUpdate = z.infer<typeof StateUpdateSchema>
