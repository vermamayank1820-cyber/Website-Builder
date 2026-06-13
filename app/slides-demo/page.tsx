'use client'

import { DeckViewer } from '@/features/slides/DeckViewer'
import { FIXTURE_DECK } from '@/lib/slides/fixture'

/** Public harness for the Slides renderer (the authed flow + live LLM call
 *  aren't reachable headless). Not a product surface. */
export default function SlidesDemoPage() {
  return <DeckViewer deck={FIXTURE_DECK} />
}
