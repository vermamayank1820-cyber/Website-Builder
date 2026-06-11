import type { CrawledPageType } from '@/types'

import { extractTitle, fetchWithTimeout, htmlToText } from './fetch-page'

export interface CrawledPage {
  url: string
  type: CrawledPageType
  title: string
  text: string
}

export interface SiteCrawl {
  origin: string
  pages: CrawledPage[]
  /** Hex colors and font families lifted from the homepage markup/CSS. */
  styleHints: { colors: string[]; fonts: string[] }
}

const MAX_PAGES = 7
const PAGE_TEXT_CHARS = 3_500
const HOMEPAGE_TEXT_CHARS = 5_000

/** URL-path keywords → page classification, in priority order. */
const PAGE_RULES: Array<{ type: CrawledPageType; pattern: RegExp }> = [
  { type: 'pricing', pattern: /pricing|plans|tarif/i },
  { type: 'products', pattern: /products?|shop|store|menu|catalog/i },
  { type: 'features', pattern: /features?|solutions?|services|platform|how-it-works/i },
  { type: 'blog', pattern: /blog|news|articles|insights|journal/i },
  { type: 'about', pattern: /about|team|company|story|mission/i },
  { type: 'contact', pattern: /contact|book|reservation|demo|get-in-touch/i },
  { type: 'docs', pattern: /docs|documentation|developers|api|help|support|guides/i },
  { type: 'legal', pattern: /privacy|terms|legal|imprint/i },
]

function classifyPath(pathname: string): CrawledPageType {
  for (const rule of PAGE_RULES) {
    if (rule.pattern.test(pathname)) return rule.type
  }
  return 'other'
}

/** Internal links from a document, deduped, same-origin, fragment-free. */
function extractInternalLinks(html: string, baseUrl: string): string[] {
  const origin = new URL(baseUrl).origin
  const links = new Set<string>()

  for (const match of html.matchAll(/<a[^>]+href=["']([^"'#]+)["']/gi)) {
    try {
      const resolved = new URL(match[1], baseUrl)
      resolved.hash = ''
      resolved.search = ''
      if (resolved.origin !== origin) continue
      if (/\.(png|jpe?g|gif|svg|webp|pdf|zip|mp4|css|js|ico|xml)$/i.test(resolved.pathname)) continue
      links.add(resolved.href)
    } catch {
      // Malformed href — skip.
    }
  }

  return [...links]
}

/** Hex colors + font families from homepage markup and its first stylesheet. */
async function extractStyleHints(html: string, baseUrl: string): Promise<SiteCrawl['styleHints']> {
  let css = ''
  const stylesheetHref = html.match(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/i)?.[1]
  if (stylesheetHref) {
    try {
      const response = await fetchWithTimeout(new URL(stylesheetHref, baseUrl).href)
      if (response.ok) css = (await response.text()).slice(0, 60_000)
    } catch {
      // Stylesheet unreachable — hints come from inline markup only.
    }
  }

  const corpus = `${html.slice(0, 60_000)}\n${css}`

  const colorCounts = new Map<string, number>()
  for (const match of corpus.matchAll(/#(?:[0-9a-f]{6}|[0-9a-f]{3})\b/gi)) {
    const hex = match[0].toLowerCase()
    if (/^#(?:fff(?:fff)?|000(?:000)?)$/.test(hex)) continue // skip pure b/w noise
    colorCounts.set(hex, (colorCounts.get(hex) ?? 0) + 1)
  }
  const colors = [...colorCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([hex]) => hex)

  const fonts = new Set<string>()
  for (const match of corpus.matchAll(/font-family:\s*([^;}"']+)/gi)) {
    const first = match[1].split(',')[0]?.trim().replace(/["']/g, '')
    if (first && !/^(inherit|sans-serif|serif|monospace|system-ui|var\()/i.test(first)) {
      fonts.add(first)
    }
    if (fonts.size >= 4) break
  }

  return { colors, fonts: [...fonts] }
}

/**
 * Step 1 of the Website Intelligence Engine: crawl the site starting at
 * the homepage, classify discovered pages (pricing, products, blog, …),
 * and extract one page per category up to MAX_PAGES total. Each fetch is
 * best-effort — unreachable pages are simply skipped.
 */
export async function crawlWebsite(startUrl: string): Promise<SiteCrawl | null> {
  let homepageHtml: string
  let homepageUrl: string
  try {
    const response = await fetchWithTimeout(startUrl)
    if (!response.ok) return null
    homepageUrl = response.url || startUrl
    homepageHtml = await response.text()
  } catch {
    return null
  }

  const homepageText = htmlToText(homepageHtml).slice(0, HOMEPAGE_TEXT_CHARS)
  if (homepageText.length < 120) return null

  const pages: CrawledPage[] = [
    {
      url: homepageUrl,
      type: 'homepage',
      title: extractTitle(homepageHtml) || homepageUrl,
      text: homepageText,
    },
  ]

  // Pick one candidate URL per category (shortest path wins — closest to root).
  const candidates = new Map<CrawledPageType, string>()
  for (const link of extractInternalLinks(homepageHtml, homepageUrl)) {
    const pathname = new URL(link).pathname
    if (pathname === '/' || pathname === new URL(homepageUrl).pathname) continue
    const type = classifyPath(pathname)
    if (type === 'other') continue
    const existing = candidates.get(type)
    if (!existing || pathname.length < new URL(existing).pathname.length) {
      candidates.set(type, link)
    }
  }

  const toFetch = [...candidates.entries()].slice(0, MAX_PAGES - 1)
  const fetched = await Promise.allSettled(
    toFetch.map(async ([type, url]) => {
      const response = await fetchWithTimeout(url)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const html = await response.text()
      const text = htmlToText(html).slice(0, PAGE_TEXT_CHARS)
      if (text.length < 80) throw new Error('Empty page')
      return { url, type, title: extractTitle(html) || url, text } satisfies CrawledPage
    })
  )

  for (const result of fetched) {
    if (result.status === 'fulfilled') pages.push(result.value)
  }

  const styleHints = await extractStyleHints(homepageHtml, homepageUrl)

  return { origin: new URL(homepageUrl).origin, pages, styleHints }
}

/** Renders the crawl as a corpus block for the analyst prompts. */
export function crawlToCorpus(crawl: SiteCrawl): string {
  const sections = crawl.pages.map(
    (page) => `--- PAGE [${page.type.toUpperCase()}] ${page.url}\nTitle: ${page.title}\n${page.text}`
  )
  const hints = [
    crawl.styleHints.colors.length
      ? `Detected brand colors (from markup/CSS): ${crawl.styleHints.colors.join(', ')}`
      : '',
    crawl.styleHints.fonts.length
      ? `Detected fonts: ${crawl.styleHints.fonts.join(', ')}`
      : '',
  ].filter(Boolean)

  return [`CRAWLED SITE: ${crawl.origin} (${crawl.pages.length} pages)`, ...hints, '', ...sections]
    .join('\n')
    .slice(0, 24_000)
}
