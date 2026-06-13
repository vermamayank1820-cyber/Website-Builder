import { NextResponse, type NextRequest } from 'next/server'

import { understand } from '@/lib/knowledge/understand'

export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * Structured understanding endpoint: { prompt?, text? } → KnowledgeGraph +
 * intent + planner + generation context. The text is typically the output of
 * /api/parse for one or more attached documents.
 */
export async function POST(request: NextRequest) {
  let body: { prompt?: string; text?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.prompt && !body.text) {
    return NextResponse.json({ success: false, error: 'Provide prompt or text' }, { status: 400 })
  }

  try {
    const result = await understand({ prompt: body.prompt, text: body.text })
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Understanding failed' },
      { status: 502 },
    )
  }
}
