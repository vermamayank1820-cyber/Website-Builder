import { redirect } from 'next/navigation'

import { isSupabaseConfigured } from '@/lib/supabase/config'
import { getSupabaseServerClient } from '@/lib/supabase/server'

/**
 * Root entry: signed-in users land in their workspace, everyone else
 * goes to login. The generator itself lives at /new and /project/[id].
 */
export default async function Home() {
  if (!isSupabaseConfigured()) {
    redirect('/login')
  }

  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  redirect(user ? '/workspace' : '/login')
}
