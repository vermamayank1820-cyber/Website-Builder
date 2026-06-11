import { Sparkles } from 'lucide-react'

import { LogoMark } from '@/components/ui/LogoMark'

const HIGHLIGHTS = [
  'Live preview, editable code',
  'Every project auto-saved',
  'Version history built in',
]

/**
 * Left half of the split-screen auth layout: branding, value proposition,
 * and a CSS-built product vignette (no images, loads instantly).
 */
export function BrandPanel() {
  return (
    <div className="bg-grid bg-glow relative hidden flex-col justify-between overflow-hidden border-r border-border p-10 lg:flex xl:p-14">
      <div className="flex items-center gap-2.5">
        <LogoMark />
        <span className="text-sm font-semibold tracking-tight">PromptSite</span>
      </div>

      <div className="relative">
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-muted">
          <Sparkles className="h-3.5 w-3.5 text-accent-secondary" />
          Prompt to production-ready website
        </span>
        <h1 className="max-w-md text-4xl font-semibold tracking-tight text-balance xl:text-5xl">
          Describe it.{' '}
          <span className="text-accent-gradient">We&apos;ll build</span> the website.
        </h1>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted xl:text-base">
          Type a prompt and get a polished landing page in seconds — saved to your
          workspace, ready whenever you come back.
        </p>

        {/* Stylized "generated site" vignette */}
        <div className="pointer-events-none mt-10 max-w-md select-none">
          <div className="rounded-2xl border border-border bg-surface shadow-[0_32px_80px_-32px_rgba(0,0,0,0.9)]">
            <div className="flex items-center gap-1.5 border-b border-border px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <span className="ml-3 h-5 flex-1 rounded-full border border-border bg-surface-raised" />
            </div>
            <div className="space-y-3 p-5">
              <div className="h-3 w-24 rounded-full bg-accent/40" />
              <div className="h-5 w-4/5 rounded-full bg-white/15" />
              <div className="h-5 w-3/5 rounded-full bg-white/10" />
              <div className="flex gap-2 pt-1">
                <div className="h-7 w-24 rounded-full bg-accent-gradient opacity-80" />
                <div className="h-7 w-24 rounded-full border border-border bg-surface-raised" />
              </div>
              <div className="grid grid-cols-3 gap-2 pt-3">
                <div className="h-16 rounded-xl border border-border bg-surface-raised" />
                <div className="h-16 rounded-xl border border-border bg-surface-raised" />
                <div className="h-16 rounded-xl border border-border bg-surface-raised" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ul className="flex flex-wrap gap-x-6 gap-y-2">
        {HIGHLIGHTS.map((item) => (
          <li key={item} className="flex items-center gap-2 text-xs text-muted">
            <span className="h-1 w-1 rounded-full bg-accent" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
