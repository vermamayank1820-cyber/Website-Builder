import type { ChangeLog, LaunchCheck, ProjectSummary } from '@/types'

import { parseSections } from './parse-sections'

const MANIFEST_REGEX = /^[ \t]*\/\/\s*MANIFEST:\s*(\{.*\})\s*$/m
const CHANGELOG_REGEX = /^[ \t]*\/\/\s*CHANGELOG:\s*(\{.*\})\s*$/m

interface RawManifest {
  industry?: string
  projectType?: string
  designStyle?: string
  features?: string[]
  premiumTouches?: string[]
}

interface RawChangelog {
  summary?: string
  changes?: string[]
  improvements?: string[]
  sectionsAffected?: string[]
}

function parseJsonComment<T>(code: string, regex: RegExp): T | null {
  const match = code.match(regex)
  if (!match) return null

  try {
    return JSON.parse(match[1]) as T
  } catch {
    return null
  }
}

function asStringArray(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .slice(0, max)
}

/**
 * Removes the CHANGELOG comment so it never accumulates across edits
 * (the MANIFEST line is intentionally kept — the edit flow reads it).
 */
export function stripChangelogComment(code: string): string {
  return code.replace(CHANGELOG_REGEX, '').replace(/\n{3,}/g, '\n\n')
}

/** Counts occurrences of a regex without keeping the matches around. */
function countMatches(code: string, regex: RegExp): number {
  return (code.match(regex) ?? []).length
}

function detectFeatures(code: string): string[] {
  const features: string[] = []

  if (/<nav[\s>]/.test(code)) features.push('Navigation with working anchor links')
  if (/IntersectionObserver/.test(code)) features.push('Scroll-triggered reveal animations')
  if (/hover:/.test(code)) features.push('Designed hover and focus states')
  if (/sm:|md:|lg:/.test(code)) features.push('Fully responsive layout')
  if (/<form[\s>]/.test(code)) features.push('Contact / action form')
  if (/<footer[\s>]/.test(code)) features.push('Multi-column footer')
  if (/useState/.test(code)) features.push('Interactive stateful components')
  if (/<svg/.test(code)) features.push('Custom inline SVG graphics')
  if (/images\.unsplash\.com/.test(code)) features.push('Art-directed photography')

  return features
}

function detectTechnical(code: string): string[] {
  const technical: string[] = ['React 18 functional component', 'Tailwind CSS styling']

  if (/sm:|md:|lg:/.test(code)) technical.push('Mobile-first responsive breakpoints')
  if (/IntersectionObserver/.test(code)) technical.push('IntersectionObserver-based motion (no animation library)')
  if (/transition/.test(code)) technical.push('GPU-friendly CSS transitions')
  if (/aria-|alt=/.test(code)) technical.push('Accessibility attributes (ARIA, alt text)')
  technical.push('Zero external dependencies — single deployable component')

  return technical
}

function inferDesignStyle(code: string): string {
  const isDark = /bg-(?:zinc|stone|neutral|slate|gray)-9(?:00|50)/.test(code)
  const hasSerif = /font-serif/.test(code)

  if (isDark && hasSerif) return 'Dark luxury editorial'
  if (isDark) return 'Dark modern premium'
  if (hasSerif) return 'Light editorial'
  return 'Clean modern'
}

function buildLaunchChecks(code: string): LaunchCheck[] {
  const hrefs = [...code.matchAll(/href="([^"]*)"/g)].map((m) => m[1])
  const ids = new Set([...code.matchAll(/\bid="([^"]*)"/g)].map((m) => m[1]))
  const anchorsResolve = hrefs.every((href) => {
    if (!href.startsWith('#')) return true
    return href !== '#' && ids.has(href.slice(1))
  })

  return [
    { label: 'All navigation links resolve', passed: anchorsResolve },
    { label: 'Responsive across breakpoints', passed: /sm:|md:|lg:/.test(code) },
    { label: 'Navigation present', passed: /<nav[\s>]/.test(code) },
    { label: 'Footer present', passed: /<footer[\s>]/.test(code) },
    {
      label: 'No placeholder content',
      passed: !/lorem ipsum|your brand|company name/i.test(code),
    },
  ]
}

/**
 * Builds a ProjectSummary for generated page code by combining the model's
 * MANIFEST comment (intent: industry, style, features) with programmatic
 * analysis of the code itself (facts: sections, counts, launch checks).
 */
export function analyzePage(code: string): ProjectSummary {
  const manifest = parseJsonComment<RawManifest>(code, MANIFEST_REGEX)
  const sections = parseSections(code).map((section) => section.name)

  const componentCount =
    countMatches(code, /<nav[\s>]/g) +
    countMatches(code, /<section[\s>]/g) +
    countMatches(code, /<header[\s>]/g) +
    countMatches(code, /<footer[\s>]/g) +
    countMatches(code, /<form[\s>]/g) +
    countMatches(code, /<button[\s>]/g)

  const imageCount =
    countMatches(code, /<img[\s>]/g) + countMatches(code, /<svg[\s>]/g)

  const detectedFeatures = detectFeatures(code)
  const manifestFeatures = asStringArray(manifest?.features, 8)

  return {
    industry: manifest?.industry?.trim() || 'Custom project',
    projectType: manifest?.projectType?.trim() || 'Landing page',
    designStyle: manifest?.designStyle?.trim() || inferDesignStyle(code),
    sections,
    features: manifestFeatures.length > 0 ? manifestFeatures : detectedFeatures,
    premiumTouches: asStringArray(manifest?.premiumTouches, 6),
    technical: detectTechnical(code),
    componentCount,
    imageCount,
    launchChecks: buildLaunchChecks(code),
  }
}

/**
 * Builds a ChangeLog for an edit from the model's CHANGELOG comment, with
 * a section-diff fallback when the comment is missing or malformed.
 */
export function buildChangeLog(
  newCode: string,
  previousCode: string
): Omit<ChangeLog, 'version'> {
  const raw = parseJsonComment<RawChangelog>(newCode, CHANGELOG_REGEX)

  if (raw?.summary) {
    return {
      summary: raw.summary.trim(),
      changes: asStringArray(raw.changes, 8),
      improvements: asStringArray(raw.improvements, 6),
      sectionsAffected: asStringArray(raw.sectionsAffected, 12),
    }
  }

  const before = new Set(parseSections(previousCode).map((s) => s.name))
  const after = parseSections(newCode).map((s) => s.name)
  const added = after.filter((name) => !before.has(name))
  const afterSet = new Set(after)
  const removed = [...before].filter((name) => !afterSet.has(name))

  const changes = [
    ...added.map((name) => `Added ${name} section`),
    ...removed.map((name) => `Removed ${name} section`),
  ]

  return {
    summary: 'Applied your requested changes to the page.',
    changes: changes.length > 0 ? changes : ['Updated page content and styling'],
    improvements: [],
    sectionsAffected: added.length > 0 ? added : after,
  }
}
