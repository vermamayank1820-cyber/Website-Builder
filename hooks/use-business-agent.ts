import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import { detectSourceType, extractUrl } from '@/lib/agents/url'
import { getLatestVersion, getProject } from '@/lib/projects/service'
import {
  analyzeProject,
  createDraftProject,
  getAgentRunById,
  runAgent,
  startWebsiteBuild,
  updateProjectMeta,
} from '@/lib/projects/business-service'
import { deriveProjectMeta } from '@/lib/projects/derive-meta'
import { useGeneratorStore } from '@/store/generator-store'
import type { DocumentKind } from '@/types'

export type StageStatus = 'pending' | 'active' | 'done' | 'error'

export interface AgentStage {
  id: string
  label: string
  status: StageStatus
  detail?: string
}

const STAGE_LABELS: Record<DocumentKind, string> = {
  research: 'Market research',
  growth: 'Growth strategy',
  design: 'Design system',
}

/** localStorage key for the in-flight build — survives refresh/sleep. */
const ACTIVE_BUILD_KEY = 'promptsite:active-build'
const POLL_INTERVAL_MS = 5_000
/** Client-side cap; the server watchdog fires at 15 min. */
const POLL_TIMEOUT_MS = 20 * 60_000

interface ActiveBuild {
  runId: string
  projectId: string
  companyName: string
  startedAt: number
}

function readActiveBuild(): ActiveBuild | null {
  try {
    const raw = window.localStorage.getItem(ACTIVE_BUILD_KEY)
    return raw ? (JSON.parse(raw) as ActiveBuild) : null
  } catch {
    return null
  }
}

function writeActiveBuild(build: ActiveBuild | null): void {
  try {
    if (build) window.localStorage.setItem(ACTIVE_BUILD_KEY, JSON.stringify(build))
    else window.localStorage.removeItem(ACTIVE_BUILD_KEY)
  } catch {
    // Storage unavailable — resume-after-refresh just won't work.
  }
}

/**
 * The Business Agent run loop: Understand → Plan → Execute. The website
 * build runs as a SERVER-SIDE background job — the client only polls the
 * agent_runs row, so a sleeping laptop, dropped connection, or page
 * refresh can no longer lose a build (it resumes from localStorage).
 */
export function useBusinessAgent() {
  const router = useRouter()
  const [stages, setStages] = useState<AgentStage[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (pollTimer.current) clearTimeout(pollTimer.current)
    },
    []
  )

  const updateStage = useCallback((id: string, update: Partial<AgentStage>) => {
    setStages((current) =>
      current.map((stage) => (stage.id === id ? { ...stage, ...update } : stage))
    )
  }, [])

  /** Opens the finished project: latest version is already saved server-side. */
  const openFinishedBuild = useCallback(
    async (build: ActiveBuild, runSummary: string | null) => {
      const [project, version] = await Promise.all([
        getProject(build.projectId),
        getLatestVersion(build.projectId),
      ])
      if (!project || !version) throw new Error('Build finished but the project could not be loaded')

      useGeneratorStore.getState().hydrateProject({
        projectId: project.id,
        projectTitle: project.title,
        prompt: project.prompt,
        code: version.generated_code,
        version: version.version_number,
        projectSummary: version.summary_data ?? null,
        messages: [
          { id: 'agent-user', role: 'user', content: project.prompt },
          {
            id: 'agent-assistant',
            role: 'assistant',
            content: `Your website is ready — ${runSummary ?? `version ${version.version_number} shipped`}. The full knowledge base, research, and growth plan live in the Overview and Business tabs.`,
            card: { title: `Built ${project.title}`, status: 'done' },
            summary: version.summary_data ?? undefined,
          },
        ],
      })

      writeActiveBuild(null)
      router.push(`/project/${build.projectId}`)
    },
    [router]
  )

  /** Polls the background build until done/error; survives refreshes. */
  const pollBuild = useCallback(
    (build: ActiveBuild) => {
      const tick = async () => {
        if (Date.now() - build.startedAt > POLL_TIMEOUT_MS) {
          updateStage('website', { status: 'error', detail: 'Build timed out' })
          setError('The build timed out — check the project list; a version may still appear.')
          writeActiveBuild(null)
          setIsRunning(false)
          return
        }

        let run
        try {
          run = await getAgentRunById(build.runId)
        } catch {
          // Transient network failure (sleep/offline) — keep polling.
          pollTimer.current = setTimeout(tick, POLL_INTERVAL_MS * 2)
          return
        }

        if (!run) {
          updateStage('website', { status: 'error', detail: 'Build record not found' })
          writeActiveBuild(null)
          setIsRunning(false)
          return
        }

        if (run.status === 'running') {
          updateStage('website', { status: 'active', detail: run.title })
          pollTimer.current = setTimeout(tick, POLL_INTERVAL_MS)
          return
        }

        if (run.status === 'error') {
          updateStage('website', { status: 'error', detail: run.error ?? 'Build failed' })
          setError(run.error ?? 'The website build failed')
          writeActiveBuild(null)
          setIsRunning(false)
          return
        }

        // done
        updateStage('website', { status: 'done', detail: run.summary ?? 'Website built' })
        try {
          await openFinishedBuild(build, run.summary)
        } catch (cause: unknown) {
          setError(cause instanceof Error ? cause.message : 'Failed to open the project')
          setIsRunning(false)
        }
      }

      void tick()
    },
    [openFinishedBuild, updateStage]
  )

  // Resume an in-flight build after refresh/sleep.
  useEffect(() => {
    const active = readActiveBuild()
    if (!active) return
    setIsRunning(true)
    setStages([
      {
        id: 'website',
        label: `Website build — ${active.companyName}`,
        status: 'active',
        detail: 'Resuming…',
      },
    ])
    pollBuild(active)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const launch = useCallback(
    async (input: string) => {
      setIsRunning(true)
      setError(null)

      const url = extractUrl(input) ?? undefined
      const isWebsiteSource = url ? detectSourceType(url) === 'website' : false
      const analyzeLabel = isWebsiteSource ? 'Website crawl & analysis' : 'Business analysis'
      setStages([
        { id: 'analyze', label: analyzeLabel, status: 'active' },
        { id: 'plan', label: 'Execution plan', status: 'pending' },
        { id: 'website', label: 'Website build & self-review', status: 'pending' },
      ])

      let projectId: string | null = null
      try {
        const meta = deriveProjectMeta(input, null)
        const project = await createDraftProject({
          title: meta.title,
          category: meta.category,
          prompt: input,
        })
        projectId = project.id

        const { knowledge, plan, source, crawledPages, critiqueFlaws } = await analyzeProject({
          projectId,
          goal: input,
          url,
        })
        const analyzeDetail =
          crawledPages > 0
            ? `${knowledge.company_name} — crawled ${crawledPages} pages, ${critiqueFlaws} flaws found by the critic`
            : source
              ? `${knowledge.company_name} — ${source.note}`
              : knowledge.company_name
        updateStage('analyze', { status: 'done', detail: analyzeDetail })

        if (knowledge.company_name && knowledge.company_name !== 'Untitled Business') {
          await updateProjectMeta(projectId, {
            title: knowledge.company_name,
            category: knowledge.industry,
          }).catch(() => undefined)
        }

        const docSteps = plan.filter(
          (step): step is typeof step & { agent: DocumentKind } =>
            step.agent === 'research' || step.agent === 'growth' || step.agent === 'design'
        )
        setStages([
          { id: 'analyze', label: analyzeLabel, status: 'done', detail: analyzeDetail },
          { id: 'plan', label: 'Execution plan', status: 'done', detail: `${plan.length} steps` },
          ...docSteps.map((step) => ({
            id: step.agent,
            label: STAGE_LABELS[step.agent],
            status: 'pending' as StageStatus,
            detail: step.title,
          })),
          { id: 'website', label: 'Website build & self-review', status: 'pending' },
        ])

        for (const step of docSteps) {
          updateStage(step.agent, { status: 'active' })
          try {
            const doc = await runAgent(projectId, step.agent)
            updateStage(step.agent, { status: 'done', detail: doc.title })
          } catch (cause: unknown) {
            updateStage(step.agent, {
              status: 'error',
              detail: cause instanceof Error ? cause.message : 'Failed',
            })
          }
        }

        // Website build: background job + poll. Resumable from here on.
        updateStage('website', { status: 'active', detail: 'Starting the design pipeline…' })
        const { runId } = await startWebsiteBuild(projectId, buildWebsitePrompt(input, knowledge.company_name))
        const build: ActiveBuild = {
          runId,
          projectId,
          companyName: knowledge.company_name,
          startedAt: Date.now(),
        }
        writeActiveBuild(build)
        pollBuild(build)
      } catch (cause: unknown) {
        const message = cause instanceof Error ? cause.message : 'The agent run failed'
        setError(message)
        setStages((current) =>
          current.map((stage) =>
            stage.status === 'active' ? { ...stage, status: 'error', detail: message } : stage
          )
        )
        setIsRunning(false)
      }
    },
    [pollBuild, updateStage]
  )

  return { launch, stages, isRunning, error }
}

function buildWebsitePrompt(goal: string, companyName: string): string {
  return `A conversion-focused website for ${companyName}. Original goal: ${goal}`.slice(0, 1900)
}
