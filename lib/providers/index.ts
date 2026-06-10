import { OpenAIProvider, DEFAULT_MODEL } from './openai'
import type { CompletionProvider } from './types'

export { ProviderError } from './types'
export type { ChatMessage, ChatRole, CompletionProvider } from './types'

/**
 * Returns the configured AI completion provider.
 *
 * Swapping models or providers is a matter of adding a case here —
 * business logic in lib/ai never touches a provider directly.
 */
export function getProvider(): CompletionProvider {
  const providerName = process.env.AI_PROVIDER ?? 'openai'

  switch (providerName) {
    case 'openai': {
      const apiKey = process.env.OPENAI_API_KEY ?? ''
      const model = process.env.OPENAI_MODEL ?? DEFAULT_MODEL
      return new OpenAIProvider(apiKey, model)
    }
    default:
      throw new Error(`Unknown AI provider: ${providerName}`)
  }
}
