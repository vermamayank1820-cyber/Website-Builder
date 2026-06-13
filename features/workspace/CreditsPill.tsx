'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { CalendarClock, ChevronRight, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/utils/cn'

interface CreditsPillProps {
  credits?: number
  monthlyUsed?: number
  monthlyTotal?: number
  dailyRefresh?: number
}

/**
 * Compact credit display for the top-right. Lightweight pill → premium glass
 * popover with usage breakdown + upgrade. No heavy dashboards.
 */
export function CreditsPill({
  credits = 798,
  monthlyUsed = 498,
  monthlyTotal = 4000,
  dailyRefresh = 300,
}: CreditsPillProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const fmt = new Intl.NumberFormat('en-US')

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[0.82rem] font-medium tabular-nums transition-colors duration-150',
          'text-foreground/85 shadow-[inset_0_0_0_1px_var(--hairline)] hover:bg-white/[0.05]',
          open && 'bg-white/[0.05]'
        )}
      >
        <Sparkles className="h-3.5 w-3.5 text-accent-secondary" />
        {fmt.format(credits)}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="menu"
            initial={{ opacity: 0, scale: 0.97, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -6 }}
            transition={{ duration: 0.16, ease: [0.32, 0.72, 0, 1] }}
            style={{ transformOrigin: 'top right' }}
            className="elev-4 absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[18rem] rounded-2xl p-3.5 backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between">
              <span className="text-[0.9rem] font-semibold text-foreground">PromptSite Free</span>
              <button
                type="button"
                className="rounded-full bg-white px-2.5 py-1 text-[0.72rem] font-semibold text-[#0b0b0d] transition-transform hover:-translate-y-px"
              >
                Upgrade
              </button>
            </div>
            <div className="my-3 border-t border-dashed border-white/10" />
            <div className="space-y-2.5 text-[0.8rem]">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-accent-secondary" /> Credits
                </span>
                <span className="tabular-nums text-foreground">{fmt.format(credits)}</span>
              </div>
              <div className="flex items-center justify-between text-white/45">
                <span>Monthly</span>
                <span className="tabular-nums">{fmt.format(monthlyUsed)} / {fmt.format(monthlyTotal)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/[0.06] pt-2.5">
                <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                  <CalendarClock className="h-3.5 w-3.5 text-white/55" /> Daily refresh
                </span>
                <span className="tabular-nums text-foreground">{fmt.format(dailyRefresh)}</span>
              </div>
              <p className="text-[0.7rem] text-white/35">Refreshes to {dailyRefresh} at 05:30 every day</p>
            </div>
            <button
              type="button"
              className="mt-3 inline-flex items-center gap-1 text-[0.78rem] font-medium text-white/55 transition-colors hover:text-foreground"
            >
              View usage <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
