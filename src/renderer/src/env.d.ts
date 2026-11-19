/// <reference types="vite/client" />

declare global {
  interface Window {
    nyx: {
      version: string
      setInteractive: (interactive: boolean) => void
    }
  }
}

export {}
