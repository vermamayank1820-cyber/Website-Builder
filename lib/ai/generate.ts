import { analyzePage, buildChangeLog, stripChangelogComment } from '@/lib/parser/analyze-page'
import { extractPageCode } from '@/lib/parser/extract-code'
import {
  GENERATE_SYSTEM_PROMPT,
  EDIT_SYSTEM_PROMPT,
  buildGeneratePrompt,
  buildEditPrompt,
} from '@/lib/prompts/system-prompt'
import { getCodegenProvider } from '@/lib/providers'
import type { ChangeLog, ProjectSummary } from '@/types'

export interface GenerationResult {
  code: string
  summary: ProjectSummary
}

export interface EditResult {
  code: string
  summary: ProjectSummary
  changelog: Omit<ChangeLog, 'version'>
}

/**
 * Generates a brand new landing page component from a text prompt.
 * One model call, no follow-ups — the project summary is derived from
 * the code's MANIFEST comment plus static analysis, not a second call.
 */
export async function generateLandingPage(
  prompt: string,
  businessContext?: string,
  industryHint?: string
): Promise<GenerationResult> {
  const provider = getCodegenProvider()

  const userPrompt = businessContext
    ? `${businessContext}\n\n${buildGeneratePrompt(prompt)}`
    : buildGeneratePrompt(prompt)

  const raw = await provider.complete([
    { role: 'system', content: GENERATE_SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ])

  const code = extractPageCode(raw, industryHint)

  return { code, summary: analyzePage(code) }
}

/**
 * Applies a refinement instruction to an existing landing page component.
 * One model call, given the current code plus the new instruction. The
 * change log comes from the CHANGELOG comment (with a section-diff
 * fallback) and is stripped from the stored code so it never accumulates.
 */
export async function editLandingPage(
  prompt: string,
  currentCode: string
): Promise<EditResult> {
  const provider = getCodegenProvider()

  const raw = await provider.complete([
    { role: 'system', content: EDIT_SYSTEM_PROMPT },
    { role: 'user', content: buildEditPrompt(prompt, currentCode) },
  ])

  const extracted = extractPageCode(raw)
  const changelog = buildChangeLog(extracted, currentCode)
  const code = stripChangelogComment(extracted)

  return { code, summary: analyzePage(code), changelog }
}
