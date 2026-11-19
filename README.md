# Nyx

A modern, AI-powered desktop companion — an original purple-bat spiritual successor
to 90s animated desktop assistants, with a Halloween twist. Built for Kiroween 2026.

Nyx sleeps by default and wakes only when it can actually help: a failed `nyx run`
command, an error on your clipboard, or when you summon it with a hotkey or click.

> All mascot art, name, and animations are original. This project uses no Microsoft
> Clippy assets, name, or likeness.

## Status

Pre-alpha. The design and task plan live in `.kiro/specs/nyx-mvp/`. Project guidance
lives in `.kiro/steering/`.

## Install &amp; Run

> Filled in as packaging lands (Phase 9). Until then, dev only.

### Dev

```bash
npm install
npm run dev
```

### CLI (`nyx run`)

```bash
npm run build:cli
./out/cli/index.js run <command>
```

## Troubleshooting

### `npm run dev` says "Error: Electron uninstall" or can't find Electron

The Electron postinstall (which fetches the binary) didn't run — usually because
npm's install-script allowlist went stale after a version bump. Fix it for the
installed version:

```bash
node node_modules/electron/install.js
```

Or reinstall cleanly:

```bash
rm -rf node_modules package-lock.json && npm install
```

## Platform notes

- **Linux / Wayland:** Nyx runs under **XWayland** by default — it does not set
  `--ozone-platform=wayland`. This keeps transparent, always-on-top, and click-through
  behavior consistent with X11. On a Wayland session, run Nyx as usual and it uses
  XWayland automatically. Native Wayland is a stretch goal.
- **Windows:** transparency, always-on-top, and click-through are verified via the
  `windows-spike` GitHub Actions build — trigger it and download the `.exe` artifact.

## Kiro usage

This repo is built with Kiro: steering docs (`.kiro/steering/`), a spec
(`.kiro/specs/nyx-mvp/`), and hooks (`.kiro/hooks/`). See the write-up (Phase 10) for
how the Kiro workflow was used end-to-end.
