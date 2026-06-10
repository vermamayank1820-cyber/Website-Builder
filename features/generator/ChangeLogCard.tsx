'use client'

import { ArrowUpRight, GitCommitHorizontal, ListChecks, Target } from 'lucide-react'

import type { ChangeLog } from '@/types'

interface ChangeLogCardProps {
  changelog: ChangeLog
}

/**
 * Structured change log shown after each refinement: what changed, what
 * was improved beyond the literal ask, which sections were touched, and
 * the resulting project version.
 */
export function ChangeLogCard({ changelog }: ChangeLogCardProps) {
  return (
    <div className="space-y-3.5 rounded-xl border border-border bg-surface-raised p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <GitCommitHorizontal className="h-3.5 w-3.5 text-accent-secondary" />
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            What changed
          </span>
        </div>
        <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] font-medium text-muted">
          v{changelog.version}
        </span>
      </div>

      <ul className="space-y-1">
        {changelog.changes.map((change) => (
          <li key={change} className="flex gap-2 text-xs text-foreground">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent-secondary" />
            <span className="leading-relaxed">{change}</span>
          </li>
        ))}
      </ul>

      {changelog.improvements.length > 0 ? (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Improved
            </span>
          </div>
          <ul className="space-y-1">
            {changelog.improvements.map((improvement) => (
              <li key={improvement} className="flex gap-2 text-xs text-foreground">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
                <span className="leading-relaxed">{improvement}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {changelog.sectionsAffected.length > 0 ? (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-accent-secondary" />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Sections affected
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {changelog.sectionsAffected.map((section) => (
              <span
                key={section}
                className="rounded-md border border-border px-2 py-0.5 text-xs text-foreground"
              >
                {section}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex items-center gap-1.5 border-t border-border pt-2.5 text-[11px] text-muted">
        <ListChecks className="h-3 w-3" />
        All existing sections preserved unless listed above
      </div>
    </div>
  )
}
