import type { SourceType } from '@/types'

const SOURCE_PATTERNS: Array<{ type: SourceType; pattern: RegExp }> = [
  { type: 'github', pattern: /(^|\.)github\.com$/i },
  { type: 'instagram', pattern: /(^|\.)instagram\.com$/i },
  { type: 'linkedin', pattern: /(^|\.)linkedin\.com$/i },
  { type: 'youtube', pattern: /(^|\.)(youtube\.com|youtu\.be)$/i },
  { type: 'zomato', pattern: /(^|\.)zomato\.com$/i },
  { type: 'figma', pattern: /(^|\.)figma\.com$/i },
  { type: 'notion', pattern: /(^|\.)(notion\.so|notion\.site)$/i },
]

export const SOURCE_LABELS: Record<SourceType, string> = {
  website: 'Website',
  github: 'GitHub profile',
  instagram: 'Instagram profile',
  linkedin: 'LinkedIn profile',
  youtube: 'YouTube channel',
  zomato: 'Zomato listing',
  figma: 'Figma design',
  notion: 'Notion workspace',
  none: 'No source',
}

/** Tech terms that look like bare domains but aren't ("next.js"). */
const FALSE_TLD = /\.(js|ts|jsx|tsx|css|html|json|md|txt|py|rb|go)$/i

/** Finds the first URL in free text, if any (bare domains included). */
export function extractUrl(text: string): string | null {
  const match = text.match(/https?:\/\/[^\s<>"')\]]+/i)
  if (match) return match[0]

  const bare = text.match(
    /(?:^|\s)((?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s<>"')\]]*)?)(?:\s|$)/i
  )
  if (!bare) return null

  const domainOnly = bare[1].split('/')[0]
  if (FALSE_TLD.test(domainOnly)) return null
  return `https://${bare[1]}`
}

export function detectSourceType(url: string): SourceType {
  try {
    const host = new URL(url).hostname.replace(/^www\./i, '')
    for (const { type, pattern } of SOURCE_PATTERNS) {
      if (pattern.test(host)) return type
    }
    return 'website'
  } catch {
    return 'website'
  }
}
