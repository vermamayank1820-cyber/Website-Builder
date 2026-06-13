'use client'

import { useState } from 'react'

import { AttachmentButton } from '@/features/workspace/attachments/AttachmentButton'
import { FileChips } from '@/features/workspace/attachments/FileChips'
import { UnderstandingDebug } from '@/features/workspace/attachments/UnderstandingDebug'

/**
 * Public, unguarded harness for visually verifying the attachment system
 * (the authed /workspace composer isn't reachable headless). Not part of the
 * product surface.
 */
export default function AttachDemoPage() {
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 2600)
  }

  return (
    <main className="bg-grid bg-glow flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6">
      <div className="w-full max-w-2xl">
        <div className="glass-card rounded-[28px]">
          <div className="px-6 pb-2 pt-5.5 text-[0.98rem] text-white/30">
            Describe your goal, or paste a link — your website, GitHub, Instagram…
          </div>
          <FileChips />
          <div className="flex items-center gap-1 px-3.5 pb-3.5">
            <AttachmentButton onComingSoon={showToast} />
            <div className="flex-1" />
            <button
              type="button"
              className="ease-spring inline-flex items-center gap-2 rounded-full bg-accent-gradient px-5 py-2.5 text-sm font-semibold text-white"
            >
              Generate Website
            </button>
          </div>
        </div>
        <div className="mt-3.5 min-h-5 text-center text-sm text-white/45" aria-live="polite">
          {toast}
        </div>
        <UnderstandingDebug />
      </div>
    </main>
  )
}
