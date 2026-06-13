interface MarkdownMeta {
  headings: string[]
  links: string[]
  codeBlocks: number
}

/** Plain text — decoded as UTF-8. */
export function parseTxt(buffer: Buffer): string {
  return buffer.toString('utf-8').trim()
}

/** Raw markdown plus a light structural read (headings, links, code blocks). */
export function parseMarkdown(buffer: Buffer): { text: string; meta: MarkdownMeta } {
  const text = buffer.toString('utf-8').trim()

  const headings = Array.from(text.matchAll(/^#{1,6}\s+(.+)$/gm)).map((m) => m[1].trim())
  const links = Array.from(text.matchAll(/\[[^\]]+\]\(([^)\s]+)[^)]*\)/g)).map((m) => m[1])
  const codeBlocks = (text.match(/```/g)?.length ?? 0) >> 1 // pairs of fences

  return { text, meta: { headings, links, codeBlocks } }
}
