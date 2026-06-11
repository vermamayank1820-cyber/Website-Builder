import type { ProjectSummary } from '@/types'

const MAX_TITLE_LENGTH = 60

/** Filler lead-ins users type before describing the actual site. */
const LEAD_IN_PATTERN =
  /^(?:please\s+)?(?:can you\s+)?(?:build|create|make|design|generate)(?:\s+me)?\s+(?:a|an|the)?\s*(?:landing\s+page|website|site|page)?\s*(?:for|about|of)?\s*/i

/**
 * Derives a presentable project title and category from the original
 * prompt plus the structured generation summary.
 */
export function deriveProjectMeta(
  prompt: string,
  summary: ProjectSummary | null
): { title: string; category: string } {
  const cleaned = prompt.trim().replace(LEAD_IN_PATTERN, '').replace(/[.!?\s]+$/, '')
  const base = cleaned.length > 2 ? cleaned : prompt.trim()

  const truncated =
    base.length > MAX_TITLE_LENGTH ? `${base.slice(0, MAX_TITLE_LENGTH - 1).trimEnd()}…` : base

  const title = truncated.charAt(0).toUpperCase() + truncated.slice(1)

  return {
    title: title || 'Untitled project',
    category: summary?.industry?.trim() || 'Website',
  }
}
