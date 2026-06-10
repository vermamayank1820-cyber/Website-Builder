import { extractPageCode } from '@/lib/parser/extract-code'
import {
  GENERATE_SYSTEM_PROMPT,
  EDIT_SYSTEM_PROMPT,
  buildGeneratePrompt,
  buildEditPrompt,
} from '@/lib/prompts/system-prompt'
import { getProvider } from '@/lib/providers'

/**
 * Generates a brand new landing page component from a text prompt.
 * One model call, no follow-ups.
 */
export async function generateLandingPage(prompt: string): Promise<string> {
  const provider = getProvider()

  const raw = await provider.complete([
    { role: 'system', content: GENERATE_SYSTEM_PROMPT },
    { role: 'user', content: buildGeneratePrompt(prompt) },
  ])

  return extractPageCode(raw)
}

/**
 * Applies a refinement instruction to an existing landing page component.
 * One model call, given the current code plus the new instruction.
 */
export async function editLandingPage(
  prompt: string,
  currentCode: string
): Promise<string> {
  const provider = getProvider()

  const raw = await provider.complete([
    { role: 'system', content: EDIT_SYSTEM_PROMPT },
    { role: 'user', content: buildEditPrompt(prompt, currentCode) },
  ])

  return extractPageCode(raw)
}
