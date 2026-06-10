'use client'

import { Check, Copy, Search } from 'lucide-react'
import { useMemo, useState } from 'react'

import { generateMeta } from '@/lib/seo/generate-meta'
import type { PageSection } from '@/types'
import { cn } from '@/utils/cn'

interface SeoTabProps {
  prompt: string
  sections: PageSection[]
}

export function SeoTab({ prompt, sections }: SeoTabProps) {
  const meta = useMemo(() => generateMeta(prompt, sections), [prompt, sections])

  return (
    <div className="space-y-6 px-6 py-6">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-raised">
          <Search className="h-4 w-4 text-muted" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">SEO &amp; AI search</h3>
          <p className="mt-0.5 text-sm text-muted">
            Suggested metadata, auto-generated from your prompt and page sections.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <CopyField label="Page title" value={meta.title} />
        <CopyField label="Meta description" value={meta.description} multiline />
        <CopyField label="Open Graph title" value={meta.ogTitle} />
        <CopyField label="Open Graph description" value={meta.ogDescription} multiline />
        <CopyField label="Keywords" value={meta.keywords.join(', ')} multiline />
      </div>
    </div>
  )
}

function CopyField({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="rounded-xl border border-border bg-surface-raised p-3">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-muted transition-colors hover:bg-white/5 hover:text-foreground"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <p className={cn('text-sm text-foreground', multiline ? 'leading-relaxed' : 'truncate')}>{value}</p>
    </div>
  )
}
