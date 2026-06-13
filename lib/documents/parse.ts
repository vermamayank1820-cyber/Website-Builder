import { parseDocx } from './docx'
import { parsePdf } from './pdf'
import { parseMarkdown, parseTxt } from './text'
import { ParseError, wordCount, type ParsedDocument } from './types'

function extensionOf(name: string): string {
  return name.slice(name.lastIndexOf('.') + 1).toLowerCase()
}

function formatKb(bytes: number): string {
  return `${Math.max(1, Math.round(bytes / 1024))}KB`
}

/**
 * DocumentParser entry point. Delegates to the format-specific parser,
 * assembles the ParsedDocument, and emits a [DocumentParser] debug line.
 * Throws ParseError (differentiated) on failure — never a generic message.
 */
export async function parseDocument(
  buffer: Buffer,
  fileName: string,
): Promise<ParsedDocument> {
  const ext = extensionOf(fileName)
  const started = Date.now()
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`

  const doc: ParsedDocument = {
    id,
    fileName,
    fileType: ext,
    text: '',
    metadata: { wordCount: 0 },
  }

  try {
    switch (ext) {
      case 'pdf': {
        const { text, pageCount, failedPages } = await parsePdf(new Uint8Array(buffer))
        doc.metadata.pageCount = pageCount
        if (failedPages) doc.metadata.failedPages = failedPages
        // Scanned-PDF detection: a real page count but almost no text layer.
        // Signal 'scanned' so the caller routes to the OCR fallback.
        if (pageCount > 0 && wordCount(text) < 10) {
          throw new ParseError('scanned', 'Scanned PDF — OCR required')
        }
        doc.text = text
        break
      }
      case 'docx': {
        const { text, headings } = await parseDocx(buffer)
        doc.text = text
        doc.metadata.headings = headings
        break
      }
      case 'md':
      case 'markdown': {
        const { text, meta } = parseMarkdown(buffer)
        doc.text = text
        doc.metadata.headings = meta.headings
        doc.metadata.links = meta.links
        doc.metadata.codeBlocks = meta.codeBlocks
        break
      }
      case 'txt': {
        doc.text = parseTxt(buffer)
        break
      }
      default:
        throw new ParseError('unsupported', `Unsupported extension: ${ext}`)
    }

    if (!doc.text.trim()) throw new ParseError('empty', 'No extractable text')
    doc.metadata.wordCount = wordCount(doc.text)

    console.log(
      `[DocumentParser] type=${ext} size=${formatKb(buffer.length)} ` +
        `${doc.metadata.pageCount ? `pages=${doc.metadata.pageCount} ` : ''}` +
        `words=${doc.metadata.wordCount} duration=${Date.now() - started}ms status=success`,
    )
    return doc
  } catch (error) {
    const code = error instanceof ParseError ? error.code : 'failed'
    console.log(
      `[DocumentParser] type=${ext} size=${formatKb(buffer.length)} ` +
        `duration=${Date.now() - started}ms status=error code=${code} ` +
        `error=${error instanceof Error ? error.message : 'unknown'}`,
    )
    throw error instanceof ParseError ? error : new ParseError('failed', 'Extraction failed')
  }
}
