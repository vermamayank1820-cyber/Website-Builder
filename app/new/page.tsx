'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef } from 'react'

import { LogoMark } from '@/components/ui/LogoMark'
import { Hero } from '@/features/generator/Hero'
import { useCreateProject } from '@/hooks/use-create-project'
import { useGeneratorStore } from '@/store/generator-store'

/**
 * Standalone new-project flow (the creation-first homepage at /workspace
 * is the primary entry). Prompt → generate → persist → open the editor.
 */
export default function NewProjectPage() {
  const prompt = useGeneratorStore((state) => state.prompt)
  const status = useGeneratorStore((state) => state.status)
  const error = useGeneratorStore((state) => state.error)
  const setPrompt = useGeneratorStore((state) => state.setPrompt)
  const reset = useGeneratorStore((state) => state.reset)

  const { createFromPrompt, isSaving } = useCreateProject()
  const didReset = useRef(false)

  // Clear any previously open project's state when starting fresh.
  useEffect(() => {
    if (!didReset.current) {
      didReset.current = true
      reset()
    }
  }, [reset])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 py-4">
        <Link
          href="/workspace"
          className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Workspace
        </Link>
        <div className="flex items-center gap-2.5">
          <LogoMark />
          <span className="hidden text-sm font-semibold tracking-tight sm:inline">
            PromptSite
          </span>
        </div>
      </header>

      <Hero
        prompt={prompt}
        isLoading={status === 'generating' || isSaving}
        error={error}
        onPromptChange={setPrompt}
        onSubmit={(value) => void createFromPrompt(value)}
      />
    </div>
  )
}
