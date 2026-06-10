/**
 * Lightweight string-scanning helpers for locating JSX element boundaries.
 * Not a real parser — assumes well-formed JSX and uses the heuristic that a
 * tag-opening "<" is always followed by a letter, "/" (closing tag), or ">"
 * (fragment), which holds for generated landing-page code.
 */

export interface TagEnd {
  /** Index immediately after the tag's closing ">". */
  index: number
  selfClosing: boolean
}

/** Scans from the "<" of a tag to its closing ">", skipping strings and `{}` expressions. */
export function findTagEnd(code: string, start: number): TagEnd {
  let i = start + 1
  let braceDepth = 0
  let inString: string | null = null

  while (i < code.length) {
    const ch = code[i]

    if (inString) {
      if (ch === '\\') {
        i += 2
        continue
      }
      if (ch === inString) inString = null
      i++
      continue
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch
      i++
      continue
    }

    if (ch === '{') {
      braceDepth++
      i++
      continue
    }

    if (ch === '}') {
      braceDepth--
      i++
      continue
    }

    if (ch === '>' && braceDepth === 0) {
      return { index: i + 1, selfClosing: code[i - 1] === '/' }
    }

    i++
  }

  return { index: code.length, selfClosing: false }
}

/**
 * Given the index of a JSX element's opening "<", returns the index
 * immediately after its matching closing tag (or the end of the string).
 */
export function findMatchingTagEnd(code: string, start: number): number {
  let i = start
  let depth = 0
  let inString: string | null = null

  while (i < code.length) {
    const ch = code[i]

    if (inString) {
      if (ch === '\\') {
        i += 2
        continue
      }
      if (ch === inString) inString = null
      i++
      continue
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch
      i++
      continue
    }

    if (ch === '<') {
      const next = code[i + 1]

      if (next === '/') {
        const close = code.indexOf('>', i)
        if (close === -1) return code.length
        depth--
        i = close + 1
        if (depth === 0) return i
        continue
      }

      if (next === '>') {
        // Fragment opening "<>"
        depth++
        i += 2
        continue
      }

      if (next && /[A-Za-z]/.test(next)) {
        const tagEnd = findTagEnd(code, i)
        if (tagEnd.selfClosing) {
          if (depth === 0) return tagEnd.index
          i = tagEnd.index
          continue
        }
        depth++
        i = tagEnd.index
        continue
      }
    }

    i++
  }

  return code.length
}

/** Finds the index of the next JSX element/fragment opening "<" at or after `from`. */
export function findNextJsxElementStart(code: string, from: number): number {
  for (let i = from; i < code.length; i++) {
    if (code[i] !== '<') continue
    const next = code[i + 1]
    if (next === '/') return -1
    if (next === '>' || (next && /[A-Za-z]/.test(next))) return i
  }
  return -1
}
