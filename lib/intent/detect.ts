import { PlannerRegistry } from '@/lib/intent/registry'
import type { WebsiteIntent, WebsiteType } from '@/lib/intent/types'

const WEIGHT = { typePhrase: 6, strong: 3, weak: 1 } as const
/** Below this top score we don't trust the classification → fallback. */
const CONFIDENCE_FLOOR = 3

/** Lowercase, collapse whitespace, pad with spaces for word-boundary-ish
 *  multi-word matching without a full tokenizer. */
function normalize(text: string): string {
  const folded = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics: café -> cafe
    .toLowerCase()
  return ` ${folded.replace(/[\s\n]+/g, ' ').replace(/[^a-z0-9 #&./'-]/g, ' ')} `
}

function countHits(haystack: string, term: string): number {
  const needle = term.toLowerCase()
  if (!needle) return 0
  // word-ish boundary for single tokens; substring for multi-word phrases
  if (needle.includes(' ')) {
    return haystack.includes(needle) ? 1 : 0
  }
  const re = new RegExp(`(?:^| )${needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:s)?(?: |$|[.,!?#&/'-])`, 'g')
  return (haystack.match(re) ?? []).length
}

export interface DetectInput {
  prompt: string
  /** Extracted document text and/or crawled site text, concatenated. */
  context?: string
  /** Optional explicit override (e.g. a URL hint or user selection). */
  forcedType?: WebsiteType
}

/**
 * IntentDetectionService (deterministic core). Scores the input against
 * every registered planner's signals and returns the winning WebsiteType
 * with confidence + explainability. An LLM classifier can later escalate
 * low-confidence cases — the interface stays the same.
 */
export function detectIntent(input: DetectInput): WebsiteIntent {
  if (input.forcedType) {
    return {
      websiteType: input.forcedType,
      confidence: 1,
      matchedSignals: ['forced:override'],
      alternatives: [],
      lowConfidence: false,
    }
  }

  const text = normalize(`${input.prompt} ${input.context ?? ''}`)
  const matched: string[] = []

  const scored = PlannerRegistry.classifiable().map((planner) => {
    let score = 0
    for (const phrase of planner.typePhrases) {
      const hits = countHits(text, phrase)
      if (hits) {
        score += hits * WEIGHT.typePhrase
        matched.push(`${planner.type}:"${phrase}"`)
      }
    }
    for (const term of planner.signals.strong) {
      const hits = countHits(text, term)
      if (hits) {
        score += hits * WEIGHT.strong
        matched.push(`${planner.type}:${term}`)
      }
    }
    for (const term of planner.signals.weak) {
      const hits = countHits(text, term)
      if (hits) score += hits * WEIGHT.weak
    }
    return { type: planner.type, score }
  })

  scored.sort((a, b) => b.score - a.score)
  const top = scored[0]
  const total = scored.reduce((sum, s) => sum + s.score, 0)
  const lowConfidence = !top || top.score < CONFIDENCE_FLOOR

  return {
    websiteType: lowConfidence ? PlannerRegistry.fallback().type : top.type,
    confidence: total > 0 && top ? Number((top.score / total).toFixed(2)) : 0,
    matchedSignals: matched,
    alternatives: scored.slice(0, 4).filter((s) => s.score > 0),
    lowConfidence,
  }
}
