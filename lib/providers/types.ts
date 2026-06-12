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

  /**
   * Vision completion: system + user text plus images (data URLs).
   * Optional — providers without vision simply don't implement it.
   */
  completeVision?(system: string, userText: string, imageDataUrls: string[]): Promise<string>
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
