import { useCallback } from 'react'

import { useGeneratorStore } from '@/store/generator-store'
import type { ApiResponse, GenerateResponseData } from '@/types'

async function postJson(
  url: string,
  body: Record<string, unknown>
): Promise<ApiResponse<GenerateResponseData>> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  return (await response.json()) as ApiResponse<GenerateResponseData>
}

function createMessageId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

/**
 * Drives the generate/edit lifecycle against the API routes, updating the
 * shared generator store and conversation history as the request progresses.
 */
export function useGenerate() {
  const setStatus = useGeneratorStore((state) => state.setStatus)
  const setCode = useGeneratorStore((state) => state.setCode)
  const setError = useGeneratorStore((state) => state.setError)
  const addMessage = useGeneratorStore((state) => state.addMessage)
  const updateMessage = useGeneratorStore((state) => state.updateMessage)
  const setLastGeneratedAt = useGeneratorStore((state) => state.setLastGeneratedAt)
  const code = useGeneratorStore((state) => state.code)

  const generate = useCallback(
    async (prompt: string) => {
      setStatus('generating')
      setError(null)

      const assistantId = createMessageId()
      addMessage({ id: createMessageId(), role: 'user', content: prompt })
      addMessage({
        id: assistantId,
        role: 'assistant',
        content:
          "I'll design a landing page based on your prompt and set up the layout, content, and styling.",
        card: { title: 'Building your page…', status: 'building' },
      })

      const result = await postJson('/api/generate', { prompt })

      if (!result.success || !result.data) {
        setError(result.error ?? 'Failed to generate the page')
        setStatus('error')
        updateMessage(assistantId, {
          content: 'Something went wrong while building your page. Please try again.',
          card: { title: 'Build failed', status: 'error' },
        })
        return
      }

      setCode(result.data.code)
      setStatus('ready')
      setLastGeneratedAt(Date.now())
      updateMessage(assistantId, {
        content:
          "Your landing page is ready — check the preview, or tell me what to change next.",
        card: { title: 'Created landing page', status: 'done' },
      })
    },
    [setStatus, setCode, setError, addMessage, updateMessage, setLastGeneratedAt]
  )

  const edit = useCallback(
    async (prompt: string) => {
      setStatus('generating')
      setError(null)

      const assistantId = createMessageId()
      addMessage({ id: createMessageId(), role: 'user', content: prompt })
      addMessage({
        id: assistantId,
        role: 'assistant',
        content: "I'll update the page to match that.",
        card: { title: 'Updating your page…', status: 'building' },
      })

      const result = await postJson('/api/edit', { prompt, currentCode: code })

      if (!result.success || !result.data) {
        setError(result.error ?? 'Failed to update the page')
        setStatus('error')
        updateMessage(assistantId, {
          content: 'Something went wrong while updating your page. Please try again.',
          card: { title: 'Update failed', status: 'error' },
        })
        return
      }

      setCode(result.data.code)
      setStatus('ready')
      setLastGeneratedAt(Date.now())
      updateMessage(assistantId, {
        content: "Done! I've updated the page — check the preview for the changes.",
        card: { title: 'Updated landing page', status: 'done' },
      })
    },
    [code, setStatus, setCode, setError, addMessage, updateMessage, setLastGeneratedAt]
  )

  return { generate, edit }
}
