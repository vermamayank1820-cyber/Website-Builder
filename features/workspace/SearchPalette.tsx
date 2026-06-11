'use client'

import { FileText, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

import type { Project } from '@/types'
import { relativeTime } from '@/utils/relative-time'

interface SearchPaletteProps {
  isOpen: boolean
  projects: Project[]
  onClose: () => void
}

const MAX_RESULTS = 8

/** ⌘K command palette for jumping to a project by name or category. */
export function SearchPalette({ isOpen, projects, onClose }: SearchPaletteProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      // Wait a frame so the input exists before focusing.
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [isOpen])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const matches = q
      ? projects.filter(
          (p) =>
            p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
        )
      : projects
    return matches.slice(0, MAX_RESULTS)
  }, [projects, query])

  if (!isOpen) return null

  const open = (projectId: string) => {
    onClose()
    router.push(`/project/${projectId}`)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search projects"
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[16vh]"
    >
      <button
        type="button"
        aria-label="Close search"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <div className="glass-card relative w-full max-w-lg overflow-hidden rounded-2xl">
        <div className="flex items-center gap-3 border-b border-white/[0.07] px-4">
          <Search className="h-4 w-4 shrink-0 text-white/40" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') onClose()
              if (event.key === 'Enter' && results[0]) open(results[0].id)
            }}
            placeholder="Search projects…"
            className="w-full bg-transparent py-3.5 text-sm text-white placeholder:text-white/35 focus:outline-none"
          />
          <kbd className="shrink-0 rounded-md border border-white/10 bg-white/[0.05] px-1.5 py-0.5 text-[0.65rem] text-white/40">
            esc
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-white/40">
              No projects match “{query}”.
            </p>
          ) : (
            results.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => open(project.id)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/[0.06]"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.05]">
                  <FileText className="h-3.5 w-3.5 text-white/50" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-white">{project.title}</span>
                  <span className="block truncate text-xs text-white/40">
                    {project.category} · edited {relativeTime(project.updated_at)}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
