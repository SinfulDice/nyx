---
inclusion: always
---

# Product: Nyx

## Vision
Nyx is a modern, AI-powered desktop companion — a spiritual successor to the 90s
animated Office assistants, with a Halloween twist. Where those assistants were
intrusive and always-on, Nyx is the opposite: it sleeps by default and only wakes
when it can actually help.

Nyx is a small purple bat with big yellow eyes and tiny fangs. It hangs upside
down at the edge of your screen and dozes. When something goes wrong — a command
fails, an error lands on your clipboard, or you summon it — it flips upright, opens
its eyes, and offers a short, useful nudge in a retro speech bubble.

## Resurrection angle (hackathon category)
Category: **Resurrection** — revive an obsolete technology using modern innovations.

The obsolete technology being resurrected is the **90s animated desktop assistant**
(Clippy, Rover, the Office Helpers). We are resurrecting the *concept*, not any
existing product: Nyx is an original character with original art, name, and
animations. The modern innovation is the inversion of the core premise — a desktop
assistant that is dormant by default and powered by a local LLM, waking only on
meaningful events instead of nagging on every blank line.

## Target users
- Solo developers and small teams on Linux (Mint 22, X11/Wayland) and Windows who
  want a lightweight, low-noise helper that stays out of the way.
- People who find 90s desktop assistants nostalgic and want a polished, on-theme
  (Halloween) reinterpretation.

Primary user for MVP scope: a solo developer running tests/builds and copying stack
traces, who wants quick, contextual nudges without leaving the flow.

## Behavior states
Nyx is a small finite-state machine:

- **Sleeping** — hangs upside down at the screen edge, eyes closed, slow breathing
  animation, occasional "zzz". Near-zero CPU, no LLM calls. This is the default.
- **Waking** — triggered by a meaningful event. Nyx opens its eyes, stretches its
  wings, flips upright. Brief transition animation.
- **Helping** — a retro speech bubble appears (cream `#FFF6CC` background, 2px
  `#1B1726` border, 10px radius, small tail, VT323 pixel font) with a short
  contextual, LLM-generated message and 2–3 quick actions (Explain, Suggest fix,
  Dismiss; in ask mode: Send, Cancel).
- **Yawning** — after Dismiss or a timeout, Nyx yawns and goes back to sleep.
- **Snooze / Mute** — the user can put Nyx to sleep for X minutes or mute it entirely.

## Wake-up triggers (MVP)
1. `nyx run <command>` CLI wrapper — runs the command, captures output, wakes Nyx if
   it fails (non-zero exit) or produces error output.
2. Clipboard watcher — when clipboard contents match a cheap local error/stack-trace
   heuristic, Nyx wakes and *offers* help. Clipboard content is never sent to any LLM
   until the user clicks Explain or Suggest fix.
3. User click on Nyx or a global hotkey — opens an "ask" input in the bubble so the
   user can ask a question directly.

Stretch (if time allows): watching a log file or a test runner's output.

## Personality
Sleepy, slightly grumpy at being woken up, but genuinely helpful and funny. Short
messages only — never walls of text. Enforced by the LLM system prompt (≈2 sentences
max).

## Privacy stance (important for judges)
- Default LLM is **local** via Ollama. Nothing leaves the machine by default.
- Clipboard detection is a **local regex/heuristic only**, debounced, with zero LLM
  calls. Nyx just decides whether to wake and offer.
- Clipboard content is sent to an LLM **only after an explicit user action**
  (Explain / Suggest fix). With Ollama this stays on-device; with a cloud provider it
  is the user's explicit choice, configured in Settings.
- Clipboard watching can be disabled or snoozed at any time.

## MVP scope
A polished, working core: one character, five states, three triggers, local-first
LLM, retro bubble UI, cross-platform builds (Linux AppImage/.deb, Windows .exe),
packaged and released via GitHub Actions. See the spec for the full breakdown.

## Non-goals (MVP)
- No auto-applying fixes into other apps (read-only suggestions only: display, copy
  to clipboard, optionally open in editor). Auto-apply is a stretch, not MVP.
- No voice, no audio TTS, no AR/3D.
- No cloud account requirement — cloud LLM is optional.
- No native Wayland transparency as a hard requirement (we target XWayland for
  reliable transparent/click-through; native Wayland is a stretch).
- No telemetry or any data collection.
- No use of any Microsoft Clippy assets, name, likeness, or animations. Nyx is
  original.

## Success criteria (aligned to judging, equal weight)
- **Potential Impact** — a low-noise, privacy-respecting reboot of a beloved UX
  pattern, local-first.
- **Technological Implementation** — reliable transparent always-on-top window +
  cross-platform clipboard + local LLM, packaged builds that actually run.
- **Design** — a polished, complete product: coherent mascot, retro bubble, smooth
  idle animation, personality.
- **Innovation** — the inversion (sleeps until useful) + local-first privacy.
- **Presentation** — <3 min demo video + write-up of how Kiro was used.
