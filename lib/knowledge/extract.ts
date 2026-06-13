import { completeJson } from '@/lib/agents/llm-json'
import { WEBSITE_TYPES } from '@/lib/intent/types'

import { EMPTY_GRAPH, knowledgeGraphSchema, type KnowledgeGraph } from './schema'

/** Cap the text fed to the extractor to keep token cost bounded. */
const EXTRACT_WINDOW = 24_000

const SYSTEM_PROMPT = `You are a senior brand strategist who reads a person's or business's documents and extracts a precise, structured understanding before any website is designed.

Return ONLY a JSON object matching this shape (omit nothing you can infer; leave unknown fields empty):
{
  "person": { "name","title","headline","bio","location","email","phone" },
  "company": { "name","tagline","mission","offerings":[],"industries":[],"locations":[] },
  "projects": [ { "title","description","technologies":[],"outcomes" } ],
  "services": [],
  "experience": [ { "role","org","period","summary" } ],
  "skills": [],
  "education": [],
  "testimonials": [ { "quote","author","role" } ],
  "contact": { "email","phone","location","socials":[] },
  "links": [],
  "brand": { "tone":[], "keywords":[], "industry","personality":[], "visualDirection" },
  "contentBlocks": [ { "heading","body","priority":1-10 } ],
  "suggestedWebsiteType": "ONE OF the allowed types"
}

Rules:
- Use ONLY information supported by the source; never invent names, employers, or metrics.
- person = an individual (resume/CV/portfolio). company = an organisation (profile/brochure).
- brand: infer tone/personality/visualDirection from the domain (e.g. "luxury legal advisory" -> tone: premium, professional, trustworthy).
- contentBlocks: 3-7 sections the website should have, in priority order (1 = most important).
- suggestedWebsiteType MUST be one of: ${WEBSITE_TYPES.join(', ')}.`

export interface ExtractInput {
  /** Combined extracted document text. */
  text?: string
  /** The user's free-form prompt, if any. */
  prompt?: string
}

/**
 * ExtractionService — raw text → KnowledgeGraph via the analysis model.
 * Never throws: a failed extraction degrades to an empty graph so the rest
 * of the pipeline still runs.
 */
export async function extractKnowledgeGraph(input: ExtractInput): Promise<KnowledgeGraph> {
  const source = [input.prompt, input.text].filter(Boolean).join('\n\n').trim()
  if (source.length < 40) return EMPTY_GRAPH

  const { data } = await completeJson({
    label: 'knowledge-extraction',
    schema: knowledgeGraphSchema,
    maxAttempts: 2,
    fallback: EMPTY_GRAPH,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Extract the knowledge graph from the following source.\n\n${source.slice(0, EXTRACT_WINDOW)}`,
      },
    ],
  })

  return data
}
