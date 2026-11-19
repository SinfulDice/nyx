#!/usr/bin/env node
// Lint & format a .ts/.tsx file that Kiro just saved.
//
// Reads the FileSave hook event JSON on STDIN, extracts the saved file path
// (the exact field name is not documented, so we check several), and runs the
// project's LOCAL eslint --fix and prettier --write on it.
//
// Best-effort and non-blocking: if a tool is not installed yet, we skip it; if
// anything fails, we exit 0 so the hook never blocks a save.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const PATH_KEYS = ['file_path', 'filePath', 'path'];

function readStdin() {
  return new Promise((resolvePromise) => {
    if (process.stdin.isTTY) return resolvePromise('');
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (c) => (data += c));
    process.stdin.on('end', () => resolvePromise(data));
    // Don't hang if STDIN is never closed for some reason.
    setTimeout(() => resolvePromise(data), 2000);
  });
}

function findPath(obj) {
  if (!obj || typeof obj !== 'object') return null;
  for (const k of PATH_KEYS) {
    if (typeof obj[k] === 'string' && obj[k]) return obj[k];
  }
  if (obj.tool_input && typeof obj.tool_input === 'object') {
    for (const k of PATH_KEYS) {
      if (typeof obj.tool_input[k] === 'string' && obj.tool_input[k]) return obj.tool_input[k];
    }
  }
  return null;
}

async function main() {
  let raw = '';
  try {
    raw = await readStdin();
  } catch {
    raw = '';
  }

  let event = {};
  try {
    event = JSON.parse(raw || '{}');
  } catch {
    event = {};
  }

  const file = process.env.FILE_PATH || findPath(event);
  if (!file) process.exit(0);
  if (!/\.(ts|tsx)$/.test(file)) process.exit(0);

  const tools = [
    { bin: 'eslint', args: ['--fix', file] },
    { bin: 'prettier', args: ['--write', file] },
  ];

  for (const { bin, args } of tools) {
    const local = resolve('node_modules/.bin', bin);
    if (!existsSync(local)) continue; // tool not installed yet (pre-Phase 0.3)
    try {
      spawnSync(local, args, { stdio: 'ignore', timeout: 30000 });
    } catch {
      // ignore — never block the save
    }
  }
  process.exit(0);
}

main().catch(() => process.exit(0));
