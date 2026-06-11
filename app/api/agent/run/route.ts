import { NextResponse } from 'next/server'

import { runSpecialistAgent } from '@/lib/agents/business-agent'
import { agentRunRequestSchema } from '@/lib/ai/schema'
import { ProviderError } from '@/lib/providers'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import type { ApiResponse, BusinessKnowledge, ProjectDocument } from '@/types'

export const maxDuration = 120

const RUN_TITLES = {
  research: 'Researching the market & competitors',
  growth: 'Building the growth strategy',
  design: 'Defining the brand & design system',
} as const

/**
 * Runs a specialist agent (research / growth / design) against the
 * project's shared knowledge base and stores the resulting document.
 */
export async function POST(
  request: Request
): Promise<NextResponse<ApiResponse<ProjectDocument>>> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: 'Request body must be valid JSON' },
      { status: 400 }
    )
  }

  const parsed = agentRunRequestSchema.safeParse(body)
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

  const { projectId, kind } = parsed.data

  const { data: profile } = await supabase
    .from('business_profiles')
    .select('knowledge')
    .eq('project_id', projectId)
    .maybeSingle()
  if (!profile) {
    return NextResponse.json(
      { success: false, error: 'No knowledge base for this project — run analysis first' },
      { status: 404 }
    )
  }

  const knowledge = profile.knowledge as BusinessKnowledge
  const goal = knowledge.goals.join('; ')

  const { data: run } = await supabase
    .from('agent_runs')
    .insert({
      project_id: projectId,
      agent: kind,
      status: 'running',
      title: RUN_TITLES[kind],
    })
    .select()
    .single()

  try {
    const { title, contentMd } = await runSpecialistAgent(kind, goal, knowledge)

    const { data: document, error: docError } = await supabase
      .from('project_documents')
      .insert({ project_id: projectId, kind, title, content_md: contentMd })
      .select()
      .single()
    if (docError) throw new Error(`Failed to save document: ${docError.message}`)

    if (run) {
      await supabase
        .from('agent_runs')
        .update({ status: 'done', summary: title, completed_at: new Date().toISOString() })
        .eq('id', run.id)
    }

    return NextResponse.json({ success: true, data: document as ProjectDocument })
  } catch (error: unknown) {
    const message =
      error instanceof ProviderError || error instanceof Error ? error.message : 'Agent failed'
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
