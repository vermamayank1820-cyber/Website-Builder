import { z } from 'zod'

import type { QualityReview, SiteCritique, WebsiteGraph } from '@/types'

import { completeJson, lenientString, lenientStringArray } from './llm-json'
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

Each score is 0-10: visual = hierarchy/spacing/typography/polish; brand = consistency with the provided identity; conversion = CTA clarity, proof, funnel logic; accessibility = contrast, semantics, alt text, labels; mobile = responsive classes, mobile-first layout; performance = image sizing, no bloat.

AUTOMATIC HEAVY PENALTIES (cap the affected score at 4 and list the fix first):
- Any image whose subject does not match the business domain — check every img alt/URL against the business context (e.g. food/fitness/lifestyle photos on a coffee or software brand).
- Any permanently-visible fixed/floating element (always-open cart panel, chat bubble, promo box) that overlaps page content while scrolling — carts must be a nav control with a dismissible dropdown.
- Layouts that would look identical with the brand name swapped (template-grade work).

Be strict: 9-10 means genuinely best-in-class (Stripe/Linear level), 7-8 is good, 5-6 is average template work. "feedback" is the 3-6 highest-impact concrete fixes, ordered by impact — specific edits, not vibes. Numbers must be bare JSON numbers.`

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

  const overall =
    Math.round(
      (Object.values(data.scores).reduce((sum, value) => sum + value, 0) /
        Object.values(data.scores).length) *
        10
    ) / 10

  return {
    scores: data.scores,
    overall,
    feedback: data.feedback.slice(0, 6),
    iteration,
    iterations_total: iteration,
  }
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
