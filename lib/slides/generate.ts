import { completeJson } from '@/lib/agents/llm-json'

import { deckSchema, EMPTY_DECK, type SlideDeck } from './types'

const SYSTEM_PROMPT = `You are a world-class presentation designer. Produce a tight, persuasive slide deck as JSON.

Return ONLY a JSON object: { "title", "subtitle", "theme", "slides": [ ... ] }.

Each slide: { "layout", "eyebrow", "title", "subtitle", "body", "bullets":[], "columns":[{heading,body}], "quote":{text,author}, "stats":[{value,label}], "notes" }.

Allowed layouts: title, section, bullets, two-column, quote, stat, closing.
Allowed themes: editorial, minimal, midnight.

Rules:
- 10–14 slides. Open with a "title" slide, close with a "closing" slide; use "section" dividers to structure.
- ONE idea per slide. Real, specific content — never lorem/placeholder.
- Prefer concise bullets (3–5, short). Use "stat" for metrics, "quote" for testimonials/vision, "two-column" for comparisons.
- "notes" = one line of speaker guidance per slide.
- Choose the theme that fits the topic (editorial = narrative/serif; minimal = clean/product; midnight = bold/dark).
- Only include fields a slide actually uses.`

export interface GenerateDeckInput {
  prompt: string
  /** Extracted document/website context, if any. */
  context?: string
}

/**
 * prompt (+ context) → validated SlideDeck. Never throws — a failed generation
 * degrades to an empty deck the caller can surface as an error.
 */
export async function generateDeck(input: GenerateDeckInput): Promise<SlideDeck> {
  const source = [input.prompt, input.context].filter(Boolean).join('\n\n').trim()
  if (source.length < 8) return EMPTY_DECK

  const { data } = await completeJson({
    label: 'slides-generation',
    schema: deckSchema,
    maxAttempts: 2,
    fallback: EMPTY_DECK,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Create the deck for:\n\n${source.slice(0, 16_000)}` },
    ],
  })

  // Ensure every slide has a stable id.
  return {
    ...data,
    slides: data.slides.map((s, i) => ({ ...s, id: s.id || `s_${i}` })),
  }
}
