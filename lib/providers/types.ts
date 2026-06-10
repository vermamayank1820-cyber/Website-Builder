export type ChatRole = 'system' | 'user' | 'assistant'

export interface ChatMessage {
  role: ChatRole
  content: string
}

export interface CompletionProvider {
  /**
   * Sends a chat-style completion request and returns the raw text response.
   */
  complete(messages: ChatMessage[]): Promise<string>
}

/**
 * An error raised by a completion provider, carrying the HTTP status code
 * that API routes should respond with.
 */
export class ProviderError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ProviderError'
    this.status = status
  }
}
