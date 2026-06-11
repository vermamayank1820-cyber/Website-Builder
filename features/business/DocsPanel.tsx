'use client'

import { FileSearch, Loader2, Palette, RefreshCw, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Markdown } from '@/components/ui/Markdown'
import { listLatestDocuments, runAgent } from '@/lib/projects/business-service'
import type { DocumentKind, ProjectDocument } from '@/types'
import { cn } from '@/utils/cn'
import { relativeTime } from '@/utils/relative-time'

interface DocsPanelProps {
  projectId: string
}

const DOC_TABS: ReadonlyArray<{ kind: DocumentKind; label: string; icon: typeof FileSearch }> = [
  { kind: 'research', label: 'Research', icon: FileSearch },
  { kind: 'growth', label: 'Growth', icon: TrendingUp },
  { kind: 'design', label: 'Design', icon: Palette },
]

const EMPTY_COPY: Record<DocumentKind, string> = {
  research: 'Run the Research Agent to map your market, competitors, and personas.',
  growth: 'Run the Growth Agent to build your SEO, content, and funnel strategy.',
  design: 'Run the Design Agent to define your brand and design system.',
}

/**
 * Business documents produced by the specialist agents, with on-demand
 * (re)generation against the shared knowledge base.
 */
export function DocsPanel({ projectId }: DocsPanelProps) {
  const [docs, setDocs] = useState<Partial<Record<DocumentKind, ProjectDocument>>>({})
  const [activeKind, setActiveKind] = useState<DocumentKind>('research')
  const [isLoading, setIsLoading] = useState(true)
  const [runningKind, setRunningKind] = useState<DocumentKind | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    listLatestDocuments(projectId)
      .then((latest) => {
        if (!cancelled) setDocs(latest)
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Failed to load documents')
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [projectId])

  const handleRun = async (kind: DocumentKind) => {
    setRunningKind(kind)
    setError(null)
    try {
      const doc = await runAgent(projectId, kind)
      setDocs((current) => ({ ...current, [kind]: doc }))
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : 'Agent run failed')
    } finally {
      setRunningKind(null)
    }
  }

  const activeDoc = docs[activeKind]
  const activeTabMeta = DOC_TABS.find((tab) => tab.kind === activeKind)

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-surface px-4 py-2.5">
        <div className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-raised p-1">
          {DOC_TABS.map(({ kind, label, icon: Icon }) => (
            <button
              key={kind}
              type="button"
              onClick={() => setActiveKind(kind)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                activeKind === kind
                  ? 'bg-surface-overlay text-foreground shadow-sm'
                  : 'text-muted hover:text-foreground'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
              {docs[kind] ? <span className="h-1 w-1 rounded-full bg-emerald-400" /> : null}
            </button>
          ))}
        </div>

        {activeDoc ? (
          <button
            type="button"
            onClick={() => void handleRun(activeKind)}
            disabled={runningKind !== null}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-muted transition-colors hover:bg-white/5 hover:text-foreground disabled:opacity-50"
            title="Regenerate from the current knowledge base"
          >
            {runningKind === activeKind ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Regenerate
          </button>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {error ? (
          <p className="mx-auto mt-6 max-w-3xl rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        ) : null}

        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted" />
          </div>
        ) : activeDoc ? (
          <article className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
            <header className="mb-6 border-b border-border pb-5">
              <h2 className="text-xl font-semibold tracking-tight">{activeDoc.title}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Generated {relativeTime(activeDoc.created_at)} from the business knowledge base
              </p>
            </header>
            <Markdown>{activeDoc.content_md}</Markdown>
          </article>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
            {activeTabMeta ? <activeTabMeta.icon className="h-6 w-6 text-muted" /> : null}
            <p className="max-w-sm text-sm text-muted">{EMPTY_COPY[activeKind]}</p>
            <Button
              type="button"
              variant="secondary"
              onClick={() => void handleRun(activeKind)}
              disabled={runningKind !== null}
            >
              {runningKind === activeKind ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Run {activeTabMeta?.label} Agent
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
