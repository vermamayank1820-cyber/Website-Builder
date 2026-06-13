import { z } from 'zod'

/**
 * SlideDeck — the structured artifact for the Slides surface. Unlike the
 * website path (an opaque code string rendered in a sandbox), a deck is a
 * validated data model rendered by a first-party React renderer, so it can be
 * edited, reordered, themed, and exported.
 */

export const SLIDE_LAYOUTS = ['title', 'section', 'bullets', 'two-column', 'quote', 'stat', 'closing'] as const
export type SlideLayout = (typeof SLIDE_LAYOUTS)[number]

export const DECK_THEMES = ['editorial', 'minimal', 'midnight'] as const
export type DeckTheme = (typeof DECK_THEMES)[number]

const str = z.string().trim().default('')
const strArr = z.array(z.string().trim()).default([])

export const slideSchema = z.object({
  id: z.string().default(() => `s_${Math.random().toString(36).slice(2, 9)}`),
  layout: z.enum(SLIDE_LAYOUTS).catch('bullets'),
  eyebrow: str,
  title: str,
  subtitle: str,
  body: str,
  bullets: strArr,
  columns: z.array(z.object({ heading: str, body: str })).default([]),
  quote: z.object({ text: str, author: str }).partial().default({}),
  stats: z.array(z.object({ value: str, label: str })).default([]),
  notes: str,
})
export type Slide = z.infer<typeof slideSchema>

export const deckSchema = z.object({
  title: z.string().trim().default('Untitled deck'),
  subtitle: str,
  theme: z.enum(DECK_THEMES).catch('editorial'),
  slides: z.array(slideSchema).default([]),
})
export type SlideDeck = z.infer<typeof deckSchema>

export const EMPTY_DECK: SlideDeck = { title: 'Untitled deck', subtitle: '', theme: 'editorial', slides: [] }
