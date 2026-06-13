'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

import type { AttachmentProvider } from '@/lib/attachments/types'
import { cn } from '@/utils/cn'

interface AttachmentMenuProps {
  open: boolean
  providers: AttachmentProvider[]
  onSelect: (provider: AttachmentProvider) => void
  onClose: () => void
}

export function AttachmentMenu({ open, providers, onSelect, onClose }: AttachmentMenuProps) {
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [active, setActive] = useState(0)

  // Focus the active item whenever the menu opens or selection moves.
  useEffect(() => {
    if (open) itemRefs.current[active]?.focus()
  }, [open, active])

  // Open on the first item.
  useEffect(() => {
    if (open) setActive(0)
  }, [open])

  const move = (delta: number) =>
    setActive((i) => (i + delta + providers.length) % providers.length)

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        move(1)
        break
      case 'ArrowUp':
        event.preventDefault()
        move(-1)
        break
      case 'Home':
        event.preventDefault()
        setActive(0)
        break
      case 'End':
        event.preventDefault()
        setActive(providers.length - 1)
        break
      case 'Tab':
        // Focus trap: keep Tab/Shift+Tab cycling within the menu.
        event.preventDefault()
        move(event.shiftKey ? -1 : 1)
        break
      case 'Escape':
        event.preventDefault()
        onClose()
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        onSelect(providers[active])
        break
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          role="menu"
          aria-label="Add an attachment"
          aria-orientation="vertical"
          onKeyDown={handleKeyDown}
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 6 }}
          transition={{ type: 'spring', stiffness: 460, damping: 32, mass: 0.7 }}
          style={{ transformOrigin: 'bottom left' }}
          className={cn(
            'absolute bottom-[calc(100%+0.6rem)] left-0 z-30 w-[22rem] origin-bottom-left overflow-hidden p-1.5',
            'rounded-2xl border border-white/10 bg-[#0f0f13]/85 backdrop-blur-2xl',
            'shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_28px_70px_-18px_rgba(0,0,0,0.92)]'
          )}
        >
          {providers.map((provider, index) => {
            const isFirstDisabled =
              !provider.enabled && providers[index - 1]?.enabled
            return (
              <div key={provider.id}>
                {isFirstDisabled ? (
                  <div className="mx-2 my-1.5 h-px bg-white/8" role="separator" />
                ) : null}
                <button
                  ref={(el) => {
                    itemRefs.current[index] = el
                  }}
                  type="button"
                  role="menuitem"
                  tabIndex={index === active ? 0 : -1}
                  aria-disabled={!provider.enabled}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => onSelect(provider)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-150',
                    'outline-none focus-visible:bg-white/10',
                    index === active ? 'bg-white/[0.07]' : 'hover:bg-white/[0.05]'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-8 w-8 flex-none items-center justify-center rounded-lg border',
                      provider.enabled
                        ? 'border-white/10 bg-white/[0.06] text-white/85'
                        : 'border-white/8 bg-white/[0.03] text-white/45'
                    )}
                  >
                    {provider.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        'block truncate text-[0.9rem] font-medium',
                        provider.enabled ? 'text-white/90' : 'text-white/55'
                      )}
                    >
                      {provider.title}
                    </span>
                    {provider.description ? (
                      <span className="block truncate text-[0.72rem] text-white/40">
                        {provider.description}
                      </span>
                    ) : null}
                  </span>
                  {provider.badge ? (
                    <span className="flex-none whitespace-nowrap rounded-full border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[0.58rem] font-medium uppercase tracking-wide text-white/45">
                      {provider.badge}
                    </span>
                  ) : null}
                </button>
              </div>
            )
          })}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
