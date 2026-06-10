import type { PageSection } from '@/types'

const STOPWORDS = new Set([
  'a', 'an', 'the', 'for', 'and', 'or', 'with', 'of', 'to', 'in', 'on',
  'that', 'this', 'is', 'are', 'be', 'as', 'it', 'at', 'by', 'from',
])

export interface GeneratedMeta {
  title: string
  description: string
  keywords: string[]
  ogTitle: string
  ogDescription: string
}

/**
 * Derives suggested SEO/meta fields from the user's original prompt and the
 * detected page sections. Pure string templating — no additional API calls.
 */
export function generateMeta(prompt: string, sections: PageSection[]): GeneratedMeta {
  const cleaned = prompt.trim().replace(/\s+/g, ' ')
  const title = truncate(toTitleCase(cleaned), 60)
  const description = truncate(buildDescription(cleaned, sections), 160)
  const keywords = extractKeywords(cleaned, sections)

  return {
    title,
    description,
    keywords,
    ogTitle: title,
    ogDescription: description,
  }
}

function buildDescription(prompt: string, sections: PageSection[]): string {
  const summary = sectionSummary(sections)
  const base = prompt.endsWith('.') ? prompt : `${prompt}.`
  return summary ? `${base} ${summary}` : base
}

function sectionSummary(sections: PageSection[]): string {
  const names = sections
    .map((section) => section.name)
    .filter((name) => !['Hero', 'CTA', 'Footer'].includes(name))

  if (names.length === 0) return ''

  return `Includes ${formatList(names.map((name) => name.toLowerCase()))} sections.`
}

function extractKeywords(prompt: string, sections: PageSection[]): string[] {
  const words = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word))

  const sectionWords = sections
    .map((section) => section.name.toLowerCase())
    .filter((name) => !['hero', 'cta', 'footer'].includes(name))

  return [...new Set([...words, ...sectionWords])].slice(0, 12)
}

function formatList(items: string[]): string {
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
}

function toTitleCase(value: string): string {
  return value.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1))
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value
  return `${value.slice(0, maxLength - 1).trimEnd()}…`
}
