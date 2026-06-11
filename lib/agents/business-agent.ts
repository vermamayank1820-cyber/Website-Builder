import { z } from 'zod'

import { getProvider } from '@/lib/providers'
import type { BusinessKnowledge, DocumentKind, PlanStep } from '@/types'

import { completeJson } from './llm-json'
import type { SourceIntel } from './link-intel'
import {
  ANALYST_SYSTEM_PROMPT,
  DESIGN_SYSTEM_PROMPT,
  GROWTH_SYSTEM_PROMPT,
  PLANNER_SYSTEM_PROMPT,
  RESEARCH_SYSTEM_PROMPT,
  buildAnalystPrompt,
  buildPlannerPrompt,
  buildSpecialistPrompt,
} from './prompts'

const FALLBACK = {
  string: (value: unknown, fallback: string): string =>
    typeof value === 'string' && value.trim() ? value : fallback,
  strings: (value: unknown, fallback: string[]): string[] =>
    Array.isArray(value) && value.length > 0
      ? value.filter((item): item is string => typeof item === 'string')
      : fallback,
}

/** Normalizes model output into a complete BusinessKnowledge object. */
function normalizeKnowledge(raw: unknown, goal: string): BusinessKnowledge {
  const data = (raw ?? {}) as Record<string, never>
  const get = (key: string): unknown => (data as Record<string, unknown>)[key]
  const audience = (get('audience') ?? {}) as Record<string, unknown>
  const brand = (get('brand_identity') ?? {}) as Record<string, unknown>
  const visual = (get('visual_style') ?? {}) as Record<string, unknown>

  return {
    company_name: FALLBACK.string(get('company_name'), 'Untitled Business'),
    tagline: FALLBACK.string(get('tagline'), goal.slice(0, 80)),
    industry: FALLBACK.string(get('industry'), 'General'),
    business_model: FALLBACK.string(get('business_model'), 'To be defined'),
    audience: {
      description: FALLBACK.string(audience.description, 'To be defined'),
      personas: FALLBACK.strings(audience.personas, []),
    },
    products_services: FALLBACK.strings(get('products_services'), []),
    competitors: FALLBACK.strings(get('competitors'), []),
    brand_identity: {
      voice: FALLBACK.string(brand.voice, 'Clear and confident'),
      personality: FALLBACK.strings(brand.personality, []),
      values: FALLBACK.strings(brand.values, []),
    },
    visual_style: {
      mood: FALLBACK.string(visual.mood, 'Clean and modern'),
      colors: FALLBACK.strings(visual.colors, []),
      typography: FALLBACK.string(visual.typography, 'Modern sans-serif'),
    },
    goals: FALLBACK.strings(get('goals'), [goal]),
    opportunities: FALLBACK.strings(get('opportunities'), []),
    summary: FALLBACK.string(get('summary'), goal),
    assumptions: Boolean(get('assumptions')),
  }
}

/**
 * Stage 1 of the Business Agent: source material + goal → the shared
 * business knowledge base.
 */
export async function analyzeBusiness(
  goal: string,
  intel: SourceIntel | null
): Promise<BusinessKnowledge> {
  const { data, ok } = await completeJson({
    label: 'business-analysis',
    schema: z.record(z.string(), z.unknown()),
    maxAttempts: 3,
    fallback: {},
    messages: [
      { role: 'system', content: ANALYST_SYSTEM_PROMPT },
      {
        role: 'user',
        content: buildAnalystPrompt({
          goal,
          url: intel?.url,
          sourceType: intel?.sourceType,
          sourceContent: intel?.content,
          sourceNote: intel?.note,
        }),
      },
    ],
  })

  const knowledge = normalizeKnowledge(data, goal)
  // Honesty guard: without extracted source data (or with a degraded
  // analysis) this is a proposal, not extracted fact.
  if (!intel?.extracted || !ok) knowledge.assumptions = true
  return knowledge
}

const DEFAULT_PLAN: PlanStep[] = [
  {
    id: 'step-1',
    agent: 'research',
    title: 'Map the market & competitors',
    rationale: 'Ground the strategy in the competitive landscape.',
  },
  {
    id: 'step-2',
    agent: 'growth',
    title: 'Build the growth strategy',
    rationale: 'Define the SEO, content, and funnel plan.',
  },
  {
    id: 'step-3',
    agent: 'design',
    title: 'Define the brand & design system',
    rationale: 'Give the website agent a clear visual direction.',
  },
  {
    id: 'step-4',
    agent: 'website',
    title: 'Generate the production website',
    rationale: 'Every plan ships a live, conversion-focused site.',
  },
]

const planStepsSchema = z.unknown().transform((value): PlanStep[] =>
  Array.isArray(value)
    ? value.filter(
        (step): step is PlanStep =>
          Boolean(step) &&
          typeof (step as PlanStep).title === 'string' &&
          ['research', 'growth', 'design', 'website'].includes((step as PlanStep).agent)
      )
    : []
)

/** Stage 2: knowledge base + goal → ordered execution plan. Never throws. */
export async function createExecutionPlan(
  goal: string,
  knowledge: BusinessKnowledge
): Promise<PlanStep[]> {
  const { data } = await completeJson({
    label: 'execution-plan',
    schema: planStepsSchema,
    kind: 'array',
    maxAttempts: 2,
    fallback: DEFAULT_PLAN,
    messages: [
      { role: 'system', content: PLANNER_SYSTEM_PROMPT },
      { role: 'user', content: buildPlannerPrompt(goal, knowledge) },
    ],
  })

  const steps = data.length > 0 ? [...data] : [...DEFAULT_PLAN]

  // The plan must always end by shipping the website.
  if (!steps.some((step) => step.agent === 'website')) {
    steps.push({
      id: `step-${steps.length + 1}`,
      agent: 'website',
      title: 'Generate the production website',
      rationale: 'Every plan ships a live, conversion-focused site.',
    })
  }

  return steps.map((step, index) => ({ ...step, id: `step-${index + 1}` }))
}

const SPECIALIST_PROMPTS: Record<DocumentKind, { system: string; title: (k: BusinessKnowledge) => string }> = {
  research: {
    system: RESEARCH_SYSTEM_PROMPT,
    title: (k) => `Market Research — ${k.company_name}`,
  },
  growth: {
    system: GROWTH_SYSTEM_PROMPT,
    title: (k) => `Growth Strategy — ${k.company_name}`,
  },
  design: {
    system: DESIGN_SYSTEM_PROMPT,
    title: (k) => `Brand & Design System — ${k.company_name}`,
  },
}

/**
 * Stage 3: a specialist agent (research / growth / design) consumes the
 * shared knowledge base and produces a Markdown document.
 */
export async function runSpecialistAgent(
  kind: DocumentKind,
  goal: string,
  knowledge: BusinessKnowledge
): Promise<{ title: string; contentMd: string }> {
  const provider = getProvider()
  const spec = SPECIALIST_PROMPTS[kind]

  const contentMd = await provider.complete([
    { role: 'system', content: spec.system },
    { role: 'user', content: buildSpecialistPrompt(goal, knowledge) },
  ])

  return {
    title: spec.title(knowledge),
    contentMd: contentMd.replace(/^```(?:markdown|md)?\s*/i, '').replace(/```\s*$/, '').trim(),
  }
}
