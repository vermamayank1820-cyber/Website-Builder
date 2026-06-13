import { NextResponse, type NextRequest } from 'next/server'

import { ProviderError } from '@/lib/providers'
import { generateDeck } from '@/lib/slides/generate'

export const runtime = 'nodejs'
export const maxDuration = 120

/**
 * Slides generation. { prompt, context? } → a validated SlideDeck. Mirrors the
 * website-generation route's shape (provider abstraction + JSON envelope).
 */
export async function POST(request: NextRequest) {
  let body: { prompt?: string; context?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Request body must be valid JSON' }, { status: 400 })
  }
  if (!body.prompt || body.prompt.trim().length < 8) {
    return NextResponse.json({ success: false, error: 'Describe the deck you want' }, { status: 400 })
  }

  try {
    const deck = await generateDeck({ prompt: body.prompt, context: body.context })
    if (deck.slides.length === 0) {
      return NextResponse.json({ success: false, error: 'Could not generate a deck — try a richer prompt' }, { status: 422 })
    }
    return NextResponse.json({ success: true, data: deck })
  } catch (error) {
    const status = error instanceof ProviderError ? error.status : 502
    const message = error instanceof Error ? error.message : 'Generation failed'
    return NextResponse.json({ success: false, error: message }, { status })
  }
}
