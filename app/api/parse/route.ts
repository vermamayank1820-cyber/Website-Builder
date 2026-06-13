import { NextResponse, type NextRequest } from 'next/server'

import { parseDocument } from '@/lib/documents/parse'
import { ParseError, PARSE_ERROR_MESSAGES } from '@/lib/documents/types'

export const runtime = 'nodejs'
export const maxDuration = 60

const MAX_BYTES = 25 * 1024 * 1024 // 25MB

/**
 * Server-side document parsing. Accepts a single file (multipart/form-data),
 * returns a ParsedDocument or a differentiated error { error, code }.
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
    return NextResponse.json(
      { success: false, error: PARSE_ERROR_MESSAGES.too_large, code: 'too_large' },
      { status: 413 },
    )
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const parsed = await parseDocument(buffer, file.name)
    return NextResponse.json({ success: true, data: parsed })
  } catch (error) {
    const code = error instanceof ParseError ? error.code : 'failed'
    return NextResponse.json(
      { success: false, error: PARSE_ERROR_MESSAGES[code], code },
      { status: 422 },
    )
  }
}
