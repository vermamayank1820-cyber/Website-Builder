import { OpenAIProvider, DEFAULT_MODEL } from './openai'
import type { CompletionProvider } from './types'

export { ProviderError } from './types'
export type { ChatMessage, ChatRole, CompletionProvider } from './types'

/** The model used for final website code generation (and edits). */
const DEFAULT_CODEGEN_MODEL = 'gpt-5'

/**
 * Returns the configured AI completion provider.
 *
 * Swapping models or providers is a matter of adding a case here —
 * business logic in lib/ai never touches a provider directly.
 */
export function getProvider(model?: string): CompletionProvider {
  const providerName = process.env.AI_PROVIDER ?? 'openai'

  switch (providerName) {
    case 'openai': {
      const apiKey = process.env.OPENAI_API_KEY ?? ''
      return new OpenAIProvider(apiKey, model ?? process.env.OPENAI_MODEL ?? DEFAULT_MODEL)
    }
    default:
      throw new Error(`Unknown AI provider: ${providerName}`)
  }
}

/**
 * Model routing: planning/research/critic/review agents stay on the fast
 * default model via getProvider(); only the website code generation step
 * pays for the strong model. Override with OPENAI_CODEGEN_MODEL.
 */
export function getCodegenProvider(): CompletionProvider {
  const model = process.env.OPENAI_CODEGEN_MODEL ?? DEFAULT_CODEGEN_MODEL
  console.info(`[codegen] using model: ${model}`)
  return getProvider(model)
}

/** Vision Creative Director model — judges rendered pixels, not code. */
const DEFAULT_VISION_MODEL = 'gpt-4.1'

export function getVisionProvider(): CompletionProvider {
  return getProvider(process.env.OPENAI_VISION_MODEL ?? DEFAULT_VISION_MODEL)
}
