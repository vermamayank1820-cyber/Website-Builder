import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { WorkspaceDashboard } from '@/features/workspace/WorkspaceDashboard'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import type { Project, RecentlyViewedItem } from '@/types'

export const metadata: Metadata = {
  title: 'Workspace — PromptSite',
  description: 'Your PromptSite projects, recents, and templates.',
}

export default async function WorkspacePage() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [{ data: projects }, { data: recents }] = await Promise.all([
    supabase.from('projects').select().order('updated_at', { ascending: false }),
    supabase
      .from('recently_viewed')
      .select('id, project_id, viewed_at, project:projects(*)')
      .order('viewed_at', { ascending: false })
      .limit(30),
  ])

  const recentItems = ((recents ?? []) as unknown as RecentlyViewedItem[]).filter(
    (item) => item.project !== null
  )

  return (
    <WorkspaceDashboard
      user={{
        id: user.id,
        email: user.email ?? '',
        name:
          (user.user_metadata?.full_name as string | undefined) ??
          (user.user_metadata?.name as string | undefined) ??
          null,
        avatarUrl: (user.user_metadata?.avatar_url as string | undefined) ?? null,
      }}
      initialProjects={(projects ?? []) as Project[]}
      initialRecents={recentItems}
    />
  )
}
