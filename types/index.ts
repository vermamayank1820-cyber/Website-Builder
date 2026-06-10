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

export interface LaunchCheck {
  label: string
  passed: boolean
}

/**
 * Structured description of what a generation produced. Built by
 * lib/parser/analyze-page.ts from the model's MANIFEST comment plus
 * programmatic code analysis — no extra AI call.
 */
export interface ProjectSummary {
  industry: string
  projectType: string
  designStyle: string
  sections: string[]
  features: string[]
  premiumTouches: string[]
  technical: string[]
  componentCount: number
  imageCount: number
  launchChecks: LaunchCheck[]
}

/** Structured description of what a refinement changed. */
export interface ChangeLog {
  summary: string
  changes: string[]
  improvements: string[]
  sectionsAffected: string[]
  version: number
}

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  card?: ChatMessageCard
  summary?: ProjectSummary
  changelog?: ChangeLog
}

export interface GeneratorState {
  prompt: string
  code: string
  status: GenerationStatus
  error: string | null
  streamBuffer: string
  messages: ChatMessage[]
  lastGeneratedAt: number | null
  projectSummary: ProjectSummary | null
  version: number
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
  setProjectSummary: (summary: ProjectSummary | null) => void
  setVersion: (version: number) => void
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
  summary?: ProjectSummary
  changelog?: Omit<ChangeLog, 'version'>
}
