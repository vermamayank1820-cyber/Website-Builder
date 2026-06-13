import { NextResponse, after } from 'next/server'
import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'

import { buildWebsiteContext } from '@/lib/agents/prompts'
import {
  buildConceptContext,
  buildImprovementContext,
  exploreConcepts,
  reviewGeneratedSite,
  reviewRenderedScreenshots,
} from '@/lib/agents/website-intel'
import { generateLandingPage } from '@/lib/ai/generate'
import { MAX_INPUT_CHARS, MIN_INPUT_CHARS } from '@/lib/input/constants'
import { ProviderError } from '@/lib/providers'
import { captureScreenshots } from '@/lib/render/screenshot'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import type {
  ApiResponse,
  BusinessKnowledge,
  ProjectSummary,
  QualityReview,
  SiteCritique,
  WebsiteGraph,
} from '@/types'

// The response itself returns in <1s; the pipeline continues via after().
// On Vercel, after() work is still bounded by maxDuration — true prod
// scale needs a worker/queue (Phase C). In `next dev` it runs to completion.
export const maxDuration = 800

const MAX_ITERATIONS = 3
const SHIP_THRESHOLD = 9
/** Don't start another generation pass after this much pipeline time. */
const ITERATION_TIME_BUDGET_MS = 10 * 60_000
/** Absolute watchdog: the run is marked failed past this point. */
const PIPELINE_HARD_CAP_MS = 15 * 60_000

const websiteRequestSchema = z.object({
  projectId: z.string().uuid(),
  prompt: z.string().trim().min(MIN_INPUT_CHARS).max(MAX_INPUT_CHARS),
})

export interface WebsiteAgentStartData {
  /** agent_runs.id — poll this row for status/title/summary updates. */
  runId: string
}

interface Attempt {
  code: string
  summary: ProjectSummary
  review: QualityReview
}

/**
 * Website Agent as a background job: POST validates, creates the
 * agent_run (the job record), and returns its id immediately. The
 * pipeline — concepts → generate → code review → screenshots → vision
 * review → refine ×≤3 → persist version — runs after the response and
 * writes ALL results server-side, so a sleeping laptop, closed tab, or
 * dropped connection can no longer lose a finished website. The client
 * polls the agent_runs row (RLS-scoped) for live stage titles.
 */
export async function POST(
  request: Request
): Promise<NextResponse<ApiResponse<WebsiteAgentStartData>>> {
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

  const { data: run, error: runError } = await supabase
    .from('agent_runs')
    .insert({
      project_id: projectId,
      agent: 'website',
      status: 'running',
      title: 'Queued — starting the design pipeline',
    })
    .select()
    .single()
  if (runError || !run) {
    return NextResponse.json(
      { success: false, error: `Failed to start the build: ${runError?.message ?? 'unknown'}` },
      { status: 500 }
    )
  }

  after(async () => {
    const watchdog = setTimeout(() => {
      void supabase
        .from('agent_runs')
        .update({
          status: 'error',
          error: `Pipeline exceeded the ${PIPELINE_HARD_CAP_MS / 60_000}-minute hard cap`,
          completed_at: new Date().toISOString(),
        })
        .eq('id', run.id)
        .eq('status', 'running')
    }, PIPELINE_HARD_CAP_MS)

    try {
      await runWebsitePipeline({
        supabase,
        runId: run.id,
        userId: user.id,
        projectId,
        prompt,
        knowledge: profile.knowledge as BusinessKnowledge,
        graph: (profile.website_graph as WebsiteGraph | null) ?? null,
        critique: (profile.site_critique as SiteCritique | null) ?? null,
      })
    } catch (error: unknown) {
      const message =
        error instanceof ProviderError || error instanceof Error
          ? error.message
          : 'Website pipeline failed'
      console.error(`[pipeline] run ${run.id} FAILED: ${message}`)
      await supabase
        .from('agent_runs')
        .update({ status: 'error', error: message, completed_at: new Date().toISOString() })
        .eq('id', run.id)
        .eq('status', 'running')
    } finally {
      clearTimeout(watchdog)
    }
  })

  return NextResponse.json({ success: true, data: { runId: run.id } })
}

interface PipelineInput {
  supabase: SupabaseClient
  runId: string
  userId: string
  projectId: string
  prompt: string
  knowledge: BusinessKnowledge
  graph: WebsiteGraph | null
  critique: SiteCritique | null
}

async function runWebsitePipeline(input: PipelineInput): Promise<void> {
  const { supabase, runId, userId, projectId, prompt, knowledge, graph, critique } = input
  const pipelineStart = Date.now()

  const elapsed = () => `${Math.round((Date.now() - pipelineStart) / 1000)}s`
  const step = (name: string) => {
    console.info(`[pipeline] ${elapsed()} — ${name}`)
  }
  const setProgress = async (title: string) => {
    step(title)
    await supabase.from('agent_runs').update({ title }).eq('id', runId)
  }

  const contextBlocks = [buildWebsiteContext(knowledge)]
  if (graph) contextBlocks.push(buildImprovementContext(graph, critique))

  // STEP: concept exploration
  await setProgress('Exploring 4 design concepts')
  const selection = await exploreConcepts(`${prompt}\n\n${contextBlocks.join('\n\n')}`)
  if (selection) contextBlocks.push(buildConceptContext(selection))
  const winningConcept = selection ? selection.concepts[selection.winnerIndex] : null
  step(`concepts done${winningConcept ? ` — winner “${winningConcept.name}”` : ' (skipped)'}`)

  // STEP: evolution memory
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

  let best: Attempt | null = null
  let firstReview: QualityReview | null = null
  let feedbackBlock = ''

  for (let iteration = 1; iteration <= MAX_ITERATIONS; iteration++) {
    // STEP: generation
    await setProgress(
      `Generating the website${winningConcept ? ` — “${winningConcept.name}”` : ''} (pass ${iteration}/${MAX_ITERATIONS})`
    )
    const generationStart = Date.now()
    const { code, summary } = await generateLandingPage(
      prompt,
      feedbackBlock ? `${baseContext}\n\n${feedbackBlock}` : baseContext,
      knowledge.industry
    )
    step(`pass ${iteration} generated in ${Math.round((Date.now() - generationStart) / 1000)}s`)

    // STEP: code review
    await setProgress(`Design review — pass ${iteration}`)
    let review: QualityReview
    try {
      review = await reviewGeneratedSite(code, baseContext, iteration)
    } catch {
      review = {
        scores: { visual: 7, brand: 7, conversion: 7, accessibility: 7, mobile: 7, performance: 7 },
        overall: 7,
        feedback: [],
        iteration,
        iterations_total: iteration,
      }
    }

    // STEP: screenshots + vision review (pixels override code judgment;
    // both stages degrade gracefully and never kill the run)
    try {
      await setProgress(`Rendering & vision review — pass ${iteration}`)
      const shots = await captureScreenshots(code)
      if (shots) {
        const visionReview = await reviewRenderedScreenshots(
          shots.map((shot) => shot.dataUrl),
          baseContext,
          iteration
        )
        if (visionReview) {
          step(
            `pass ${iteration}: vision ${visionReview.overall}/10 (code review said ${review.overall}/10)`
          )
          review = {
            ...visionReview,
            feedback: [...visionReview.feedback, ...review.feedback].slice(0, 8),
          }
        }
      } else {
        step(`pass ${iteration}: screenshots unavailable — code review only`)
      }
    } catch (cause: unknown) {
      console.warn(
        '[pipeline] vision stage failed — using code review:',
        cause instanceof Error ? cause.message : 'unknown'
      )
    }

    if (iteration === 1) firstReview = review
    if (!best || review.overall > best.review.overall) {
      best = { code, summary, review }
    }

    const outOfBudget = Date.now() - pipelineStart > ITERATION_TIME_BUDGET_MS
    if (review.overall >= SHIP_THRESHOLD || outOfBudget || iteration === MAX_ITERATIONS) {
      if (outOfBudget) step('time budget reached — shipping best version')
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

  // STEP: persist the version SERVER-SIDE — the result can never again
  // be lost to a dead client connection.
  await setProgress('Saving your website')
  const { data: latest } = await supabase
    .from('project_versions')
    .select('version_number')
    .eq('project_id', projectId)
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle()
  const nextNumber = (latest?.version_number ?? 0) + 1

  const { error: versionError } = await supabase.from('project_versions').insert({
    project_id: projectId,
    version_number: nextNumber,
    generated_code: best.code,
    generation_summary: `Built ${knowledge.company_name} website — ${winningConcept ? `“${winningConcept.name}”, ` : ''}self-review ${best.review.overall}/10 (${best.review.iteration} pass${best.review.iteration === 1 ? '' : 'es'})`,
    summary_data: best.summary,
    quality_review: best.review,
  })
  if (versionError) throw new Error(`Failed to save the website: ${versionError.message}`)

  await supabase.from('projects').update({ status: 'ready' }).eq('id', projectId)

  // STEP: evolution memory writes (best-effort)
  if (firstReview && firstReview.overall < SHIP_THRESHOLD && firstReview.feedback.length > 0) {
    const known = new Set(pastLessons.map((lesson) => lesson.trim().toLowerCase()))
    const PLUMBING =
      /aria|srcset|alt text|lazy[- ]?load|focus (?:style|ring)|screen reader|semantic html|landmark|wcag|next\.js|performance|loading=/i
    const newLessons = firstReview.feedback
      .filter((lesson) => !PLUMBING.test(lesson))
      .slice(0, 3)
      .filter((lesson) => !known.has(lesson.trim().toLowerCase()))
      .map((lesson) => ({
        user_id: userId,
        project_id: projectId,
        category: 'first-pass-review',
        lesson,
      }))
    if (newLessons.length > 0) {
      await supabase.from('design_lessons').insert(newLessons)
    }
  }
  if (best.review.overall >= SHIP_THRESHOLD && winningConcept) {
    await supabase.from('design_lessons').insert({
      user_id: userId,
      project_id: projectId,
      category: 'winning',
      lesson: `“${winningConcept.name}” for ${knowledge.industry}: ${winningConcept.atmosphere} (shipped at ${best.review.overall}/10)`,
    })
  }

  // STEP: done
  await supabase
    .from('agent_runs')
    .update({
      status: 'done',
      title: 'Website built',
      summary: `${winningConcept ? `Concept “${winningConcept.name}” — ` : ''}shipped v${nextNumber} at ${best.review.overall}/10 after ${best.review.iteration} of ${MAX_ITERATIONS} max passes`,
      completed_at: new Date().toISOString(),
    })
    .eq('id', runId)
  step(`pipeline complete — v${nextNumber} at ${best.review.overall}/10`)
}
