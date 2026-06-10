export type GenerationStatus =
  | 'idle'
  | 'generating'
  | 'streaming'
  | 'ready'
  | 'error'

export type ChatRole = 'user' | 'assistant'

export type ChatCardStatus = 'building' | 'done' | 'error'

export interface ChatMessageCard {
  title: string
  status: ChatCardStatus
}

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  card?: ChatMessageCard
}

export interface GeneratorState {
  prompt: string
  code: string
  status: GenerationStatus
  error: string | null
  streamBuffer: string
  messages: ChatMessage[]
  lastGeneratedAt: number | null
}

export interface GeneratorActions {
  setPrompt: (prompt: string) => void
  setCode: (code: string) => void
  setStatus: (status: GenerationStatus) => void
  setError: (error: string | null) => void
  appendStream: (chunk: string) => void
  resetStream: () => void
  addMessage: (message: ChatMessage) => void
  updateMessage: (id: string, update: Partial<Omit<ChatMessage, 'id'>>) => void
  setLastGeneratedAt: (timestamp: number | null) => void
  reset: () => void
}

export interface PageSection {
  id: string
  name: string
  index: number
  code: string
}

export interface PageRoute {
  path: string
  label: string
  sectionIndex: number
}

export interface VirtualFile {
  path: string
  name: string
  type: 'file' | 'folder'
  language?: 'jsx' | 'css' | 'markdown'
  content?: string
  children?: VirtualFile[]
}

export type WorkspaceMode = 'preview' | 'files' | 'code' | 'more'

export interface GenerateRequest {
  prompt: string
  currentCode?: string
  isEdit?: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface GenerateResponseData {
  code: string
}
