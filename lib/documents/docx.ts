import { ParseError } from './types'

interface DocxResult {
  text: string
  headings: string[]
}

/**
 * DOCX parsing via mammoth. extractRawText preserves paragraph/list ordering;
 * convertToHtml lets us lift the heading outline for metadata.
 */
export async function parseDocx(buffer: Buffer): Promise<DocxResult> {
  const mammoth = await import('mammoth')
  try {
    const [{ value: text }, { value: html }] = await Promise.all([
      mammoth.extractRawText({ buffer }),
      mammoth.convertToHtml({ buffer }),
    ])

    const headings = Array.from(html.matchAll(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi))
      .map((m) => m[1].replace(/<[^>]+>/g, '').trim())
      .filter(Boolean)

    const clean = text.trim()
    if (!clean) throw new ParseError('empty', 'No text in DOCX')
    return { text: clean, headings }
  } catch (error) {
    if (error instanceof ParseError) throw error
    throw new ParseError('corrupted', 'Could not read DOCX')
  }
}
