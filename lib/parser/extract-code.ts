import { VERIFIED_PHOTO_IDS, fallbackPhotoId } from '@/lib/prompts/photo-library'

const CODE_FENCE_REGEX = /```(?:[a-zA-Z]*)\n?([\s\S]*?)```/

const UNSPLASH_ID_REGEX = /(images\.unsplash\.com\/)(photo-[0-9a-f]+-[0-9a-f]+)/g

/**
 * Replaces any Unsplash photo ID the model invented (not in the verified
 * library, so it would 404) with a deterministic verified fallback drawn
 * from the industry-matching category when a hint is available. The
 * prompt instructs the model to use only library IDs, but compliance is
 * not 100% — this guarantees no broken images reach the preview, and the
 * hint guarantees the replacement subject still fits the business.
 */
function sanitizeImageUrls(code: string, industryHint?: string): string {
  return code.replace(UNSPLASH_ID_REGEX, (match, host: string, id: string) => {
    if (VERIFIED_PHOTO_IDS.has(id)) return match
    return `${host}${fallbackPhotoId(id, industryHint)}`
  })
}

/**
 * Cleans up raw model output into a bare `function Page() { ... }` body.
 *
 * Models occasionally ignore the "no markdown" instruction or prepend a
 * sentence before the code. This strips fences, trims to the function
 * declaration, and removes stray import/export statements so the result
 * can be evaluated directly in the preview sandbox.
 */
export function extractPageCode(raw: string, industryHint?: string): string {
  let code = raw.trim()

  const fenceMatch = code.match(CODE_FENCE_REGEX)
  if (fenceMatch) {
    code = fenceMatch[1].trim()
  }

  const functionStart = code.indexOf('function Page')
  if (functionStart > 0) {
    code = code.slice(functionStart)
  }

  code = code
    .split('\n')
    .filter((line) => {
      const trimmed = line.trim()
      return !trimmed.startsWith('import ') && !trimmed.startsWith('export ')
    })
    .join('\n')
    .trim()

  if (!code.includes('function Page')) {
    throw new Error('Generated code did not contain a Page component')
  }

  return sanitizeImageUrls(code, industryHint)
}
