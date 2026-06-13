'use client'

import { useAttachmentStore } from '@/store/attachment-store'

/**
 * Dev-only window into the structured understanding pipeline — what was
 * extracted from the documents and how it was classified. Never renders in
 * production.
 */
export function UnderstandingDebug() {
  const files = useAttachmentStore((s) => s.files)
  const understanding = useAttachmentStore((s) => s.understanding)
  const status = useAttachmentStore((s) => s.understandingStatus)

  if (process.env.NODE_ENV === 'production') return null
  const ready = files.filter((f) => f.status === 'ready')
  if (ready.length === 0) return null

  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-black/40 p-4 font-mono text-[0.72rem] leading-relaxed text-white/70 backdrop-blur">
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded bg-amber-400/15 px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-amber-300">
          Dev · Understanding
        </span>
        {status === 'running' ? <span className="text-white/40">analyzing…</span> : null}
        {status === 'error' ? <span className="text-red-400/80">extraction unavailable</span> : null}
      </div>

      {ready.map((f) => (
        <div key={f.id} className="text-white/55">
          📄 {f.name} · {String((f.metadata?.wordCount as number) ?? '')} words · Ready
        </div>
      ))}

      {understanding ? (
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div>
            <div className="text-white/35">Extracted</div>
            <div>Name: <span className="text-white/85">{understanding.name}</span></div>
            <div>Title: <span className="text-white/85">{understanding.title}</span></div>
            <div>
              Projects: {understanding.counts.projects} · Skills: {understanding.counts.skills} ·
              Exp: {understanding.counts.experience} · Services: {understanding.counts.services}
            </div>
          </div>
          <div>
            <div className="text-white/35">Detected</div>
            <div>Type: <span className="text-emerald-300">{understanding.websiteType}</span></div>
            <div>Industry: <span className="text-white/85">{understanding.industry}</span></div>
            <div>Planner: <span className="text-emerald-300">{understanding.planner}</span> <span className="text-white/35">({understanding.intentConfidence})</span></div>
          </div>
        </div>
      ) : status === 'running' ? null : (
        <div className="mt-2 text-white/35">waiting for understanding…</div>
      )}
    </div>
  )
}
