'use client'

import { Briefcase, Code2, Eye, Folder, LayoutDashboard, MoreHorizontal } from 'lucide-react'

import type { WorkspaceMode } from '@/types'
import { cn } from '@/utils/cn'

interface WorkspaceNavProps {
  mode: WorkspaceMode
  onChange: (mode: WorkspaceMode) => void
  /** Shows the business OS tabs (Overview / Business) when true. */
  hasBusiness?: boolean
  className?: string
}

const ALL_MODES: ReadonlyArray<{
  id: WorkspaceMode
  label: string
  icon: typeof Eye
  businessOnly?: boolean
}> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, businessOnly: true },
  { id: 'preview', label: 'Preview', icon: Eye },
  { id: 'files', label: 'Files', icon: Folder },
  { id: 'code', label: 'Code', icon: Code2 },
  { id: 'business', label: 'Business', icon: Briefcase, businessOnly: true },
  { id: 'more', label: 'More', icon: MoreHorizontal },
]

export function WorkspaceNav({ mode, onChange, hasBusiness = false, className }: WorkspaceNavProps) {
  const modes = ALL_MODES.filter((entry) => hasBusiness || !entry.businessOnly)

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-border bg-surface-raised p-1',
        className
      )}
    >
      {modes.map(({ id, label, icon: Icon }, index) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          title={`${label} (⌘${index + 1})`}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
            mode === id
              ? 'bg-surface-overlay text-foreground shadow-sm'
              : 'text-muted hover:text-foreground'
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          <span className="hidden md:inline">{label}</span>
        </button>
      ))}
    </div>
  )
}
