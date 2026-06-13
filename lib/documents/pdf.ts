import { ParseError } from './types'

interface PdfResult {
  text: string
  pageCount: number
  failedPages: number
}

interface PdfTextItem {
  str?: string
}

/**
 * PDF text extraction via pdf.js (Node legacy build — no browser worker, so
 * none of the CDN/CORS worker fragility of the client path). Per-page
 * try/catch implements the fallback strategy: one bad page never fails the
 * whole document. Distinguishes password / corrupted / scanned causes.
 */
export async function parsePdf(data: Uint8Array): Promise<PdfResult> {
  // Legacy build is the Node-friendly entrypoint.
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')

  let doc
  try {
    doc = await pdfjs.getDocument({
      data,
      // Empty password → pdf.js throws PasswordException for protected files,
      // which we map to a clear 'password' error instead of hanging.
      password: '',
    }).promise
  } catch (error) {
    const name = (error as { name?: string })?.name ?? ''
    if (name === 'PasswordException') throw new ParseError('password', 'Password-protected PDF')
    if (name === 'InvalidPDFException') throw new ParseError('corrupted', 'Invalid or corrupted PDF')
    const detail = error instanceof Error ? error.message : String(error)
    throw new ParseError('corrupted', `Could not open PDF: ${detail}`)
  }

  const pageCount = doc.numPages
  const pages: string[] = []
  let failedPages = 0

  for (let i = 1; i <= pageCount; i++) {
    try {
      const page = await doc.getPage(i)
      const content = await page.getTextContent()
      const text = (content.items as PdfTextItem[])
        .map((item) => item.str ?? '')
        .join(' ')
        .replace(/[ \t]+/g, ' ')
        .trim()
      if (text) pages.push(text)
    } catch {
      failedPages++ // fallback: skip the unreadable page, keep going
    }
  }

  const text = pages.join('\n\n').trim()
  // Note: we do NOT throw on empty text here — the orchestrator decides
  // whether this is a scanned PDF (pageCount > 0 && wordCount < 10) and
  // routes it to the OCR fallback.
  return { text, pageCount, failedPages }
}
