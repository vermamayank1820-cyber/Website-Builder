'use client'

import {
  Check,
  ChevronRight,
  Circle,
  FileCode2,
  Loader2,
  Square,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import {
  useGenerationStore,
  type FeedItem,
  type PhaseState,
} from '@/store/generation-store'
import { cn } from '@/utils/cn'

const TABS = ['Analysis', 'Code', 'Preview', 'Logs'] as const
type Tab = (typeof TABS)[number]

function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setNow(Date.now()), 400)
    return () => clearInterval(id)
  }, [active])
  return now
}

function dur(ms: number): string {
  const s = Math.max(0, Math.round(ms / 100) / 10)
  return `${s.toFixed(1)}s`
}

function PhaseRow({ phase, startEpoch, now }: { phase: PhaseState; startEpoch: number; now: number }) {
  const icon =
    phase.status === 'done' ? (
      <Check className="h-3.5 w-3.5 text-emerald-400" />
    ) : phase.status === 'active' ? (
      <Loader2 className="h-3.5 w-3.5 animate-spin text-accent-secondary" />
    ) : phase.status === 'cancelled' ? (
      <Circle className="h-3.5 w-3.5 text-red-400/60" />
    ) : (
      <Circle className="h-3.5 w-3.5 text-white/20" />
    )
  const duration =
    phase.status === 'done' && phase.startedAt != null && phase.endedAt != null
      ? dur(phase.endedAt - phase.startedAt)
      : phase.status === 'active' && phase.startedAt != null
        ? dur(now - startEpoch - phase.startedAt)
        : null
  return (
    <div
      className={cn(
        'flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors',
        phase.status === 'active' && 'bg-white/[0.04]'
      )}
    >
      <span className="flex-none">{icon}</span>
      <span
        className={cn(
          'flex-1 truncate text-[0.82rem]',
          phase.status === 'pending' ? 'text-white/35' : phase.status === 'cancelled' ? 'text-white/35 line-through' : 'text-white/80'
        )}
      >
        {phase.label}
      </span>
      {duration ? <span className="flex-none font-mono text-[0.66rem] text-white/35">{duration}</span> : null}
    </div>
  )
}

function FeedBlock({ item }: { item: FeedItem }) {
  if (item.kind === 'analysis') {
    const values = Array.isArray(item.value) ? item.value : item.value ? [item.value] : []
    return (
      <div className="rounded-xl bg-white/[0.03] px-3.5 py-3 shadow-[inset_0_0_0_1px_var(--hairline)]">
        <div className="text-[0.7rem] font-medium uppercase tracking-wider text-white/40">{item.key}</div>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {values.map((v, i) => (
            <span key={i} className="rounded-md bg-white/[0.05] px-2 py-0.5 text-[0.8rem] text-white/80">{v}</span>
          ))}
        </div>
      </div>
    )
  }
  if (item.kind === 'progress') {
    return <div className="pl-4 text-[0.82rem] text-white/55">{item.text}</div>
  }
  return (
    <div className="flex gap-2.5">
      <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-accent-secondary/70" />
      <p className="text-[0.88rem] leading-relaxed text-white/75">{item.text}</p>
    </div>
  )
}

function PreviewFrame({ stage }: { stage: string | null }) {
  const lit = (s: string) => ['wireframe', 'hero', 'sections', 'final'].indexOf(stage ?? '') >= ['wireframe', 'hero', 'sections', 'final'].indexOf(s)
  return (
    <div className="mx-auto w-full max-w-md rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="mb-3 flex gap-1.5">
        {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
          <span key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: stage ? c : 'rgba(255,255,255,0.15)' }} />
        ))}
      </div>
      <div className={cn('h-24 rounded-lg transition-colors duration-500', stage && lit('hero') ? 'bg-white/[0.08]' : 'bg-white/[0.03]')} />
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className={cn('h-16 rounded-lg transition-colors duration-500', stage && lit('sections') ? 'bg-white/[0.06]' : 'bg-white/[0.025]')} />
        <div className={cn('h-16 rounded-lg transition-colors duration-500', stage && lit('sections') ? 'bg-white/[0.06]' : 'bg-white/[0.025]')} />
      </div>
      <div className={cn('mt-3 h-10 rounded-lg transition-colors duration-500', stage && lit('final') ? 'bg-white/[0.07]' : 'bg-white/[0.02]')} />
    </div>
  )
}

export function LiveSession({ onClose }: { onClose?: () => void }) {
  const s = useGenerationStore()
  const [tab, setTab] = useState<Tab>('Analysis')
  const feedRef = useRef<HTMLDivElement>(null)
  const logRef = useRef<HTMLDivElement>(null)
  const now = useNow(s.status === 'running')
  const startEpoch = useRef(Date.now()).current

  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: 'smooth' })
  }, [s.feed.length])
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight })
  }, [s.logs.length])

  const running = s.status === 'running'

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="text-[0.7rem] font-medium uppercase tracking-wider text-white/40">{s.surface ?? 'Website'} generation</span>
            {running ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[0.66rem] font-medium text-emerald-400">
                <span className="m-live-dot h-1.5 w-1.5 rounded-full bg-emerald-400" /> Live
              </span>
            ) : s.status === 'cancelled' ? (
              <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[0.66rem] font-medium text-red-400">Stopped</span>
            ) : s.status === 'completed' ? (
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[0.66rem] font-medium text-emerald-400">Complete</span>
            ) : null}
          </div>
          <h1 className="mt-0.5 truncate text-[0.95rem] font-semibold tracking-tight">{s.title ?? 'Preparing…'}</h1>
        </div>
        <div className="flex items-center gap-2">
          {running ? (
            <button
              type="button"
              onClick={s.stop}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 text-[0.8rem] font-medium text-white/85 transition-colors hover:bg-red-500/15 hover:text-red-300"
            >
              <Square className="h-3.5 w-3.5 fill-current" /> Stop
            </button>
          ) : null}
          {onClose ? (
            <button type="button" onClick={onClose} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-full text-white/45 transition-colors hover:bg-white/[0.06] hover:text-white">
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[248px_1fr_400px]">
        {/* Left — timeline */}
        <aside className="hidden min-h-0 flex-col border-r border-white/[0.06] p-3 lg:flex">
          <p className="px-2.5 pb-1.5 pt-1 text-[0.65rem] font-semibold uppercase tracking-widest text-white/30">Generation Timeline</p>
          <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto">
            {s.phases.map((p) => (
              <PhaseRow key={p.id} phase={p} startEpoch={startEpoch} now={now} />
            ))}
          </div>
        </aside>

        {/* Center — activity feed */}
        <section ref={feedRef} className="min-h-0 overflow-y-auto px-6 py-5">
          <p className="pb-3 text-[0.65rem] font-semibold uppercase tracking-widest text-white/30">Live Activity</p>
          <div className="space-y-3.5">
            {s.feed.map((item) => (
              <FeedBlock key={item.id} item={item} />
            ))}
            {running ? (
              <div className="flex items-center gap-2 text-[0.82rem] text-white/40">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Working…
              </div>
            ) : s.status === 'cancelled' ? (
              <p className="text-[0.85rem] text-white/45">Generation stopped. Completed steps are preserved.</p>
            ) : s.status === 'completed' ? (
              <p className="text-[0.85rem] text-emerald-400/80">Generation complete.</p>
            ) : null}
          </div>
        </section>

        {/* Right — tabs */}
        <aside className="hidden min-h-0 flex-col border-l border-white/[0.06] lg:flex">
          <div className="flex items-center gap-1 border-b border-white/[0.06] px-2 py-2">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  'rounded-lg px-2.5 py-1.5 text-[0.78rem] font-medium transition-colors',
                  tab === t ? 'bg-white/[0.07] text-white' : 'text-white/45 hover:bg-white/[0.04] hover:text-white/80'
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4" ref={tab === 'Logs' ? logRef : undefined}>
            {tab === 'Analysis' ? (
              <div className="space-y-3">
                {s.analysis.length === 0 ? <p className="text-[0.8rem] text-white/30">Streaming analysis…</p> : null}
                {s.analysis.map((a, i) => (
                  <div key={i}>
                    <div className="text-[0.68rem] font-medium uppercase tracking-wider text-white/40">{a.key}</div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {(Array.isArray(a.value) ? a.value : [a.value]).map((v, j) => (
                        <span key={j} className="rounded-md bg-white/[0.05] px-2 py-0.5 text-[0.8rem] text-white/80">{v}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
            {tab === 'Code' ? (
              <div className="space-y-0.5">
                {s.files.length === 0 ? <p className="text-[0.8rem] text-white/30">Files will appear as they're written…</p> : null}
                {s.files.map((f) => (
                  <div key={f.path} className="flex items-center gap-2 rounded-md px-2 py-1.5 font-mono text-[0.76rem]">
                    <FileCode2 className="h-3.5 w-3.5 flex-none text-white/35" />
                    <span className="flex-1 truncate text-white/75">{f.path}</span>
                    <span className={cn('flex-none text-[0.64rem]', f.status === 'updated' ? 'text-amber-400/80' : 'text-emerald-400/80')}>
                      {f.status === 'updated' ? 'updated' : '✓'}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
            {tab === 'Preview' ? (
              <div className="space-y-3">
                <PreviewFrame stage={s.preview?.stage ?? null} />
                <p className="text-center text-[0.8rem] text-white/45">{s.preview?.label ?? 'Waiting for first render…'}</p>
              </div>
            ) : null}
            {tab === 'Logs' ? (
              <div className="space-y-0.5 font-mono text-[0.72rem]">
                {s.logs.length === 0 ? <p className="text-white/30">No logs yet…</p> : null}
                {s.logs.map((l, i) => (
                  <div key={i} className="flex gap-2.5">
                    <span className="flex-none text-white/30">{l.time}</span>
                    <span className="text-white/65">{l.text}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  )
}
