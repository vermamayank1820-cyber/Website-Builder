'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import { DocsPanel } from '@/features/business/DocsPanel'
import { OverviewPanel } from '@/features/business/OverviewPanel'
import { Workspace } from '@/features/generator/Workspace'
import { useGenerate } from '@/hooks/use-generate'
import {
  recordProjectView,
  saveVersion,
  updateLatestVersionCode,
  uploadThumbnail,
} from '@/lib/projects/service'
import { useGeneratorStore } from '@/store/generator-store'
import type { ChatMessage, Project, ProjectVersion } from '@/types'

import { ThumbnailCapture } from './ThumbnailCapture'
import { VersionHistory } from './VersionHistory'

interface ProjectEditorProps {
  project: Project
  latestVersion: ProjectVersion
  /** Whether a business knowledge base exists (enables Overview/Business tabs). */
  hasBusinessProfile: boolean
}

const CODE_AUTOSAVE_DEBOUNCE_MS = 2000
const SAVED_INDICATOR_RESET_MS = 2500

function buildRestoredMessages(project: Project, version: ProjectVersion): ChatMessage[] {
  const messages: ChatMessage[] = []

  if (project.prompt) {
    messages.push({ id: 'restored-user', role: 'user', content: project.prompt })
  }

  messages.push({
    id: 'restored-assistant',
    role: 'assistant',
    content: `Welcome back — restored "${project.title}" exactly where you left off. Tell me what to change next.`,
    card: { title: `Restored v${version.version_number}`, status: 'done' },
    summary: version.summary_data ?? undefined,
  })

  return messages
}

/**
 * Persistence-aware editor around the shared Workspace UI. Hydrates the
 * generator store from the saved project, records the view, auto-saves
 * every change (AI edits → new version, manual edits → debounced update),
 * keeps the thumbnail fresh, and exposes version history with restore.
 */
export function ProjectEditor({
  project,
  latestVersion,
  hasBusinessProfile,
}: ProjectEditorProps) {
  const router = useRouter()
  const store = useGeneratorStore()
  const { edit } = useGenerate()

  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0)
  const [capture, setCapture] = useState<{ code: string; key: number } | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const captureCounter = useRef(0)

  const setSaveState = useGeneratorStore((state) => state.setSaveState)

  const flashSaved = useCallback(() => {
    setSaveState('saved')
    if (savedResetTimer.current) clearTimeout(savedResetTimer.current)
    savedResetTimer.current = setTimeout(() => setSaveState('idle'), SAVED_INDICATOR_RESET_MS)
  }, [setSaveState])

  const requestCapture = useCallback((code: string) => {
    captureCounter.current += 1
    setCapture({ code, key: captureCounter.current })
  }, [])

  // Hydrate the store from the saved project — unless we just navigated
  // here from /new with this project's state already in memory.
  useEffect(() => {
    const state = useGeneratorStore.getState()

    if (state.projectId !== project.id) {
      state.hydrateProject({
        projectId: project.id,
        projectTitle: project.title,
        prompt: project.prompt,
        code: latestVersion.generated_code,
        version: latestVersion.version_number,
        projectSummary: latestVersion.summary_data ?? null,
        messages: buildRestoredMessages(project, latestVersion),
      })
    }

    setIsHydrated(true)
    void recordProjectView(project.id).catch(() => undefined)

    // Capture a thumbnail on open if the project doesn't have one yet.
    if (!project.thumbnail_url) {
      requestCapture(
        state.projectId === project.id ? state.code : latestVersion.generated_code
      )
    }
    // Intentionally mount-only: hydration must not re-run on store changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id])

  useEffect(
    () => () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
      if (savedResetTimer.current) clearTimeout(savedResetTimer.current)
    },
    []
  )

  // AI refinement: model edit → persist as a new version → refresh thumbnail.
  const handleRefine = useCallback(
    async (instruction: string) => {
      const data = await edit(instruction)
      if (!data) return

      setSaveState('saving')
      try {
        const version = await saveVersion({
          projectId: project.id,
          code: data.code,
          generationSummary: data.changelog?.summary ?? instruction,
          summaryData: data.summary ?? null,
        })
        useGeneratorStore.getState().setVersion(version.version_number)
        setHistoryRefreshKey((key) => key + 1)
        flashSaved()
        requestCapture(data.code)
      } catch {
        setSaveState('error')
      }
    },
    [edit, project.id, setSaveState, flashSaved, requestCapture]
  )

  // Manual code edits: update the store immediately, persist debounced.
  const handleCodeChange = useCallback(
    (code: string) => {
      useGeneratorStore.getState().setCode(code)
      setSaveState('saving')

      if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
      autosaveTimer.current = setTimeout(() => {
        updateLatestVersionCode(project.id, code)
          .then(() => {
            flashSaved()
            requestCapture(code)
          })
          .catch(() => setSaveState('error'))
      }, CODE_AUTOSAVE_DEBOUNCE_MS)
    },
    [project.id, setSaveState, flashSaved, requestCapture]
  )

  // Restore: copy an older version's code forward as a brand-new version.
  const handleRestore = useCallback(
    async (version: ProjectVersion) => {
      setSaveState('saving')
      try {
        const restored = await saveVersion({
          projectId: project.id,
          code: version.generated_code,
          generationSummary: `Restored from v${version.version_number}`,
          summaryData: version.summary_data ?? null,
        })

        const state = useGeneratorStore.getState()
        state.setCode(version.generated_code)
        state.setVersion(restored.version_number)
        state.setProjectSummary(version.summary_data ?? null)
        state.addMessage({
          id: `restore-${restored.id}`,
          role: 'assistant',
          content: `Restored v${version.version_number} — saved as v${restored.version_number}. The preview is now showing the restored page.`,
          card: { title: `Restored v${version.version_number}`, status: 'done' },
        })

        setHistoryRefreshKey((key) => key + 1)
        flashSaved()
        requestCapture(version.generated_code)
      } catch (cause) {
        setSaveState('error')
        throw cause
      }
    },
    [project.id, setSaveState, flashSaved, requestCapture]
  )

  const handleThumbnailCaptured = useCallback(
    (dataUrl: string) => {
      setCapture(null)
      void uploadThumbnail(project.id, dataUrl).catch(() => undefined)
    },
    [project.id]
  )

  if (!isHydrated) return null

  return (
    <>
      <Workspace
        prompt={store.prompt}
        code={store.code}
        messages={store.messages}
        status={store.status}
        isLoading={store.status === 'generating'}
        error={store.error}
        lastGeneratedAt={store.lastGeneratedAt}
        projectSummary={store.projectSummary}
        version={store.version}
        projectTitle={store.projectTitle || project.title}
        saveState={store.saveState}
        onOpenVersions={() => setIsHistoryOpen(true)}
        onCodeChange={handleCodeChange}
        onRefine={(instruction) => void handleRefine(instruction)}
        onReset={() => router.push('/workspace')}
        overviewPanel={
          hasBusinessProfile ? <OverviewPanel projectId={project.id} /> : undefined
        }
        businessPanel={hasBusinessProfile ? <DocsPanel projectId={project.id} /> : undefined}
      />

      <VersionHistory
        projectId={project.id}
        isOpen={isHistoryOpen}
        refreshKey={historyRefreshKey}
        onClose={() => setIsHistoryOpen(false)}
        onRestore={handleRestore}
      />

      {capture ? (
        <ThumbnailCapture
          code={capture.code}
          captureKey={capture.key}
          onCapture={handleThumbnailCaptured}
          onError={() => setCapture(null)}
        />
      ) : null}
    </>
  )
}
