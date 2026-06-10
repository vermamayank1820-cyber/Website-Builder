'use client'

import { Hero } from '@/features/generator/Hero'
import { Workspace } from '@/features/generator/Workspace'
import { useGenerate } from '@/hooks/use-generate'
import { useGeneratorStore } from '@/store/generator-store'

export default function Home() {
  const prompt = useGeneratorStore((state) => state.prompt)
  const code = useGeneratorStore((state) => state.code)
  const status = useGeneratorStore((state) => state.status)
  const error = useGeneratorStore((state) => state.error)
  const messages = useGeneratorStore((state) => state.messages)
  const lastGeneratedAt = useGeneratorStore((state) => state.lastGeneratedAt)
  const setPrompt = useGeneratorStore((state) => state.setPrompt)
  const setCode = useGeneratorStore((state) => state.setCode)
  const reset = useGeneratorStore((state) => state.reset)

  const { generate, edit } = useGenerate()

  const isLoading = status === 'generating'

  if (!code) {
    return (
      <Hero
        prompt={prompt}
        isLoading={isLoading}
        error={error}
        onPromptChange={setPrompt}
        onSubmit={(value) => {
          setPrompt(value)
          void generate(value)
        }}
      />
    )
  }

  return (
    <Workspace
      prompt={prompt}
      code={code}
      messages={messages}
      status={status}
      isLoading={isLoading}
      error={error}
      lastGeneratedAt={lastGeneratedAt}
      onCodeChange={setCode}
      onRefine={(instruction) => void edit(instruction)}
      onReset={reset}
    />
  )
}
