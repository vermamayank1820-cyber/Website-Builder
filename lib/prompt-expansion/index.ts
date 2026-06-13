import { baseSpec, formatSpec, type ExpandInput, type PromptSpec } from './types'
import { expandWebsitePrompt } from './website'
import {
  expandAppPrompt,
  expandDesignPrompt,
  expandGamePrompt,
  expandResearchPrompt,
  expandSlidesPrompt,
} from './others'

export type { PromptSpec, ExpandInput } from './types'
export { formatSpec } from './types'
export { expandWebsitePrompt } from './website'
export {
  expandAppPrompt,
  expandDesignPrompt,
  expandGamePrompt,
  expandResearchPrompt,
  expandSlidesPrompt,
} from './others'

/** Fallback for surfaces without a dedicated expander (still never one-line). */
function expandGenericPrompt(surfaceLabel: string, input: ExpandInput): PromptSpec {
  return baseSpec({
    title: `${surfaceLabel} brief`,
    goal: `Create a polished ${surfaceLabel.toLowerCase()} from this intent: "${input.idea}".`,
    businessContext: input.idea,
    audience: 'the intended audience for this output.',
    requiredSections: ['Clear focal subject', 'Supporting detail', 'A confident finish'],
    requiredFeatures: ['On-brand, specific, production-quality'],
    visualStyle: 'Premium and intentional — a deliberate aesthetic direction',
    colorPalette: ['a deliberate, cohesive palette'],
  })
}

export interface ExpandRequest {
  surfaceId: string | null
  subSurfaceId?: string | null
  idea: string
}

/** Routes intent → the correct domain expander → a structured PromptSpec. */
export function expandPrompt(req: ExpandRequest): PromptSpec {
  const input: ExpandInput = { idea: req.idea, subSurfaceId: req.subSurfaceId }
  switch (req.surfaceId) {
    case 'website':
      return expandWebsitePrompt(input)
    case 'slides':
      return expandSlidesPrompt(input)
    case 'research':
      return expandResearchPrompt(input)
    case 'design':
      return expandDesignPrompt(input)
    case 'mobile':
    case 'desktop':
      return expandAppPrompt(input)
    case 'games':
      return expandGamePrompt(input)
    case 'image':
      return expandGenericPrompt('Image', input)
    case 'video':
      return expandGenericPrompt('Video', input)
    case 'audio':
      return expandGenericPrompt('Audio', input)
    case 'viz':
      return expandGenericPrompt('Visualisation', input)
    case 'scheduled':
      return expandGenericPrompt('Scheduled task', input)
    default:
      return expandWebsitePrompt(input)
  }
}

/** Convenience: intent → editable mini-PRD text for the composer. */
export function expandToText(req: ExpandRequest): string {
  return formatSpec(expandPrompt(req))
}
