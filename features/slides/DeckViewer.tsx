'use client'

import { ChevronLeft, ChevronRight, Download, Play, Printer, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { DECK_THEMES, type DeckTheme, type SlideDeck } from '@/lib/slides/types'
import { cn } from '@/utils/cn'

import { SlideRenderer } from './SlideRenderer'

interface DeckViewerProps {
  deck: SlideDeck
  onClose?: () => void
}

/** Editor/preview surface for a generated deck: thumbnail rail, main stage,
 *  present mode, and browser-print export. First-party React render — no sandbox. */
export function DeckViewer({ deck, onClose }: DeckViewerProps) {
  const [index, setIndex] = useState(0)
  const [present, setPresent] = useState(false)
  const [theme, setTheme] = useState<DeckTheme>(deck.theme)
  const total = deck.slides.length

  const go = useCallback(
    (delta: number) => setIndex((i) => Math.max(0, Math.min(total - 1, i + delta))),
    [total]
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === 'Escape') setPresent(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(deck, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${deck.title.replace(/\s+/g, '-').toLowerCase()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const current = deck.slides[index]

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <div className="deck-screen flex min-h-0 flex-1 flex-col">
        {/* Toolbar */}
        <header className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
          <div className="min-w-0">
            <div className="text-[0.66rem] font-medium uppercase tracking-wider text-white/40">Slides</div>
            <h1 className="truncate text-[0.95rem] font-semibold tracking-tight">{deck.title}</h1>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="mr-1 hidden items-center gap-1 rounded-full bg-white/[0.04] p-0.5 sm:flex">
              {DECK_THEMES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  className={cn('rounded-full px-2.5 py-1 text-[0.72rem] capitalize transition-colors', theme === t ? 'bg-white/[0.1] text-white' : 'text-white/45 hover:text-white')}
                >
                  {t}
                </button>
              ))}
            </div>
            <ToolbarBtn onClick={() => window.print()} icon={<Printer className="h-4 w-4" />} label="PDF" />
            <ToolbarBtn onClick={exportJson} icon={<Download className="h-4 w-4" />} label="Export" />
            <button
              type="button"
              onClick={() => setPresent(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[0.8rem] font-semibold text-[#0b0b0d] transition-transform hover:-translate-y-px"
            >
              <Play className="h-3.5 w-3.5 fill-current" /> Present
            </button>
            {onClose ? (
              <button type="button" onClick={onClose} aria-label="Close" className="ml-1 flex h-8 w-8 items-center justify-center rounded-full text-white/45 transition-colors hover:bg-white/[0.06] hover:text-white">
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-[180px_1fr]">
          {/* Thumbnail rail */}
          <aside className="min-h-0 space-y-2.5 overflow-y-auto border-r border-white/[0.06] p-3">
            {deck.slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setIndex(i)}
                className={cn(
                  'block w-full overflow-hidden rounded-md ring-1 transition-all',
                  i === index ? 'ring-2 ring-accent' : 'ring-white/10 hover:ring-white/25'
                )}
              >
                <SlideRenderer slide={slide} theme={theme} />
              </button>
            ))}
          </aside>

          {/* Stage */}
          <main className="flex min-h-0 flex-col items-center justify-center gap-4 p-8">
            <div className="w-full max-w-4xl overflow-hidden rounded-xl shadow-[0_40px_90px_-40px_rgba(0,0,0,0.8)] ring-1 ring-white/10">
              <SlideRenderer slide={current} theme={theme} index={index} total={total} />
            </div>
            <div className="flex items-center gap-4 text-white/55">
              <button type="button" onClick={() => go(-1)} disabled={index === 0} className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/[0.06] hover:text-white disabled:opacity-30">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-[0.82rem] tabular-nums">{index + 1} / {total}</span>
              <button type="button" onClick={() => go(1)} disabled={index === total - 1} className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/[0.06] hover:text-white disabled:opacity-30">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </main>
        </div>
      </div>

      {/* Present mode overlay */}
      {present ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black" onClick={() => go(1)}>
          <div className="w-full max-w-6xl px-6">
            <SlideRenderer slide={current} theme={theme} index={index} total={total} />
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setPresent(false) }}
            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-white/20"
            aria-label="Exit present mode"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[0.72rem] text-white/40">{index + 1} / {total} · ← → to navigate · Esc to exit</div>
        </div>
      ) : null}

      {/* Print-only: every slide, one per page */}
      <div className="deck-print-root">
        {deck.slides.map((slide) => (
          <SlideRenderer key={slide.id} slide={slide} theme={theme} />
        ))}
      </div>
    </div>
  )
}

function ToolbarBtn({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[0.8rem] font-medium text-white/65 transition-colors hover:bg-white/[0.06] hover:text-white"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}
