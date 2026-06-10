import OpenAI from 'openai'

import { ProviderError, type ChatMessage, type CompletionProvider } from './types'

export const DEFAULT_MODEL = 'gpt-4.1-mini'

// A full landing page component runs ~4-5k completion tokens, more for
// richer art-directed pages with custom motion hooks and inline <style>
// blocks. gpt-4.1-mini is fast, but give it generous headroom so larger
// pages and edits aren't truncated mid-component.
const REQUEST_TIMEOUT_MS = 180_000
const MAX_OUTPUT_TOKENS = 24000

/**
 * Talks to OpenAI via the Responses API. One call in, one string out —
 * no streaming, no tool use, no extra round trips.
 */
export class OpenAIProvider implements CompletionProvider {
  private readonly client: OpenAI
  private readonly model: string

  constructor(apiKey: string, model: string = DEFAULT_MODEL) {
    if (!apiKey) {
      throw new ProviderError(
        'OPENAI_API_KEY is not configured. Add it to your .env.local file.',
        500
      )
    }

    this.client = new OpenAI({ apiKey, timeout: REQUEST_TIMEOUT_MS })
    this.model = model
  }

  async complete(messages: ChatMessage[]): Promise<string> {
    try {
      const response = await this.client.responses.create({
        model: this.model,
        input: messages.map(({ role, content }) => ({ role, content })),
        max_output_tokens: MAX_OUTPUT_TOKENS,
      })

      const content = response.output_text?.trim()

      if (!content) {
        throw new ProviderError('OpenAI response did not contain any content', 502)
      }

      return content
    } catch (error: unknown) {
      throw toProviderError(error)
    }
  }
}

/**
 * Normalizes OpenAI SDK errors into ProviderErrors with status codes that
 * API routes can pass straight through to the client.
 */
function toProviderError(error: unknown): ProviderError {
  if (error instanceof ProviderError) {
    return error
  }

  if (error instanceof OpenAI.AuthenticationError) {
    return new ProviderError('OpenAI request failed: invalid or missing API key.', 401)
  }

  if (error instanceof OpenAI.RateLimitError) {
    return new ProviderError(
      'OpenAI request failed: rate limit exceeded. Please try again shortly.',
      429
    )
  }

  if (error instanceof OpenAI.APIConnectionError) {
    return new ProviderError('OpenAI request failed: unable to reach the API.', 502)
  }

  if (error instanceof OpenAI.APIError) {
    return new ProviderError(
      `OpenAI request failed (${error.status ?? 'unknown'}): ${error.message}`,
      error.status ?? 502
    )
  }

  if (error instanceof Error) {
    return new ProviderError(error.message, 502)
  }

  return new ProviderError('OpenAI request failed: unexpected error', 502)
}
