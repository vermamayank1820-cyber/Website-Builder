import { baseSpec, ideaHas, type ExpandInput, type PromptSpec } from './types'

export function expandSlidesPrompt(input: ExpandInput): PromptSpec {
  const investor = input.subSurfaceId === 'investor' || ideaHas(input.idea, 'investor', 'series', 'fund')
  const sales = input.subSurfaceId === 'sales' || ideaHas(input.idea, 'sales', 'enterprise', 'proposal')
  const kind = investor ? 'investor deck' : sales ? 'sales deck' : 'pitch deck'
  return baseSpec({
    title: `${kind[0].toUpperCase()}${kind.slice(1)}`,
    goal: `Create a ${kind} that tells a tight, persuasive story and earns the next meeting.`,
    businessContext: input.idea,
    audience: investor ? 'investors evaluating the opportunity and the team.' : sales ? 'enterprise buyers weighing the decision.' : 'an audience deciding whether to back this.',
    requiredSections: investor
      ? ['Cover', 'Problem', 'Solution', 'Market (TAM/SAM/SOM)', 'Product', 'Traction & metrics', 'Business model', 'Competition', 'Team', 'The ask']
      : ['Cover', 'The problem', 'The solution', 'How it works', 'Proof / results', 'Pricing or offer', 'Why now', 'Call to action'],
    requiredFeatures: ['One idea per slide', 'Real numbers, not placeholders', 'A consistent visual system across slides'],
    interactions: ['Clean slide-to-slide transitions', 'Optional speaker notes'],
    visualStyle: 'Editorial, confident, restrained — strong typographic hierarchy, generous space',
    colorPalette: ['disciplined 2–3 colour system', 'one accent for emphasis'],
    requirements: ['10–14 slides.', 'Each slide must earn its place — no filler.'],
  })
}

export function expandResearchPrompt(input: ExpandInput): PromptSpec {
  const map: Record<string, { title: string; sections: string[] }> = {
    market: { title: 'Market sizing analysis', sections: ['Executive summary', 'Market definition & scope', 'TAM / SAM / SOM with methodology', 'Growth drivers & projections', 'Segmentation', 'Key risks', 'Sources'] },
    competitive: { title: 'Competitive analysis', sections: ['Executive summary', 'Competitor landscape', 'Feature & pricing comparison', 'Positioning map', 'Strengths / weaknesses', 'Opportunities & gaps', 'Sources'] },
    diligence: { title: 'Due diligence report', sections: ['Executive summary', 'Company & market overview', 'Product & technology', 'Financial signals', 'Risks & red flags', 'Recommendation', 'Sources'] },
  }
  const pick = map[input.subSurfaceId ?? ''] ?? map.market
  return baseSpec({
    title: pick.title,
    goal: `Produce a rigorous ${pick.title.toLowerCase()} a partner could act on.`,
    businessContext: input.idea,
    audience: 'decision-makers who need defensible, well-sourced analysis.',
    requiredSections: pick.sections,
    requiredFeatures: ['Cited sources for every key claim', 'Clear methodology', 'Quantified where possible'],
    interactions: [],
    visualStyle: 'Clean report formatting — clear headings, tables, and charts where they clarify',
    colorPalette: ['neutral document palette', 'one accent for emphasis'],
    requirements: ['Never invent figures — flag assumptions explicitly.', 'Lead with an executive summary.'],
  })
}

export function expandDesignPrompt(input: ExpandInput): PromptSpec {
  const logo = input.subSurfaceId === 'logo' || ideaHas(input.idea, 'logo', 'wordmark', 'monogram')
  const brand = input.subSurfaceId === 'brand' || ideaHas(input.idea, 'brand', 'identity', 'vi')
  const title = logo ? 'Logo & wordmark' : brand ? 'Brand identity system' : 'Design concept'
  return baseSpec({
    title,
    goal: `Create a ${title.toLowerCase()} that is distinctive, ownable, and unmistakably on-brand.`,
    businessContext: input.idea,
    audience: 'the brand’s customers and the team who will live with this identity.',
    requiredSections: brand
      ? ['Logo & wordmark', 'Colour system', 'Typography', 'Iconography', 'Usage & spacing rules', 'Sample applications']
      : logo
        ? ['Primary mark', '2–3 alternates', 'Mono / inverse versions', 'Clear-space & sizing']
        : ['Concept', 'Variations', 'Application mockups'],
    requiredFeatures: ['A clear point of view, not generic', 'Works at small and large sizes', 'Defined colour + type pairing'],
    interactions: [],
    visualStyle: 'Intentional and bespoke — a real aesthetic direction, not a default',
    colorPalette: ['a deliberate 3–5 colour palette derived from the brief'],
    requirements: ['Original work — never copy existing brands.', 'Justify the core aesthetic choice.'],
  })
}

export function expandAppPrompt(input: ExpandInput): PromptSpec {
  return baseSpec({
    title: 'App experience',
    goal: 'Design a focused app experience with a clear primary job and premium interaction quality.',
    businessContext: input.idea,
    audience: 'the people who will use this app daily.',
    requiredSections: ['Onboarding / entry', 'Primary screen (the core job)', 'A secondary flow', 'Settings / profile', 'Empty & error states'],
    requiredFeatures: ['One unmistakable primary action per screen', 'Consistent navigation model', 'Thumb-reachable layout'],
    interactions: ['Native-feeling transitions', 'Press / haptic-style feedback', 'Loading & success states'],
    visualStyle: 'Calm, modern, native-grade — clear hierarchy, no clutter',
    colorPalette: ['neutral base', 'one accent', 'semantic colours for status'],
    requirements: ['Mobile-first; respects safe areas.', 'Accessible touch targets (≥44px).'],
  })
}

export function expandGamePrompt(input: ExpandInput): PromptSpec {
  return baseSpec({
    title: 'Browser game',
    goal: 'Build a playable, satisfying browser game with a tight core loop.',
    businessContext: input.idea,
    audience: 'casual players who want something fun within seconds.',
    requiredSections: ['Start / menu screen', 'The play loop', 'Score / progress HUD', 'Game-over & restart'],
    requiredFeatures: ['A clear, escalating core mechanic', 'Responsive controls (keyboard + touch)', 'Juice: feedback on every action'],
    interactions: ['Immediate input response', 'Particle / motion feedback', 'No layout-breaking lag (60fps target)'],
    visualStyle: 'Cohesive art direction with character — readable shapes, confident palette',
    colorPalette: ['a bold, cohesive game palette'],
    requirements: ['Playable end-to-end with no crashes.', 'Canvas/web-based, self-contained.'],
  })
}
