# Spec: Nyx MVP

## Introduction
Nyx is a desktop companion — an original purple-bat spiritual successor to 90s
animated assistants — that sleeps by default and wakes only on meaningful events to
offer short, contextual, LLM-generated help. This spec covers the MVP: five behavior
states, three wake-up triggers, a local-first OpenAI-compatible LLM, a retro speech
bubble UI, and cross-platform builds for Linux (Mint 22, X11/Wayland) and Windows.

The MVP must demonstrate real Kiro usage (steering, spec, hooks) and ship as a public
MIT repo with downloadable builds via GitHub Actions, a <3 min demo video, and a
Kiro-usage write-up.

## User stories

### Sleeping companion
As a developer, I want Nyx to hang asleep at the edge of my screen and use almost no
resources, so it stays out of my way until it's useful.
Acceptance: Nyx is asleep by default, animated (slow breath, occasional "zzz"), and
the process uses near-zero CPU with no LLM calls while asleep.

### Wake on a failed command
As a developer, when a command I run via `nyx run` fails, I want Nyx to wake and
offer to explain or suggest a fix, so I get a quick nudge without context-switching.
Acceptance: `nyx run <cmd>` runs the command and reports its exit code and output to
Nyx; Nyx wakes on non-zero exit or error output and shows a contextual message with
Explain / Suggest fix / Dismiss actions.

### Wake on a copied error
As a developer, when I copy a stack trace or error, I want Nyx to notice and offer
help, without sending my clipboard anywhere automatically.
Acceptance: Nyx locally detects error/stack-trace patterns in the clipboard, wakes,
and offers help; clipboard content is sent to an LLM only after I click Explain or
Suggest fix.

### Ask Nyx directly
As a developer, I want to click Nyx or press a hotkey to ask a question in a small
input, so I can get a quick answer without opening a browser.
Acceptance: clicking Nyx or pressing the global hotkey opens an ask input in the
bubble; submitting sends my question (optionally with clipboard context) to the LLM.

### Snooze / mute
As a user, I want to snooze Nyx for X minutes or mute it entirely, so it never
becomes naggy.
Acceptance: tray menu and a setting let me snooze (15/30/60 min) or mute; while
snoozed/muted, no wake-ups except an explicit ask.

### Local-first privacy
As a privacy-conscious user, I want the LLM to be local by default and my clipboard
never sent anywhere without consent.
Acceptance: Ollama is the default provider; cloud is optional and requires a key I
configure; clipboard content leaves the machine only via an explicit action and only
if I've configured a cloud provider.

### Installable builds
As a judge/user, I want a downloadable build for my OS that just runs.
Acceptance: GitHub Releases contains an AppImage/.deb (Linux) and an .exe (Windows)
produced by GitHub Actions; README has install/run instructions.

## Functional requirements (EARS)

### Windowing & transparency
WHEN Nyx starts
THE SYSTEM SHALL create a single transparent, frameless, always-on-top, skip-taskbar
window anchored to a configurable screen corner

WHEN the cursor is not over Nyx or the speech bubble
THE SYSTEM SHALL make the window click-through so input reaches the app beneath

WHEN the cursor is over Nyx or the speech bubble
THE SYSTEM SHALL capture pointer events on those regions only

### Behavior states
WHEN Nyx is idle
THE SYSTEM SHALL render the sleeping state with eyes closed and a slow breathing
animation, using near-zero CPU and no LLM calls

WHEN a meaningful event occurs
THE SYSTEM SHALL transition to waking, then to helping

WHEN the user dismisses the bubble or a help timeout elapses
THE SYSTEM SHALL transition to yawning and then back to sleeping

### Trigger: failed command
WHEN the user runs `nyx run <command>`
THE SYSTEM SHALL run the command and capture its stdout, stderr, and exit code

WHEN the command exits non-zero or its output matches the error heuristic
THE SYSTEM SHALL wake Nyx with a failed-command HelpContext

WHEN the command exits zero with no error output
THE SYSTEM SHALL NOT wake Nyx

WHEN the app is not running
THE `nyx` CLI SHALL still run the command and exit with the command's exit code

### Trigger: clipboard
WHEN clipboard watching is enabled and the clipboard changes to content matching the
local error heuristic
THE SYSTEM SHALL wake Nyx with a clipboard-error HelpContext and offer help

WHEN Nyx offers clipboard help
THE SYSTEM SHALL NOT send clipboard content to any LLM until the user clicks Explain
or Suggest fix

WHEN clipboard watching is disabled or Nyx is snoozed/muted
THE SYSTEM SHALL NOT wake from clipboard changes

### Trigger: direct ask
WHEN the user clicks Nyx or presses the global hotkey
THE SYSTEM SHALL open the ask input in the speech bubble

WHEN the user submits a question
THE SYSTEM SHALL send it to the configured LLM and show the response in the bubble

### LLM
WHEN Nyx is awake and the user requests help or asks a question
THE SYSTEM SHALL call the configured OpenAI-compatible provider (Ollama by default)

WHEN no LLM provider is reachable
THE SYSTEM SHALL show a "brain offline" message and offer to open Settings

WHEN an LLM call fails
THE SYSTEM SHALL show a friendly error with Retry and Dismiss

WHEN generating a message
THE SYSTEM SHALL apply the personality system prompt (short, sleepy/grumpy-but-helpful,
≈2 sentences max)

### Settings & tray
WHEN the user opens Settings
THE SYSTEM SHALL let them configure provider (baseURL, model, apiKey), enable/disable
clipboard watching, set the hotkey, choose the screen corner, snooze, and mute

WHEN the user opens the tray menu
THE SYSTEM SHALL offer Settings, Snooze (15/30/60 min), Mute, and Quit

### Packaging & release
WHEN a build runs in CI
THE SYSTEM SHALL produce AppImage and .deb for Linux and an NSIS .exe for Windows

WHEN a tag is pushed
THE SYSTEM SHALL publish the builds to GitHub Releases

## Non-functional requirements
- **Performance:** sleeping state uses near-zero CPU (no JS polling loops except
  relaxed clipboard polling ≈2s; CSS-only idle animations; no LLM calls while
  asleep).
- **Privacy:** no telemetry; local LLM default; clipboard never leaves the machine
  without explicit action; cloud requires user-configured key.
- **Cross-platform:** runs on Linux Mint 22 (X11 and via XWayland; native Wayland
  stretch) and Windows 10/11.
- **Originality:** no Microsoft Clippy assets, name, likeness, or animations. All art
  is original procedural SVG.
- **Accessibility:** bubble text is selectable; actions are keyboard-reachable; the
  window does not trap focus.
- **Packaging:** builds produced and published by GitHub Actions; `.kiro/` committed
  and never gitignored; MIT license; README with install/run instructions.

## Edge cases & error handling
- Ollama not installed/running → "brain offline" message + open Settings.
- Cloud key missing → fall back to local or show "brain offline".
- IPC socket unavailable (app not running) → CLI still runs the command and exits with
  its code; prints a one-line hint.
- Clipboard heuristic false positives → user can Dismiss; repeated dismissals of the
  same pattern are remembered (stretch) to reduce noise.
- Hotkey conflict → Settings reports the conflict and asks for another.
- Multiple rapid triggers → debounce/coalesce; Nyx shows the most recent context.
- Wayland compositor without XWayland transparency → fall back to a bordered window
  (stretch) or instruct the user to run under XWayland.
