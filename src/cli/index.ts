// nyx CLI — Phase 0: `nyx run <command...>` runs the command and exits with its code.
// App wake-up via the local IPC socket is added in Phase 6.
import { spawn } from 'node:child_process'

function main(): void {
  const args = process.argv.slice(2)
  if (args[0] !== 'run' || args.length < 2) {
    console.error('Usage: nyx run <command> [args...]')
    process.exit(2)
  }

  const [cmd, ...rest] = args.slice(1)
  const child = spawn(cmd, rest, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })

  child.on('exit', (code) => process.exit(code ?? 0))
}

main()
