import { buildPlanContext } from '@/lib/intent/build-context'
import { detectIntent } from '@/lib/intent/detect'
import { PlannerRegistry } from '@/lib/intent/registry'
import type { WebsiteIntent, WebsitePlan, WebsiteType } from '@/lib/intent/types'

import { extractKnowledgeGraph } from './extract'
import { brandName, buildKnowledgeContext, graphSignalText, summarizeGraph } from './context'
import type { KnowledgeGraph } from './schema'

export interface Understanding {
  knowledgeGraph: KnowledgeGraph
  intent: WebsiteIntent
  plannerLabel: string
  plan: WebsitePlan
  /** What generation consumes — structured knowledge + planner directive. */
  generationContext: string
  debug: ReturnType<typeof summarizeGraph> & {
    websiteType: string
    planner: string
    intentConfidence: number
  }
}

const isRegistered = (t: WebsiteType): boolean => PlannerRegistry.get(t).type === t

/** Within a personal site, pick the portfolio flavour we have a planner for. */
function pickPortfolioType(g: KnowledgeGraph): WebsiteType {
  const hay = [g.person?.title, ...g.skills, g.brand?.industry].filter(Boolean).join(' ').toLowerCase()
  if (/\b(develop|engineer|software|react|backend|frontend|full.?stack|programmer|devops|sde)\b/.test(hay)) {
    return 'DEVELOPER_PORTFOLIO'
  }
  return 'PERSONAL_PORTFOLIO'
}

/**
 * Structure-first intent: what the document *is* outranks ambiguous keywords.
 *  1. An explicit, confident prompt wins (the user said what they want).
 *  2. A person (resume/CV) → a portfolio — never a business vertical, even if
 *     they work in design/marketing.
 *  3. A company → its industry via keywords (law/CA/café/manufacturing…),
 *     else COMPANY_WEBSITE.
 */
function resolveIntent(g: KnowledgeGraph, input: { prompt?: string; text?: string }): WebsiteIntent {
  const prompt = input.prompt?.trim() ?? ''
  const promptIntent = prompt ? detectIntent({ prompt }) : null
  if (promptIntent && !promptIntent.lowConfidence) return promptIntent

  const isPerson = Boolean(g.person?.name && !g.company?.name)
  if (isPerson) return detectIntent({ prompt: '', forcedType: pickPortfolioType(g) })

  const signal = graphSignalText(g)
  const intent = detectIntent({ prompt, context: `${signal}\n${input.text ?? ''}` })
  if (!intent.lowConfidence) return intent

  const suggested = g.suggestedWebsiteType
  if (suggested && isRegistered(suggested)) return detectIntent({ prompt: '', forcedType: suggested })
  if (g.company?.name) return detectIntent({ prompt: '', forcedType: 'COMPANY_WEBSITE' })
  return intent
}

/**
 * The structured understanding pipeline:
 *   text + prompt → ExtractionService → KnowledgeGraph
 *               → IntentDetection (graph-aware) → PlannerRegistry → plan
 *               → generation input (knowledge + plan, NOT raw text)
 */
export async function understand(input: { prompt?: string; text?: string }): Promise<Understanding> {
  const knowledgeGraph = await extractKnowledgeGraph(input)
  const g = knowledgeGraph
  const intent = resolveIntent(g, input)
  const planner = PlannerRegistry.get(intent.websiteType)
  const plan = planner.plan({
    prompt: input.prompt ?? '',
    intent,
    brandName: brandName(knowledgeGraph),
    knowledge: knowledgeGraph as unknown as Record<string, unknown>,
  })

  const generationContext = [buildKnowledgeContext(knowledgeGraph), buildPlanContext(plan)]
    .filter(Boolean)
    .join('\n\n')

  return {
    knowledgeGraph,
    intent,
    plannerLabel: planner.label,
    plan,
    generationContext,
    debug: {
      ...summarizeGraph(knowledgeGraph),
      websiteType: intent.websiteType,
      planner: planner.label,
      intentConfidence: intent.confidence,
    },
  }
}
