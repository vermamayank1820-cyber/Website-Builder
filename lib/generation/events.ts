/**
 * Real-time generation event model. The Live Session UI consumes these typed
 * events over SSE; the source is swappable (today: a session driver; in
 * production: the real generation pipeline emitting the same events).
 */

export type GenEventType =
  | 'JOB_CREATED'
  | 'PHASE_STARTED'
  | 'PHASE_PROGRESS'
  | 'THOUGHT'
  | 'ANALYSIS'
  | 'FILE_CREATED'
  | 'FILE_UPDATED'
  | 'PREVIEW_UPDATED'
  | 'LOG'
  | 'ERROR'
  | 'COMPLETED'
  | 'CANCELLED'

export interface GenEvent {
  type: GenEventType
  /** ms since session start. */
  t: number
  phaseId?: string
  /** THOUGHT / LOG / PHASE_PROGRESS text. */
  text?: string
  /** ANALYSIS key/value (value may be a list). */
  analysisKey?: string
  analysisValue?: string | string[]
  /** FILE_CREATED / FILE_UPDATED path. */
  path?: string
  /** PREVIEW_UPDATED stage. */
  previewStage?: 'wireframe' | 'hero' | 'sections' | 'final'
  previewLabel?: string
  /** JOB_CREATED metadata. */
  jobId?: string
  title?: string
  surface?: string
}

export interface Phase {
  id: string
  label: string
}

/** The 12-step phase pipeline. */
export const PHASES: Phase[] = [
  { id: 'understand', label: 'Understanding Request' },
  { id: 'expand', label: 'Expanding Specification' },
  { id: 'analysis', label: 'Business Analysis' },
  { id: 'domain', label: 'Domain Intelligence' },
  { id: 'ia', label: 'Information Architecture' },
  { id: 'design', label: 'Design Planning' },
  { id: 'components', label: 'Component Generation' },
  { id: 'code', label: 'Code Generation' },
  { id: 'optimize', label: 'Optimization' },
  { id: 'preview', label: 'Preview Rendering' },
  { id: 'review', label: 'Final Review' },
  { id: 'complete', label: 'Complete' },
]

export const PHASE_LABEL: Record<string, string> = Object.fromEntries(
  PHASES.map((p) => [p.id, p.label])
)

/** Serialise/parse one SSE `data:` line. */
export function encodeEvent(e: GenEvent): string {
  return `data: ${JSON.stringify(e)}\n\n`
}
export function parseEvent(line: string): GenEvent | null {
  const json = line.replace(/^data:\s*/, '').trim()
  if (!json) return null
  try {
    return JSON.parse(json) as GenEvent
  } catch {
    return null
  }
}
