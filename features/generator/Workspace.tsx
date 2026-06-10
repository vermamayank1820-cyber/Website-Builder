'use client'

import { Eye, MessageSquare, RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'

import { Button } from '@/components/ui/Button'
import { CodePanel } from '@/features/code/CodePanel'
import { FilesPanel } from '@/features/files/FilesPanel'
import { MorePanel } from '@/features/more/MorePanel'
import { BrowserPreview } from '@/features/preview/BrowserPreview'
import { buildRoutes } from '@/lib/parser/build-routes'
import { buildVirtualFs } from '@/lib/parser/build-virtual-fs'
import { parseSections } from '@/lib/parser/parse-sections'
import type { ChatMessage, GenerationStatus, ProjectSummary, WorkspaceMode } from '@/types'
import { cn } from '@/utils/cn'

import { ChatPanel } from './ChatPanel'
import { WorkspaceNav } from './WorkspaceNav'

type MobilePreviewTab = 'chat' | 'preview'

interface WorkspaceProps {
  prompt: string
  code: string
  messages: ChatMessage[]
  status: GenerationStatus
  isLoading: boolean
  error: string | null
  lastGeneratedAt: number | null
  projectSummary: ProjectSummary | null
  version: number
  onCodeChange: (code: string) => void
  onRefine: (instruction: string) => void
  onReset: () => void
}

const MOBILE_PREVIEW_TABS = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'preview', label: 'Preview', icon: Eye },
] as const

const SHORTCUT_MODES: WorkspaceMode[] = ['preview', 'files', 'code', 'more']

export function Workspace({
  prompt,
  code,
  messages,
  status,
  isLoading,
  error,
  lastGeneratedAt,
  projectSummary,
  version,
  onCodeChange,
  onRefine,
  onReset,
}: WorkspaceProps) {
  const [mode, setMode] = useState<WorkspaceMode>('preview')
  const [mobilePreviewTab, setMobilePreviewTab] = useState<MobilePreviewTab>('chat')

  const sections = useMemo(() => parseSections(code), [code])
  const routes = useMemo(() => buildRoutes(sections), [sections])
  const virtualFs = useMemo(() => buildVirtualFs(code, sections), [code, sections])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && mode !== 'preview') {
        setMode('preview')
        return
      }

      if (!(event.metaKey || event.ctrlKey)) return

      const shortcutIndex = SHORTCUT_MODES.findIndex((_, i) => event.key === String(i + 1))
      if (shortcutIndex === -1) return

      event.preventDefault()
      setMode(SHORTCUT_MODES[shortcutIndex])
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mode])

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border bg-surface px-3 py-2.5 sm:px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-gradient text-sm font-bold text-white">
            P
          </div>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-semibold tracking-tight">PromptSite</p>
            <p className="text-xs text-muted-foreground">Generated page · live preview</p>
          </div>
        </div>

        <div className="flex flex-1 justify-center">
          <WorkspaceNav mode={mode} onChange={setMode} />
        </div>

        <Button type="button" variant="secondary" onClick={onReset}>
          <RotateCcw className="h-4 w-4" />
          <span className="hidden sm:inline">New page</span>
        </Button>
      </header>

      {error ? (
        <div className="border-b border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-400">
          {error}
        </div>
      ) : null}

      {mode === 'preview' ? (
        <div className="flex flex-1 justify-center border-b border-border bg-surface px-3 py-2 lg:hidden">
          <div className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-raised p-1">
            {MOBILE_PREVIEW_TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setMobilePreviewTab(id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                  mobilePreviewTab === id
                    ? 'bg-surface-overlay text-foreground shadow-sm'
                    : 'text-muted hover:text-foreground'
                )}
              >
                <Icon className="h-3.5 w-3.5" /> {label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-hidden">
        {mode === 'preview' ? (
          <>
            <div className="hidden h-full lg:block">
              <PanelGroup direction="horizontal" className="h-full w-full">
                <Panel defaultSize={32} minSize={24} maxSize={45}>
                  <ChatPanel
                    messages={messages}
                    isLoading={isLoading}
                    projectSummary={projectSummary}
                    version={version}
                    status={status}
                    onRefine={onRefine}
                    onViewCode={() => setMode('code')}
                    className="flex h-full"
                  />
                </Panel>
                <PanelResizeHandle className="w-px bg-border transition-colors hover:bg-accent" />
                <Panel minSize={40}>
                  <BrowserPreview code={code} routes={routes} className="h-full" />
                </Panel>
              </PanelGroup>
            </div>

            <div className="h-full lg:hidden">
              <ChatPanel
                messages={messages}
                isLoading={isLoading}
                projectSummary={projectSummary}
                version={version}
                status={status}
                onRefine={onRefine}
                onViewCode={() => setMode('code')}
                className={cn('h-full', mobilePreviewTab === 'chat' ? 'flex' : 'hidden')}
              />
              <BrowserPreview
                code={code}
                routes={routes}
                className={cn('h-full', mobilePreviewTab === 'preview' ? 'flex' : 'hidden')}
              />
            </div>
          </>
        ) : null}

        {mode === 'files' ? <FilesPanel files={virtualFs} /> : null}

        {mode === 'code' ? <CodePanel code={code} files={virtualFs} onCodeChange={onCodeChange} /> : null}

        {mode === 'more' ? (
          <MorePanel
            prompt={prompt}
            code={code}
            sections={sections}
            status={status}
            lastGeneratedAt={lastGeneratedAt}
          />
        ) : null}
      </div>
    </div>
  )
}
