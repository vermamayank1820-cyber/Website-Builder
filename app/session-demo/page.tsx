'use client'

import { useEffect } from 'react'

import { LiveSession } from '@/features/generation/LiveSession'
import { expandToText } from '@/lib/prompt-expansion'
import { useGenerationStore } from '@/store/generation-store'

/**
 * Public harness for the live generation session (the authed flow + real
 * minutes-long model call can't be screenshotted live). Not a product surface.
 */
export default function SessionDemoPage() {
  const start = useGenerationStore((s) => s.start)
  const reset = useGenerationStore((s) => s.reset)

  useEffect(() => {
    const prompt = expandToText({ surfaceId: 'website', subSurfaceId: 'landing', idea: 'Build a waitlist landing page' })
    start(prompt, 'Website')
    return () => reset()
  }, [start, reset])

  const restart = () => {
    const prompt = expandToText({ surfaceId: 'website', subSurfaceId: 'landing', idea: 'Build a waitlist landing page' })
    reset()
    start(prompt, 'Website')
  }

  return <LiveSession onClose={restart} />
}
