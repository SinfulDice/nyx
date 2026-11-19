# Design: Nyx MVP

## Architecture
One package, three cooperating parts:

- **Electron app** — `src/main` + `src/preload` + `src/renderer`. The main process
  owns window lifecycle, the wake state machine, the clipboard watcher, the global
  hotkey, the IPC server, the LLM client, settings, and the tray. The renderer
  (React) renders the mascot and bubble and drives CSS animations from the current
  state.
- **CLI** — `src/cli`, exposed as the `nyx` bin entry. A short-lived Node process:
  spawns the command, captures output/exit code, connects to the app's IPC socket,
  sends a run-result message, then exits with the command's exit code.
- **Shared** — `src/shared`. Types, zod IPC schema, and the local error heuristics
  used by the app and the CLI.

Data flows one way for triggers (CLI/clipboard/hotkey → main → renderer state) and
one way back for user actions (renderer → main → LLM → renderer).

## Components & responsibilities (main process)
- `window.ts` — create the transparent frameless always-on-top window; manage
  click-through via `setIgnoreMouseEvents(true,{forward:true})` toggled by cursor
  position over interactive regions.
- `wake-engine.ts` — the NyxState machine; receives WakeEvents, drives transitions,
  applies snooze/mute gating, enforces timeouts.
- `clipboard-watcher.ts` — polls `clipboard.readText()` at a relaxed interval, diffs,
  debounces, runs the local heuristic, emits clipboard WakeEvents.
- `hotkey.ts` — registers the global shortcut; emits user/hotkey WakeEvents.
- `ipc-server.ts` — listens on a local socket (unix domain socket on Linux, named
  pipe on Windows) and accepts run-result messages from the CLI.
- `llm-client.ts` — OpenAI-compatible client (Ollama default); applies the personality
  system prompt; handles Explain / Suggest fix / Ask requests; reports offline state.
- `settings.ts` — electron-store wrapper with zod-validated schema; exposes provider
  config, triggers, hotkey, position, snooze, mute.
- `tray.ts` — tray icon + menu (Settings, Snooze 15/30/60, Mute, Quit).
- `triggers/cli-run.ts`, `triggers/clipboard.ts`, `triggers/user.ts` — map trigger
  sources to WakeEvents and HelpContext.

## Components & responsibilities (renderer)
- `App.tsx` — subscribes to state from main; renders Nyx + bubble; routes actions.
- `mascot/Nyx.tsx` — renders the procedural SVG for the current expression; applies
  CSS animation classes.
- `mascot/expressions/*` — sleeping, waking, alert, yawning SVG variants.
- `bubble/SpeechBubble.tsx` — cream retro bubble (VT323, tail, border).
- `bubble/QuickActions.tsx` — Explain / Suggest fix / Dismiss (error context) or
  Send / Cancel (ask context).
- `bubble/AskInput.tsx` — the small input shown for direct asks.
- `state/store.ts` — current NyxState + HelpContext + messages.

## Data flow
1. A trigger fires (CLI run result / clipboard match / hotkey / click) → main builds a
   WakeEvent with HelpContext → wake-engine transitions sleeping→waking→helping and
   sends state + context to the renderer.
2. The renderer shows the bubble with a short message. For clipboard/cli errors the
   message is a fixed offer ("Looks like your tests failed. Want me to look?") until
   the user acts; no LLM call yet.
3. The user clicks Explain / Suggest fix / Send → renderer sends the action + context
   to main → llm-client calls the provider → response shown in the bubble.
4. The user clicks Dismiss or a timeout elapses → wake-engine → yawning → sleeping;
   renderer tears down the bubble.

## Interfaces

### IPC (app ↔ cli), local socket, zod-validated
```
RunResult {
  source: 'cli-run',
  command: string,
  exitCode: number,
  stdout: string,        // truncated to N chars
  stderr: string,        // truncated to N chars
  ts: number
}
```
Socket path: app userData on Linux; `\\.\pipe\nyx` on Windows. The CLI finds it via
the `NYX_SOCKET` env var or a well-known file the app writes on start.

### IPC (main ↔ renderer), contextBridge
Channels (all payloads zod-validated in preload):
- `nyx:state:update` (main→renderer): `{ state: NyxState, context: HelpContext|null }`
- `nyx:message` (main→renderer): `{ text: string }`
- `nyx:action` (renderer→main): `{ action: 'explain'|'suggest'|'dismiss'|'send'|'open-settings'|'snooze'|'mute', payload?: unknown }`
- `nyx:settings:get` / `nyx:settings:set`

### LLM (OpenAI-compatible)
POST `{baseURL}/chat/completions` with `{ model, messages:[{role:'system',...},{role:'user',...}], temperature, max_tokens }`.
- Ollama default: `baseURL=http://localhost:11434/v1`, model `qwen2.5-coder:7b`
  (already installed locally for dev).
- Cloud: user-configured `baseURL`, `apiKey`, `model` (OpenAI/Groq/OpenRouter/LM Studio).
- System prompt enforces personality: sleepy/grumpy-but-helpful, ≤2 sentences, bat
  persona, no walls of text.

## Data models
```
NyxState = 'sleeping' | 'waking' | 'helping' | 'yawning'

HelpContext =
  | { kind:'failed-command', command:string, exitCode:number, snippet:string }
  | { kind:'clipboard-error', snippet:string }
  | { kind:'question', question:string, withClipboardContext:boolean }

WakeEvent = { source:'cli-run'|'clipboard'|'user-click'|'hotkey', context:HelpContext }

Settings = {
  llm: { provider:'ollama'|'openai'|'custom', baseURL:string, model:string, apiKey?:string },
  triggers: { clipboard:{ enabled:boolean, pollIntervalMs:number }, errorPatterns:string[] },
  hotkey: string,                       // accelerator, e.g. 'Ctrl+Shift+N'
  position: { edge:'top'|'bottom', corner:'left'|'right' },
  snoozeUntil?: number,                 // epoch ms
  muted: boolean
}
```

## State machine
```
sleeping --(WakeEvent & not snoozed/muted)--> waking
waking   --(animation done)--> helping
helping  --(dismiss / timeout)--> yawning
yawning  --(animation done)--> sleeping
```
Snooze/mute gate all triggers except an explicit user ask. A help timeout (e.g. 20s
after the user's last interaction) returns Nyx to sleep.

## Window & rendering approach (the risky bit)
- One transparent, frameless, always-on-top, skip-taskbar, no-shadow window sized to
  the maximum bubble footprint, anchored top-right by default. Fixed size avoids
  resize jank on Linux.
- Click-through: default the window to `setIgnoreMouseEvents(true,{forward:true})`.
  A full-window transparent overlay tracks `mousemove`; when the cursor is over an
  interactive element (Nyx or bubble) the handler calls
  `setIgnoreMouseEvents(false)`, and re-enables click-through when it leaves. This is
  the standard Electron technique and works reliably on X11/XWayland.
- Anchor & multi-monitor: position relative to the active display's work area; store
  the chosen corner in Settings.

## Cross-platform notes & mitigations
- **Linux Wayland:** default to XWayland (do not set `--ozone-platform=wayland`) so
  transparent/always-on-top/click-through behave like X11. Detect the session; if
  native Wayland is forced and transparency fails, fall back to a small bordered
  window (stretch). Spike on the target machine first (Phase 1).
- **Windows early:** Phase 1 builds a Windows .exe of the window spike via a GitHub
  Actions workflow so transparency, click-through, and always-on-top can be verified
  on Windows 10/11 before building features on top of it.
- **Clipboard:** `clipboard.readText()` on both OSes; poll + diff + debounce. MVP
  watches CLIPBOARD; Linux PRIMARY selection is optional/stretch.
- **Global hotkey:** `globalShortcut` on both; default `Ctrl+Shift+N`; configurable.
- **Socket:** unix domain socket (Linux) vs named pipe (Windows) via Node `net`.

## Error handling
- LLM offline (Ollama not running / cloud unreachable): "brain offline" message +
  Open Settings action; queue nothing.
- LLM call error: friendly inline error + Retry/Dismiss.
- CLI can't reach the app: run the command anyway, exit with its code, print a hint.
- Heuristic false positives: Dismiss; (stretch) remember dismissed patterns.
- Hotkey conflict: Settings surfaces it and asks for another.

## Testing strategy
- **Shared heuristics:** unit tests (vitest) for the error/stack-trace regex against a
  corpus of positive (JS/TS/Python/Go/Rust/Java stack traces, generic `Error:`
  lines, exit-code banners) and negative samples.
- **Wake-engine:** unit tests for state transitions, snooze/mute gating, coalescing.
- **LLM client:** tests against a stubbed OpenAI-compatible endpoint; personality
  prompt length assertion.
- **IPC protocol:** zod round-trip tests for RunResult and action payloads.
- **Manual/visual (documented):** transparency + click-through on X11 and XWayland;
  clipboard detection on Linux + Windows; an end-to-end `nyx run` → wake → explain
  flow with Ollama.
- CI: lint + typecheck + unit tests on every push; packaging builds on tag.

## Mascot design (canonical)
Nyx is an original purple bat. Canonical reference (awake/neutral), to live at
`src/assets/nyx-reference.svg`:

```svg
<svg width="180" height="180" viewBox="0 0 200 200">
  <ellipse cx="100" cy="188" rx="46" ry="6" fill="#000000" opacity="0.35"/>
  <path d="M92 100 Q60 60 16 78 Q28 92 26 110 Q38 102 46 118 Q56 106 66 122 Q76 108 92 120 Z" fill="#4B3A6B"/>
  <path d="M108 100 Q140 60 184 78 Q172 92 174 110 Q162 102 154 118 Q144 106 134 122 Q124 108 108 120 Z" fill="#4B3A6B"/>
  <path d="M72 74 L78 36 L95 64 Z" fill="#2A2238"/>
  <path d="M128 74 L122 36 L105 64 Z" fill="#2A2238"/>
  <path d="M78 66 L80 48 L88 62 Z" fill="#F4A6C0" opacity="0.6"/>
  <path d="M122 66 L120 48 L112 62 Z" fill="#F4A6C0" opacity="0.6"/>
  <ellipse cx="100" cy="104" rx="38" ry="42" fill="#2A2238"/>
  <ellipse cx="100" cy="122" rx="22" ry="20" fill="#3B3150"/>
  <circle cx="86" cy="96" r="12" fill="#FFD27A"/>
  <circle cx="114" cy="96" r="12" fill="#FFD27A"/>
  <ellipse cx="88" cy="98" rx="4" ry="7" fill="#1B1726"/>
  <ellipse cx="116" cy="98" rx="4" ry="7" fill="#1B1726"/>
  <path d="M90 114 Q100 119 110 114" stroke="#EEEAF7" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M94 115 L98 115 L96 122 Z" fill="#FFFFFF"/>
  <path d="M102 115 L106 115 L104 122 Z" fill="#FFFFFF"/>
  <line x1="92" y1="144" x2="90" y2="154" stroke="#2A2238" stroke-width="4" stroke-linecap="round"/>
  <line x1="108" y1="144" x2="110" y2="154" stroke="#2A2238" stroke-width="4" stroke-linecap="round"/>
</svg>
```

Fixed palette: body `#2A2238`, wings `#4B3A6B`, eyes `#FFD27A`, inner ears `#F4A6C0`.
Expressions derived from the reference (same palette, same geometry ratios):
- **sleeping** — upside down (rotated 180° at the anchor edge), eyes closed (lids),
  slow breathing scale, occasional "zzz".
- **waking** — flip upright (rotate 180°→0°), stretch wings (wing path scale), eyes
  open.
- **alert/helping** — eyes open and bright, subtle wing settle, optional ear twitch.
- **yawning** — mouth open (fangs visible), eyes half-closed, then back to sleeping.

Speech bubble: cream `#FFF6CC` background, 2px `#1B1726` border, 10px radius, small
tail pointing to Nyx, VT323 pixel font.

## Animation approach
CSS-only keyframes for idle (breathing, "zzz", blink) using transform/opacity
(GPU-friendly, ~free while sleeping). Transitions between expressions use CSS
transitions on transform/opacity keyed by the `state` prop. No
`requestAnimationFrame` loops while sleeping. Wake/yawn transitions are short
(300–600ms). This keeps sleeping CPU near zero.
