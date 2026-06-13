import { z } from 'zod'

import { WEBSITE_TYPES } from '@/lib/intent/types'

/**
 * KnowledgeGraph — the structured understanding of a person/business pulled
 * from documents + prompt before any website is generated. Every field is
 * lenient (defaulted) so a partial extraction never fails the pipeline.
 */

const str = z.string().trim().default('')
const strArr = z.array(z.string().trim()).default([])

export const personSchema = z.object({
  name: str,
  title: str,
  headline: str,
  bio: str,
  location: str,
  email: str,
  phone: str,
})

export const companySchema = z.object({
  name: str,
  tagline: str,
  mission: str,
  offerings: strArr,
  industries: strArr,
  locations: strArr,
})

export const projectSchema = z.object({
  title: str,
  description: str,
  technologies: strArr,
  outcomes: str,
})

export const experienceSchema = z.object({
  role: str,
  org: str,
  period: str,
  summary: str,
})

export const testimonialSchema = z.object({
  quote: str,
  author: str,
  role: str,
})

export const contentBlockSchema = z.object({
  heading: str,
  body: str,
  priority: z.number().int().min(1).max(10).catch(5).default(5),
})

export const brandSchema = z.object({
  tone: strArr,
  keywords: strArr,
  industry: str,
  personality: strArr,
  visualDirection: str,
})

export const contactSchema = z.object({
  email: str,
  phone: str,
  location: str,
  socials: strArr,
})

export const knowledgeGraphSchema = z.object({
  person: personSchema.partial().optional(),
  company: companySchema.partial().optional(),
  projects: z.array(projectSchema).default([]),
  services: strArr,
  experience: z.array(experienceSchema).default([]),
  skills: strArr,
  education: strArr,
  testimonials: z.array(testimonialSchema).default([]),
  contact: contactSchema.partial().default({}),
  links: strArr,
  brand: brandSchema.partial().default({}),
  contentBlocks: z.array(contentBlockSchema).default([]),
  /** The extractor's own read of the doc — used as an intent signal. */
  suggestedWebsiteType: z.enum(WEBSITE_TYPES).optional(),
})

export type KnowledgeGraph = z.infer<typeof knowledgeGraphSchema>
export type PersonProfile = z.infer<typeof personSchema>
export type CompanyProfile = z.infer<typeof companySchema>
export type Project = z.infer<typeof projectSchema>
export type ContentBlock = z.infer<typeof contentBlockSchema>

/** An empty graph — the safe fallback when extraction is unavailable. */
export const EMPTY_GRAPH: KnowledgeGraph = {
  projects: [],
  services: [],
  experience: [],
  skills: [],
  education: [],
  testimonials: [],
  contact: {},
  links: [],
  brand: {},
  contentBlocks: [],
}
