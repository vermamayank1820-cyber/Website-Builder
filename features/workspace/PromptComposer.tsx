'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowUp,
  ArrowUpLeft,
  ChevronRight,
  Link2,
  Loader2,
  Mic,
  Sparkles,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'

import { SOURCE_LABELS, detectSourceType, extractUrl } from '@/lib/agents/url'
import { analyzeInput } from '@/lib/input/analyze'
import { CHUNK_THRESHOLD_CHARS } from '@/lib/input/constants'
import { expandToText } from '@/lib/prompt-expansion'
import { SURFACES } from '@/lib/surfaces/catalog'
import { useAttachmentStore } from '@/store/attachment-store'
import { cn } from '@/utils/cn'

import { AttachmentButton } from './attachments/AttachmentButton'
import { FileChips } from './attachments/FileChips'
import { UnderstandingDebug } from './attachments/UnderstandingDebug'

interface PromptComposerProps {
  isBusy: boolean
  /** Status line shown while a generation is in flight. */
  busyLabel?: string
  error: string | null
  onSubmit: (prompt: string) => void
  onTemplatesClick: () => void
}

const HINT_TIMEOUT_MS = 2600
/** Surfaces shown directly in the selector row; the rest live under "More". */
const PRIMARY_SURFACE_IDS = ['website']

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
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Website is the only surface — pre-select it so the user goes straight to
  // choosing a vertical (SaaS / Cafe / Real Estate).
  const [surfaceId, setSurfaceId] = useState<string | null>('website')
  const [subId, setSubId] = useState<string | null>(null)
  const [moreOpen, setMoreOpen] = useState(false)
  /** True while the composer holds an auto-expanded spec the user hasn't edited. */
  const [autofilled, setAutofilled] = useState(false)
  const surface = useMemo(() => SURFACES.find((s) => s.id === surfaceId) ?? null, [surfaceId])
  const sub = useMemo(
    () => surface?.subSurfaces.find((x) => x.id === subId) ?? null,
    [surface, subId]
  )
  const suggestions = sub?.suggestions ?? surface?.suggestions ?? []

  const selectSurface = (id: string | null) => {
    setSurfaceId(id)
    setSubId(null)
    setMoreOpen(false)
    setAutofilled(false)
    textareaRef.current?.focus()
  }
  /**
   * Prompt Expansion Engine: a clicked idea becomes a structured mini-PRD in
   * the composer (editable) — never a bare one-line prompt.
   */
  const fillFromIntent = (idea: string, subOverride?: string | null) => {
    setValue(
      expandToText({
        surfaceId,
        subSurfaceId: subOverride !== undefined ? subOverride : subId,
        idea,
      })
    )
    setAutofilled(true)
    textareaRef.current?.focus()
  }
  const applySuggestion = (idea: string) => fillFromIntent(idea)
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (hintTimer.current) clearTimeout(hintTimer.current)
  }, [])

  const showHint = (message: string) => {
    setHint(message)
    if (hintTimer.current) clearTimeout(hintTimer.current)
    hintTimer.current = setTimeout(() => setHint(null), HINT_TIMEOUT_MS)
  }

  const attachedFiles = useAttachmentStore((s) => s.files)
  const readyContext = useAttachmentStore((s) => s.readyContext)
  const hasReadyAttachment = attachedFiles.some((f) => f.status === 'ready')

  const submit = () => {
    const trimmed = value.trim()
    const context = readyContext()
    if ((!trimmed && !context) || isBusy) return
    // Attached documents become additional context for generation.
    const base = trimmed || 'Build a website using the attached document(s).'
    onSubmit(context ? `${base}\n\n${context}` : base)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault()
      submit()
    }
  }

  // Universal input: a pasted link upgrades the run to link intelligence.
  const detectedSource = useMemo(() => {
    const url = extractUrl(value)
    return url ? SOURCE_LABELS[detectSourceType(url)] : null
  }, [value])

  // Real-time input statistics + content-type detection (no size limit).
  const stats = useMemo(() => analyzeInput(value), [value])
  const isLargeInput = stats.chars > CHUNK_THRESHOLD_CHARS
  const numberFmt = useMemo(() => new Intl.NumberFormat('en-US'), [])

  return (
    <div className="w-full max-w-3xl">
      <div className="composer-surface">
        <span className="composer-halo" aria-hidden="true" />
        <label htmlFor="composer" className="sr-only">
          Describe what you want to create
        </label>
        <textarea
          id="composer"
          ref={textareaRef}
          value={value}
          onChange={(event) => {
            setValue(event.target.value)
            setAutofilled(false)
          }}
          onKeyDown={handleKeyDown}
          disabled={isBusy}
          rows={4}
          placeholder={surface ? surface.placeholder : 'Describe what you want to create, or paste a link…'}
          className="w-full resize-none bg-transparent px-6 pb-2 pt-6 text-[1.02rem] leading-relaxed text-foreground placeholder:text-white/28 focus:outline-none disabled:opacity-60"
        />

        {value.trim() ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-5 pb-1">
            {detectedSource ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/10 px-2.5 py-1 text-[0.7rem] font-medium text-accent">
                <Link2 className="h-3 w-3" />
                {detectedSource} detected — the agent will analyze it
              </span>
            ) : null}
            {stats.contentType ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-2.5 py-1 text-[0.7rem] font-medium text-white/70">
                <Sparkles className="h-3 w-3" />
                {stats.contentType} detected
              </span>
            ) : null}
            <span className="text-[0.7rem] tabular-nums text-white/40">
              {numberFmt.format(stats.chars)} characters · {numberFmt.format(stats.words)} words
              {isLargeInput ? ' · large input — we’ll structure it first' : ''}
            </span>
          </div>
        ) : null}

        <FileChips />

        <div className="flex items-center gap-1 px-3.5 pb-3.5">
          <AttachmentButton disabled={isBusy} onComingSoon={showHint} />

          {surface ? (
            <button
              type="button"
              onClick={() => selectSurface(null)}
              className="ml-0.5 inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/12 py-1.5 pl-2.5 pr-2 text-xs font-medium text-accent-secondary transition-colors hover:bg-accent/18"
              title="Clear surface"
            >
              <surface.icon className="h-3.5 w-3.5" />
              {surface.label}
              <X className="h-3 w-3 opacity-70" />
            </button>
          ) : null}

          <div className="flex-1" />

          <button
            type="button"
            onClick={() => showHint('Voice input is coming soon')}
            disabled={isBusy}
            aria-label="Voice input"
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/55 transition-colors duration-150 hover:bg-white/[0.06] hover:text-foreground disabled:opacity-50"
          >
            <Mic className="h-[1.05rem] w-[1.05rem]" />
          </button>

          <button
            type="button"
            onClick={submit}
            disabled={isBusy || (!value.trim() && !hasReadyAttachment)}
            title="Generate (⌘↵)"
            aria-label="Generate"
            className="composer-send"
          >
            {isBusy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Surface OS — the interface morphs in place (no navigation). */}
      <div className="mt-5">
        <AnimatePresence mode="wait" initial={false}>
          {!surface ? (
            <motion.div
              key="selector"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
              className="surface-rail flex items-center gap-1 overflow-x-auto pb-1"
            >
              {SURFACES.map((s) => (
                <button key={s.id} type="button" className="surface-chip flex-none" onClick={() => selectSurface(s.id)}>
                  <s.icon className="h-4 w-4" />
                  {s.label}
                </button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key={surface.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
            >
              {surface.subSurfaces.length > 0 ? (
                <>
                  <p className="mb-2.5 text-left text-[0.8rem] font-medium text-white/55">What would you like to build?</p>
                  <div className="flex flex-wrap gap-2">
                    {surface.subSurfaces.map((ss) => {
                      const active = subId === ss.id
                      return (
                        <button
                          key={ss.id}
                          type="button"
                          onClick={() => {
                            const next = active ? null : ss.id
                            setSubId(next)
                            if (next && (autofilled || !value.trim())) fillFromIntent(ss.label, next)
                          }}
                          className={cn(
                            'rounded-xl px-3.5 py-2 text-[0.85rem] transition-all duration-200',
                            active
                              ? 'bg-accent/12 text-accent-secondary shadow-[inset_0_0_0_1px_var(--accent-ring)]'
                              : 'bg-white/[0.03] text-white/65 shadow-[inset_0_0_0_1px_var(--hairline)] hover:bg-white/[0.06] hover:text-white'
                          )}
                        >
                          {ss.label}
                        </button>
                      )
                    })}
                  </div>
                </>
              ) : null}

              {suggestions.length > 0 ? (
                <div className={cn(surface.subSurfaces.length > 0 && 'mt-5')}>
                  <p className="mb-2.5 text-left text-[0.8rem] font-medium text-white/55">
                    {sub ? 'Explore ideas' : 'Suggestions'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((text) => (
                      <button
                        key={text}
                        type="button"
                        onClick={() => applySuggestion(text)}
                        className="group inline-flex items-center gap-2 rounded-xl bg-white/[0.03] px-3.5 py-2.5 text-[0.85rem] text-white/70 shadow-[inset_0_0_0_1px_var(--hairline)] transition-all duration-200 hover:-translate-y-px hover:bg-white/[0.06] hover:text-white hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)]"
                      >
                        {text}
                        <ArrowUpLeft className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-60" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-3.5 min-h-5 text-center" aria-live="polite">
        {isBusy ? <p className="text-sm text-white/55">{busyLabel}</p> : null}
        {!isBusy && error ? <p className="text-sm text-red-300">{error}</p> : null}
        {!isBusy && !error && hint ? <p className="text-sm text-white/45">{hint}</p> : null}
      </div>

      <UnderstandingDebug />
    </div>
  )
}
