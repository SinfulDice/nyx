# Tasks: Nyx MVP

> Review one phase at a time. The risk spikes (Phase 1, Phase 2) come first so the
> riskiest platform behavior is validated before features are built on top of it.
> `[ ]` = not started; mark `[x]` when done. Required vs optional noted per task.

## Cut line
Deadline: **Dec 4, 2:00 PM PT**. Ship the MVP by **Dec 2** to leave time for the demo
video and submission.

**Guaranteed MVP** (ship by Dec 2):
- Phase 0 (all) · Phase 1 (1.1–1.3, 1.5, 1.6) · Phase 2 (2.1–2.4) · Phase 3 (3.1–3.4)
  · Phase 4 (all) · Phase 5 (all) · Phase 6 (6.1–6.4) · Phase 7 (7.1–7.3)
  · Phase 8 (8.1–8.2) · Phase 9 (9.1 AppImage+.exe, 9.2, 9.3, 9.4)
  · Phase 10 (10.1–10.3).

**Stretch goals** — drop in this order if we fall behind (drop #1 first):
1. 1.4 — native Wayland support
2. 10.6 — auto-apply a suggested fix
3. 10.5 — test-runner output trigger
4. 10.4 — log-file watcher trigger
5. 7.4 — remember dismissed clipboard patterns
6. 2.5 — Linux PRIMARY selection
7. 9.1 — .deb build (keep AppImage + .exe)

## Time estimates (rough, solo, ~1 week)
| Phase | Hours |
| --- | --- |
| 0 Foundations | 2–3 |
| 1 Window spike + Windows build | 3–4 |
| 2 Clipboard spike | 2–3 |
| 3 Mascot SVG | 2–3 |
| 4 Wake state machine | 1.5–2 |
| 5 Speech bubble + ask | 2 |
| 6 Triggers | 2–3 |
| 7 LLM | 2 |
| 8 Settings + tray | 1.5 |
| 9 Packaging + release | 2–3 |
| 10 Polish + submission | 3–4 |
| **Total** | **~23–31** |

## Phase 0 — Foundations & tooling (est. 2–3h)
- [ ] 0.1 Initialize a single npm package; add the `nyx` bin entry; create `src/{shared,main,preload,renderer,assets,cli}` folders (required)
  - Expected outcome: `npm install` works; `@shared/*`, `@main/*`, `@renderer/*` path aliases resolve.
  - Dependencies: none
- [ ] 0.2 Scaffold the app with electron-vite (main/preload/renderer) + React + TS strict (required)
  - Expected outcome: `npm run dev` opens an Electron window rendering React "hello".
  - Dependencies: 0.1
- [ ] 0.3 Add ESLint + Prettier + `tsconfig.base` + path aliases; the lint-on-save and keep-readme-in-sync hooks already exist (required)
  - Expected outcome: `npm run lint` and `npm run typecheck` pass; hook files already present and valid JSON.
  - Dependencies: 0.1
- [ ] 0.4 Define shared types + zod schemas in `src/shared` (`NyxState`, `WakeEvent`, `HelpContext`, `Settings`, `RunResult`) (required)
  - Expected outcome: `src/shared` exports validated types; imported by main, preload, renderer, cli.
  - Dependencies: 0.1
- [ ] 0.5 Add electron-store settings wrapper with zod validation (required)
  - Expected outcome: settings read/write/validate; defaults applied.
  - Dependencies: 0.2, 0.4
- [ ] 0.6 Add CI workflow: lint + typecheck + unit tests on every push (required)
  - Expected outcome: CI runs green on push; no packaging yet.
  - Dependencies: 0.2, 0.4

## Phase 1 — RISK SPIKE: transparent always-on-top click-through window (est. 3–4h)
- [ ] 1.1 Create a transparent, frameless, always-on-top, skip-taskbar, no-shadow window anchored top-right (required)
  - Expected outcome: on X11 (Mint), a transparent window sits on top of other apps.
  - Dependencies: 0.2
- [ ] 1.2 Implement click-through with interactive regions via `setIgnoreMouseEvents(true,{forward:true})` toggled by cursor position (required)
  - Expected outcome: clicks pass through empty areas; clicks on a test "hit" region register.
  - Dependencies: 1.1
- [ ] 1.3 Verify under XWayland; document the XWayland default (required)
  - Expected outcome: behavior confirmed under XWayland; README notes it.
  - Dependencies: 1.2
- [ ] 1.4 (stretch) Attempt native Wayland (`--ozone-platform=wayland`); record results (optional)
  - Expected outcome: known-good/known-bad matrix per compositor; fallback decided.
  - Dependencies: 1.3
- [ ] 1.5 Verify transparency + click-through + always-on-top on Windows (required)
  - Expected outcome: the Windows .exe from 1.6 behaves correctly on Windows 10/11.
  - Dependencies: 1.6
- [ ] 1.6 Add a minimal electron-builder win (NSIS) target + a GitHub Actions workflow (`windows-spike.yml`) that builds a Windows .exe of the current window spike and uploads it as an artifact (required)
  - Expected outcome: a downloadable .exe artifact in the workflow run; runs on Windows.
  - Dependencies: 1.2

## Phase 2 — RISK SPIKE: cross-platform clipboard watching (est. 2–3h)
- [ ] 2.1 Implement clipboard polling + diff + debounce (required)
  - Expected outcome: only genuinely new clipboard text triggers, at a relaxed interval.
  - Dependencies: 0.4
- [ ] 2.2 Implement local error/stack-trace heuristics with unit tests (required)
  - Expected outcome: a corpus of positive (JS/TS/Python/Go/Rust/Java/generic) and negative samples pass/fail correctly; zero LLM calls.
  - Dependencies: 0.4
- [ ] 2.3 Emit clipboard WakeEvent; gate by Settings + snooze/mute (required)
  - Expected outcome: a copied stack trace wakes Nyx; disabled/snoozed/muted does not.
  - Dependencies: 2.1, 2.2, 0.5
- [ ] 2.4 Verify on Linux (X11) and Windows (required)
  - Expected outcome: clipboard detection works on both; content never leaves the machine until an explicit action.
  - Dependencies: 2.3
- [ ] 2.5 (stretch) Watch Linux PRIMARY selection (optional)
  - Dependencies: 2.4

## Phase 3 — Mascot SVG & expressions (est. 2–3h)
- [ ] 3.1 Save the canonical reference SVG to `src/assets/nyx-reference.svg` (required)
  - Expected outcome: reference committed; palette documented in `tokens.css`.
  - Dependencies: 0.2
- [ ] 3.2 Build `Nyx.tsx` rendering the reference expression (required)
  - Expected outcome: the awake/neutral bat renders in the transparent window.
  - Dependencies: 1.1, 3.1
- [ ] 3.3 Derive sleeping (upside-down, eyes closed), waking, alert, yawning expressions (required)
  - Expected outcome: four expressions, same palette/geometry ratios.
  - Dependencies: 3.2
- [ ] 3.4 CSS animations: breathing + "zzz" (sleeping), flip + wing stretch (waking), yawn (optional twitch) (required)
  - Expected outcome: smooth transitions; no JS loops while sleeping.
  - Dependencies: 3.3

## Phase 4 — Wake state machine (est. 1.5–2h)
- [ ] 4.1 Implement `NyxState` transitions sleeping→waking→helping→yawning→sleeping (required)
  - Expected outcome: unit tests cover all transitions; invalid ones rejected.
  - Dependencies: 0.4
- [ ] 4.2 Apply snooze/mute gating and help timeout (required)
  - Expected outcome: snoozed/muted blocks triggers (except explicit ask); timeout returns to sleep.
  - Dependencies: 4.1, 0.5
- [ ] 4.3 Coalesce rapid triggers; keep most recent context (required)
  - Expected outcome: a burst of triggers produces one wake with the latest context.
  - Dependencies: 4.1
- [ ] 4.4 Wire state to renderer; idle sleeping uses near-zero CPU (required)
  - Expected outcome: profiler shows no JS timers while asleep beyond the clipboard poll.
  - Dependencies: 3.4, 4.1

## Phase 5 — Speech bubble & ask input (est. 2h)
- [ ] 5.1 `SpeechBubble.tsx`: cream `#FFF6CC`, 2px `#1B1726` border, 10px radius, tail, VT323 (required)
  - Expected outcome: bubble renders in the window; tail points at Nyx.
  - Dependencies: 1.2, 3.2
- [ ] 5.2 `QuickActions.tsx`: Explain / Suggest fix / Dismiss (error) and Send / Cancel (ask) (required)
  - Expected outcome: actions emit `nyx:action` to main; keyboard-reachable.
  - Dependencies: 5.1, 0.4
- [ ] 5.3 `AskInput.tsx`: small input for direct questions (required)
  - Expected outcome: submit sends a question HelpContext to main.
  - Dependencies: 5.1

## Phase 6 — Triggers (est. 2–3h)
- [ ] 6.1 `globalShortcut` default `Ctrl+Shift+N` (configurable); click → ask mode (required)
  - Expected outcome: hotkey/click opens the ask input; conflicts reported in Settings.
  - Dependencies: 4.1, 5.3
- [ ] 6.2 IPC server (unix socket / named pipe) in main (required)
  - Expected outcome: accepts connections; validates `RunResult` with zod.
  - Dependencies: 0.4
- [ ] 6.3 `nyx` CLI: `nyx run <command>` spawns, captures, sends `RunResult`, exits with code (required)
  - Expected outcome: a failed `nyx run` wakes Nyx; app-down still runs the command.
  - Dependencies: 6.2
- [ ] 6.4 Wire the clipboard WakeEvent from Phase 2 into the state machine (required)
  - Expected outcome: a copied error → Nyx offers help, no LLM call yet.
  - Dependencies: 2.3, 4.1

## Phase 7 — LLM client (est. 2h; Ollama already running with qwen2.5-coder:7b)
- [ ] 7.1 OpenAI-compatible client (Ollama default, model `qwen2.5-coder:7b`), personality system prompt (required)
  - Expected outcome: Explain/Suggest/Send returns a short (≤2-sentence) message.
  - Dependencies: 0.5, 5.2
- [ ] 7.2 Graceful offline state ("brain offline") + Open Settings (required)
  - Expected outcome: no Ollama/key → friendly message, no crash.
  - Dependencies: 7.1
- [ ] 7.3 LLM error handling: inline error + Retry/Dismiss (required)
  - Expected outcome: a failed call shows a friendly error.
  - Dependencies: 7.1
- [ ] 7.4 (stretch) Remember dismissed clipboard patterns to reduce noise (optional)
  - Dependencies: 2.3, 7.1

## Phase 8 — Settings window & tray (est. 1.5h)
- [ ] 8.1 Settings window: provider, clipboard toggle, hotkey, corner, snooze, mute (required)
  - Expected outcome: changes persist via electron-store and take effect live.
  - Dependencies: 0.5, 7.1
- [ ] 8.2 Tray icon + menu: Settings, Snooze 15/30/60, Mute, Quit (required)
  - Expected outcome: menu actions work; left-click wakes Nyx.
  - Dependencies: 8.1, 4.1

## Phase 9 — Packaging & release (est. 2–3h)
- [ ] 9.1 Configure electron-builder: AppImage (Linux) + NSIS .exe (Windows); .deb is the first cut if behind (required)
  - Expected outcome: local `npm run dist` produces AppImage + .exe.
  - Dependencies: all app phases
- [ ] 9.2 GitHub Actions matrix (linux+windows) builds + upload artifacts; publish to Releases on tag (required)
  - Expected outcome: a tag produces downloadable builds in GitHub Releases.
  - Dependencies: 9.1, 0.6, 1.6
- [ ] 9.3 Smoke-test the produced builds on Linux + Windows (required)
  - Expected outcome: the downloaded AppImage/.exe launch and the core flow works.
  - Dependencies: 9.2
- [ ] 9.4 Install/run instructions in README; LICENSE (MIT); `.kiro/` committed and never gitignored (required)
  - Expected outcome: README covers both OSes; `.kiro/` is not gitignored.
  - Dependencies: 9.1

## Phase 10 — Polish & submission (est. 3–4h)
- [ ] 10.1 Tighten animation timing and personality copy (required)
  - Expected outcome: wake/yawn feel snappy; messages stay short and in-voice.
  - Dependencies: 3.4, 7.1
- [ ] 10.2 Demo video <3 min: sleep→wake→help→sleep, covering clipboard + CLI + ask (required)
  - Expected outcome: a single video covers the three triggers and the retro UI.
  - Dependencies: 9.3
- [ ] 10.3 Write-up: how Kiro was used (steering/spec/hooks) (required)
  - Expected outcome: a short doc in the repo describing the Kiro workflow.
  - Dependencies: all
- [ ] 10.4 (stretch) Log-file watcher trigger (optional)
- [ ] 10.5 (stretch) Test-runner output trigger (optional)
- [ ] 10.6 (stretch) Auto-apply a suggested fix (optional)
