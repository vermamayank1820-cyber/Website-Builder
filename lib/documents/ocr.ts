import { ParseError } from './types'

interface OcrResult {
  text: string
  pageCount: number
}

/** Cap OCR work — OCR is slow; a handful of pages covers resumes/profiles. */
const MAX_OCR_PAGES = 8

/**
 * OCR fallback for scanned PDFs: render each page to a PNG (pdf-to-img →
 * @napi-rs/canvas) and recognise text with Tesseract. Used only when the
 * normal text layer is missing (pageCount > 0 && wordCount < 10).
 */
export async function ocrPdf(buffer: Buffer): Promise<OcrResult> {
  const { pdf } = await import('pdf-to-img')
  const { createWorker } = await import('tesseract.js')

  let document
  try {
    document = await pdf(new Uint8Array(buffer), { scale: 2 })
  } catch (error) {
    console.error('[OCR] render error:', error)
    throw new ParseError('corrupted', `OCR render failed: ${error instanceof Error ? error.message : 'unknown'}`)
  }

  const worker = await createWorker('eng')
  const pages: string[] = []
  let pageCount = 0
  try {
    for await (const image of document) {
      pageCount++
      const { data } = await worker.recognize(image)
      const text = data.text.replace(/[ \t]+/g, ' ').trim()
      if (text) pages.push(text)
      if (pageCount >= MAX_OCR_PAGES) break
    }
  } finally {
    await worker.terminate()
  }

  const text = pages.join('\n\n').trim()
  if (!text) {
    throw new ParseError('scanned', 'We couldn’t extract text from this scanned PDF.')
  }
  return { text, pageCount }
}
