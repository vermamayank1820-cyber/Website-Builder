import { NextResponse } from 'next/server'

import { buildWebsiteContext } from '@/lib/agents/prompts'
import { generateLandingPage } from '@/lib/ai/generate'
import { generateRequestSchema } from '@/lib/ai/schema'
import { ProviderError } from '@/lib/providers'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import type { ApiResponse, BusinessKnowledge, GenerateResponseData } from '@/types'

// Allow the function to run long enough for larger completions
// (requires a Vercel plan that supports it).
export const maxDuration = 120

function toErrorResponse(error: unknown): { message: string; status: number } {
  if (error instanceof ProviderError) {
    return { message: error.message, status: error.status }
  }

  if (error instanceof Error) {
    return { message: error.message, status: 502 }
  }

  return { message: 'Unexpected error', status: 502 }
}

export async function POST(
  request: Request
): Promise<NextResponse<ApiResponse<GenerateResponseData>>> {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: 'Request body must be valid JSON' },
      { status: 400 }
    )
  }

  const parsed = generateRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid request' },
      { status: 400 }
    )
  }

  // When the request belongs to a project with a knowledge base, ground
  // the generation in it (RLS scopes the lookup to the signed-in owner).
  let businessContext: string | undefined
  let industryHint: string | undefined
  if (parsed.data.projectId) {
    try {
      const supabase = await getSupabaseServerClient()
      const { data: profile } = await supabase
        .from('business_profiles')
        .select('knowledge')
        .eq('project_id', parsed.data.projectId)
        .maybeSingle()
      if (profile?.knowledge) {
        const knowledge = profile.knowledge as BusinessKnowledge
        businessContext = buildWebsiteContext(knowledge)
        industryHint = knowledge.industry
      }
    } catch {
      // Knowledge base unavailable — generate from the prompt alone.
    }
  }

  try {
    const { code, summary } = await generateLandingPage(
      parsed.data.prompt,
      businessContext,
      industryHint ?? parsed.data.prompt
    )
    return NextResponse.json({ success: true, data: { code, summary } })
  } catch (error: unknown) {
    const { message, status } = toErrorResponse(error)
    return NextResponse.json({ success: false, error: message }, { status })
  }
}
