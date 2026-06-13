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

export type SaveState = 'idle' | 'saving' | 'saved' | 'error'

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
  projectId: string | null
  projectTitle: string
  saveState: SaveState
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
  setProject: (project: { id: string; title: string }) => void
  setSaveState: (saveState: SaveState) => void
  hydrateProject: (snapshot: ProjectSnapshot) => void
  reset: () => void
}

/** Everything needed to restore a project's editor state on open. */
export interface ProjectSnapshot {
  projectId: string
  projectTitle: string
  prompt: string
  code: string
  version: number
  projectSummary: ProjectSummary | null
  messages: ChatMessage[]
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

export type WorkspaceMode = 'overview' | 'preview' | 'files' | 'code' | 'business' | 'more'

/** Inline content tabs on the creation-first homepage feed. */
export type FeedTab = 'projects' | 'starred' | 'recent' | 'templates'

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
  /** IVIS — the vertical the input was classified as (for UI / telemetry). */
  websiteType?: string
}

// ──────────────────────────────────────────────
// Persistence (Supabase rows + view models)
// ──────────────────────────────────────────────

export type ProjectStatus = 'ready' | 'draft' | 'error'

export interface Project {
  id: string
  user_id: string
  title: string
  category: string
  prompt: string
  thumbnail_url: string | null
  status: ProjectStatus
  created_at: string
  updated_at: string
}

export interface ProjectVersion {
  id: string
  project_id: string
  version_number: number
  generated_code: string
  generation_summary: string | null
  summary_data: ProjectSummary | null
  created_at: string
}

export interface RecentlyViewedItem {
  id: string
  project_id: string
  viewed_at: string
  project: Project
}

// ──────────────────────────────────────────────
// Business OS (knowledge base, agents, documents)
// ──────────────────────────────────────────────

export type SourceType =
  | 'website'
  | 'github'
  | 'instagram'
  | 'linkedin'
  | 'youtube'
  | 'zomato'
  | 'figma'
  | 'notion'
  | 'none'

/**
 * The shared business knowledge base. Created once by the Business Agent
 * and consumed by every downstream agent — no isolated outputs.
 */
export interface BusinessKnowledge {
  company_name: string
  tagline: string
  industry: string
  business_model: string
  audience: {
    description: string
    personas: string[]
  }
  products_services: string[]
  competitors: string[]
  brand_identity: {
    voice: string
    personality: string[]
    values: string[]
  }
  visual_style: {
    mood: string
    colors: string[]
    typography: string
  }
  goals: string[]
  opportunities: string[]
  summary: string
  /** True when built from a goal alone (no link data) — values are proposals. */
  assumptions: boolean
}

export type AgentKind = 'analyze' | 'research' | 'growth' | 'design' | 'website'

export interface PlanStep {
  id: string
  agent: AgentKind
  title: string
  rationale: string
}

/** A page discovered and classified by the site crawler. */
export type CrawledPageType =
  | 'homepage'
  | 'pricing'
  | 'products'
  | 'features'
  | 'blog'
  | 'about'
  | 'contact'
  | 'docs'
  | 'legal'
  | 'other'

export interface CrawledPageMeta {
  url: string
  type: CrawledPageType
  title: string
}

/** Structured knowledge graph built from a full-site crawl. */
export interface WebsiteGraph {
  company: string
  industry: string
  audience: string
  products: string[]
  pricing: string
  revenue_model: string
  conversion_funnel: string
  brand_positioning: string
  competitors: string[]
  visual_identity: string
  typography: string
  colors: string[]
  layout_patterns: string
  design_system: string
  navigation_structure: string[]
  seo_strategy: string
  unique_value_propositions: string[]
  pages: CrawledPageMeta[]
}

/** Website Critic Agent output — flaws vs. best-in-class benchmarks. */
export interface SiteCritique {
  benchmark_summary: string
  weaknesses: string[]
  design_flaws: string[]
  conversion_flaws: string[]
  ux_flaws: string[]
  copy_flaws: string[]
  accessibility_flaws: string[]
}

/** One of three explored design directions; the council picks a winner. */
export interface DesignConcept {
  name: string
  atmosphere: string
  layout_strategy: string
  typography: string
  palette: string[]
  imagery_strategy: string
  conversion_approach: string
  score: number
  rationale: string
}

export interface ConceptSelection {
  concepts: DesignConcept[]
  winnerIndex: number
  selection_rationale: string
}

/** Self-critique scores for a generated site (0-10 each). */
export interface QualityReview {
  scores: {
    visual: number
    brand: number
    conversion: number
    accessibility: number
    mobile: number
    performance: number
  }
  overall: number
  feedback: string[]
  iteration: number
  iterations_total: number
}

export interface BusinessProfile {
  id: string
  project_id: string
  source_url: string | null
  source_type: SourceType | null
  knowledge: BusinessKnowledge
  plan: PlanStep[]
  website_graph: WebsiteGraph | null
  site_critique: SiteCritique | null
  created_at: string
  updated_at: string
}

export type AgentRunStatus = 'running' | 'done' | 'error'

export interface AgentRun {
  id: string
  project_id: string
  agent: AgentKind
  status: AgentRunStatus
  title: string
  summary: string | null
  error: string | null
  created_at: string
  completed_at: string | null
}

export type DocumentKind = 'research' | 'growth' | 'design'

export interface ProjectDocument {
  id: string
  project_id: string
  kind: DocumentKind
  title: string
  content_md: string
  created_at: string
}

export interface Template {
  id: string
  category: string
  title: string
  description: string
  /** Bare `function Page() { ... }` source, same contract as generated code. */
  code: string
  /** Default prompt seeded into the new project for future refinements. */
  prompt: string
}
