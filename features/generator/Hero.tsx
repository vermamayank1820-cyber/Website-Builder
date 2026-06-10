import { Sparkles } from 'lucide-react'

import { PromptForm } from './PromptForm'

interface HeroProps {
  prompt: string
  isLoading: boolean
  error: string | null
  onPromptChange: (prompt: string) => void
  onSubmit: (prompt: string) => void
}

export function Hero({ prompt, isLoading, error, onPromptChange, onSubmit }: HeroProps) {
  return (
    <main className="bg-grid bg-glow relative flex min-h-screen flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="flex flex-col items-center text-center">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-muted">
          <Sparkles className="h-3.5 w-3.5 text-accent-secondary" />
          Prompt to landing page
        </span>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
          Describe it. <span className="text-accent-gradient">We&apos;ll build</span> the
          landing page.
        </h1>
        <p className="mt-5 max-w-xl text-base text-muted sm:text-lg">
          Type a prompt and get a polished, production-ready React landing page —
          live preview and editable code, in seconds.
        </p>
      </div>

      <div className="mt-10 flex w-full justify-center">
        <PromptForm
          value={prompt}
          isLoading={isLoading}
          onChange={onPromptChange}
          onSubmit={onSubmit}
        />
      </div>

      {isLoading ? (
        <p className="mt-4 text-center text-sm text-muted">
          Designing your page — this usually takes about a minute.
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 max-w-xl text-center text-sm text-red-400">{error}</p>
      ) : null}
    </main>
  )
}
