'use client'

import {
  CheckCircle2,
  Circle,
  Layers,
  Palette,
  Rocket,
  Sparkles,
  Wrench,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { ProjectSummary } from '@/types'

interface SummaryCardProps {
  summary: ProjectSummary
}

/**
 * Rich post-generation breakdown shown in the chat: what was built,
 * the design direction, technical capabilities, premium touches, and
 * launch readiness. Rendered from analyzer output — fully dynamic.
 */
export function SummaryCard({ summary }: SummaryCardProps) {
  return (
    <div className="space-y-4 rounded-xl border border-border bg-surface-raised p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-medium text-foreground">
          {summary.industry}
        </span>
        <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs text-muted">
          {summary.designStyle}
        </span>
        <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs text-muted">
          {summary.componentCount} components
        </span>
      </div>

      <SummarySection icon={Layers} title="Sections created">
        <div className="flex flex-wrap gap-1.5">
          {summary.sections.map((section) => (
            <span
              key={section}
              className="rounded-md border border-border px-2 py-0.5 text-xs text-foreground"
            >
              {section}
            </span>
          ))}
        </div>
      </SummarySection>

      {summary.features.length > 0 ? (
        <SummarySection icon={Sparkles} title="Features added">
          <BulletList items={summary.features} />
        </SummarySection>
      ) : null}

      {summary.premiumTouches.length > 0 ? (
        <SummarySection icon={Palette} title="Premium touches">
          <BulletList items={summary.premiumTouches} />
        </SummarySection>
      ) : null}

      <SummarySection icon={Wrench} title="Technical">
        <BulletList items={summary.technical} />
      </SummarySection>

      <SummarySection icon={Rocket} title="Launch readiness">
        <ul className="space-y-1">
          {summary.launchChecks.map((check) => (
            <li key={check.label} className="flex items-center gap-2 text-xs">
              {check.passed ? (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
              ) : (
                <Circle className="h-3.5 w-3.5 shrink-0 text-muted" />
              )}
              <span className={check.passed ? 'text-foreground' : 'text-muted'}>
                {check.label}
              </span>
            </li>
          ))}
        </ul>
      </SummarySection>
    </div>
  )
}

function SummarySection({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-accent-secondary" />
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          {title}
        </span>
      </div>
      {children}
    </div>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-xs text-foreground">
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent-secondary" />
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  )
}
