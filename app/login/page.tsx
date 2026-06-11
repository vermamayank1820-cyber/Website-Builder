import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { LoginScreen } from '@/features/auth/LoginScreen'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Sign in — PromptSite',
  description: 'Sign in to your PromptSite workspace.',
}

interface LoginPageProps {
  searchParams: Promise<{ next?: string; error?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next, error } = await searchParams

  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      redirect('/workspace')
    }
  }

  const nextPath =
    next && next.startsWith('/') && !next.startsWith('//') ? next : '/workspace'

  return <LoginScreen nextPath={nextPath} initialError={error} />
}
