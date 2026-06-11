'use client'

import { Check, Cloud, Eye, History, Loader2, MessageSquare, Plus } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'

import { Button } from '@/components/ui/Button'
import { CodePanel } from '@/features/code/CodePanel'
import { FilesPanel } from '@/features/files/FilesPanel'
import { MorePanel } from '@/features/more/MorePanel'
import { BrowserPreview } from '@/features/preview/BrowserPreview'
import { buildRoutes } from '@/lib/parser/build-routes'
import { buildVirtualFs } from '@/lib/parser/build-virtual-fs'
import { parseSections } from '@/lib/parser/parse-sections'
import type {
  ChatMessage,
  GenerationStatus,
  ProjectSummary,
  SaveState,
  WorkspaceMode,
} from '@/types'
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
  /** Project title shown in the header (persistence mode). */
  projectTitle?: string
  /** Auto-save indicator state (persistence mode). */
  saveState?: SaveState
  /** Shows the version-history button when provided. */
  onOpenVersions?: () => void
  /** Business OS panels (project context) — enable the Overview/Business tabs. */
  overviewPanel?: ReactNode
  businessPanel?: ReactNode
}

function SaveIndicator({ saveState }: { saveState: SaveState }) {
  if (saveState === 'idle') return null

  return (
    <span
      className={cn(
        'hidden items-center gap-1.5 text-xs sm:inline-flex',
        saveState === 'error' ? 'text-red-400' : 'text-muted'
      )}
      aria-live="polite"
    >
      {saveState === 'saving' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
      {saveState === 'saved' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : null}
      {saveState === 'error' ? <Cloud className="h-3.5 w-3.5" /> : null}
      {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved' : 'Save failed'}
    </span>
  )
}

const MOBILE_PREVIEW_TABS = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'preview', label: 'Preview', icon: Eye },
] as const

const BASE_SHORTCUT_MODES: WorkspaceMode[] = ['preview', 'files', 'code', 'more']
const BUSINESS_SHORTCUT_MODES: WorkspaceMode[] = [
  'overview',
  'preview',
  'files',
  'code',
  'business',
  'more',
]

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
  projectTitle,
  saveState = 'idle',
  onOpenVersions,
  overviewPanel,
  businessPanel,
}: WorkspaceProps) {
  const [mode, setMode] = useState<WorkspaceMode>('preview')
  const [mobilePreviewTab, setMobilePreviewTab] = useState<MobilePreviewTab>('chat')

  const hasBusiness = Boolean(overviewPanel || businessPanel)
  const shortcutModes = hasBusiness ? BUSINESS_SHORTCUT_MODES : BASE_SHORTCUT_MODES

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

      const shortcutIndex = shortcutModes.findIndex((_, i) => event.key === String(i + 1))
      if (shortcutIndex === -1) return

      event.preventDefault()
      setMode(shortcutModes[shortcutIndex])
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mode, shortcutModes])

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border bg-surface px-3 py-2.5 sm:px-4">
        <Link href="/workspace" className="flex items-center gap-2.5" title="Back to workspace">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-gradient text-sm font-bold text-white">
            P
          </div>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-semibold tracking-tight">PromptSite</p>
            <p className="max-w-44 truncate text-xs text-muted-foreground">
              {projectTitle ?? 'Generated page · live preview'}
            </p>
          </div>
        </Link>

        <div className="flex flex-1 justify-center">
          <WorkspaceNav mode={mode} onChange={setMode} hasBusiness={hasBusiness} />
        </div>

        <div className="flex items-center gap-2">
          <SaveIndicator saveState={saveState} />

          {onOpenVersions ? (
            <Button type="button" variant="ghost" onClick={onOpenVersions} title="Version history">
              <History className="h-4 w-4" />
              <span className="hidden lg:inline">History</span>
            </Button>
          ) : null}

          <Button type="button" variant="secondary" onClick={onReset}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New website</span>
          </Button>
        </div>
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

        {mode === 'overview' ? overviewPanel : null}

        {mode === 'business' ? businessPanel : null}

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
