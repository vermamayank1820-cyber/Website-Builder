'use client'

import { ChevronDown, FolderOpen } from 'lucide-react'
import { useState } from 'react'

import type { GenerationStatus, ProjectSummary } from '@/types'
import { cn } from '@/utils/cn'

interface ProjectOverviewProps {
  summary: ProjectSummary
  version: number
  status: GenerationStatus
}

const STATUS_LABELS: Partial<Record<GenerationStatus, string>> = {
  ready: 'Ready',
  generating: 'Updating…',
  error: 'Needs attention',
}

/**
 * Collapsible at-a-glance panel pinned above the conversation: industry,
 * project type, counts, features, design style, and live status. Stays
 * current because it renders the latest analyzer output from the store.
 */
export function ProjectOverview({ summary, version, status }: ProjectOverviewProps) {
  const [isOpen, setIsOpen] = useState(false)

  const statusLabel = STATUS_LABELS[status] ?? 'Ready'
  const isReady = status === 'ready'

  return (
    <div className="border-b border-border bg-surface">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-surface-raised"
      >
        <FolderOpen className="h-3.5 w-3.5 shrink-0 text-accent-secondary" />
        <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">
          {summary.projectType}
        </span>
        <span className="rounded-full border border-border px-1.5 py-px text-[10px] text-muted">
          v{version}
        </span>
        <span
          className={cn(
            'flex items-center gap-1 text-[11px]',
            isReady ? 'text-emerald-400' : 'text-muted'
          )}
        >
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              isReady ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
            )}
          />
          {statusLabel}
        </span>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 shrink-0 text-muted transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen ? (
        <div className="space-y-3 border-t border-border px-3 py-3">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
            <OverviewItem label="Industry" value={summary.industry} />
            <OverviewItem label="Project type" value={summary.projectType} />
            <OverviewItem label="Sections" value={String(summary.sections.length)} />
            <OverviewItem label="Components" value={String(summary.componentCount)} />
            <OverviewItem label="Design style" value={summary.designStyle} />
            <OverviewItem label="Visuals" value={`${summary.imageCount} images & graphics`} />
          </dl>

          {summary.features.length > 0 ? (
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
                Features
              </p>
              <div className="flex flex-wrap gap-1.5">
                {summary.features.map((feature) => (
                  <span
                    key={feature}
                    className="rounded-md border border-border px-2 py-0.5 text-[11px] text-foreground"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function OverviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted">{label}</dt>
      <dd className="text-xs text-foreground">{value}</dd>
    </div>
  )
}
