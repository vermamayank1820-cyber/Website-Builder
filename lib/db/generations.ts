import { getSupabaseBrowserClient } from '@/lib/supabase/client'

/** Allowed generation statuses (mirrors the DB CHECK constraint). */
export const GENERATION_STATUSES = ['pending', 'running', 'completed', 'failed'] as const
export type GenerationStatus = (typeof GENERATION_STATUSES)[number]

/** Allowed generation categories (mirrors the DB CHECK constraint). */
export const GENERATION_CATEGORIES = [
  'Website',
  'Mobile Apps',
  'Games',
  'Slides',
  'Design',
  'Desktop Apps/PWA',
  'Video Generation',
  'Image Generation',
  'Scheduled Task',
  'Wide Research',
  'Visualisation',
  'Audio Generation',
  'More/Other',
] as const
export type GenerationCategory = (typeof GENERATION_CATEGORIES)[number]

/** A row of public.generations. `user_id` is an auth.users id. */
export interface Generation {
  id: string
  user_id: string
  token_cost: number
  category: GenerationCategory
  prompt: string | null
  description: string | null
  status: GenerationStatus
  output_url: string | null
  metadata: Record<string, unknown> | null
  /** YYYY-MM-DD */
  date: string
  created_at: string
}

export interface CreateGenerationInput {
  category: GenerationCategory
  tokenCost: number
  prompt?: string | null
  description?: string | null
  status?: GenerationStatus
  outputUrl?: string | null
  metadata?: Record<string, unknown> | null
  /** Defaults to today (YYYY-MM-DD). */
  date?: string
}

function assertNoError(error: { message: string } | null, action: string): void {
  if (error) throw new Error(`${action}: ${error.message}`)
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Lists the signed-in user's generations, newest first (RLS-scoped). */
export async function listGenerations(): Promise<Generation[]> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('generations')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
  assertNoError(error, 'Failed to load generations')
  return (data ?? []) as Generation[]
}

/** Records a new generation for the signed-in user. */
export async function createGeneration(input: CreateGenerationInput): Promise<Generation> {
  const supabase = getSupabaseBrowserClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('You must be signed in to record a generation')

  const { data, error } = await supabase
    .from('generations')
    .insert({
      user_id: user.id,
      category: input.category,
      token_cost: input.tokenCost,
      prompt: input.prompt ?? null,
      description: input.description ?? null,
      status: input.status ?? 'completed',
      output_url: input.outputUrl ?? null,
      metadata: input.metadata ?? null,
      date: input.date ?? today(),
    })
    .select('*')
    .single()
  assertNoError(error, 'Failed to record generation')
  return data as Generation
}

/** Updates the status of a generation (e.g. running → completed/failed). */
export async function updateGenerationStatus(
  id: string,
  status: GenerationStatus
): Promise<void> {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase.from('generations').update({ status }).eq('id', id)
  assertNoError(error, 'Failed to update generation status')
}
