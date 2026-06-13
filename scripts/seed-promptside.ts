/**
 * PromptSite seed (replaces the spec's seed_db()).
 *
 * Idempotent: ensures a demo Supabase Auth user exists (Supabase hashes the
 * password — no plaintext, no werkzeug) and inserts 8 sample generations
 * across categories, spread across the current month. Re-running never
 * duplicates data.
 *
 * Run:  SUPABASE_SERVICE_ROLE_KEY must be set (in .env.local or the env).
 *   node --experimental-strip-types scripts/seed-promptside.ts
 * or:  npm run db:seed
 *
 * NOTE: apply migration 0005_generations.sql first (Supabase SQL editor /
 * `supabase db push`).
 */
import { readFileSync } from 'node:fs'

import { createClient } from '@supabase/supabase-js'

// Load .env.local for standalone runs (Next loads it automatically; node does not).
function loadEnvLocal(): void {
  try {
    for (const line of readFileSync('.env.local', 'utf-8').split('\n')) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].replace(/^["']|["']$/g, '')
      }
    }
  } catch {
    /* no .env.local — rely on the ambient environment */
  }
}
loadEnvLocal()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceRoleKey) {
  console.error('✗ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.')
  process.exit(1)
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const DEMO = { email: 'demo@promptside.com', password: 'demo123', name: 'Demo User' }

async function ensureDemoUser(): Promise<string> {
  // Idempotent: reuse the existing demo user if present.
  const { data: list, error: listError } = await supabase.auth.admin.listUsers()
  if (listError) throw new Error(`listUsers failed: ${listError.message}`)
  const existing = list.users.find((u) => u.email === DEMO.email)
  if (existing) return existing.id

  const { data, error } = await supabase.auth.admin.createUser({
    email: DEMO.email,
    password: DEMO.password,
    email_confirm: true,
    user_metadata: { full_name: DEMO.name },
  })
  if (error || !data.user) throw new Error(`createUser failed: ${error?.message ?? 'no user'}`)
  return data.user.id
}

function sampleGenerations(userId: string) {
  const now = new Date()
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const on = (day: number) => `${ym}-${String(day).padStart(2, '0')}`

  const rows = [
    { category: 'Website', token_cost: 0.65, status: 'completed', date: on(3), prompt: 'Landing page for a specialty coffee roastery', description: 'Warm, editorial single-page site', output_url: 'https://example.com/roastery' },
    { category: 'Mobile Apps', token_cost: 2.5, status: 'completed', date: on(6), prompt: 'A daily habit-tracking app', description: 'React Native habit tracker UI', output_url: null },
    { category: 'Games', token_cost: 1.2, status: 'completed', date: on(9), prompt: 'A 2D endless runner', description: 'Canvas-based browser game', output_url: null },
    { category: 'Slides', token_cost: 0.4, status: 'completed', date: on(12), prompt: 'Seed-stage investor pitch deck', description: '10-slide narrative deck', output_url: null },
    { category: 'Design', token_cost: 0.25, status: 'completed', date: on(15), prompt: 'Logo concepts for a fintech brand', description: 'Three distinct logo directions', output_url: null },
    { category: 'Video Generation', token_cost: 2.5, status: 'running', date: on(18), prompt: '15-second product teaser', description: 'Cinematic teaser render', output_url: null },
    { category: 'Image Generation', token_cost: 0.4, status: 'completed', date: on(21), prompt: 'Hero image — mountains at dawn', description: 'Four hero variations', output_url: null },
    { category: 'Visualisation', token_cost: 0.65, status: 'failed', date: on(24), prompt: 'Quarterly sales dashboard charts', description: 'Revenue visualisation', output_url: null },
  ]
  return rows.map((r) => ({ ...r, user_id: userId, metadata: { seed: true } }))
}

async function main(): Promise<void> {
  const userId = await ensureDemoUser()

  // Idempotent: skip if this user already has seeded generations.
  const { count, error: countError } = await supabase
    .from('generations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  if (countError) throw new Error(`count failed: ${countError.message}`)
  if ((count ?? 0) > 0) {
    console.log(`• Seed skipped — ${count} generation(s) already exist for ${DEMO.email}.`)
    return
  }

  const rows = sampleGenerations(userId)
  const { error } = await supabase.from('generations').insert(rows)
  if (error) throw new Error(`insert generations failed: ${error.message}`)
  console.log(`✓ Seeded ${DEMO.email} + ${rows.length} sample generations.`)
}

main().catch((error) => {
  console.error('✗ Seed failed:', error instanceof Error ? error.message : error)
  process.exit(1)
})
