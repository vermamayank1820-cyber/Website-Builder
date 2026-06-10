'use client'

import { useState } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'

import { CodeEditor } from '@/features/editor/CodeEditor'
import { FileTree } from '@/features/files/FileTree'
import { findVirtualFile } from '@/lib/parser/build-virtual-fs'
import type { VirtualFile } from '@/types'

interface CodePanelProps {
  code: string
  files: VirtualFile[]
  onCodeChange: (code: string) => void
}

const LANDING_PAGE_PATH = 'src/pages/LandingPage.jsx'

export function CodePanel({ code, files, onCodeChange }: CodePanelProps) {
  const [selectedPath, setSelectedPath] = useState(LANDING_PAGE_PATH)

  const selectedFile = findVirtualFile(files, selectedPath) ?? findVirtualFile(files, LANDING_PAGE_PATH)
  const isLandingPage = selectedFile?.path === LANDING_PAGE_PATH

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
          isLandingPage ? (
            <CodeEditor code={code} onChange={onCodeChange} filename={selectedFile.name} />
          ) : (
            <CodeEditor code={selectedFile.content ?? ''} filename={selectedFile.name} readOnly />
          )
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            Select a file to view
          </div>
        )}
      </Panel>
    </PanelGroup>
  )
}
