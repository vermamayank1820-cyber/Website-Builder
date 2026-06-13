import { NextResponse, type NextRequest } from 'next/server'

import { ocrPdf } from '@/lib/documents/ocr'
import { ParseError, PARSE_ERROR_MESSAGES, wordCount, type ParsedDocument } from '@/lib/documents/types'

export const runtime = 'nodejs'
export const maxDuration = 120

const MAX_BYTES = 25 * 1024 * 1024

/**
 * OCR fallback endpoint for scanned PDFs. Separate from /api/parse so the UI
 * can show the 'ocr-processing' state while this (slow) work runs.
 */
export async function POST(request: NextRequest) {
  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid upload', code: 'failed' }, { status: 400 })
  }

  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, error: 'No file provided', code: 'failed' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ success: false, error: PARSE_ERROR_MESSAGES.too_large, code: 'too_large' }, { status: 413 })
  }

  const started = Date.now()
  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const { text, pageCount } = await ocrPdf(buffer)
    const parsed: ParsedDocument = {
      id: crypto.randomUUID(),
      fileName: file.name,
      fileType: 'pdf',
      text,
      metadata: { pageCount, wordCount: wordCount(text) },
    }
    console.log(`[DocumentParser] type=pdf ocr=true pages=${pageCount} words=${parsed.metadata.wordCount} duration=${Date.now() - started}ms status=success`)
    return NextResponse.json({ success: true, data: parsed })
  } catch (error) {
    const code = error instanceof ParseError ? error.code : 'failed'
    console.log(`[DocumentParser] type=pdf ocr=true duration=${Date.now() - started}ms status=error code=${code}`)
    return NextResponse.json({ success: false, error: PARSE_ERROR_MESSAGES[code], code }, { status: 422 })
  }
}
