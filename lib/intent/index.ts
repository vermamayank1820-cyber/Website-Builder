import { detectIntent, type DetectInput } from '@/lib/intent/detect'
import { PlannerRegistry } from '@/lib/intent/registry'
import { buildPlanContext } from '@/lib/intent/build-context'
import type { WebsiteIntent, WebsitePlan } from '@/lib/intent/types'

export { detectIntent, PlannerRegistry, buildPlanContext }
export type { DetectInput }
export * from '@/lib/intent/types'

export interface RoutedPlan {
  intent: WebsiteIntent
  plannerLabel: string
  plan: WebsitePlan
  /** Ready-to-inject directive for the website generator. */
  generationContext: string
}

/**
 * The PromptSite 2.0 entry point: input → intent → routed planner → plan →
 * generation directive. One call answers "what?" then "how?".
 */
export function routeAndPlan(input: DetectInput & { brandName?: string }): RoutedPlan {
  const intent = detectIntent(input)
  const planner = PlannerRegistry.get(intent.websiteType)
  const plan = planner.plan({ prompt: input.prompt, intent, brandName: input.brandName })
  return {
    intent,
    plannerLabel: planner.label,
    plan,
    generationContext: buildPlanContext(plan),
  }
}
