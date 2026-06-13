'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Check, FileText, Loader2, X } from 'lucide-react'

import { formatBytes } from '@/lib/attachments/extract'
import type { UploadedFile } from '@/lib/attachments/types'
import { useAttachmentStore } from '@/store/attachment-store'
import { cn } from '@/utils/cn'

function StatusBadge({ file }: { file: UploadedFile }) {
  if (file.status === 'ready') {
    return (
      <span className="inline-flex items-center gap-1 text-[0.68rem] font-medium text-emerald-400/90">
        <Check className="h-3 w-3" /> Ready
      </span>
    )
  }
  if (file.status === 'error') {
    return (
      <span className="inline-flex items-center gap-1 text-[0.68rem] font-medium text-red-400/90" title={file.error}>
        <AlertCircle className="h-3 w-3" /> {file.statusLabel}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-[0.68rem] font-medium text-white/45">
      <Loader2 className="h-3 w-3 animate-spin" /> {file.statusLabel}
    </span>
  )
}

export function FileChips() {
  const files = useAttachmentStore((s) => s.files)
  const removeFile = useAttachmentStore((s) => s.removeFile)

  if (files.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 px-5 pb-1 pt-1">
      <AnimatePresence initial={false}>
        {files.map((file) => (
          <motion.div
            key={file.id}
            layout
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 480, damping: 34, mass: 0.6 }}
            className={cn(
              'group flex items-center gap-2.5 rounded-xl border px-2.5 py-2',
              file.status === 'error'
                ? 'border-red-500/25 bg-red-500/[0.06]'
                : 'border-white/10 bg-white/[0.04]'
            )}
          >
            <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-white/[0.06] text-white/70">
              <FileText className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block max-w-[12rem] truncate text-[0.78rem] font-medium text-white/85">
                {file.name}
              </span>
              <span className="flex items-center gap-2">
                <span className="text-[0.66rem] text-white/35">{formatBytes(file.size)}</span>
                <StatusBadge file={file} />
              </span>
            </span>
            <button
              type="button"
              onClick={() => removeFile(file.id)}
              aria-label={`Remove ${file.name}`}
              className="flex h-6 w-6 flex-none items-center justify-center rounded-md text-white/40 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
