import { create } from 'zustand'

import { formatBytes, getExtension, requestOcr, requestParse, validateFile } from '@/lib/attachments/extract'
import type { UploadedFile } from '@/lib/attachments/types'
import { MAX_INPUT_CHARS } from '@/lib/input/constants'
import { OCR_RUNNING_LABEL, ParseError, PARSE_ERROR_LABELS } from '@/lib/documents/types'
import type { Understanding } from '@/lib/knowledge/understand'

type Debug = Understanding['debug']

interface AttachmentState {
  files: UploadedFile[]
  /** Dev-only: the structured understanding of the ready documents. */
  understanding: Debug | null
  understandingStatus: 'idle' | 'running' | 'done' | 'error'
  /** Validate + ingest picked files; extraction runs async per file. */
  addFiles: (files: File[]) => void
  removeFile: (id: string) => void
  clear: () => void
  /** Combined extracted text of ready files — fed to generation as context. */
  readyContext: () => string
  /** Run the structured understanding pipeline over the ready documents. */
  runUnderstanding: () => Promise<void>
}

function newId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `f_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

export const useAttachmentStore = create<AttachmentState>((set, get) => {
  const patch = (id: string, next: Partial<UploadedFile>) =>
    set((state) => ({
      files: state.files.map((f) => (f.id === id ? { ...f, ...next } : f)),
    }))

  // Debounce: a batch of files becoming ready triggers one understanding run.
  let understandTimer: ReturnType<typeof setTimeout> | null = null
  const scheduleUnderstanding = () => {
    if (understandTimer) clearTimeout(understandTimer)
    understandTimer = setTimeout(() => void get().runUnderstanding(), 450)
  }

  function markReady(id: string, parsed: { text: string; metadata: unknown }) {
    patch(id, {
      status: 'ready',
      statusLabel: 'Ready',
      rawText: parsed.text.slice(0, MAX_INPUT_CHARS),
      metadata: parsed.metadata as Record<string, unknown>,
    })
    scheduleUnderstanding()
  }

  function markError(id: string, error: unknown) {
    // Differentiated, honest errors — never a blanket "couldn't read".
    const code = error instanceof ParseError ? error.code : 'failed'
    patch(id, {
      status: 'error',
      statusLabel: PARSE_ERROR_LABELS[code],
      error: error instanceof Error ? error.message : 'Extraction failed',
    })
  }

  async function process(id: string, file: File) {
    // state machine: reading → processing → (ocr-processing) → ready / error
    patch(id, { status: 'reading', statusLabel: 'Reading document…' })
    try {
      const parsed = await requestParse(file)
      patch(id, { status: 'processing', statusLabel: 'Understanding content…' })
      await new Promise((r) => setTimeout(r, 240)) // a deliberate beat
      markReady(id, parsed)
    } catch (error) {
      // Scanned PDF → OCR fallback (the single pipeline never just fails it).
      if (error instanceof ParseError && error.code === 'scanned') {
        patch(id, { status: 'ocr-processing', statusLabel: OCR_RUNNING_LABEL })
        try {
          const ocrParsed = await requestOcr(file)
          markReady(id, ocrParsed)
        } catch (ocrError) {
          markError(id, ocrError)
        }
        return
      }
      markError(id, error)
    }
  }

  return {
    files: [],
    understanding: null,
    understandingStatus: 'idle',

    addFiles: (incoming) => {
      const entries: UploadedFile[] = []
      const toProcess: { id: string; file: File }[] = []

      for (const file of incoming) {
        const id = newId()
        const base: UploadedFile = {
          id,
          name: file.name,
          extension: getExtension(file.name),
          size: file.size,
          status: 'uploading',
          statusLabel: formatBytes(file.size),
        }
        const validation = validateFile(file)
        if (!validation.ok) {
          entries.push({ ...base, status: 'error', statusLabel: 'Unsupported', error: validation.reason })
        } else {
          entries.push(base)
          toProcess.push({ id, file })
        }
      }

      set((state) => ({ files: [...state.files, ...entries] }))
      for (const { id, file } of toProcess) void process(id, file)
    },

    removeFile: (id) => set((state) => ({ files: state.files.filter((f) => f.id !== id) })),

    clear: () => set({ files: [], understanding: null, understandingStatus: 'idle' }),

    runUnderstanding: async () => {
      const text = get().readyContext()
      if (!text) {
        set({ understanding: null, understandingStatus: 'idle' })
        return
      }
      set({ understandingStatus: 'running' })
      try {
        const res = await fetch('/api/understand', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        })
        const json = await res.json()
        if (!res.ok || !json.success) throw new Error(json.error ?? 'failed')
        set({ understanding: json.data.debug as Debug, understandingStatus: 'done' })
      } catch {
        set({ understandingStatus: 'error' })
      }
    },

    readyContext: () => {
      const ready = get().files.filter((f) => f.status === 'ready' && f.rawText)
      if (ready.length === 0) return ''
      return ready
        .map((f) => `--- Attached: ${f.name} ---\n${f.rawText}`)
        .join('\n\n')
    },
  }
})
