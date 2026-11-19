import { resolve } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  main: {
    build: {
      rollupOptions: { input: { index: resolve(projectRoot, 'src/main/index.ts') } },
    },
    resolve: {
      alias: { '@shared': resolve(projectRoot, 'src/shared'), '@main': resolve(projectRoot, 'src/main') },
    },
  },
  preload: {
    build: {
      rollupOptions: { input: { index: resolve(projectRoot, 'src/preload/index.ts') } },
    },
    resolve: {
      alias: { '@shared': resolve(projectRoot, 'src/shared'), '@preload': resolve(projectRoot, 'src/preload') },
    },
  },
  renderer: {
    root: resolve(projectRoot, 'src/renderer'),
    build: {
      rollupOptions: { input: { index: resolve(projectRoot, 'src/renderer/index.html') } },
    },
    resolve: {
      alias: {
        '@renderer': resolve(projectRoot, 'src/renderer/src'),
        '@shared': resolve(projectRoot, 'src/shared'),
        '@assets': resolve(projectRoot, 'src/assets'),
      },
    },
    plugins: [react()],
  },
})
