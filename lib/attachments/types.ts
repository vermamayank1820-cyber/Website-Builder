import type { ReactNode } from 'react'

/** A source in the attachment menu (local files, Drive, Figma…). */
export interface AttachmentSource {
  id: string
  title: string
  description?: string
  icon: ReactNode
  enabled: boolean
  badge?: string
  /** Coming-soon copy shown via toast when a disabled source is clicked. */
  comingSoonMessage?: string
}

export type AttachmentStatus =
  | 'uploading'
  | 'uploaded'
  | 'reading'
  | 'processing'
  | 'ocr-processing'
  | 'ready'
  | 'error'

export interface UploadedFile {
  id: string
  name: string
  extension: string
  size: number
  status: AttachmentStatus
  /** Human-readable status line ("Reading document…", "Ready"). */
  statusLabel: string
  rawText?: string
  metadata?: Record<string, unknown>
  error?: string
}

/** Extensible provider contract — add a source with registerAttachmentProvider. */
export interface AttachmentProvider extends AttachmentSource {}
