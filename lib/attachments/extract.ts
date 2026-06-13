import {
  ParseError,
  PARSE_ERROR_MESSAGES,
  type ParsedDocument,
  type ParseErrorCode,
} from '@/lib/documents/types'

/** Document formats the local-files picker accepts. */
export const ACCEPTED_EXTENSIONS = ['pdf', 'docx', 'txt', 'md', 'markdown'] as const
export const ACCEPT_ATTR = '.pdf,.docx,.txt,.md,.markdown'
const MAX_FILE_BYTES = 25 * 1024 * 1024 // 25MB per file

export function getExtension(name: string): string {
  return name.slice(name.lastIndexOf('.') + 1).toLowerCase()
}

export interface ValidationResult {
  ok: boolean
  reason?: string
}

/** Fast client-side gate — reject images, video, archives, oversized files. */
export function validateFile(file: File): ValidationResult {
  const ext = getExtension(file.name)
  if (!ACCEPTED_EXTENSIONS.includes(ext as (typeof ACCEPTED_EXTENSIONS)[number])) {
    return { ok: false, reason: `${ext.toUpperCase() || 'This'} files aren’t supported — use PDF, DOCX, TXT or Markdown.` }
  }
  if (file.size > MAX_FILE_BYTES) {
    return { ok: false, reason: 'File is larger than 25 MB.' }
  }
  return { ok: true }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Send the file to the server-side DocumentParser and return the structured
 * ParsedDocument. Heavy parsers (pdf.js, mammoth) run on the server, so they
 * never touch the client bundle. Throws ParseError with a differentiated code.
 */
export async function requestParse(file: File): Promise<ParsedDocument> {
  const form = new FormData()
  form.append('file', file)

  let res: Response
  try {
    res = await fetch('/api/parse', { method: 'POST', body: form })
  } catch {
    throw new ParseError('failed', 'Network error while reading the document.')
  }

  const json = (await res.json().catch(() => null)) as
    | { success: true; data: ParsedDocument }
    | { success: false; error?: string; code?: ParseErrorCode }
    | null

  if (!res.ok || !json || json.success === false) {
    const code = (json && 'code' in json && json.code) || 'failed'
    const message = (json && 'error' in json && json.error) || PARSE_ERROR_MESSAGES[code]
    throw new ParseError(code, message)
  }

  return json.data
}

/**
 * OCR fallback for scanned PDFs (slow). Called only after /api/parse reports
 * a 'scanned' code, while the UI shows the 'ocr-processing' state.
 */
export async function requestOcr(file: File): Promise<ParsedDocument> {
  const form = new FormData()
  form.append('file', file)

  let res: Response
  try {
    res = await fetch('/api/ocr', { method: 'POST', body: form })
  } catch {
    throw new ParseError('failed', 'Network error during OCR.')
  }

  const json = (await res.json().catch(() => null)) as
    | { success: true; data: ParsedDocument }
    | { success: false; error?: string; code?: ParseErrorCode }
    | null

  if (!res.ok || !json || json.success === false) {
    const code = (json && 'code' in json && json.code) || 'scanned'
    const message = (json && 'error' in json && json.error) || PARSE_ERROR_MESSAGES[code]
    throw new ParseError(code, message)
  }

  return json.data
}
