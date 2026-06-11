import { createServerClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/**
 * Server-side Supabase client for Server Components, Route Handlers, and
 * Server Actions. Sessions live in cookies; writes are best-effort because
 * Server Components cannot set cookies (middleware refreshes them instead).
 */
export async function getSupabaseServerClient(): Promise<SupabaseClient> {
  // Touch cookies() before validating config so pages using this client are
  // always dynamically rendered (never statically prerendered at build time).
  const cookieStore = await cookies()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    )
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Called from a Server Component — safe to ignore, the proxy
          // (middleware) handles session refresh cookie writes.
        }
      },
    },
  })
}
