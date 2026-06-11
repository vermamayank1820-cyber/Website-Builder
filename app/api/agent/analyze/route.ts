import { NextResponse } from 'next/server'

import { analyzeBusiness, createExecutionPlan } from '@/lib/agents/business-agent'
import { gatherSourceIntel, type SourceIntel } from '@/lib/agents/link-intel'
import { crawlWebsite, crawlToCorpus, type SiteCrawl } from '@/lib/agents/site-crawler'
import { buildWebsiteGraph, critiqueWebsite } from '@/lib/agents/website-intel'
import { detectSourceType } from '@/lib/agents/url'
import { analyzeRequestSchema } from '@/lib/ai/schema'
import { ProviderError } from '@/lib/providers'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import type {
  ApiResponse,
  BusinessKnowledge,
  PlanStep,
  SiteCritique,
  SourceType,
  WebsiteGraph,
} from '@/types'

export const maxDuration = 300

export interface AnalyzeResponseData {
  knowledge: BusinessKnowledge
  plan: PlanStep[]
  source: { url: string; sourceType: SourceType; extracted: boolean; note: string } | null
  /** Website Intelligence results (websites only). */
  crawledPages: number
  critiqueFlaws: number
}

/**
 * Business Agent stage 1+2: Link → Intelligence → Knowledge Base → Plan.
 * Persists the profile and logs the run; RLS scopes everything to the
 * signed-in owner of the project.
 */
export async function POST(
  request: Request
): Promise<NextResponse<ApiResponse<AnalyzeResponseData>>> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: 'Request body must be valid JSON' },
      { status: 400 }
    )
  }

  const parsed = analyzeRequestSchema.safeParse(body)
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

  const { projectId, goal, url } = parsed.data

  // Ownership check (also enforced by RLS on every write below).
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .maybeSingle()
  if (!project) {
    return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
  }

  const { data: run } = await supabase
    .from('agent_runs')
    .insert({
      project_id: projectId,
      agent: 'analyze',
      status: 'running',
      title: url ? 'Analyzing source & building knowledge base' : 'Building knowledge base',
    })
    .select()
    .single()

  try {
    // Website Intelligence Engine: for real websites, crawl the whole
    // site, build the knowledge graph, and run the critic — the analyst
    // then works from the full crawl corpus instead of one page.
    let intel: SourceIntel | null = null
    let crawl: SiteCrawl | null = null
    let graph: WebsiteGraph | null = null
    let critique: SiteCritique | null = null

    if (url) {
      if (detectSourceType(url) === 'website') {
        crawl = await crawlWebsite(url)
      }
      if (crawl) {
        graph = await buildWebsiteGraph(crawl)
        critique = await critiqueWebsite(graph, crawl)
        intel = {
          url,
          sourceType: 'website',
          extracted: true,
          content: crawlToCorpus(crawl).slice(0, 12_000),
          note: `Crawled ${crawl.pages.length} pages (${crawl.pages.map((p) => p.type).join(', ')}).`,
        }
      } else {
        intel = await gatherSourceIntel(url)
      }
    }

    const knowledge = await analyzeBusiness(goal, intel)
    const plan = await createExecutionPlan(goal, knowledge)

    const { error: profileError } = await supabase.from('business_profiles').upsert(
      {
        project_id: projectId,
        source_url: intel?.url ?? null,
        source_type: intel?.sourceType ?? null,
        knowledge,
        plan,
        website_graph: graph,
        site_critique: critique,
      },
      { onConflict: 'project_id' }
    )
    if (profileError) throw new Error(`Failed to save knowledge base: ${profileError.message}`)

    if (run) {
      await supabase
        .from('agent_runs')
        .update({
          status: 'done',
          summary: knowledge.summary,
          completed_at: new Date().toISOString(),
        })
        .eq('id', run.id)
    }

    const critiqueFlaws = critique
      ? [
          critique.weaknesses,
          critique.design_flaws,
          critique.conversion_flaws,
          critique.ux_flaws,
          critique.copy_flaws,
          critique.accessibility_flaws,
        ].reduce((sum, list) => sum + list.length, 0)
      : 0

    return NextResponse.json({
      success: true,
      data: {
        knowledge,
        plan,
        source: intel
          ? {
              url: intel.url,
              sourceType: intel.sourceType,
              extracted: intel.extracted,
              note: intel.note,
            }
          : null,
        crawledPages: crawl?.pages.length ?? 0,
        critiqueFlaws,
      },
    })
  } catch (error: unknown) {
    const message =
      error instanceof ProviderError || error instanceof Error
        ? error.message
        : 'Analysis failed'
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
