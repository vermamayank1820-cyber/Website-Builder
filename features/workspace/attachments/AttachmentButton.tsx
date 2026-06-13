'use client'

import { Paperclip } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { ACCEPT_ATTR } from '@/lib/attachments/extract'
import { getAttachmentProviders } from '@/lib/attachments/registry'
import type { AttachmentProvider } from '@/lib/attachments/types'
import { useAttachmentStore } from '@/store/attachment-store'
import { cn } from '@/utils/cn'

import { AttachmentMenu } from './AttachmentMenu'

interface AttachmentButtonProps {
  disabled?: boolean
  /** Surface coming-soon copy for not-yet-enabled providers. */
  onComingSoon: (message: string) => void
}

export function AttachmentButton({ disabled, onComingSoon }: AttachmentButtonProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const addFiles = useAttachmentStore((s) => s.addFiles)
  const providers = getAttachmentProviders()

  // Close on outside click.
  useEffect(() => {
    if (!open) return
    const onDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const close = () => {
    setOpen(false)
    triggerRef.current?.focus()
  }

  const handleSelect = (provider: AttachmentProvider) => {
    if (!provider.enabled) {
      onComingSoon(provider.comingSoonMessage ?? `${provider.title} is coming soon.`)
      setOpen(false)
      return
    }
    if (provider.id === 'local') {
      fileInputRef.current?.click()
      setOpen(false)
    }
  }

  const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const list = event.target.files
    if (list && list.length) addFiles(Array.from(list))
    event.target.value = '' // allow re-picking the same file
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        title="Add an attachment"
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-colors',
          'text-white/60 hover:bg-white/10 hover:text-white',
          open && 'bg-white/10 text-white',
          'disabled:cursor-not-allowed disabled:opacity-50'
        )}
      >
        <Paperclip className="h-4 w-4" />
        <span className="hidden sm:inline">Attach</span>
      </button>

      <AttachmentMenu open={open} providers={providers} onSelect={handleSelect} onClose={close} />

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPT_ATTR}
        onChange={handleFiles}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  )
}
