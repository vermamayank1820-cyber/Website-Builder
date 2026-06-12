import { NextResponse } from 'next/server'
import { z } from 'zod'

import { buildWebsiteContext } from '@/lib/agents/prompts'
import {
  buildConceptContext,
  buildImprovementContext,
  exploreConcepts,
  reviewGeneratedSite,
  reviewRenderedScreenshots,
} from '@/lib/agents/website-intel'
import { captureScreenshots } from '@/lib/render/screenshot'
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
  /** Winning design concept from the multi-concept exploration, if any. */
  concept: { name: string; atmosphere: string } | null
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

  const { data: run } = await supabase
    .from('agent_runs')
    .insert({
      project_id: projectId,
      agent: 'website',
      status: 'running',
      title: 'Exploring concepts, generating & self-reviewing the website',
    })
    .select()
    .single()

  // Multi-concept exploration: three radically different directions,
  // council-scored, winner becomes a binding design directive. A failed
  // exploration is logged and generation proceeds without it.
  const selection = await exploreConcepts(`${prompt}\n\n${contextBlocks.join('\n\n')}`)
  if (selection) contextBlocks.push(buildConceptContext(selection))
  const winningConcept = selection ? selection.concepts[selection.winnerIndex] : null

  // Evolution memory: recurring weaknesses (do-not-repeat) plus proven
  // winning directions from past generations.
  const { data: lessonRows } = await supabase
    .from('design_lessons')
    .select('lesson, category')
    .order('created_at', { ascending: false })
    .limit(18)
  const allLessons = (lessonRows ?? []) as Array<{ lesson: string; category: string }>
  const pastLessons = allLessons
    .filter((row) => row.category !== 'winning')
    .map((row) => row.lesson)
    .slice(0, 12)
  const pastWins = allLessons
    .filter((row) => row.category === 'winning')
    .map((row) => row.lesson)
    .slice(0, 4)

  if (pastLessons.length > 0) {
    contextBlocks.push(
      [
        'EVOLUTION MEMORY — recurring weaknesses from your past generations. Do not repeat ANY of them:',
        ...pastLessons.map((lesson) => `- ${lesson}`),
      ].join('\n')
    )
  }
  if (pastWins.length > 0) {
    contextBlocks.push(
      [
        'PROVEN WINNERS — directions that scored 9+ in past generations (let them inform taste, never copy them literally):',
        ...pastWins.map((win) => `- ${win}`),
      ].join('\n')
    )
  }

  const baseContext = contextBlocks.join('\n\n')

  const startedAt = Date.now()
  let best: Attempt | null = null
  let firstReview: QualityReview | null = null

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

      // Vision review: render the page and judge the PIXELS. When the
      // Vision Creative Director can see the page, its verdict replaces
      // the code-only scores (code review can't see dead viewports or
      // text drowning in imagery); the code reviewer's fixes are kept as
      // secondary feedback. Degrades silently when no browser/vision.
      try {
        const shots = await captureScreenshots(code)
        if (shots) {
          const visionReview = await reviewRenderedScreenshots(
            shots.map((shot) => shot.dataUrl),
            baseContext,
            iteration
          )
          if (visionReview) {
            console.info(
              `[agent:website] iteration ${iteration}: vision ${visionReview.overall}/10 (code review said ${review.overall}/10)`
            )
            review = {
              ...visionReview,
              feedback: [...visionReview.feedback, ...review.feedback].slice(0, 8),
            }
          }
        }
      } catch (cause: unknown) {
        console.warn(
          '[agent:website] vision stage failed — using code review:',
          cause instanceof Error ? cause.message : 'unknown'
        )
      }

      if (iteration === 1) firstReview = review

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

    // Evolution memory write: a weak first pass means the model's habits
    // failed — record the reviewer's top fixes so future generations are
    // warned up front. Best-effort, never blocks the response.
    if (firstReview && firstReview.overall < SHIP_THRESHOLD && firstReview.feedback.length > 0) {
      const known = new Set(pastLessons.map((lesson) => lesson.trim().toLowerCase()))
      // Evolution memory is for design taste — keep a11y/perf plumbing
      // out of it (those are handled by prompt rules, not memory).
      const PLUMBING = /aria|srcset|alt text|lazy[- ]?load|focus (?:style|ring)|screen reader|semantic html|landmark|wcag|next\.js|performance|loading=/i
      const newLessons = firstReview.feedback
        .filter((lesson) => !PLUMBING.test(lesson))
        .slice(0, 3)
        .filter((lesson) => !known.has(lesson.trim().toLowerCase()))
        .map((lesson) => ({
          user_id: user.id,
          project_id: projectId,
          category: 'first-pass-review',
          lesson,
        }))
      if (newLessons.length > 0) {
        await supabase
          .from('design_lessons')
          .insert(newLessons)
          .then(({ error: lessonError }) => {
            if (lessonError) {
              console.warn('[agent:website] failed to record design lessons:', lessonError.message)
            }
          })
      }
    }

    // Record winning directions so future generations inherit taste.
    if (best.review.overall >= SHIP_THRESHOLD && winningConcept) {
      await supabase
        .from('design_lessons')
        .insert({
          user_id: user.id,
          project_id: projectId,
          category: 'winning',
          lesson: `“${winningConcept.name}” for ${knowledge.industry}: ${winningConcept.atmosphere} (shipped at ${best.review.overall}/10)`,
        })
        .then(({ error: winError }) => {
          if (winError) {
            console.warn('[agent:website] failed to record winning pattern:', winError.message)
          }
        })
    }

    if (run) {
      await supabase
        .from('agent_runs')
        .update({
          status: 'done',
          summary: `${winningConcept ? `Concept “${winningConcept.name}” — ` : ''}shipped at ${best.review.overall}/10 after ${best.review.iteration} of ${MAX_ITERATIONS} max iterations`,
          completed_at: new Date().toISOString(),
        })
        .eq('id', run.id)
    }

    return NextResponse.json({
      success: true,
      data: {
        code: best.code,
        summary: best.summary,
        review: best.review,
        concept: winningConcept
          ? { name: winningConcept.name, atmosphere: winningConcept.atmosphere }
          : null,
      },
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
