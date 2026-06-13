/**
 * Prompt Expansion Engine — turns a short intent (a clicked chip/suggestion)
 * into a structured generation specification (a mini-PRD), so the generator
 * never receives a one-line prompt. Deterministic + instant (no LLM latency);
 * domain intelligence lives in the per-surface expanders.
 */

export interface PromptSpec {
  title: string
  goal: string
  audience: string
  businessContext: string
  requiredSections: string[]
  requiredFeatures: string[]
  interactions: string[]
  visualStyle: string
  colorPalette: string[]
  references: string[]
  requirements: string[]
  generationInstructions: string
}

export interface ExpandInput {
  /** The clicked idea/suggestion or sub-surface label. */
  idea: string
  /** The selected sub-surface id, if any (landing/portfolio/pitch/…). */
  subSurfaceId?: string | null
}

/** Sensible platform-wide defaults so every spec is complete. */
export function baseSpec(partial: Partial<PromptSpec>): PromptSpec {
  return {
    title: partial.title ?? 'Untitled',
    goal: partial.goal ?? '',
    audience: partial.audience ?? 'a general audience',
    businessContext: partial.businessContext ?? '',
    requiredSections: partial.requiredSections ?? [],
    requiredFeatures: partial.requiredFeatures ?? [],
    interactions: partial.interactions ?? [],
    visualStyle: partial.visualStyle ?? 'Premium, modern, intentional — generous whitespace, confident hierarchy',
    colorPalette: partial.colorPalette ?? [],
    references: partial.references ?? [],
    requirements: partial.requirements ?? [
      'Production-grade, fully responsive, accessible (WCAG AA).',
      'No placeholder or lorem content — write real, specific copy.',
    ],
    generationInstructions:
      partial.generationInstructions ??
      'Build a premium result a top studio would ship. Improve on references, never copy them.',
  }
}

/** Renders a PromptSpec as an editable, mini-PRD prompt for the composer. */
export function formatSpec(s: PromptSpec): string {
  const lines: string[] = []

  const opener = s.businessContext ? `${s.goal} ${s.businessContext}` : s.goal
  lines.push(`${opener} It's for ${s.audience}.`)
  lines.push('')

  if (s.requiredSections.length) lines.push(`Sections: ${s.requiredSections.join('; ')}.`)
  if (s.requiredFeatures.length) lines.push(`Key features: ${s.requiredFeatures.join('; ')}.`)
  if (s.interactions.length) lines.push(`Interactions: ${s.interactions.join('; ')}.`)
  lines.push('')

  lines.push(`Visual direction: ${s.visualStyle}.`)
  if (s.colorPalette.length) lines.push(`Palette: ${s.colorPalette.join(', ')}.`)
  if (s.references.length) {
    lines.push(`References for inspiration (improve on them, never copy): ${s.references.join(', ')}.`)
  }
  if (s.requirements.length) lines.push(s.requirements.join(' '))

  return lines
    .join('\n')
    .replace(/\.{2,}/g, '.') // collapse accidental double periods
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** Light keyword check used by the domain-intelligence layer. */
export function ideaHas(idea: string, ...terms: string[]): boolean {
  const low = idea.toLowerCase()
  return terms.some((t) => low.includes(t))
}
