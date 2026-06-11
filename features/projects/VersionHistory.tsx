'use client'

import { History, Loader2, RotateCcw, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { listVersions } from '@/lib/projects/service'
import type { ProjectVersion } from '@/types'
import { relativeTime } from '@/utils/relative-time'

interface VersionHistoryProps {
  projectId: string
  isOpen: boolean
  /** Bumps when a new version is saved so the open panel refreshes. */
  refreshKey: number
  onClose: () => void
  onRestore: (version: ProjectVersion) => Promise<void>
}

/**
 * Slide-over listing every saved version, newest first. Restoring never
 * destroys anything — it appends the chosen code as a new version.
 */
export function VersionHistory({
  projectId,
  isOpen,
  refreshKey,
  onClose,
  onRestore,
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<ProjectVersion[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [restoringId, setRestoringId] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    let cancelled = false

    setError(null)
    listVersions(projectId)
      .then((data) => {
        if (!cancelled) setVersions(data)
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Failed to load history')
        }
      })

    return () => {
      cancelled = true
    }
  }, [isOpen, projectId, refreshKey])

  if (!isOpen) return null

  const handleRestore = async (version: ProjectVersion) => {
    setRestoringId(version.id)
    try {
      await onRestore(version)
      onClose()
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : 'Failed to restore version')
    } finally {
      setRestoringId(null)
    }
  }

  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label="Version history">
      <button
        type="button"
        aria-label="Close version history"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
      />

      <aside className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col border-l border-border bg-surface shadow-[-24px_0_64px_-32px_rgba(0,0,0,0.9)]">
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <History className="h-4 w-4 text-accent" />
            <h2 className="text-sm font-semibold tracking-tight">Version history</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {error ? (
            <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-400">
              {error}
            </p>
          ) : null}

          {versions === null && !error ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted" />
            </div>
          ) : null}

          <ol className="space-y-2.5">
            {versions?.map((version, index) => {
              const isLatest = index === 0
              return (
                <li
                  key={version.id}
                  className="group rounded-2xl border border-border bg-surface-raised p-4 transition-colors hover:border-border-strong"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold tracking-tight">
                          v{version.version_number}
                        </span>
                        {isLatest ? (
                          <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[0.65rem] font-medium text-accent">
                            Current
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
                        {version.generation_summary ?? 'Code update'}
                      </p>
                      <p className="mt-1.5 text-[0.7rem] text-muted-foreground">
                        {relativeTime(version.created_at)}
                      </p>
                    </div>

                    {!isLatest ? (
                      <button
                        type="button"
                        onClick={() => void handleRestore(version)}
                        disabled={restoringId !== null}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted opacity-0 transition-all hover:border-accent hover:text-foreground focus-visible:opacity-100 disabled:opacity-40 group-hover:opacity-100"
                      >
                        {restoringId === version.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <RotateCcw className="h-3 w-3" />
                        )}
                        Restore
                      </button>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ol>

          {versions?.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted">No versions yet.</p>
          ) : null}
        </div>

        <footer className="border-t border-border px-5 py-3">
          <p className="text-[0.7rem] leading-relaxed text-muted-foreground">
            Restoring copies an older version forward as a new one — nothing is ever lost.
          </p>
        </footer>
      </aside>
    </div>
  )
}
