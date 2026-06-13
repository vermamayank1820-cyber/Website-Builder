import { NextResponse, type NextRequest } from 'next/server'

import { routeAndPlan } from '@/lib/intent'

/**
 * Demo / introspection endpoint for the PromptSite 2.0 intent layer.
 * GET /api/plan?input=<prompt>&brand=<name>&context=<extra text>
 * Returns the detected intent + the routed WebsitePlan + the generation
 * directive — proving different inputs route to fundamentally different
 * plans. No OpenAI key required (deterministic routing core).
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const input = params.get('input')?.trim()
  if (!input) {
    return NextResponse.json(
      { error: 'Provide ?input=<your prompt>' },
      { status: 400 }
    )
  }

  const routed = routeAndPlan({
    prompt: input,
    context: params.get('context') ?? undefined,
    brandName: params.get('brand') ?? undefined,
  })

  return NextResponse.json({
    input,
    intent: routed.intent,
    plannerLabel: routed.plannerLabel,
    plan: routed.plan,
    generationContext: routed.generationContext,
  })
}
