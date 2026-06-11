import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type {
  Project,
  ProjectSummary,
  ProjectVersion,
  QualityReview,
  RecentlyViewedItem,
} from '@/types'

interface CreateProjectInput {
  title: string
  category: string
  prompt: string
  code: string
  generationSummary: string
  summaryData: ProjectSummary | null
}

interface SaveVersionInput {
  projectId: string
  code: string
  generationSummary: string
  summaryData: ProjectSummary | null
  qualityReview?: QualityReview | null
}

function assertNoError(error: { message: string } | null, action: string): void {
  if (error) {
    throw new Error(`${action}: ${error.message}`)
  }
}

/** Creates a project plus its first version. Returns the new project row. */
export async function createProject(input: CreateProjectInput): Promise<Project> {
  const supabase = getSupabaseBrowserClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('You must be signed in to save projects')

  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      title: input.title,
      category: input.category,
      prompt: input.prompt,
      status: 'ready',
    })
    .select()
    .single()
  assertNoError(error, 'Failed to create project')

  const { error: versionError } = await supabase.from('project_versions').insert({
    project_id: project.id,
    version_number: 1,
    generated_code: input.code,
    generation_summary: input.generationSummary,
    summary_data: input.summaryData,
  })
  assertNoError(versionError, 'Failed to save first version')

  return project as Project
}

/** Appends a new version and bumps the project's updated_at. */
export async function saveVersion(input: SaveVersionInput): Promise<ProjectVersion> {
  const supabase = getSupabaseBrowserClient()

  const { data: latest, error: latestError } = await supabase
    .from('project_versions')
    .select('version_number')
    .eq('project_id', input.projectId)
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle()
  assertNoError(latestError, 'Failed to read version history')

  const nextNumber = (latest?.version_number ?? 0) + 1

  const { data: version, error } = await supabase
    .from('project_versions')
    .insert({
      project_id: input.projectId,
      version_number: nextNumber,
      generated_code: input.code,
      generation_summary: input.generationSummary,
      summary_data: input.summaryData,
      quality_review: input.qualityReview ?? null,
    })
    .select()
    .single()
  assertNoError(error, 'Failed to save version')

  const { error: touchError } = await supabase
    .from('projects')
    .update({ status: 'ready' })
    .eq('id', input.projectId)
  assertNoError(touchError, 'Failed to update project')

  return version as ProjectVersion
}

/**
 * Persists manual code edits into the latest version (debounced by the
 * caller). Manual tweaks refine the current version rather than creating
 * a new one — new versions come from generate/edit/restore.
 */
export async function updateLatestVersionCode(
  projectId: string,
  code: string
): Promise<void> {
  const supabase = getSupabaseBrowserClient()

  const { data: latest, error: latestError } = await supabase
    .from('project_versions')
    .select('id')
    .eq('project_id', projectId)
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle()
  assertNoError(latestError, 'Failed to read version history')
  if (!latest) throw new Error('Project has no versions to update')

  const { error } = await supabase
    .from('project_versions')
    .update({ generated_code: code })
    .eq('id', latest.id)
  assertNoError(error, 'Failed to auto-save code')

  const { error: touchError } = await supabase
    .from('projects')
    .update({ status: 'ready' })
    .eq('id', projectId)
  assertNoError(touchError, 'Failed to update project')
}

export async function listProjects(): Promise<Project[]> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('projects')
    .select()
    .order('updated_at', { ascending: false })
  assertNoError(error, 'Failed to load projects')
  return (data ?? []) as Project[]
}

export async function getProject(projectId: string): Promise<Project | null> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('projects')
    .select()
    .eq('id', projectId)
    .maybeSingle()
  assertNoError(error, 'Failed to load project')
  return (data as Project) ?? null
}

export async function getLatestVersion(
  projectId: string
): Promise<ProjectVersion | null> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('project_versions')
    .select()
    .eq('project_id', projectId)
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle()
  assertNoError(error, 'Failed to load latest version')
  return (data as ProjectVersion) ?? null
}

export async function listVersions(projectId: string): Promise<ProjectVersion[]> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('project_versions')
    .select()
    .eq('project_id', projectId)
    .order('version_number', { ascending: false })
  assertNoError(error, 'Failed to load version history')
  return (data ?? []) as ProjectVersion[]
}

export async function renameProject(projectId: string, title: string): Promise<void> {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase
    .from('projects')
    .update({ title })
    .eq('id', projectId)
  assertNoError(error, 'Failed to rename project')
}

export async function deleteProject(projectId: string): Promise<void> {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase.from('projects').delete().eq('id', projectId)
  assertNoError(error, 'Failed to delete project')
}

/** Copies a project and its latest version. Returns the new project. */
export async function duplicateProject(projectId: string): Promise<Project> {
  const supabase = getSupabaseBrowserClient()

  const [project, latest] = await Promise.all([
    getProject(projectId),
    getLatestVersion(projectId),
  ])
  if (!project || !latest) throw new Error('Project not found')

  const { data: copy, error } = await supabase
    .from('projects')
    .insert({
      user_id: project.user_id,
      title: `${project.title} (copy)`,
      category: project.category,
      prompt: project.prompt,
      thumbnail_url: project.thumbnail_url,
      status: project.status,
    })
    .select()
    .single()
  assertNoError(error, 'Failed to duplicate project')

  const { error: versionError } = await supabase.from('project_versions').insert({
    project_id: copy.id,
    version_number: 1,
    generated_code: latest.generated_code,
    generation_summary: latest.generation_summary,
    summary_data: latest.summary_data,
  })
  assertNoError(versionError, 'Failed to duplicate project version')

  return copy as Project
}

/** Upserts a recently-viewed entry (the DB trigger caps the list at 30). */
export async function recordProjectView(projectId: string): Promise<void> {
  const supabase = getSupabaseBrowserClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from('recently_viewed')
    .upsert(
      { user_id: user.id, project_id: projectId, viewed_at: new Date().toISOString() },
      { onConflict: 'user_id,project_id' }
    )
  assertNoError(error, 'Failed to record project view')
}

export async function listRecentlyViewed(): Promise<RecentlyViewedItem[]> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('recently_viewed')
    .select('id, project_id, viewed_at, project:projects(*)')
    .order('viewed_at', { ascending: false })
    .limit(30)
  assertNoError(error, 'Failed to load recently viewed')

  return ((data ?? []) as unknown as RecentlyViewedItem[]).filter(
    (item) => item.project !== null
  )
}

/**
 * Uploads a captured thumbnail (data URL) to the public `thumbnails`
 * bucket and stores its cache-busted URL on the project.
 */
export async function uploadThumbnail(
  projectId: string,
  dataUrl: string
): Promise<string> {
  const supabase = getSupabaseBrowserClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('You must be signed in to save thumbnails')

  const blob = await (await fetch(dataUrl)).blob()
  const path = `${user.id}/${projectId}.jpg`

  const { error: uploadError } = await supabase.storage
    .from('thumbnails')
    .upload(path, blob, { upsert: true, contentType: 'image/jpeg' })
  assertNoError(uploadError, 'Failed to upload thumbnail')

  const {
    data: { publicUrl },
  } = supabase.storage.from('thumbnails').getPublicUrl(path)

  const versionedUrl = `${publicUrl}?v=${Date.now()}`
  const { error } = await supabase
    .from('projects')
    .update({ thumbnail_url: versionedUrl })
    .eq('id', projectId)
  assertNoError(error, 'Failed to save thumbnail URL')

  return versionedUrl
}
