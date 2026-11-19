---
inclusion: always
---

# Technology Stack

## Stack summary
Electron + React + TypeScript, packaged with electron-builder, bundled with
electron-vite. A separate `nyx` CLI talks to the running app over a local IPC
socket. LLM access is OpenAI-compatible, defaulting to a local Ollama instance.

## Languages & runtimes
- TypeScript (strict) for app, preload, renderer, and CLI.
- Electron (latest stable) main + renderer process model.
- Node 20+ LTS for tooling (the author's machine has Node 24; Electron ships its own
  runtime).
- React 18 for the renderer.

## Frameworks & libraries
- **electron-vite** — Vite-based build for main/preload/renderer + HMR in dev.
- **electron-builder** — packaging to AppImage/.deb (Linux) and NSIS .exe (Windows),
  with GitHub Releases publishing config.
- **electron-store** — typed settings persistence in OS userData.
- **React 18** + a minimal state approach (zustand or React context) in the renderer.
- **zod** — validate IPC payloads and settings at trust boundaries.
- **openai** (npm) pointed at a configurable baseURL — one client covers Ollama's
  OpenAI-compatible endpoint, OpenAI, Groq, OpenRouter, LM Studio, etc.
- **VT323** font (web font) for the retro bubble.
- No heavy UI framework; the bubble and mascot are bespoke SVG + CSS.

## Build & packaging
- Dev: `npm run dev` (electron-vite) — main + renderer HMR.
- Build: `npm run build` (electron-vite bundles), then `npm run dist` (electron-builder
  produces AppImage/.deb/.exe).
- CI: GitHub Actions matrix (ubuntu-latest, windows-latest) builds and uploads
  artifacts; tagged pushes publish to GitHub Releases.
- The `nyx` CLI is a separate package (`packages/cli`) built with tsup; install for
  demo via `npm install -g .` from the repo.

## Cross-platform constraints
- Targets: Linux Mint 22 (X11 and Wayland) and Windows 10/11.
- **Linux/Wayland:** Electron's native Wayland (`--ozone-platform=wayland`) has
  inconsistent transparent + always-on-top + click-through support across compositors
  (Mutter, KWin, wlroots). Default to running under **XWayland** (omit the ozone flag)
  so the window behaves like X11. Native Wayland is a stretch goal.
- **Clipboard:** Electron `clipboard.readText()` works on both OSes (CLIPBOARD
  selection). On Linux the PRIMARY selection is optionally watchable via
  `clipboard.readText('selection')`; MVP watches CLIPBOARD only.
- **Global shortcut:** Electron `globalShortcut` works on both platforms. Default
  `Ctrl+Shift+N`, configurable.
- **Paths & userData:** electron-store handles OS-correct locations.
- **Packaging:** AppImage + .deb for Linux, NSIS .exe for Windows.

## The risky bits (validate early — see spec Phase 1 & 2)
1. Transparent, frameless, always-on-top window with region click-through on Linux.
   Mitigation: a single fixed-size transparent window; `setIgnoreMouseEvents(true,
   {forward:true})` toggled by mouse position over interactive regions; default to
   XWayland. Spike this before building features on top of it.
2. Cross-platform clipboard watching with change detection + debounce and a local
   error heuristic. Spike on Linux + Windows before wiring it to the state machine.

## IPC protocol (shared)
A local socket the app listens on; the `nyx` CLI connects and sends run results.
- Linux: unix domain socket in userData.
- Windows: named pipe `\\.\pipe\nyx`.
- The shared message schema lives in `packages/shared` and is validated with zod at
  both ends.

## Conventions
- Strict TypeScript; `noImplicitAny`, explicit return types on public APIs.
- ESM where the toolchain allows; CommonJS only where Electron/main requires.
- All IPC and settings shapes are defined once in `packages/shared`, imported by app,
  preload, and CLI — never duplicated.
- Code style enforced by ESLint + Prettier (the lint-on-save hook applies it to
  agent-written files).
- Commits conventional-ish; the branch model is simple (main + feature branches).

## Performance & idle budget
- Sleeping state must be ~near-zero CPU. Achieved by: no JS polling loops while idle
  except clipboard polling at a relaxed interval (≈2s, negligible), and CSS-only
  animations (GPU-accelerated transforms/opacity) for breathing. No
  `requestAnimationFrame` loops while sleeping.
- The LLM is called only when awake and only after an explicit user action (Explain /
  Suggest fix / Send) or when the user explicitly asks.

## Key dependencies (versions pinned at scaffold time)
| Concern | Library |
| --- | --- |
| App shell | electron |
| Build | electron-vite, vite |
| Package | electron-builder |
| Settings | electron-store |
| Renderer | react |
| Validation | zod |
| LLM client | openai |
| CLI build | tsup |
