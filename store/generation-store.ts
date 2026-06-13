import { create } from 'zustand'

import { PHASES, parseEvent, type GenEvent } from '@/lib/generation/events'

export type SessionStatus = 'idle' | 'running' | 'completed' | 'cancelled' | 'error'
export type PhaseStatus = 'pending' | 'active' | 'done' | 'cancelled'

export interface PhaseState {
  id: string
  label: string
  status: PhaseStatus
  startedAt?: number
  endedAt?: number
}
export interface FeedItem {
  id: number
  kind: 'thought' | 'analysis' | 'progress'
  phaseId?: string
  text?: string
  key?: string
  value?: string | string[]
}
export interface FileNode {
  path: string
  status: 'created' | 'updated'
}
export interface LogLine {
  time: string
  text: string
}
export interface PreviewState {
  stage: 'wireframe' | 'hero' | 'sections' | 'final'
  label: string
}

interface GenerationState {
  status: SessionStatus
  jobId?: string
  title?: string
  surface?: string
  phases: PhaseState[]
  feed: FeedItem[]
  analysis: { key: string; value: string | string[] }[]
  files: FileNode[]
  logs: LogLine[]
  preview: PreviewState | null
  start: (prompt: string, surface?: string) => void
  stop: () => void
  reset: () => void
}

let controller: AbortController | null = null
let sessionStart = 0
let feedSeq = 0

const initialPhases = (): PhaseState[] => PHASES.map((p) => ({ id: p.id, label: p.label, status: 'pending' }))
const fmtTime = (t: number) =>
  new Date(sessionStart + t).toLocaleTimeString('en-GB', { hour12: false })

export const useGenerationStore = create<GenerationState>((set, get) => {
  function dispatch(e: GenEvent) {
    switch (e.type) {
      case 'JOB_CREATED':
        set({ jobId: e.jobId, title: e.title, surface: e.surface })
        break
      case 'PHASE_STARTED':
        set((s) => ({
          phases: s.phases.map((p) =>
            p.id === e.phaseId
              ? { ...p, status: 'active', startedAt: e.t }
              : p.status === 'active'
                ? { ...p, status: 'done', endedAt: e.t }
                : p
          ),
        }))
        break
      case 'THOUGHT':
        set((s) => ({ feed: [...s.feed, { id: feedSeq++, kind: 'thought', phaseId: e.phaseId, text: e.text }] }))
        break
      case 'PHASE_PROGRESS':
        set((s) => ({ feed: [...s.feed, { id: feedSeq++, kind: 'progress', phaseId: e.phaseId, text: e.text }] }))
        break
      case 'ANALYSIS':
        set((s) => ({
          analysis: [...s.analysis, { key: e.analysisKey ?? '', value: e.analysisValue ?? '' }],
          feed: [...s.feed, { id: feedSeq++, kind: 'analysis', key: e.analysisKey, value: e.analysisValue }],
        }))
        break
      case 'FILE_CREATED':
        set((s) => (s.files.some((f) => f.path === e.path) ? s : { files: [...s.files, { path: e.path!, status: 'created' }] }))
        break
      case 'FILE_UPDATED':
        set((s) => ({
          files: s.files.some((f) => f.path === e.path)
            ? s.files.map((f) => (f.path === e.path ? { ...f, status: 'updated' } : f))
            : [...s.files, { path: e.path!, status: 'updated' }],
        }))
        break
      case 'PREVIEW_UPDATED':
        set({ preview: { stage: e.previewStage!, label: e.previewLabel ?? '' } })
        break
      case 'LOG':
        set((s) => ({ logs: [...s.logs, { time: fmtTime(e.t), text: e.text ?? '' }] }))
        break
      case 'COMPLETED':
        set((s) => ({
          status: 'completed',
          title: e.title ?? s.title,
          phases: s.phases.map((p) => (p.status === 'active' ? { ...p, status: 'done', endedAt: e.t } : p)),
        }))
        break
      case 'ERROR':
        set({ status: 'error' })
        break
      case 'CANCELLED':
        // handled by stop(); ignore late server event
        break
    }
  }

  async function consume(prompt: string, surface: string) {
    controller = new AbortController()
    try {
      const res = await fetch(
        `/api/generation/stream?prompt=${encodeURIComponent(prompt)}&surface=${encodeURIComponent(surface)}`,
        { signal: controller.signal }
      )
      if (!res.body) throw new Error('No stream')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      for (;;) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const chunks = buffer.split('\n\n')
        buffer = chunks.pop() ?? ''
        for (const chunk of chunks) {
          const ev = parseEvent(chunk)
          if (ev) dispatch(ev)
        }
      }
      if (get().status === 'running') set({ status: 'completed' })
    } catch {
      // aborted (stop) or network — stop() already set the terminal status
    }
  }

  return {
    status: 'idle',
    phases: initialPhases(),
    feed: [],
    analysis: [],
    files: [],
    logs: [],
    preview: null,

    start: (prompt, surface = 'Website') => {
      feedSeq = 0
      sessionStart = Date.now()
      set({ status: 'running', phases: initialPhases(), feed: [], analysis: [], files: [], logs: [], preview: null, title: undefined })
      void consume(prompt, surface)
    },

    stop: () => {
      controller?.abort()
      set((s) => ({
        status: 'cancelled',
        phases: s.phases.map((p) => (p.status === 'active' ? { ...p, status: 'cancelled' } : p)),
      }))
    },

    reset: () => {
      controller?.abort()
      set({ status: 'idle', phases: initialPhases(), feed: [], analysis: [], files: [], logs: [], preview: null, title: undefined, jobId: undefined })
    },
  }
})
