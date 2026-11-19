// Local, LLM-free heuristics for detecting error/stack-trace-like text (clipboard
// or command output). Cheap regex set; no network. A positive match only means Nyx
// OFFERS help — the content is sent to an LLM only after an explicit user action.
// This is a starter set; Phase 2.2 expands it against a fuller corpus.

const POSITIVE_PATTERNS: RegExp[] = [
  /\bError:\s.+/, // generic "Error: ..."
  /\bTraceback \(most recent call last\):/, // Python
  /\bat .+:\d+:\d+/, // JS/TS "at file:line:col"
  /\bat .+\(.+:\d+:\d+\)/, // JS/TS "at fn (file:line:col)"
  /\bCaused by:\s/, // Java / Android
  /\bException in thread\b/, // Java
  /\bpanic:\s/, // Go / Rust panic
  /\bgoroutine \d+ \[.+\]:/, // Go
  /\bthread '.+' panicked at/, // Rust
  /\bjava\..+Exception\b/, // Java exception class
  /\bSyntaxError:/,
  /\bTypeError:/,
  /\bReferenceError:/,
]

export interface HeuristicResult {
  match: boolean
  pattern?: string
}

export function detectErrorLike(text: string): HeuristicResult {
  const sample = text.slice(0, 4000) // only scan a prefix
  for (const re of POSITIVE_PATTERNS) {
    if (re.test(sample)) {
      return { match: true, pattern: re.source }
    }
  }
  return { match: false }
}

// Used by the `nyx run` trigger: even on a zero exit, some tools print errors to
// stdout. Decide whether captured output looks like an error.
export function outputLooksLikeError(stdout: string, stderr: string): boolean {
  return detectErrorLike(stderr).match || detectErrorLike(stdout).match
}
