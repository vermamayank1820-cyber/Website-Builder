'use client'

import { useState } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'

import { CodeEditor } from '@/features/editor/CodeEditor'
import { findVirtualFile } from '@/lib/parser/build-virtual-fs'
import type { VirtualFile } from '@/types'

import { FileTree } from './FileTree'

interface FilesPanelProps {
  files: VirtualFile[]
}

const DEFAULT_PATH = 'src/pages/LandingPage.jsx'

export function FilesPanel({ files }: FilesPanelProps) {
  const [selectedPath, setSelectedPath] = useState(DEFAULT_PATH)

  const selectedFile = findVirtualFile(files, selectedPath) ?? findVirtualFile(files, DEFAULT_PATH)

  return (
    <PanelGroup direction="horizontal" className="h-full w-full">
      <Panel defaultSize={26} minSize={18} maxSize={40} className="border-r border-border bg-surface">
        <FileTree
          files={files}
          selectedPath={selectedFile?.path ?? null}
          onSelect={(file) => setSelectedPath(file.path)}
          className="h-full"
        />
      </Panel>
      <PanelResizeHandle className="w-px bg-border transition-colors hover:bg-accent" />
      <Panel minSize={40} className="bg-background">
        {selectedFile ? (
          <CodeEditor code={selectedFile.content ?? ''} filename={selectedFile.name} readOnly />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            Select a file to preview
          </div>
        )}
      </Panel>
    </PanelGroup>
  )
}
