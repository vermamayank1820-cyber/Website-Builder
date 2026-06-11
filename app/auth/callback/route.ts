import { NextResponse } from 'next/server'

import { getSupabaseServerClient } from '@/lib/supabase/server'

/**
 * OAuth / email-confirmation landing point. Exchanges the auth code for a
 * session cookie, then forwards to the requested page (default: workspace).
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/workspace'

  // Only allow internal redirect targets.
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/workspace'

  if (code) {
    const supabase = await getSupabaseServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(new URL(safeNext, requestUrl.origin))
    }
  }

  const loginUrl = new URL('/login', requestUrl.origin)
  loginUrl.searchParams.set('error', 'Could not complete sign in. Please try again.')
  return NextResponse.redirect(loginUrl)
}
