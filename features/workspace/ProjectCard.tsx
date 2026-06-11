'use client'

import { Copy, MoreHorizontal, Pencil, SquareArrowOutUpRight, Star, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import type { Project } from '@/types'
import { cn } from '@/utils/cn'
import { relativeTime } from '@/utils/relative-time'

interface ProjectCardProps {
  project: Project
  /** Overrides the time label, e.g. "Viewed 2 hours ago" for recents. */
  timeLabel?: string
  isStarred?: boolean
  onToggleStar?: (project: Project) => void
  onRename: (project: Project) => void
  onDuplicate: (project: Project) => void
  onDelete: (project: Project) => void
}

/**
 * Lovable-style project tile: borderless thumbnail block with a hover
 * lift, title + time underneath, and a quiet actions menu.
 */
export function ProjectCard({
  project,
  timeLabel,
  isStarred = false,
  onToggleStar,
  onRename,
  onDuplicate,
  onDelete,
}: ProjectCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isMenuOpen) return
    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isMenuOpen])

  const menuAction = (handler: () => void) => () => {
    setIsMenuOpen(false)
    handler()
  }

  return (
    <div className="group relative">
      <Link href={`/project/${project.id}`} aria-label={`Open ${project.title}`} className="block">
        <div
          className={cn(
            'ease-spring relative aspect-[16/10] overflow-hidden rounded-2xl bg-white/[0.03] backdrop-blur-sm',
            'shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_0_0_1px_rgba(255,255,255,0.05),0_4px_16px_-8px_rgba(0,0,0,0.5)]',
            'transition-all duration-300',
            'group-hover:-translate-y-1.5 group-hover:scale-[1.01]',
            'group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_0_0_1px_rgba(255,255,255,0.12),0_32px_64px_-20px_rgba(0,0,0,0.9),0_12px_32px_-16px_rgba(139,92,246,0.25)]'
          )}
        >
          {project.thumbnail_url ? (
            // Thumbnails live on the Supabase storage CDN — plain img keeps
            // next/image domain config out of the loop.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.thumbnail_url}
              alt={`${project.title} preview`}
              width={640}
              height={400}
              loading="lazy"
              className="h-full w-full object-cover object-top transition-transform duration-300 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent/20 via-transparent to-accent-secondary/15">
              <span className="text-4xl font-bold text-white/20">
                {project.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 flex items-end justify-start bg-gradient-to-t from-black/55 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-black">
              <SquareArrowOutUpRight className="h-3 w-3" />
              Open
            </span>
          </div>
        </div>

        <div className="mt-2.5 pr-16">
          <h3 className="truncate text-sm font-medium tracking-tight text-foreground">
            {project.title}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {timeLabel ?? `Edited ${relativeTime(project.updated_at)}`}
            <span className="mx-1.5 opacity-50">·</span>
            {project.category}
          </p>
        </div>
      </Link>

      <div ref={menuRef} className="absolute bottom-5 right-0 flex items-center">
        {onToggleStar ? (
          <button
            type="button"
            onClick={() => onToggleStar(project)}
            aria-pressed={isStarred}
            aria-label={isStarred ? `Unstar ${project.title}` : `Star ${project.title}`}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-lg transition-all hover:bg-white/10',
              isStarred
                ? 'text-amber-300 opacity-100'
                : 'text-muted opacity-0 hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100'
            )}
          >
            <Star className={cn('h-4 w-4', isStarred && 'fill-current')} />
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
          aria-label={`Actions for ${project.title}`}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-lg text-muted transition-all hover:bg-white/10 hover:text-foreground',
            isMenuOpen ? 'opacity-100' : 'opacity-0 focus-visible:opacity-100 group-hover:opacity-100'
          )}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>

        {isMenuOpen ? (
          <div
            role="menu"
            className="absolute right-0 top-8 z-20 w-44 overflow-hidden rounded-xl border border-white/10 bg-[#121215] p-1.5 shadow-[0_24px_48px_-16px_rgba(0,0,0,0.9)]"
          >
            <Link
              href={`/project/${project.id}`}
              role="menuitem"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-muted transition-colors hover:bg-white/5 hover:text-foreground"
            >
              <SquareArrowOutUpRight className="h-3.5 w-3.5" />
              Open
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={menuAction(() => onRename(project))}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-muted transition-colors hover:bg-white/5 hover:text-foreground"
            >
              <Pencil className="h-3.5 w-3.5" />
              Rename
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={menuAction(() => onDuplicate(project))}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-muted transition-colors hover:bg-white/5 hover:text-foreground"
            >
              <Copy className="h-3.5 w-3.5" />
              Duplicate
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={menuAction(() => onDelete(project))}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-red-400 transition-colors hover:bg-red-500/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
