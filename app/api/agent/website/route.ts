import { NextResponse } from 'next/server'
import { z } from 'zod'

import { buildWebsiteContext } from '@/lib/agents/prompts'
import { buildImprovementContext, reviewGeneratedSite } from '@/lib/agents/website-intel'
import { generateLandingPage } from '@/lib/ai/generate'
import { ProviderError } from '@/lib/providers'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import type {
  ApiResponse,
  BusinessKnowledge,
  ProjectSummary,
  QualityReview,
  SiteCritique,
  WebsiteGraph,
} from '@/types'

export const maxDuration = 300

const MAX_ITERATIONS = 3
const SHIP_THRESHOLD = 9
/** Stop starting new iterations once this much wall time is spent. */
const TIME_BUDGET_MS = 220_000

const websiteRequestSchema = z.object({
  projectId: z.string().uuid(),
  prompt: z.string().trim().min(3).max(2000),
})

export interface WebsiteAgentResponseData {
  code: string
  summary?: ProjectSummary
  review: QualityReview
}

interface Attempt {
  code: string
  summary: ProjectSummary
  review: QualityReview
}

/**
 * Website Agent with self-critique: generate → score (visual, brand,
 * conversion, accessibility, mobile, performance) → if below the ship
 * threshold, regenerate with the reviewer's concrete fixes injected —
 * up to 3 iterations, shipping the highest-scoring version.
 */
export async function POST(
  request: Request
): Promise<NextResponse<ApiResponse<WebsiteAgentResponseData>>> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: 'Request body must be valid JSON' },
      { status: 400 }
    )
  }

  const parsed = websiteRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid request' },
      { status: 400 }
    )
  }

  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ success: false, error: 'Not signed in' }, { status: 401 })
  }

  const { projectId, prompt } = parsed.data

  const { data: profile } = await supabase
    .from('business_profiles')
    .select('knowledge, website_graph, site_critique')
    .eq('project_id', projectId)
    .maybeSingle()
  if (!profile) {
    return NextResponse.json(
      { success: false, error: 'No knowledge base for this project — run analysis first' },
      { status: 404 }
    )
  }

  const knowledge = profile.knowledge as BusinessKnowledge
  const graph = (profile.website_graph as WebsiteGraph | null) ?? null
  const critique = (profile.site_critique as SiteCritique | null) ?? null

  const contextBlocks = [buildWebsiteContext(knowledge)]
  if (graph) contextBlocks.push(buildImprovementContext(graph, critique))
  const baseContext = contextBlocks.join('\n\n')

  const { data: run } = await supabase
    .from('agent_runs')
    .insert({
      project_id: projectId,
      agent: 'website',
      status: 'running',
      title: 'Generating & self-reviewing the website',
    })
    .select()
    .single()

  const startedAt = Date.now()
  let best: Attempt | null = null

  try {
    let feedbackBlock = ''

    for (let iteration = 1; iteration <= MAX_ITERATIONS; iteration++) {
      const { code, summary } = await generateLandingPage(
        prompt,
        feedbackBlock ? `${baseContext}\n\n${feedbackBlock}` : baseContext,
        knowledge.industry
      )

      let review: QualityReview
      try {
        review = await reviewGeneratedSite(code, baseContext, iteration)
      } catch {
        // Scoring failed — keep the attempt with a neutral review rather
        // than discarding a perfectly good generation.
        review = {
          scores: { visual: 7, brand: 7, conversion: 7, accessibility: 7, mobile: 7, performance: 7 },
          overall: 7,
          feedback: [],
          iteration,
          iterations_total: iteration,
        }
      }

      if (!best || review.overall > best.review.overall) {
        best = { code, summary, review }
      }

      const outOfBudget = Date.now() - startedAt > TIME_BUDGET_MS
      if (review.overall >= SHIP_THRESHOLD || outOfBudget || iteration === MAX_ITERATIONS) {
        break
      }

      feedbackBlock = [
        `PREVIOUS ATTEMPT SCORED ${review.overall}/10 (visual ${review.scores.visual}, brand ${review.scores.brand}, conversion ${review.scores.conversion}, a11y ${review.scores.accessibility}, mobile ${review.scores.mobile}, perf ${review.scores.performance}).`,
        'REQUIRED FIXES — address every one of these in the new version:',
        ...review.feedback.map((item) => `- ${item}`),
      ].join('\n')
    }

    if (!best) throw new Error('Website generation produced no result')
    best.review.iterations_total = best.review.iteration

    if (run) {
      await supabase
        .from('agent_runs')
        .update({
          status: 'done',
          summary: `Shipped v-best at ${best.review.overall}/10 after ${best.review.iteration} of ${MAX_ITERATIONS} max iterations`,
          completed_at: new Date().toISOString(),
        })
        .eq('id', run.id)
    }

    return NextResponse.json({
      success: true,
      data: { code: best.code, summary: best.summary, review: best.review },
    })
  } catch (error: unknown) {
    const message =
      error instanceof ProviderError || error instanceof Error
        ? error.message
        : 'Website agent failed'
    const status = error instanceof ProviderError ? error.status : 502

    if (run) {
      await supabase
        .from('agent_runs')
        .update({ status: 'error', error: message, completed_at: new Date().toISOString() })
        .eq('id', run.id)
    }

    return NextResponse.json({ success: false, error: message }, { status })
  }
}
