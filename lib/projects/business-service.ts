import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type {
  AgentRun,
  ApiResponse,
  BusinessKnowledge,
  BusinessProfile,
  DocumentKind,
  PlanStep,
  Project,
  ProjectDocument,
  SourceType,
} from '@/types'

export interface AnalyzeResult {
  knowledge: BusinessKnowledge
  plan: PlanStep[]
  source: { url: string; sourceType: SourceType; extracted: boolean; note: string } | null
  crawledPages: number
  critiqueFlaws: number
}

function assertNoError(error: { message: string } | null, action: string): void {
  if (error) throw new Error(`${action}: ${error.message}`)
}

async function postJson<T>(url: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const result = (await response.json()) as ApiResponse<T>
  if (!result.success || result.data === undefined) {
    throw new Error(result.error ?? 'Request failed')
  }
  return result.data
}

/** Creates a project shell before any version exists (agent flow). */
export async function createDraftProject(input: {
  title: string
  category: string
  prompt: string
}): Promise<Project> {
  const supabase = getSupabaseBrowserClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('You must be signed in to create projects')

  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      title: input.title,
      category: input.category,
      prompt: input.prompt,
      status: 'draft',
    })
    .select()
    .single()
  assertNoError(error, 'Failed to create project')
  return data as Project
}

export async function updateProjectMeta(
  projectId: string,
  meta: { title?: string; category?: string }
): Promise<void> {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase.from('projects').update(meta).eq('id', projectId)
  assertNoError(error, 'Failed to update project')
}

/** Business Agent stage 1+2 via the server: source intel → knowledge → plan. */
export async function analyzeProject(input: {
  projectId: string
  goal: string
  url?: string
}): Promise<AnalyzeResult> {
  return postJson<AnalyzeResult>('/api/agent/analyze', input)
}

/** Runs a specialist agent server-side; returns the stored document. */
export async function runAgent(
  projectId: string,
  kind: DocumentKind
): Promise<ProjectDocument> {
  return postJson<ProjectDocument>('/api/agent/run', { projectId, kind })
}

export async function getBusinessProfile(
  projectId: string
): Promise<BusinessProfile | null> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('business_profiles')
    .select()
    .eq('project_id', projectId)
    .maybeSingle()
  assertNoError(error, 'Failed to load business profile')
  return (data as BusinessProfile) ?? null
}

/** Latest document per kind. */
export async function listLatestDocuments(
  projectId: string
): Promise<Partial<Record<DocumentKind, ProjectDocument>>> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('project_documents')
    .select()
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
  assertNoError(error, 'Failed to load documents')

  const latest: Partial<Record<DocumentKind, ProjectDocument>> = {}
  for (const doc of (data ?? []) as ProjectDocument[]) {
    if (!latest[doc.kind]) latest[doc.kind] = doc
  }
  return latest
}

export async function listAgentRuns(projectId: string): Promise<AgentRun[]> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('agent_runs')
    .select()
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(40)
  assertNoError(error, 'Failed to load activity')
  return (data ?? []) as AgentRun[]
}

/** Logs a client-orchestrated run (the website build) into the activity feed. */
export async function logAgentRun(input: {
  projectId: string
  agent: 'website'
  title: string
  status: 'done' | 'error'
  summary?: string
  error?: string
}): Promise<void> {
  const supabase = getSupabaseBrowserClient()
  await supabase.from('agent_runs').insert({
    project_id: input.projectId,
    agent: input.agent,
    title: input.title,
    status: input.status,
    summary: input.summary ?? null,
    error: input.error ?? null,
    completed_at: new Date().toISOString(),
  })
}
