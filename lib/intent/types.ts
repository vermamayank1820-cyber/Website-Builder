/**
 * PromptSite 2.0 — Intent + PlannerRegistry contracts.
 *
 * The system answers "what is the user trying to build?" (WebsiteIntent)
 * before "how do we build it?" (WebsitePlan). Each vertical owns a
 * VerticalPlanner that declares BOTH its classification signals and its
 * generation rules, so adding a vertical is a single file.
 */

export const WEBSITE_TYPES = [
  // Professional services
  'LAW_FIRM',
  'CA_FIRM',
  'CONSULTING',
  'HR_CONSULTANCY',
  // Creative
  'DESIGN_AGENCY',
  'MARKETING_AGENCY',
  'PRODUCTION_HOUSE',
  // Food & hospitality
  'CAFE',
  'RESTAURANT',
  'BAKERY',
  'HOTEL',
  // Healthcare
  'HOSPITAL',
  'CLINIC',
  'DENTAL_CLINIC',
  'SKIN_CLINIC',
  // Education
  'COACHING',
  'SCHOOL',
  'COLLEGE',
  'TRAINING_INSTITUTE',
  // Real estate
  'BUILDER',
  'REAL_ESTATE_AGENCY',
  'INTERIOR_DESIGNER',
  // Retail
  'FASHION_BOUTIQUE',
  'JEWELLERY_STORE',
  'FURNITURE_STORE',
  'ELECTRONICS_SHOP',
  // Local MSME
  'MANUFACTURING',
  'DISTRIBUTOR',
  'PRINTING',
  'EVENT_MANAGEMENT',
  'TRAVEL_AGENCY',
  // Technology
  'SAAS',
  'STARTUP',
  'SOFTWARE_COMPANY',
  // General business
  'COMPANY_WEBSITE',
  'SMALL_BUSINESS',
  // Personal brands
  'PERSONAL_PORTFOLIO',
  'DEVELOPER_PORTFOLIO',
  'DESIGNER_PORTFOLIO',
  'FOUNDER_PORTFOLIO',
  // Religious & non-profit
  'NGO',
  'TEMPLE',
  // Fallback
  'CUSTOM',
] as const

export type WebsiteType = (typeof WEBSITE_TYPES)[number]

export type VerticalCategory =
  | 'Professional Services'
  | 'Creative'
  | 'Food & Hospitality'
  | 'Healthcare'
  | 'Education'
  | 'Real Estate'
  | 'Retail'
  | 'Local MSME'
  | 'Technology'
  | 'Personal Brand'
  | 'Religious & Non-profit'
  | 'General'

/** Keyword signals a planner contributes to the detector. Multi-word terms
 *  are matched against the normalized text; strong terms outweigh weak. */
export interface PlannerSignals {
  strong: string[]
  weak: string[]
}

/** Output of the IntentDetectionService — classification only ("what"). */
export interface WebsiteIntent {
  websiteType: WebsiteType
  /** 0..1 — share of total signal score won by the top type. */
  confidence: number
  /** Terms that fired, for explainability. */
  matchedSignals: string[]
  /** Runner-up types with their scores. */
  alternatives: { type: WebsiteType; score: number }[]
  /** True when no vertical scored above the floor (routed to fallback). */
  lowConfidence: boolean
}

/** A single planned scene/section ("how", part 1). */
export interface PlanSection {
  id: string
  name: string
  /** The job this section does in the narrative — never "websites have one". */
  job: string
  components: string[]
  copyGuidance: string
}

export interface PlanCta {
  label: string
  action: string
}

export interface StyleGuide {
  direction: string
  palette: string[]
  typography: { display: string; body: string; mono?: string }
  mood: string
  motion: string
}

/** Full output of a VerticalPlanner ("how", complete). */
export interface WebsitePlan {
  websiteType: WebsiteType
  styleGuide: StyleGuide
  sections: PlanSection[]
  primaryCta: PlanCta
  secondaryCta?: PlanCta
  features: string[]
  navStyle: string
  responsiveStrategy: string
  seo: { titlePattern: string; focus: string }
  /** What this vertical must NOT do — keeps a café from feeling like SaaS. */
  antiPatterns: string[]
}

/** Lightweight extracted context a planner may use (resume/company/etc.).
 *  Kept open for now; the KnowledgeGraph refactor will type this fully. */
export interface PlannerInput {
  prompt: string
  intent: WebsiteIntent
  brandName?: string
  knowledge?: Record<string, unknown>
}

/** The unit the PlannerRegistry stores. One file per vertical. */
export interface VerticalPlanner {
  type: WebsiteType
  label: string
  /** Classification signals — read by the detector, owned by the planner. */
  signals: PlannerSignals
  /** Strong, unambiguous type phrases (weighted highest by the detector). */
  typePhrases: string[]
  plan(input: PlannerInput): WebsitePlan
}
