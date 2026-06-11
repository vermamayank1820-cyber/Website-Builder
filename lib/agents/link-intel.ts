import type { SourceType } from '@/types'

import { extractMeta, fetchWithTimeout, htmlToText } from './fetch-page'
import { detectSourceType } from './url'

export interface SourceIntel {
  url: string
  sourceType: SourceType
  /** Whether real content was extracted (vs. handle-only analysis). */
  extracted: boolean
  /** Plain-text content for the analyst (truncated). */
  content: string
  note: string
}

const MAX_CONTENT_CHARS = 9_000

/** GitHub profiles have a real public API — use it instead of scraping. */
async function fetchGithub(url: string): Promise<SourceIntel> {
  const login = new URL(url).pathname.split('/').filter(Boolean)[0]
  if (!login) return fetchGenericWebsite(url, 'github')

  try {
    const [profileRes, reposRes] = await Promise.all([
      fetchWithTimeout(`https://api.github.com/users/${login}`),
      fetchWithTimeout(`https://api.github.com/users/${login}/repos?sort=updated&per_page=10`),
    ])
    if (!profileRes.ok) return fetchGenericWebsite(url, 'github')

    const profile = (await profileRes.json()) as Record<string, unknown>
    const repos = reposRes.ok ? ((await reposRes.json()) as Array<Record<string, unknown>>) : []

    const lines = [
      `GitHub profile: ${String(profile.name ?? login)} (@${login})`,
      profile.bio ? `Bio: ${String(profile.bio)}` : '',
      profile.company ? `Company: ${String(profile.company)}` : '',
      profile.location ? `Location: ${String(profile.location)}` : '',
      profile.blog ? `Website: ${String(profile.blog)}` : '',
      `Followers: ${String(profile.followers ?? 0)} · Public repos: ${String(profile.public_repos ?? 0)}`,
      '',
      'Recent repositories:',
      ...repos.map(
        (repo) =>
          `- ${String(repo.name)}${repo.description ? `: ${String(repo.description)}` : ''} (${String(repo.language ?? 'n/a')}, ★${String(repo.stargazers_count ?? 0)})`
      ),
    ].filter(Boolean)

    return {
      url,
      sourceType: 'github',
      extracted: true,
      content: lines.join('\n').slice(0, MAX_CONTENT_CHARS),
      note: 'Extracted from the public GitHub API.',
    }
  } catch {
    return fetchGenericWebsite(url, 'github')
  }
}

async function fetchGenericWebsite(url: string, sourceType: SourceType): Promise<SourceIntel> {
  try {
    const response = await fetchWithTimeout(url)
    if (!response.ok) {
      return {
        url,
        sourceType,
        extracted: false,
        content: '',
        note: `The page responded with HTTP ${response.status} — analysis proceeds from the URL and your goal.`,
      }
    }

    const html = await response.text()
    const meta = extractMeta(html)
    const body = htmlToText(html)
    const content = `${meta}\n\n${body}`.trim().slice(0, MAX_CONTENT_CHARS)

    // JS-only shells yield almost no text — treat as partial extraction.
    if (content.length < 120) {
      return {
        url,
        sourceType,
        extracted: false,
        content,
        note: 'The page renders client-side and exposed little crawlable text — analysis proceeds from page metadata, the URL, and your goal.',
      }
    }

    return {
      url,
      sourceType,
      extracted: true,
      content,
      note: 'Extracted from the live page.',
    }
  } catch {
    return {
      url,
      sourceType,
      extracted: false,
      content: '',
      note: 'The page could not be fetched (blocked or offline) — analysis proceeds from the URL and your goal.',
    }
  }
}

/**
 * Link → Intelligence entry point: detect the source, extract what can
 * genuinely be extracted, and say so honestly when it can't. Social
 * platforms (Instagram/LinkedIn) block server crawlers, so those usually
 * degrade to handle-plus-goal analysis rather than pretending.
 */
export async function gatherSourceIntel(url: string): Promise<SourceIntel> {
  const sourceType = detectSourceType(url)
  if (sourceType === 'github') return fetchGithub(url)
  return fetchGenericWebsite(url, sourceType)
}
