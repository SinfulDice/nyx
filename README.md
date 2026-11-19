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

## Kiro usage

This repo is built with Kiro: steering docs (`.kiro/steering/`), a spec
(`.kiro/specs/nyx-mvp/`), and hooks (`.kiro/hooks/`). See the write-up (Phase 10) for
how the Kiro workflow was used end-to-end.
