import { z } from 'zod'

import type {
  ConceptSelection,
  DesignConcept,
  QualityReview,
  SiteCritique,
  WebsiteGraph,
} from '@/types'

import { getVisionProvider } from '@/lib/providers'

import { completeJson, extractJsonBlock, lenientString, lenientStringArray, repairJson } from './llm-json'
import { crawlToCorpus, type SiteCrawl } from './site-crawler'

const GRAPH_SYSTEM_PROMPT = `You are PromptSite's Website Intelligence Engine. From a multi-page crawl of a website, build a structured knowledge graph.

Respond with ONLY a JSON object (no fences, no prose):
{
  "company": string,
  "industry": string,
  "audience": string,
  "products": string[],
  "pricing": string,
  "revenue_model": string,
  "conversion_funnel": string,
  "brand_positioning": string,
  "competitors": string[],
  "visual_identity": string,
  "typography": string,
  "colors": string[],
  "layout_patterns": string,
  "design_system": string,
  "navigation_structure": string[],
  "seo_strategy": string,
  "unique_value_propositions": string[]
}

Field notes: pricing = model & actual price points found, or "not published". conversion_funnel = how a visitor becomes a customer. colors = hex codes, prefer the detected ones provided. navigation_structure = top-level nav labels.

CRITICAL OUTPUT RULES:
- Raw JSON only. No markdown fences, no comments, no prose before or after.
- Every array element must be a bare JSON string. NEVER append notes to values: write "#1a1a1a", never "#1a1a1a" (dark text).
- Ground every field in the crawled pages; use "not published" rather than inventing facts.
- No trailing commas.`

const CRITIC_SYSTEM_PROMPT = `You are PromptSite's Website Critic Agent — a brutal but fair design director who has shipped work at the level of Apple, Stripe, Linear, Notion, Framer, Vercel, and Airbnb. Compare the analyzed website against that bar.

Respond with ONLY a JSON object (no fences, no prose, no annotations on values):
{
  "benchmark_summary": string,
  "weaknesses": string[],
  "design_flaws": string[],
  "conversion_flaws": string[],
  "ux_flaws": string[],
  "copy_flaws": string[],
  "accessibility_flaws": string[]
}

3-5 items per category (2-4 for ux/copy/accessibility). Every flaw must be specific and actionable ("Hero headline describes features, not the outcome — rewrite around the customer's result"), never generic ("improve design"). Base flaws on the actual crawled evidence. Every array element is a bare JSON string with no trailing notes.`

const REVIEW_SYSTEM_PROMPT = `You are PromptSite's Self-Critique Agent — a merciless design review panel. You are given the React/Tailwind source code of a generated landing page plus the business context it must serve. Score it.

Respond with ONLY a JSON object (no fences, no prose, no annotations on values):
{
  "scores": {
    "visual": number,
    "brand": number,
    "conversion": number,
    "accessibility": number,
    "mobile": number,
    "performance": number
  },
  "feedback": string[]
}

Each score is 0-10: visual = hierarchy/spacing/typography/polish AND atmosphere/depth (does every viewport hold a focal point, or is it dead space?) AND originality (would this layout survive a brand-name swap?); brand = consistency with the provided identity AND storytelling (does the page build an emotional narrative, or list information?) AND premium feel (does a screenshot look expensive — poster, not document?); conversion = CTA clarity, proof, funnel logic; accessibility = contrast, semantics, alt text, labels; mobile = responsive classes, mobile-first layout; performance = image sizing, no bloat.

AUTOMATIC HEAVY PENALTIES (cap the affected score at 4 and list the fix first):
- Any image whose subject does not match the business domain — check every img alt/URL against the business context (e.g. food/fitness/lifestyle photos on a coffee or software brand).
- Any permanently-visible fixed/floating element (always-open cart panel, chat bubble, promo box) that overlaps page content while scrolling — carts must be a nav control with a dismissible dropdown.
- Layouts that would look identical with the brand name swapped (template-grade work).
- THE WIREFRAME HERO: heading + paragraph + button on a flat unmodulated background (bg-black, bg-white, or one untouched solid fill with no imagery, no constructed visual, no tonal depth) — cap visual at 3.
- Dead viewports: any full section that is just a text block floating in a large flat black/white region with nothing designed around it — atmosphere, imagery, structural type, or tonal shifts must carry every screenful.
- A page that is mostly text: if fewer than half the sections contain imagery or a constructed visual (CSS/SVG scene, mockup, editorial composition), cap visual at 5.

SANDBOX REALITY — judge within it, never recommend outside it: the page is a single function Page() evaluated with React UMD + Tailwind CDN. There is NO Next.js Image, NO srcset infrastructure, NO build step, NO external fonts/libraries. Performance is judged only on what is controllable: sensible ?w= sizes on Unsplash URLs, loading="lazy" on below-fold images, no redundant markup. Never deduct for missing frameworks or suggest adopting them.

FEEDBACK PRIORITY: feedback is the 3-6 highest-impact concrete fixes. Whenever visual or brand is below 9, at least the first 3 fixes MUST be design-level (composition, hierarchy, typography, imagery treatment, atmosphere, section variety) — accessibility/performance plumbing goes after design fixes, never instead of them. Specific edits, not vibes.

Be strict: 9-10 means genuinely best-in-class (Stripe/Linear level), 7-8 is good, 5-6 is average template work. Numbers must be bare JSON numbers.`

const CONCEPT_SYSTEM_PROMPT = `You are PromptSite's design studio council — a Brand Strategist, Creative Director, UX Architect, and Conversion Specialist working a brief together. Before any code is written, the council explores four RADICALLY different design concepts and selects the strongest.

Respond with ONLY a JSON object (no fences, no prose, no annotations on values):
{
  "concepts": [
    {
      "name": string,                 // e.g. "Luxury Editorial", "Type-Led Minimalism", "Immersive Cinematic"
      "atmosphere": string,           // the emotional register of the page in one sentence
      "layout_strategy": string,      // composition approach: grids, asymmetry, bleeds, rhythm
      "typography": string,           // display/body strategy using ONLY Tailwind stacks (font-sans/serif/mono), scale + weight character
      "palette": string[],            // 3-5 hex codes or named tones
      "imagery_strategy": string,     // how imagery/constructed visuals carry the page (verified photo library or CSS/SVG scenes only)
      "conversion_approach": string,  // how this concept converts: funnel, CTAs, proof
      "score": number,                // 0-10 council score
      "rationale": string             // one sentence: why this score
    },
    { ... }, { ... }, { ... }
  ],
  "winner": number,                  // index 0-3 of the selected concept
  "selection_rationale": string
}

Rules:
- The four concepts must differ structurally — different layout strategy, different typographic character, different imagery strategy, different atmosphere. Four flavors of the same idea is a failed exploration.
- Score on: fit to the brief and audience, distinctiveness, conversion logic, feasibility within the sandbox (Tailwind built-in font stacks only; motion limited to IntersectionObserver reveals + CSS transitions; imagery from the verified library or HTML/CSS/SVG construction).
- The critics' bar: would the design teams at Stripe, Linear, Apple approve the winning direction?
- Never select a concept whose hero would be text on a flat background — every concept needs a designed ground.`

const VISION_REVIEW_SYSTEM_PROMPT = `You are PromptSite's Vision Creative Director — a design-agency owner reviewing SCREENSHOTS of a generated website. You judge pixels, not code. You are the final taste authority.

You will see: desktop hero, desktop mid-page, and mobile hero screenshots, plus the business context the page must serve.

Respond with ONLY a JSON object (no fences, no prose, no annotations on values):
{
  "scores": {
    "visual": number,          // visual impact, composition, atmosphere, premium feel — would a designer stop scrolling?
    "brand": number,           // brand identity, storytelling, memorability — does it FEEL like this brand and no other?
    "conversion": number,      // CTA prominence, trust, funnel clarity as actually rendered
    "accessibility": number,   // rendered contrast, readable text over imagery, touch-target size
    "mobile": number,          // does the mobile screenshot hold together — no collapse, overflow, or cramped type?
    "performance": number      // perceived completeness: broken images, unstyled regions, layout gaps
  },
  "feedback": string[]         // 5-10 concrete criticisms ordered by impact
}

THE APPROVAL BOARD TEST — score as if a Founder, a Creative Director, an agency owner, an investor, and a customer must each answer YES to: "Would I launch this? Would I proudly share this screenshot? Would I believe an agency charged ₹5-10 lakh for it? Would I pick it over a Lovable or Framer-template output?" A 9 means every persona says yes.

JUDGE HARSHLY:
- Dead viewports: mostly-empty black/white screens, text floating in nothing → visual ≤ 4.
- Wireframe hero (heading+paragraph+button on a flat ground) → visual ≤ 3.
- Text that is unreadable over imagery → accessibility ≤ 4.
- Broken/missing images, unstyled blocks → performance ≤ 4.
- Generic template look that could be any brand → brand ≤ 5.

Feedback must name what you SEE ("the mid-page screenshot is a near-empty black band ~600px tall between the menu and gallery — fill it or cut it"), never code-level abstractions. Numbers must be bare JSON numbers.`

// ── Schemas (lenient: per-field recovery, never reject the whole payload) ──

const graphSchema = z.object({
  company: lenientString('Unknown'),
  industry: lenientString('General'),
  audience: lenientString('not published'),
  products: lenientStringArray,
  pricing: lenientString('not published'),
  revenue_model: lenientString('not published'),
  conversion_funnel: lenientString('not published'),
  brand_positioning: lenientString('not published'),
  competitors: lenientStringArray,
  visual_identity: lenientString('not published'),
  typography: lenientString('not published'),
  colors: lenientStringArray,
  layout_patterns: lenientString('not published'),
  design_system: lenientString('not published'),
  navigation_structure: lenientStringArray,
  seo_strategy: lenientString('not published'),
  unique_value_propositions: lenientStringArray,
})

const critiqueSchema = z.object({
  benchmark_summary: lenientString(''),
  weaknesses: lenientStringArray,
  design_flaws: lenientStringArray,
  conversion_flaws: lenientStringArray,
  ux_flaws: lenientStringArray,
  copy_flaws: lenientStringArray,
  accessibility_flaws: lenientStringArray,
})

const lenientScore = z.unknown().transform((value) => {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? Math.min(10, Math.max(0, Math.round(n * 10) / 10)) : 5
})

const conceptSchema = z.object({
  concepts: z.unknown().transform((value): DesignConcept[] => {
    if (!Array.isArray(value)) return []
    return value
      .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
      .map((item) => ({
        name: typeof item.name === 'string' ? item.name : 'Untitled concept',
        atmosphere: typeof item.atmosphere === 'string' ? item.atmosphere : '',
        layout_strategy: typeof item.layout_strategy === 'string' ? item.layout_strategy : '',
        typography: typeof item.typography === 'string' ? item.typography : '',
        palette: Array.isArray(item.palette)
          ? item.palette.filter((c): c is string => typeof c === 'string')
          : [],
        imagery_strategy: typeof item.imagery_strategy === 'string' ? item.imagery_strategy : '',
        conversion_approach:
          typeof item.conversion_approach === 'string' ? item.conversion_approach : '',
        score:
          typeof item.score === 'number' && Number.isFinite(item.score)
            ? Math.min(10, Math.max(0, item.score))
            : 5,
        rationale: typeof item.rationale === 'string' ? item.rationale : '',
      }))
  }),
  winner: z.unknown().transform((value) => {
    const n = typeof value === 'number' ? value : Number(value)
    return Number.isFinite(n) ? Math.trunc(n) : -1
  }),
  selection_rationale: lenientString(''),
})

const reviewSchema = z.object({
  scores: z
    .object({
      visual: lenientScore,
      brand: lenientScore,
      conversion: lenientScore,
      accessibility: lenientScore,
      mobile: lenientScore,
      performance: lenientScore,
    })
    .catch({ visual: 5, brand: 5, conversion: 5, accessibility: 5, mobile: 5, performance: 5 }),
  feedback: lenientStringArray,
})

function emptyGraphFallback(crawl: SiteCrawl): Omit<WebsiteGraph, 'pages'> {
  return {
    company: '',
    industry: '',
    audience: '',
    products: [],
    pricing: 'not published',
    revenue_model: 'not published',
    conversion_funnel: 'not published',
    brand_positioning: 'not published',
    competitors: [],
    visual_identity: 'not published',
    typography: crawl.styleHints.fonts.join(', ') || 'not published',
    colors: crawl.styleHints.colors,
    layout_patterns: 'not published',
    design_system: 'not published',
    navigation_structure: [],
    seo_strategy: 'not published',
    unique_value_propositions: [],
  }
}

/**
 * Step 2: crawl → structured website knowledge graph. Never throws —
 * after 3 attempts it degrades to a minimal graph (crawl-derived style
 * hints only) so the run always continues.
 */
export async function buildWebsiteGraph(crawl: SiteCrawl): Promise<WebsiteGraph> {
  const { data, ok } = await completeJson({
    label: 'website-graph',
    schema: graphSchema,
    maxAttempts: 3,
    fallback: emptyGraphFallback(crawl),
    messages: [
      { role: 'system', content: GRAPH_SYSTEM_PROMPT },
      { role: 'user', content: crawlToCorpus(crawl) },
    ],
  })

  const graph: WebsiteGraph = {
    ...data,
    colors: data.colors.length > 0 ? data.colors : crawl.styleHints.colors,
    pages: crawl.pages.map(({ url, type, title }) => ({ url, type, title })),
  }

  if (!ok) {
    console.warn(
      `[agent:website-graph] degraded graph in use for ${crawl.origin} — downstream agents run on crawl evidence + style hints only`
    )
  }
  return graph
}

/** Step 3: graph + crawl evidence → critique vs. best-in-class. Never throws. */
export async function critiqueWebsite(
  graph: WebsiteGraph,
  crawl: SiteCrawl
): Promise<SiteCritique> {
  const { data } = await completeJson({
    label: 'website-critique',
    schema: critiqueSchema,
    maxAttempts: 2,
    fallback: {
      benchmark_summary: '',
      weaknesses: [],
      design_flaws: [],
      conversion_flaws: [],
      ux_flaws: [],
      copy_flaws: [],
      accessibility_flaws: [],
    },
    messages: [
      { role: 'system', content: CRITIC_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `WEBSITE KNOWLEDGE GRAPH:\n${JSON.stringify(graph, null, 2)}\n\nCRAWLED EVIDENCE:\n${crawlToCorpus(crawl).slice(0, 14_000)}`,
      },
    ],
  })
  return data
}

/**
 * Step 5: score a generated page. Never throws — an unscorable attempt
 * gets a neutral 7 so a good generation is never discarded.
 */
export async function reviewGeneratedSite(
  code: string,
  businessContext: string,
  iteration: number
): Promise<QualityReview> {
  const { data } = await completeJson({
    label: 'self-review',
    schema: reviewSchema,
    maxAttempts: 2,
    fallback: {
      scores: { visual: 7, brand: 7, conversion: 7, accessibility: 7, mobile: 7, performance: 7 },
      feedback: [],
    },
    messages: [
      { role: 'system', content: REVIEW_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `${businessContext}\n\nGENERATED PAGE SOURCE:\n\`\`\`jsx\n${code.slice(0, 16_000)}\n\`\`\``,
      },
    ],
  })

  // Weighted toward what users actually perceive: design quality and
  // brand carry the gate; a11y/mobile/perf matter but must not let
  // plumbing scores starve design refinement (observed failure mode:
  // unweighted mean sat at ~7.5 forever on a11y/perf while visual was 9,
  // so every refinement pass chased ARIA instead of composition).
  const WEIGHTS = {
    visual: 0.3,
    brand: 0.2,
    conversion: 0.2,
    accessibility: 0.1,
    mobile: 0.1,
    performance: 0.1,
  } as const
  const overall =
    Math.round(
      (Object.entries(WEIGHTS) as Array<[keyof typeof WEIGHTS, number]>).reduce(
        (sum, [key, weight]) => sum + data.scores[key] * weight,
        0
      ) * 10
    ) / 10

  return {
    scores: data.scores,
    overall,
    feedback: data.feedback.slice(0, 6),
    iteration,
    iterations_total: iteration,
  }
}

/**
 * Vision review: the Vision Creative Director scores rendered screenshots
 * (pixels, not code). Returns null when the vision call or parsing fails —
 * the caller falls back to the code-only review. Scores share the
 * QualityReview shape so merging is trivial.
 */
export async function reviewRenderedScreenshots(
  imageDataUrls: string[],
  businessContext: string,
  iteration: number
): Promise<QualityReview | null> {
  const provider = getVisionProvider()
  if (!provider.completeVision) return null

  let raw: string
  try {
    raw = await provider.completeVision(
      VISION_REVIEW_SYSTEM_PROMPT,
      `BUSINESS CONTEXT the page must serve:\n${businessContext.slice(0, 4_000)}\n\nScreenshots follow: desktop hero, desktop mid-page, mobile hero.`,
      imageDataUrls
    )
  } catch (cause: unknown) {
    console.warn(
      '[agent:vision-review] vision call failed — falling back to code review:',
      cause instanceof Error ? cause.message : 'unknown'
    )
    return null
  }

  console.info(`[agent:vision-review] iteration ${iteration} raw output:\n${raw.slice(0, 1_500)}`)

  try {
    const extracted = extractJsonBlock(raw)
    let parsed: unknown
    try {
      parsed = JSON.parse(extracted)
    } catch {
      parsed = JSON.parse(repairJson(extracted))
    }
    const result = reviewSchema.safeParse(parsed)
    if (!result.success) return null

    const scores = result.data.scores
    const WEIGHTS = {
      visual: 0.3,
      brand: 0.2,
      conversion: 0.2,
      accessibility: 0.1,
      mobile: 0.1,
      performance: 0.1,
    } as const
    const overall =
      Math.round(
        (Object.entries(WEIGHTS) as Array<[keyof typeof WEIGHTS, number]>).reduce(
          (sum, [key, weight]) => sum + scores[key] * weight,
          0
        ) * 10
      ) / 10

    return {
      scores,
      overall,
      feedback: result.data.feedback.slice(0, 8),
      iteration,
      iterations_total: iteration,
    }
  } catch {
    console.warn('[agent:vision-review] could not parse vision review — falling back to code review')
    return null
  }
}

/**
 * Multi-concept exploration: the studio council produces four radically
 * different design directions and selects the strongest before any code
 * is written. Never throws — a failed exploration returns null and
 * generation proceeds without a concept (graceful, logged).
 */
export async function exploreConcepts(brief: string): Promise<ConceptSelection | null> {
  const { data, ok } = await completeJson({
    label: 'concept-exploration',
    schema: conceptSchema,
    maxAttempts: 2,
    fallback: { concepts: [], winner: -1, selection_rationale: '' },
    messages: [
      { role: 'system', content: CONCEPT_SYSTEM_PROMPT },
      { role: 'user', content: `WEBSITE BRIEF:\n${brief.slice(0, 8_000)}` },
    ],
  })

  if (!ok || data.concepts.length === 0) return null

  // Trust the council's pick when valid; otherwise take the top score.
  const winnerIndex =
    data.winner >= 0 && data.winner < data.concepts.length
      ? data.winner
      : data.concepts.reduce(
          (best, concept, index) => (concept.score > data.concepts[best].score ? index : best),
          0
        )

  return {
    concepts: data.concepts,
    winnerIndex,
    selection_rationale: data.selection_rationale,
  }
}

/** Renders the winning concept as a binding design directive. */
export function buildConceptContext(selection: ConceptSelection): string {
  const winner = selection.concepts[selection.winnerIndex]
  const rejected = selection.concepts
    .filter((_, index) => index !== selection.winnerIndex)
    .map((concept) => concept.name)
    .join('” and “')

  return [
    `SELECTED DESIGN CONCEPT — “${winner.name}” (chosen over “${rejected}”). Execute this direction fully and consistently:`,
    `- Atmosphere: ${winner.atmosphere}`,
    `- Layout strategy: ${winner.layout_strategy}`,
    `- Typography: ${winner.typography}`,
    `- Palette: ${winner.palette.join(', ')}`,
    `- Imagery strategy: ${winner.imagery_strategy}`,
    `- Conversion approach: ${winner.conversion_approach}`,
    selection.selection_rationale
      ? `- Why this direction won: ${selection.selection_rationale}`
      : '',
    'Commit to this concept completely — do not blend it with the rejected directions or fall back to a generic layout.',
  ]
    .filter(Boolean)
    .join('\n')
}

/** Step 4 context: graph + critique → "improve, don't replicate" block. */
export function buildImprovementContext(
  graph: WebsiteGraph,
  critique: SiteCritique | null
): string {
  const lines = [
    'SOURCE WEBSITE INTELLIGENCE (the user already has this site — your job is to build a CLEARLY BETTER one, not a replica):',
    `- Company: ${graph.company} (${graph.industry})`,
    `- Positioning: ${graph.brand_positioning}`,
    `- Audience: ${graph.audience}`,
    `- Offerings: ${graph.products.join('; ') || 'see UVPs'}`,
    `- Pricing: ${graph.pricing}`,
    `- Conversion funnel today: ${graph.conversion_funnel}`,
    `- UVPs: ${graph.unique_value_propositions.join('; ')}`,
    `- Current visual identity: ${graph.visual_identity}; colors ${graph.colors.join(', ')}; type ${graph.typography}`,
    `- Current nav: ${graph.navigation_structure.join(' · ')}`,
  ]

  if (critique) {
    lines.push(
      '',
      'CRITIC FINDINGS — the new site MUST fix every one of these:',
      ...critique.design_flaws.map((flaw) => `- [design] ${flaw}`),
      ...critique.conversion_flaws.map((flaw) => `- [conversion] ${flaw}`),
      ...critique.ux_flaws.map((flaw) => `- [ux] ${flaw}`),
      ...critique.copy_flaws.map((flaw) => `- [copy] ${flaw}`),
      ...critique.accessibility_flaws.map((flaw) => `- [a11y] ${flaw}`)
    )
  }

  lines.push(
    '',
    'MANDATE: Keep the real business facts (name, offerings, pricing) and brand essence, but redesign to the standard of Stripe/Linear/Apple — stronger hierarchy, sharper outcome-led copy, clearer conversion path, accessible contrast and structure. Do not copy the original layout.'
  )

  return lines.join('\n').slice(0, 6_000)
}
