import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'

import { useGenerate } from '@/hooks/use-generate'
import { deriveProjectMeta } from '@/lib/projects/derive-meta'
import { createProject } from '@/lib/projects/service'
import { useGeneratorStore } from '@/store/generator-store'

/**
 * Prompt → generate → persist project + v1 → open the editor. Shared by
 * the creation-first homepage and /new. The generator store carries the
 * result across navigation so the editor opens without refetching.
 */
export function useCreateProject() {
  const router = useRouter()
  const { generate } = useGenerate()
  const [isSaving, setIsSaving] = useState(false)

  const setPrompt = useGeneratorStore((state) => state.setPrompt)
  const setError = useGeneratorStore((state) => state.setError)
  const setProject = useGeneratorStore((state) => state.setProject)

  const createFromPrompt = useCallback(
    async (value: string) => {
      setPrompt(value)
      const data = await generate(value)
      if (!data) return

      setIsSaving(true)
      try {
        const meta = deriveProjectMeta(value, data.summary ?? null)
        const project = await createProject({
          title: meta.title,
          category: meta.category,
          prompt: value,
          code: data.code,
          generationSummary: `Created ${meta.title}`,
          summaryData: data.summary ?? null,
        })
        setProject({ id: project.id, title: project.title })
        router.replace(`/project/${project.id}`)
      } catch (cause: unknown) {
        setIsSaving(false)
        setError(
          cause instanceof Error
            ? `Your page was generated but could not be saved — ${cause.message}`
            : 'Your page was generated but could not be saved.'
        )
      }
    },
    [generate, router, setPrompt, setError, setProject]
  )

  return { createFromPrompt, isSaving }
}
