/** Structured output of the document parsing pipeline. */
export interface ParsedDocument {
  id: string
  fileName: string
  fileType: string
  text: string
  metadata: {
    pageCount?: number
    headings?: string[]
    links?: string[]
    codeBlocks?: number
    wordCount: number
    /** Pages that failed in a partially-readable PDF (fallback strategy). */
    failedPages?: number
  }
}

export type ParseErrorCode =
  | 'unsupported'
  | 'corrupted'
  | 'password'
  | 'scanned'
  | 'empty'
  | 'too_large'
  | 'failed'

/** Carries a differentiated, user-facing reason — never a generic message. */
export class ParseError extends Error {
  readonly code: ParseErrorCode
  constructor(code: ParseErrorCode, message: string) {
    super(message)
    this.name = 'ParseError'
    this.code = code
  }
}

export const PARSE_ERROR_MESSAGES: Record<ParseErrorCode, string> = {
  unsupported: 'This format isn’t supported — use PDF, DOCX, TXT or Markdown.',
  corrupted: 'This PDF appears to be corrupted.',
  password: 'This PDF is password protected.',
  scanned: 'We couldn’t extract text from this scanned PDF.',
  empty: 'We couldn’t find any readable text in this document.',
  too_large: 'This file exceeds the maximum size.',
  failed: 'We couldn’t read this file.',
}

/** Short label for the file chip per error code. */
export const PARSE_ERROR_LABELS: Record<ParseErrorCode, string> = {
  unsupported: 'Unsupported format',
  corrupted: 'Corrupted PDF',
  password: 'Password protected',
  scanned: 'No text in scan',
  empty: 'No text found',
  too_large: 'Too large',
  failed: 'Couldn’t read file',
}

/** Live status line shown while OCR runs on a detected scanned PDF. */
export const OCR_RUNNING_LABEL = 'Scanned PDF detected. Running OCR…'

export function wordCount(text: string): number {
  const t = text.trim()
  return t ? t.split(/\s+/).length : 0
}
