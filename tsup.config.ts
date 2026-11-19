import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/cli/index.ts'],
  format: ['esm'],
  target: 'es2022',
  outDir: 'out/cli',
  clean: true,
  platform: 'node',
  banner: { js: '#!/usr/bin/env node' },
})
