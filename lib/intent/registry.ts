import type { VerticalPlanner, WebsiteType } from '@/lib/intent/types'

import { makePlanner } from '@/lib/intent/vertical-config'
import { VERTICALS } from '@/lib/intent/verticals/catalog'
import { genericPlanner } from '@/lib/intent/planners/generic'

/**
 * PlannerRegistry — the heart of PromptSite. Every Indian vertical is built
 * from its catalog config into a distinct VerticalPlanner. Register an
 * industry by adding one config to the catalog (or a hand-written planner
 * via register()); the detector and router pick it up automatically.
 */
class PlannerRegistryImpl {
  private readonly planners = new Map<WebsiteType, VerticalPlanner>()
  private readonly fallbackPlanner: VerticalPlanner

  constructor(planners: VerticalPlanner[], fallback: VerticalPlanner) {
    for (const p of planners) this.planners.set(p.type, p)
    this.fallbackPlanner = fallback
  }

  register(planner: VerticalPlanner): void {
    this.planners.set(planner.type, planner)
  }

  /** Planners that participate in classification (excludes the fallback). */
  classifiable(): VerticalPlanner[] {
    return [...this.planners.values()]
  }

  get(type: WebsiteType): VerticalPlanner {
    return this.planners.get(type) ?? this.fallbackPlanner
  }

  fallback(): VerticalPlanner {
    return this.fallbackPlanner
  }

  size(): number {
    return this.planners.size
  }
}

export const PlannerRegistry = new PlannerRegistryImpl(
  VERTICALS.map(makePlanner),
  genericPlanner
)
