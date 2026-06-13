import type { NextRequest } from 'next/server'

import { encodeEvent, type GenEvent } from '@/lib/generation/events'
import { buildSessionScript } from '@/lib/generation/script'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Resolves after `ms`, or early if the request aborts. */
function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) return resolve()
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    const onAbort = () => {
      clearTimeout(timer)
      resolve()
    }
    signal.addEventListener('abort', onAbort, { once: true })
  })
}

/**
 * Streams a generation session as typed SSE events. Cancellation is real:
 * aborting the client fetch aborts request.signal, which stops the loop and
 * emits CANCELLED. Completed phases are preserved (the UI keeps them).
 */
export async function GET(request: NextRequest) {
  const prompt = request.nextUrl.searchParams.get('prompt') ?? ''
  const surface = request.nextUrl.searchParams.get('surface') ?? 'Website'
  const steps = buildSessionScript(prompt, surface)
  const encoder = new TextEncoder()
  const signal = request.signal

  let elapsed = 0
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (e: GenEvent) => {
        try {
          controller.enqueue(encoder.encode(encodeEvent(e)))
        } catch {
          /* stream already closed */
        }
      }
      for (const step of steps) {
        await sleep(step.delayMs, signal)
        if (signal.aborted) {
          send({ type: 'CANCELLED', t: elapsed })
          controller.close()
          return
        }
        elapsed += step.delayMs
        send({ ...step.event, t: elapsed } as GenEvent)
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
