'use client'

import {
  ArrowUp,
  Check,
  ChevronDown,
  ImagePlus,
  LayoutTemplate,
  Link2,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'

import { SOURCE_LABELS, detectSourceType, extractUrl } from '@/lib/agents/url'
import { cn } from '@/utils/cn'

interface PromptComposerProps {
  isBusy: boolean
  /** Status line shown while a generation is in flight. */
  busyLabel?: string
  error: string | null
  onSubmit: (prompt: string) => void
  onTemplatesClick: () => void
}

const MODELS = [{ id: 'promptsite-1', label: 'PromptSite 1.0', available: true }]
const HINT_TIMEOUT_MS = 2600

/**
 * The dominant hero element: a large glass prompt box with attach, model,
 * and templates controls — Lovable-style. Cmd/Ctrl+Enter or the arrow
 * button submits.
 */
export function PromptComposer({
  isBusy,
  busyLabel = 'Designing your website — this usually takes about a minute…',
  error,
  onSubmit,
  onTemplatesClick,
}: PromptComposerProps) {
  const [value, setValue] = useState('')
  const [hint, setHint] = useState<string | null>(null)
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false)
  const modelMenuRef = useRef<HTMLDivElement>(null)
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!isModelMenuOpen) return
    const handleClick = (event: MouseEvent) => {
      if (!modelMenuRef.current?.contains(event.target as Node)) {
        setIsModelMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isModelMenuOpen])

  useEffect(() => () => {
    if (hintTimer.current) clearTimeout(hintTimer.current)
  }, [])

  const showHint = (message: string) => {
    setHint(message)
    if (hintTimer.current) clearTimeout(hintTimer.current)
    hintTimer.current = setTimeout(() => setHint(null), HINT_TIMEOUT_MS)
  }

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed || isBusy) return
    onSubmit(trimmed)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault()
      submit()
    }
  }

  const controlButtonClasses =
    'inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white'

  // Universal input: a pasted link upgrades the run to link intelligence.
  const detectedSource = useMemo(() => {
    const url = extractUrl(value)
    return url ? SOURCE_LABELS[detectSourceType(url)] : null
  }, [value])

  return (
    <div className="w-full max-w-2xl">
      <div
        className={cn(
          'glass-card rounded-[28px] transition-all duration-300',
          'focus-within:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),inset_0_0_0_1px_rgba(255,255,255,0.1),0_24px_72px_-20px_rgba(139,92,246,0.35),0_24px_64px_-24px_rgba(0,0,0,0.85)]'
        )}
      >
        <label htmlFor="composer" className="sr-only">
          Describe your website
        </label>
        <textarea
          id="composer"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isBusy}
          rows={4}
          placeholder="Describe your goal, or paste a link — your website, GitHub, Instagram…"
          className="w-full resize-none bg-transparent px-6 pb-2 pt-5.5 text-[0.98rem] leading-relaxed text-white placeholder:text-white/30 focus:outline-none disabled:opacity-60"
        />

        {detectedSource ? (
          <div className="px-5 pb-1">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/10 px-2.5 py-1 text-[0.7rem] font-medium text-accent">
              <Link2 className="h-3 w-3" />
              {detectedSource} detected — the agent will analyze it
            </span>
          </div>
        ) : null}

        <div className="flex items-center gap-1 px-3.5 pb-3.5">
          <button
            type="button"
            onClick={() => showHint('Image attachments are coming soon')}
            disabled={isBusy}
            title="Attach image"
            className={controlButtonClasses}
          >
            <ImagePlus className="h-4 w-4" />
            <span className="hidden sm:inline">Attach</span>
          </button>

          <div ref={modelMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsModelMenuOpen((open) => !open)}
              disabled={isBusy}
              aria-haspopup="menu"
              aria-expanded={isModelMenuOpen}
              className={controlButtonClasses}
            >
              <Sparkles className="h-4 w-4" />
              {MODELS[0].label}
              <ChevronDown className="h-3 w-3" />
            </button>
            {isModelMenuOpen ? (
              <div
                role="menu"
                className="absolute bottom-11 left-0 z-20 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#101014] p-1.5 shadow-[0_24px_64px_-16px_rgba(0,0,0,0.9)]"
              >
                {MODELS.map((model) => (
                  <button
                    key={model.id}
                    type="button"
                    role="menuitemradio"
                    aria-checked
                    onClick={() => setIsModelMenuOpen(false)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs text-white/80 transition-colors hover:bg-white/5"
                  >
                    {model.label}
                    <Check className="h-3.5 w-3.5 text-accent" />
                  </button>
                ))}
                <p className="px-3 py-2 text-[0.65rem] text-white/35">More models coming soon</p>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onTemplatesClick}
            disabled={isBusy}
            className={controlButtonClasses}
          >
            <LayoutTemplate className="h-4 w-4" />
            <span className="hidden sm:inline">Templates</span>
          </button>

          <div className="flex-1" />

          <button
            type="button"
            onClick={submit}
            disabled={isBusy || !value.trim()}
            title="Generate Website (⌘↵)"
            className={cn(
              'ease-spring inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200',
              'bg-[linear-gradient(180deg,rgba(255,255,255,0.2),rgba(255,255,255,0)_45%),linear-gradient(135deg,var(--accent),var(--accent-secondary))]',
              'shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_0_0_1px_rgba(255,255,255,0.08),0_12px_32px_-10px_var(--accent)]',
              'enabled:hover:scale-[1.02] enabled:hover:brightness-110 enabled:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.28),inset_0_0_0_1px_rgba(255,255,255,0.14),0_16px_44px_-10px_var(--accent)]',
              'enabled:active:scale-[0.98]',
              'disabled:cursor-not-allowed disabled:opacity-40'
            )}
          >
            {isBusy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">{isBusy ? 'Generating…' : 'Generate Website'}</span>
          </button>
        </div>
      </div>

      <div className="mt-3.5 min-h-5 text-center" aria-live="polite">
        {isBusy ? <p className="text-sm text-white/55">{busyLabel}</p> : null}
        {!isBusy && error ? <p className="text-sm text-red-300">{error}</p> : null}
        {!isBusy && !error && hint ? <p className="text-sm text-white/45">{hint}</p> : null}
      </div>
    </div>
  )
}
