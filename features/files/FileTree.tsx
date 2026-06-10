'use client'

import { ChevronRight, File, FileCode, FileText, Folder, FolderOpen } from 'lucide-react'
import { useState } from 'react'

import type { VirtualFile } from '@/types'
import { cn } from '@/utils/cn'

interface FileTreeProps {
  files: VirtualFile[]
  selectedPath: string | null
  onSelect: (file: VirtualFile) => void
  className?: string
}

export function FileTree({ files, selectedPath, onSelect, className }: FileTreeProps) {
  return (
    <div className={cn('overflow-y-auto py-2', className)}>
      {files.map((file) => (
        <FileTreeNode key={file.path} file={file} depth={0} selectedPath={selectedPath} onSelect={onSelect} />
      ))}
    </div>
  )
}

interface FileTreeNodeProps {
  file: VirtualFile
  depth: number
  selectedPath: string | null
  onSelect: (file: VirtualFile) => void
}

function FileTreeNode({ file, depth, selectedPath, onSelect }: FileTreeNodeProps) {
  const [open, setOpen] = useState(true)

  if (file.type === 'folder') {
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center gap-1.5 rounded-lg py-1 pr-2 text-left text-muted transition-colors hover:bg-white/5 hover:text-foreground"
          style={{ paddingLeft: `${depth * 14 + 8}px` }}
        >
          <ChevronRight className={cn('h-3.5 w-3.5 shrink-0 transition-transform', open && 'rotate-90')} />
          {open ? (
            <FolderOpen className="h-3.5 w-3.5 shrink-0 text-accent" />
          ) : (
            <Folder className="h-3.5 w-3.5 shrink-0 text-accent" />
          )}
          <span className="truncate text-xs font-medium">{file.name}</span>
        </button>
        {open && file.children ? (
          <div>
            {file.children.map((child) => (
              <FileTreeNode
                key={child.path}
                file={child}
                depth={depth + 1}
                selectedPath={selectedPath}
                onSelect={onSelect}
              />
            ))}
          </div>
        ) : null}
      </div>
    )
  }

  const Icon = file.language === 'jsx' ? FileCode : file.language === 'markdown' ? FileText : File

  return (
    <button
      type="button"
      onClick={() => onSelect(file)}
      className={cn(
        'flex w-full items-center gap-1.5 rounded-lg py-1 pr-2 text-left text-xs transition-colors',
        selectedPath === file.path
          ? 'bg-surface-overlay text-foreground'
          : 'text-muted hover:bg-white/5 hover:text-foreground'
      )}
      style={{ paddingLeft: `${depth * 14 + 26}px` }}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{file.name}</span>
    </button>
  )
}
