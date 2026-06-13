import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase client for privileged server-side tasks only —
 * seeding and Auth admin operations. It BYPASSES row level security, so it
 * must never be imported into client code or exposed to the browser.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY (a server-only secret) alongside the
 * existing NEXT_PUBLIC_SUPABASE_URL.
 */
export function getSupabaseAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Supabase admin is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    )
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
