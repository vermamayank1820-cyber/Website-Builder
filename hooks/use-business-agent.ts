import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'

import { detectSourceType, extractUrl } from '@/lib/agents/url'
import { saveVersion } from '@/lib/projects/service'
import {
  analyzeProject,
  createDraftProject,
  logAgentRun,
  runAgent,
  updateProjectMeta,
} from '@/lib/projects/business-service'
import { deriveProjectMeta } from '@/lib/projects/derive-meta'
import { useGeneratorStore } from '@/store/generator-store'
import type {
  ApiResponse,
  BusinessKnowledge,
  DocumentKind,
  ProjectSummary,
  QualityReview,
} from '@/types'

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

/**
 * The Business Agent run loop: Understand → Plan → Execute. Creates the
 * project, builds the shared knowledge base from the link/goal, runs the
 * planned specialist agents against it, generates the knowledge-grounded
 * website, then opens the project.
 */
export function useBusinessAgent() {
  const router = useRouter()
  const [stages, setStages] = useState<AgentStage[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateStage = useCallback((id: string, update: Partial<AgentStage>) => {
    setStages((current) =>
      current.map((stage) => (stage.id === id ? { ...stage, ...update } : stage))
    )
  }, [])

  const launch = useCallback(
    async (input: string) => {
      setIsRunning(true)
      setError(null)

      const url = extractUrl(input) ?? undefined
      const isWebsiteSource = url ? detectSourceType(url) === 'website' : false
      const analyzeLabel = isWebsiteSource
        ? 'Website crawl & analysis'
        : 'Business analysis'
      const initialStages: AgentStage[] = [
        { id: 'analyze', label: analyzeLabel, status: 'active' },
        { id: 'plan', label: 'Execution plan', status: 'pending' },
        { id: 'website', label: 'Website build & self-review', status: 'pending' },
      ]
      setStages(initialStages)

      let projectId: string | null = null
      try {
        // Project shell first so every agent output has a home.
        const meta = deriveProjectMeta(input, null)
        const project = await createDraftProject({
          title: meta.title,
          category: meta.category,
          prompt: input,
        })
        projectId = project.id

        // Understand: link intelligence + knowledge base + plan.
        const { knowledge, plan, source, crawledPages, critiqueFlaws } =
          await analyzeProject({
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

        // Reveal the plan as concrete stages.
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

        // Execute the specialist agents in plan order.
        for (const step of docSteps) {
          updateStage(step.agent, { status: 'active' })
          try {
            const doc = await runAgent(projectId, step.agent)
            updateStage(step.agent, { status: 'done', detail: doc.title })
          } catch (cause: unknown) {
            // A failed specialist shouldn't kill the run — the site still ships.
            updateStage(step.agent, {
              status: 'error',
              detail: cause instanceof Error ? cause.message : 'Failed',
            })
          }
        }

        // Build the website with the self-critique loop (up to 3
        // iterations server-side; the best-scoring version ships).
        updateStage('website', {
          status: 'active',
          detail: 'Exploring 3 design concepts, then generating and scoring (up to 3 passes)…',
        })
        const websitePrompt = buildWebsitePrompt(input, knowledge)
        const response = await fetch('/api/agent/website', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: websitePrompt, projectId }),
        })
        const result = (await response.json()) as ApiResponse<{
          code: string
          summary?: ProjectSummary
          review: QualityReview
          concept: { name: string; atmosphere: string } | null
        }>
        if (!result.success || !result.data) {
          throw new Error(result.error ?? 'Website generation failed')
        }

        const { review, concept } = result.data
        await saveVersion({
          projectId,
          code: result.data.code,
          generationSummary: `Built ${knowledge.company_name} website — self-review ${review.overall}/10 (${review.iteration} iteration${review.iteration === 1 ? '' : 's'})`,
          summaryData: result.data.summary ?? null,
          qualityReview: review,
        })
        updateStage('website', {
          status: 'done',
          detail: `${concept ? `“${concept.name}” — ` : ''}score ${review.overall}/10 after ${review.iteration} iteration${review.iteration === 1 ? '' : 's'}`,
        })

        // Hand the result to the editor via the store, then open it.
        const store = useGeneratorStore.getState()
        store.hydrateProject({
          projectId,
          projectTitle: knowledge.company_name,
          prompt: input,
          code: result.data.code,
          version: 1,
          projectSummary: result.data.summary ?? null,
          messages: [
            { id: 'agent-user', role: 'user', content: input },
            {
              id: 'agent-assistant',
              role: 'assistant',
              content: `I analyzed ${knowledge.company_name}, explored three design concepts${concept ? ` (went with “${concept.name}”)` : ''}, ran ${docSteps.length + 1} agents, and shipped the highest-scoring version of your site — ${review.overall}/10 from the self-review panel after ${review.iteration} iteration${review.iteration === 1 ? '' : 's'}. The full knowledge base, research, and growth plan live in the Overview and Business tabs.`,
              card: { title: `Built ${knowledge.company_name}`, status: 'done' },
              summary: result.data.summary,
            },
          ],
        })

        router.push(`/project/${projectId}`)
      } catch (cause: unknown) {
        const message = cause instanceof Error ? cause.message : 'The agent run failed'
        setError(message)
        setStages((current) =>
          current.map((stage) =>
            stage.status === 'active' ? { ...stage, status: 'error', detail: message } : stage
          )
        )
        if (projectId) {
          void logAgentRun({
            projectId,
            agent: 'website',
            title: 'Agent run failed',
            status: 'error',
            error: message,
          }).catch(() => undefined)
        }
        setIsRunning(false)
      }
    },
    [router, updateStage]
  )

  return { launch, stages, isRunning, error }
}

function buildWebsitePrompt(goal: string, knowledge: BusinessKnowledge): string {
  return [
    `A conversion-focused website for ${knowledge.company_name} — ${knowledge.tagline}.`,
    `Industry: ${knowledge.industry}. Audience: ${knowledge.audience.description}`,
    `Original goal: ${goal}`,
  ]
    .join(' ')
    .slice(0, 1900)
}
