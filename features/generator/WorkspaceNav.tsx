'use client'

import { Code2, Eye, Folder, MoreHorizontal } from 'lucide-react'

import type { WorkspaceMode } from '@/types'
import { cn } from '@/utils/cn'

interface WorkspaceNavProps {
  mode: WorkspaceMode
  onChange: (mode: WorkspaceMode) => void
  className?: string
}

const MODES: ReadonlyArray<{ id: WorkspaceMode; label: string; icon: typeof Eye; shortcut: string }> = [
  { id: 'preview', label: 'Preview', icon: Eye, shortcut: '1' },
  { id: 'files', label: 'Files', icon: Folder, shortcut: '2' },
  { id: 'code', label: 'Code', icon: Code2, shortcut: '3' },
  { id: 'more', label: 'More', icon: MoreHorizontal, shortcut: '4' },
]

export function WorkspaceNav({ mode, onChange, className }: WorkspaceNavProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-border bg-surface-raised p-1',
        className
      )}
    >
      {MODES.map(({ id, label, icon: Icon, shortcut }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          title={`${label} (${shortcut})`}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
            mode === id
              ? 'bg-surface-overlay text-foreground shadow-sm'
              : 'text-muted hover:text-foreground'
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  )
}
