import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { SettingsScreen } from '@/features/settings/SettingsScreen'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Settings — PromptSite',
}

export default async function SettingsPage() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [{ data: profile }, { count }] = await Promise.all([
    supabase.from('profiles').select().eq('id', user.id).maybeSingle(),
    supabase.from('projects').select('id', { count: 'exact', head: true }),
  ])

  return (
    <SettingsScreen
      user={{
        id: user.id,
        email: user.email ?? '',
        name:
          (profile?.full_name as string | undefined) ??
          (user.user_metadata?.full_name as string | undefined) ??
          null,
        avatarUrl:
          (profile?.avatar_url as string | undefined) ??
          (user.user_metadata?.avatar_url as string | undefined) ??
          null,
      }}
      projectCount={count ?? 0}
    />
  )
}
