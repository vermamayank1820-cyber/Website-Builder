import type { PageSection } from '@/types'

import { findMatchingTagEnd, findNextJsxElementStart, findTagEnd } from './jsx-scan'

const SECTION_MARKER = /\{\/\*\s*SECTION:\s*([A-Za-z][A-Za-z0-9 ]*)\s*\*\/\}/g

const KEYWORD_NAMES: Array<{ test: RegExp; name: string }> = [
  { test: /pricing|\bplans?\b/, name: 'Pricing' },
  { test: /testimonial|review/, name: 'Testimonials' },
  { test: /faq|frequently asked/, name: 'FAQ' },
  { test: /contact|get in touch/, name: 'Contact' },
  { test: /feature|service/, name: 'Features' },
  { test: /\babout\b/, name: 'About' },
  { test: /<footer/, name: 'Footer' },
  { test: /get started|sign up|join now|cta/, name: 'CTA' },
]

/**
 * Derives the top-level sections of a generated `Page()` component.
 *
 * Primary path: `{/* SECTION: Name *\/}` markers (added by the system prompt)
 * placed immediately before each top-level returned element.
 *
 * Fallback: scans the top-level children of the returned JSX root and
 * classifies each by position + keyword sniffing. This covers code
 * generated before the marker convention existed or hand-edited code.
 */
export function parseSections(code: string): PageSection[] {
  const marked = parseMarkedSections(code)
  if (marked.length > 0) return marked

  return parseHeuristicSections(code)
}

function parseMarkedSections(code: string): PageSection[] {
  const matches = [...code.matchAll(SECTION_MARKER)]
  if (matches.length === 0) return []

  const sections: PageSection[] = []

  matches.forEach((match, i) => {
    const name = match[1].trim()
    const searchFrom = (match.index ?? 0) + match[0].length
    const elementStart = findNextJsxElementStart(code, searchFrom)
    if (elementStart === -1) return

    const elementEnd = findMatchingTagEnd(code, elementStart)
    const snippet = code.slice(elementStart, elementEnd).trim()
    if (!snippet) return

    sections.push({ id: `section-${i}`, name, index: i, code: snippet })
  })

  return sections
}

function parseHeuristicSections(code: string): PageSection[] {
  const returnIndex = code.indexOf('return')
  if (returnIndex === -1) return []

  const rootStart = code.indexOf('<', returnIndex)
  if (rootStart === -1) return []

  const rootTagEnd = findTagEnd(code, rootStart)
  if (rootTagEnd.selfClosing) return []

  const sections: PageSection[] = []
  let pos = rootTagEnd.index

  while (pos < code.length) {
    while (pos < code.length && /\s/.test(code[pos])) pos++
    if (code[pos] !== '<' || code[pos + 1] === '/') break

    const elementStart = pos
    const elementEnd = findMatchingTagEnd(code, elementStart)
    const snippet = code.slice(elementStart, elementEnd).trim()
    if (!snippet) break

    sections.push({ id: `section-${sections.length}`, name: '', index: sections.length, code: snippet })
    pos = elementEnd
  }

  return sections.map((section, i) => ({
    ...section,
    name: classifySection(section.code, i, sections.length),
  }))
}

function classifySection(snippet: string, index: number, total: number): string {
  if (index === 0) return 'Hero'

  const lower = snippet.toLowerCase()
  for (const { test, name } of KEYWORD_NAMES) {
    if (test.test(lower)) return name
  }

  if (index === total - 1) return 'Footer'

  return `Section${index + 1}`
}
