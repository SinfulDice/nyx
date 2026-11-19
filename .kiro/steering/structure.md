---
inclusion: always
---

# Repository Structure

## Layout
```
kiroween-2026/
  .kiro/
    steering/            product.md, tech.md, structure.md (always-on context)
    specs/nyx-mvp/       requirements.md, design.md, tasks.md
    hooks/               lint-on-save.json, keep-readme-in-sync.json, scripts/
    settings/            (mcp.json only if MCP servers are added)
  src/
    shared/              types + zod schemas + heuristics used by main, preload, renderer, cli
      types.ts           NyxState, WakeEvent, HelpContext, Settings, IPC messages
      protocol.ts        IPC socket message schema (zod)
      heuristics.ts      error/stack-trace regex heuristics (local, no LLM)
    main/                index.ts, window.ts, tray.ts, clipboard-watcher.ts,
                         hotkey.ts, wake-engine.ts, llm-client.ts, settings.ts,
                         ipc-server.ts, triggers/
    preload/             index.ts (contextBridge API + types)
    renderer/
      index.html
      src/
        App.tsx
        mascot/          Nyx.tsx, expressions/*.tsx, animations.css
        bubble/         SpeechBubble.tsx, AskInput.tsx, QuickActions.tsx
        state/          store (zustand)
        api/            ipc client to main
      styles/           tokens.css (palette), fonts/ (VT323)
    assets/             nyx-reference.svg, mascot expression svgs, tray icon
    cli/                index.ts  (the `nyx` CLI: `nyx run <command>`)
  .github/workflows/
    ci.yml               lint + typecheck + unit tests on push
    windows-spike.yml    early Windows .exe build of the window spike (Phase 1)
    build.yml            matrix linux+windows, electron-builder, GH Releases on tag
  electron-builder.yml
  electron.vite.config.ts
  tsconfig.base.json
  package.json           single package; bin: { "nyx": "out/cli/index.js" }
  README.md
  LICENSE                MIT
  .gitignore             (never ignores .kiro/)
```

## Module responsibilities
- **src/shared** — single source of truth for types, the IPC message schema (zod),
  and the local error/stack-trace heuristics. Imported by main, preload, renderer,
  and cli. Never duplicates a shape that lives elsewhere.
- **src/main** — Electron main process (window, tray, clipboard watcher, hotkey,
  wake engine, LLM client, settings, IPC server, triggers).
- **src/preload** — contextBridge API + shared types exposed to the renderer.
- **src/renderer** — React app (mascot, bubble, ask input, state, ipc client).
- **src/cli** — the `nyx` CLI (`nyx run <command>`); spawned standalone, talks to the
  app over the local IPC socket. Built to `out/cli/index.js` and exposed via the
  package `bin` entry.
- **src/assets** — the canonical Nyx reference SVG, derived expression SVGs, tray icon.

## Naming conventions
- Files: kebab-case for modules (`clipboard-watcher.ts`); PascalCase for React
  components (`SpeechBubble.tsx`).
- Exports: default export for React components; named exports for utilities and
  types.
- Identifiers: `NyxState` (union), `WakeEvent`, `HelpContext`, `Settings`.
- IPC channels: `nyx:<direction>:<name>` e.g. `nyx:state:update`, `nyx:action:send`.

## Import patterns
- Shared code is imported via the `@shared/*` path alias:
  `import { NyxState } from '@shared/types'`.
- Within the app: `@main/*`, `@preload/*`, `@renderer/*`, `@assets/*` via
  electron-vite/tsconfig paths.
- No deep relative imports across module boundaries; go through `@shared` or the
  module's own barrel.

## Shared types (canonical)
- `NyxState = 'sleeping' | 'waking' | 'helping' | 'yawning'`
- `WakeEvent = { source: 'cli-run' | 'clipboard' | 'user-click' | 'hotkey'; context: HelpContext }`
- `HelpContext = { kind: 'failed-command' | 'clipboard-error' | 'question'; command?: string; exitCode?: number; output?: string; snippet?: string; question?: string }`
- `Settings` — see `specs/nyx-mvp/design.md` Data Models.
- IPC messages — see `specs/nyx-mvp/design.md` Interfaces.

## IPC protocol location
- Socket path resolved from app userData; the CLI reads it from a well-known
  location (or env var `NYX_SOCKET`) so it can find the running app.

## Asset conventions
- All mascot art is **original, procedural SVG**, derived from the canonical
  reference (`src/assets/nyx-reference.svg`). Palette is fixed:
  body `#2A2238`, wings `#4B3A6B`, eyes `#FFD27A`, inner ears `#F4A6C0`.
- The reference SVG and palette are protected: edits must preserve the palette and
  the original-character rule (no Clippy assets/name/likeness).
- Fonts: VT323 (web font) for the bubble; system stack elsewhere.

## Git & build conventions
- `.kiro/` is committed and **never** gitignored (hackathon requirement).
- LICENSE is MIT.
- README documents install/run for both platforms.
- GitHub Actions produces downloadable builds; tagged releases go to GitHub Releases.
