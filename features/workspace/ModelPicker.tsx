'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/utils/cn'

interface Model {
  id: string
  name: string
  desc: string
}

const MODELS: Model[] = [
  { id: 'max', name: 'PromptSite Max', desc: 'Highest reasoning for complex, multi-agent tasks' },
  { id: 'standard', name: 'PromptSite 1.0', desc: 'Balanced model for most tasks' },
  { id: 'lite', name: 'PromptSite Lite', desc: 'Fast and cost-efficient' },
]

/**
 * Global model picker — lives in the top bar, never inside the composer.
 * Glass popover, smooth open, selected state, keyboard accessible.
 */
export function ModelPicker() {
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState('standard')
  const ref = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [active, setActive] = useState(0)
  const current = MODELS.find((m) => m.id === selectedId) ?? MODELS[1]

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    setActive(MODELS.findIndex((m) => m.id === selectedId))
    return () => document.removeEventListener('mousedown', onDown)
  }, [open, selectedId])

  useEffect(() => {
    if (open) itemRefs.current[active]?.focus()
  }, [open, active])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => (i + 1) % MODELS.length) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => (i - 1 + MODELS.length) % MODELS.length) }
    else if (e.key === 'Escape') { setOpen(false) }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedId(MODELS[active].id); setOpen(false) }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[0.85rem] font-medium transition-colors duration-150',
          'text-foreground/85 hover:bg-white/[0.06]',
          open && 'bg-white/[0.06]'
        )}
      >
        {current.name}
        <ChevronDown className={cn('h-3.5 w-3.5 text-white/40 transition-transform duration-200', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="menu"
            onKeyDown={onKeyDown}
            initial={{ opacity: 0, scale: 0.97, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -6 }}
            transition={{ duration: 0.16, ease: [0.32, 0.72, 0, 1] }}
            style={{ transformOrigin: 'top left' }}
            className="elev-4 absolute left-0 top-[calc(100%+0.5rem)] z-50 w-[19rem] rounded-2xl p-1.5 backdrop-blur-2xl"
          >
            {MODELS.map((m, i) => {
              const isSelected = m.id === selectedId
              return (
                <button
                  key={m.id}
                  ref={(el) => { itemRefs.current[i] = el }}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isSelected}
                  tabIndex={i === active ? 0 : -1}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => { setSelectedId(m.id); setOpen(false) }}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left outline-none transition-colors duration-150',
                    i === active ? 'bg-white/[0.06]' : 'hover:bg-white/[0.04]'
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.85rem] font-medium text-foreground">{m.name}</span>
                    <span className="mt-0.5 block text-[0.72rem] leading-snug text-white/45">{m.desc}</span>
                  </span>
                  {isSelected ? <Check className="mt-0.5 h-4 w-4 flex-none text-accent-secondary" /> : null}
                </button>
              )
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
