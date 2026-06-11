import { z } from 'zod'

import { getProvider } from '@/lib/providers'
import type { ChatMessage } from '@/lib/providers/types'

/**
 * Fault-tolerant structured-output layer for agent LLM calls.
 *
 * Known failure modes (observed live with gpt-4.1-mini):
 * - annotated array values: `"#1a1a1a" (dark text),` ← most common
 * - markdown fences / leading prose around the JSON
 * - trailing commas
 * - truncated output (unbalanced braces)
 *
 * The pipeline: extract (balanced scan) → parse → repair → reparse →
 * Zod safeParse → retry with error feedback → typed fallback. It never
 * throws — a malformed model response must never kill an agent run.
 */

const LOG_HEAD_CHARS = 2_000
const LOG_TAIL_CHARS = 400

function excerpt(text: string): string {
  if (text.length <= LOG_HEAD_CHARS + LOG_TAIL_CHARS) return text
  return `${text.slice(0, LOG_HEAD_CHARS)}\n… [${text.length - LOG_HEAD_CHARS - LOG_TAIL_CHARS} chars omitted] …\n${text.slice(-LOG_TAIL_CHARS)}`
}

/**
 * Finds the first complete JSON object/array via a string-aware balanced
 * scan. If the payload is truncated, trims the dangling token and
 * auto-closes the open braces/brackets.
 */
export function extractJsonBlock(raw: string, kind: 'object' | 'array' = 'object'): string {
  const withoutFences = raw.replace(/```[a-z]*\n?/gi, '')
  const startChar = kind === 'object' ? '{' : '['
  const start = withoutFences.indexOf(startChar)
  if (start === -1) return withoutFences.trim()

  const stack: string[] = []
  let inString = false
  let escaped = false

  for (let i = start; i < withoutFences.length; i++) {
    const char = withoutFences[i]

    if (inString) {
      if (escaped) escaped = false
      else if (char === '\\') escaped = true
      else if (char === '"') inString = false
      continue
    }

    if (char === '"') inString = true
    else if (char === '{') stack.push('}')
    else if (char === '[') stack.push(']')
    else if (char === '}' || char === ']') {
      stack.pop()
      if (stack.length === 0) return withoutFences.slice(start, i + 1)
    }
  }

  // Truncated: drop any dangling partial token, then close what's open.
  let body = withoutFences.slice(start).trimEnd()
  if (inString) body += '"'
  body = body.replace(/,\s*(?:"[^"]*)?$/, '')
  return body + stack.reverse().join('')
}

/** Fixes the known malformed-JSON patterns without touching valid JSON. */
export function repairJson(text: string): string {
  return (
    text
      // `"value" (annotation),` → `"value",` — the dominant failure mode.
      .replace(/"\s*\([^()"]*\)\s*(?=[,}\]])/g, '"')
      // Trailing commas before a closing brace/bracket.
      .replace(/,\s*([}\]])/g, '$1')
      // Whole-line // comments the model sometimes echoes from the spec.
      .replace(/^\s*\/\/[^\n]*$/gm, '')
  )
}

interface CompleteJsonOptions<Schema extends z.ZodTypeAny> {
  /** Tag used in every log line, e.g. "website-graph". */
  label: string
  messages: ChatMessage[]
  schema: Schema
  kind?: 'object' | 'array'
  maxAttempts?: number
  /** Returned (with ok:false) when every attempt fails. */
  fallback: z.infer<Schema>
}

export interface CompleteJsonResult<T> {
  data: T
  ok: boolean
  attempts: number
}

/**
 * Calls the model and returns schema-validated JSON, retrying with the
 * parse error fed back, repairing what it can, and finally falling back.
 */
export async function completeJson<Schema extends z.ZodTypeAny>({
  label,
  messages,
  schema,
  kind = 'object',
  maxAttempts = 3,
  fallback,
}: CompleteJsonOptions<Schema>): Promise<CompleteJsonResult<z.infer<Schema>>> {
  const provider = getProvider()
  let lastError = ''

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const attemptMessages: ChatMessage[] =
      attempt === 1
        ? messages
        : [
            ...messages,
            {
              role: 'user',
              content: `Your previous response was not valid JSON (${lastError}). Respond again with ONLY the corrected JSON ${kind} — no prose, no markdown fences, no comments, and never append parenthetical annotations to values.`,
            },
          ]

    let raw: string
    try {
      raw = await provider.complete(attemptMessages)
    } catch (cause: unknown) {
      lastError = cause instanceof Error ? cause.message : 'provider error'
      console.error(`[agent:${label}] attempt ${attempt} provider error:`, lastError)
      continue
    }

    console.info(`[agent:${label}] attempt ${attempt} raw output (${raw.length} chars):\n${excerpt(raw)}`)

    const extracted = extractJsonBlock(raw, kind)
    let parsed: unknown = null
    let parseError = ''

    for (const candidate of [extracted, repairJson(extracted)]) {
      try {
        parsed = JSON.parse(candidate)
        if (candidate !== extracted) {
          console.warn(`[agent:${label}] attempt ${attempt}: JSON required auto-repair (annotations/commas/comments fixed)`)
        }
        parseError = ''
        break
      } catch (cause: unknown) {
        parseError = cause instanceof Error ? cause.message : 'parse error'
      }
    }

    if (parseError) {
      lastError = parseError
      console.error(`[agent:${label}] attempt ${attempt} JSON.parse failed even after repair: ${parseError}`)
      continue
    }

    const result = schema.safeParse(parsed)
    if (result.success) {
      console.info(
        `[agent:${label}] attempt ${attempt} OK — parsed ${
          kind === 'object'
            ? `keys: ${Object.keys(parsed as Record<string, unknown>).join(', ')}`
            : `${(parsed as unknown[]).length} items`
        }`
      )
      return { data: result.data, ok: true, attempts: attempt }
    }

    lastError = `schema validation failed: ${result.error.issues
      .slice(0, 5)
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ')}`
    console.error(`[agent:${label}] attempt ${attempt} ${lastError}`)
    console.error(`[agent:${label}] parsed value was:`, excerpt(JSON.stringify(parsed)))
  }

  console.error(
    `[agent:${label}] all ${maxAttempts} attempts failed (${lastError}) — continuing with fallback`
  )
  console.warn(`[agent:${label}] fallback value:`, excerpt(JSON.stringify(fallback)))
  return { data: fallback, ok: false, attempts: maxAttempts }
}

/** Lenient string: accepts anything stringy, falls back per-field. */
export const lenientString = (fallback: string) =>
  z
    .unknown()
    .transform((value) => (typeof value === 'string' && value.trim() ? value : fallback))

/** Lenient string array: keeps valid string items, drops the rest. */
export const lenientStringArray = z
  .unknown()
  .transform((value) =>
    Array.isArray(value)
      ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      : []
  )
