'use client'

import {
  AlertCircle,
  Check,
  ExternalLink,
  Loader2,
  Sparkles,
  Target,
  Users,
} from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'

import { SOURCE_LABELS } from '@/lib/agents/url'
import { getBusinessProfile, listAgentRuns } from '@/lib/projects/business-service'
import type { AgentRun, BusinessProfile } from '@/types'
import { relativeTime } from '@/utils/relative-time'

interface OverviewPanelProps {
  projectId: string
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <h3 className="text-[0.7rem] font-semibold tracking-widest text-muted-foreground uppercase">
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  )
}

function Chips({ items }: { items: string[] }) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground">—</p>
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full border border-border bg-surface-raised px-2.5 py-1 text-xs text-muted"
        >
          {item}
        </span>
      ))}
    </div>
  )
}

const RUN_STATUS_ICON = {
  running: <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />,
  done: <Check className="h-3.5 w-3.5 text-emerald-400" />,
  error: <AlertCircle className="h-3.5 w-3.5 text-red-400" />,
} as const

/**
 * Project Overview: the shared business knowledge base, the execution
 * plan, and the agent activity feed.
 */
export function OverviewPanel({ projectId }: OverviewPanelProps) {
  const [profile, setProfile] = useState<BusinessProfile | null>(null)
  const [runs, setRuns] = useState<AgentRun[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([getBusinessProfile(projectId), listAgentRuns(projectId)])
      .then(([nextProfile, nextRuns]) => {
        if (cancelled) return
        setProfile(nextProfile)
        setRuns(nextRuns)
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Failed to load overview')
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [projectId])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <Sparkles className="h-6 w-6 text-muted" />
        <p className="text-sm font-medium">No business knowledge base yet</p>
        <p className="max-w-sm text-sm text-muted">
          This project was created before the Business Agent existed (or from a quick
          generation). New projects created from the homepage get a full analysis.
        </p>
      </div>
    )
  }

  const k = profile.knowledge

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
        <header>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">{k.company_name}</h2>
            <span className="rounded-full border border-border bg-surface-raised px-2.5 py-1 text-xs text-muted">
              {k.industry}
            </span>
            {k.assumptions ? (
              <span
                className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-300"
                title="Built from your goal without extracted source data — treat as a proposal"
              >
                Proposed from goal
              </span>
            ) : null}
          </div>
          <p className="mt-1.5 text-sm text-muted">{k.tagline}</p>
          {profile.source_url ? (
            <a
              href={profile.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-xs text-accent hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              {SOURCE_LABELS[profile.source_type ?? 'website']} · {profile.source_url}
            </a>
          ) : null}
        </header>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <Card title="Executive summary">
            <p className="text-sm leading-relaxed text-muted">{k.summary}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              <span className="font-medium text-foreground">Model: </span>
              {k.business_model}
            </p>
          </Card>

          <Card title="Audience">
            <p className="flex items-start gap-2 text-sm leading-relaxed text-muted">
              <Users className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              {k.audience.description}
            </p>
            <div className="mt-3">
              <Chips items={k.audience.personas} />
            </div>
          </Card>

          <Card title="Brand identity">
            <p className="text-sm leading-relaxed text-muted">{k.brand_identity.voice}</p>
            <div className="mt-3 space-y-2">
              <Chips items={k.brand_identity.personality} />
              <Chips items={k.brand_identity.values} />
            </div>
          </Card>

          <Card title="Visual direction">
            <p className="text-sm leading-relaxed text-muted">{k.visual_style.mood}</p>
            <div className="mt-3 flex items-center gap-1.5">
              {k.visual_style.colors.map((color) => (
                <span
                  key={color}
                  title={color}
                  className="h-6 w-6 rounded-full border border-white/15"
                  style={{ background: color }}
                />
              ))}
              <span className="ml-2 text-xs text-muted-foreground">
                {k.visual_style.typography}
              </span>
            </div>
          </Card>

          <Card title="Goals & opportunities">
            <ul className="space-y-2">
              {[...k.goals, ...k.opportunities].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted">
                  <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Competitors">
            <Chips items={k.competitors} />
            {k.products_services.length > 0 ? (
              <>
                <h4 className="mt-4 text-[0.7rem] font-semibold tracking-widest text-muted-foreground uppercase">
                  Offerings
                </h4>
                <ul className="mt-2 space-y-1.5">
                  {k.products_services.map((item) => (
                    <li key={item} className="text-sm text-muted">
                      · {item}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </Card>
        </div>

        {profile.site_critique ? (
          <div className="mt-4">
            <Card title="Website critique — vs. Stripe / Linear / Apple">
              {profile.site_critique.benchmark_summary ? (
                <p className="text-sm leading-relaxed text-muted">
                  {profile.site_critique.benchmark_summary}
                </p>
              ) : null}
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {(
                  [
                    ['Design', profile.site_critique.design_flaws],
                    ['Conversion', profile.site_critique.conversion_flaws],
                    ['UX', profile.site_critique.ux_flaws],
                    ['Copy', profile.site_critique.copy_flaws],
                    ['Accessibility', profile.site_critique.accessibility_flaws],
                    ['Strategy', profile.site_critique.weaknesses],
                  ] as const
                )
                  .filter(([, items]) => items.length > 0)
                  .map(([label, items]) => (
                    <div key={label}>
                      <h4 className="text-[0.7rem] font-semibold tracking-widest text-muted-foreground uppercase">
                        {label}
                      </h4>
                      <ul className="mt-1.5 space-y-1.5">
                        {items.map((item) => (
                          <li key={item} className="text-xs leading-relaxed text-muted">
                            · {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
              </div>
              <p className="mt-4 text-[0.7rem] text-muted-foreground">
                The website agent was required to fix every finding above, then self-reviewed
                its output before shipping the highest-scoring version.
              </p>
            </Card>
          </div>
        ) : null}

        {profile.plan.length > 0 ? (
          <div className="mt-4">
          <Card title="Execution plan">
            <ol className="space-y-3">
              {profile.plan.map((step, index) => (
                <li key={step.id} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-[0.65rem] font-bold text-accent">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-xs text-muted-foreground">{step.rationale}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
          </div>
        ) : null}

        <div className="mt-4">
          <Card title="Agent activity">
            {runs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No agent runs yet.</p>
            ) : (
              <ul className="space-y-2.5">
                {runs.map((run) => (
                  <li key={run.id} className="flex items-start gap-2.5">
                    <span className="mt-0.5">{RUN_STATUS_ICON[run.status]}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">{run.title}</p>
                      {run.summary || run.error ? (
                        <p className="truncate text-xs text-muted-foreground">
                          {run.error ?? run.summary}
                        </p>
                      ) : null}
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {relativeTime(run.created_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
