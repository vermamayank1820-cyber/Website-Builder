/**
 * Lightweight, synchronous input analysis for the composer: character/word
 * counts plus a heuristic content-type guess ("Resume detected", etc.).
 * Deterministic and dependency-free so it can run on every keystroke and in
 * tests. The heavier structured extraction lives in the preprocessing
 * pipeline; this is the instant, client-side read.
 */

export type ContentType =
  | 'Resume'
  | 'Business requirements'
  | 'Website copy'
  | 'Competitor analysis'
  | 'Brand guidelines'
  | 'Long brief'

export interface InputStats {
  chars: number
  words: number
  contentType: ContentType | null
}

interface TypeRule {
  type: ContentType
  terms: string[]
  /** Needs at least this many distinct term hits to fire. */
  threshold: number
}

const RULES: TypeRule[] = [
  {
    type: 'Resume',
    threshold: 3,
    terms: ['experience', 'education', 'skills', 'work history', 'resume', 'résumé', 'curriculum vitae', 'employment', 'certifications', 'references', 'professional summary'],
  },
  {
    type: 'Business requirements',
    threshold: 3,
    terms: ['requirements', 'user stories', 'acceptance criteria', 'scope', 'deliverables', 'prd', 'product requirements', 'milestones', 'stakeholders', 'objectives', 'functional requirements', 'success metrics'],
  },
  {
    type: 'Brand guidelines',
    threshold: 3,
    terms: ['brand guidelines', 'brand voice', 'tone of voice', 'color palette', 'colour palette', 'typography', 'logo usage', 'brand colors', 'brand colours', 'visual identity', 'do and don', 'clear space'],
  },
  {
    type: 'Competitor analysis',
    threshold: 2,
    terms: ['competitor', 'competitors', 'market analysis', 'swot', 'pricing comparison', 'competitive landscape', 'market share', 'positioning', 'benchmark'],
  },
  {
    type: 'Website copy',
    threshold: 2,
    terms: ['hero section', 'headline', 'call to action', 'cta', 'above the fold', 'landing page', 'footer', 'sub-headline', 'value proposition', 'testimonials section'],
  },
]

function normalize(text: string): string {
  return ` ${text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ')} `
}

function distinctHits(haystack: string, terms: string[]): number {
  let hits = 0
  for (const term of terms) {
    if (haystack.includes(` ${term}`) || haystack.includes(`${term} `) || haystack.includes(term)) hits++
  }
  return hits
}

export function detectContentType(text: string): ContentType | null {
  if (text.trim().length < 40) return null
  const hay = normalize(text)

  let best: { type: ContentType; score: number } | null = null
  for (const rule of RULES) {
    const hits = distinctHits(hay, rule.terms)
    if (hits >= rule.threshold && (!best || hits > best.score)) {
      best = { type: rule.type, score: hits }
    }
  }
  if (best) return best.type
  // Unclassified but clearly a document, not a one-liner.
  return text.length > 1500 ? 'Long brief' : null
}

export function countWords(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

export function analyzeInput(text: string): InputStats {
  return {
    chars: text.length,
    words: countWords(text),
    contentType: detectContentType(text),
  }
}
