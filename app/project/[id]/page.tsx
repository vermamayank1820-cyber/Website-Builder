import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import { ProjectEditor } from '@/features/projects/ProjectEditor'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import type { Project, ProjectVersion } from '@/types'

export const metadata: Metadata = {
  title: 'Editor — PromptSite',
}

interface ProjectPageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params

  const supabase = await getSupabaseServerClient()

  const { data: project } = await supabase
    .from('projects')
    .select()
    .eq('id', id)
    .maybeSingle()

  if (!project) {
    notFound()
  }

  const [{ data: latestVersion }, { data: profile }] = await Promise.all([
    supabase
      .from('project_versions')
      .select()
      .eq('project_id', id)
      .order('version_number', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from('business_profiles').select('id').eq('project_id', id).maybeSingle(),
  ])

  // Drafts from interrupted agent runs have no version yet — send the
  // user back to the workspace instead of a broken editor.
  if (!latestVersion) {
    redirect('/workspace')
  }

  return (
    <ProjectEditor
      project={project as Project}
      latestVersion={latestVersion as ProjectVersion}
      hasBusinessProfile={Boolean(profile)}
    />
  )
}
