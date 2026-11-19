import { describe, it, expect } from 'vitest'
import { detectErrorLike, outputLooksLikeError } from './heuristics'

describe('detectErrorLike', () => {
  it('detects a JS/TS stack trace', () => {
    expect(
      detectErrorLike('TypeError: Cannot read properties of undefined\n    at foo (bar.js:12:7)').match,
    ).toBe(true)
  })

  it('detects a Python traceback', () => {
    expect(detectErrorLike('Traceback (most recent call last):\n  File "x.py", line 1').match).toBe(true)
  })

  it('detects a Go panic', () => {
    expect(detectErrorLike('panic: runtime error: invalid memory address').match).toBe(true)
  })

  it('ignores normal prose', () => {
    expect(detectErrorLike('Hey, can we ship this on Friday?').match).toBe(false)
  })

  it('ignores empty input', () => {
    expect(detectErrorLike('').match).toBe(false)
  })
})

describe('outputLooksLikeError', () => {
  it('flags stderr with an error', () => {
    expect(outputLooksLikeError('', 'Error: boom')).toBe(true)
  })

  it('ignores clean output', () => {
    expect(outputLooksLikeError('hello world', '')).toBe(false)
  })
})
