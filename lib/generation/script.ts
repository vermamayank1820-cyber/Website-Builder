import type { GenEvent } from './events'

export interface ScriptStep {
  delayMs: number
  event: Omit<GenEvent, 't'>
}

function section(prompt: string, label: string): string[] {
  const m = prompt.match(new RegExp(`${label}:\\s*([^\\n]+?)(?:\\.|$)`, 'i'))
  if (!m) return []
  return m[1]
    .split(/;|,/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase())
}

function deriveTitle(prompt: string): string {
  // A brand-like quoted token (capitalised, compact) wins — but ignore generic
  // quoted phrases like "as seen in".
  const brand = prompt.match(/"([A-Z][A-Za-z0-9]{1,23})"/)
  if (brand) return brand[1]
  // Else derive a concise title from the first clause of the goal.
  const first = prompt
    .split(/[.\n]/)[0]
    .replace(/^(build|create|design|make)\s+(a|an)\s+/i, '')
    .split(/\s+(?:that|which|for|to|—|-)\s+/)[0]
    .trim()
  const words = first.split(/\s+/).slice(0, 6).join(' ')
  return titleCase(words.length > 46 ? `${words.slice(0, 44)}…` : words || 'New project')
}

function componentName(sectionLabel: string): string {
  const word = sectionLabel.replace(/[^a-zA-Z ].*$/, '').trim().split(/\s+/)[0] || 'Section'
  return `${word.charAt(0).toUpperCase()}${word.slice(1)}.tsx`
}

/**
 * Builds the streamed event timeline for a prompt. Grounds analysis/sections/
 * files/palette in the actual (expanded) prompt so the session visibly
 * understood the request. Tuned for continuous streaming, no dead periods.
 */
export function buildSessionScript(prompt: string, surfaceLabel = 'Website'): ScriptStep[] {
  const steps: ScriptStep[] = []
  const push = (delayMs: number, event: Omit<GenEvent, 't'>) => steps.push({ delayMs, event })

  const title = deriveTitle(prompt)
  const sections = section(prompt, 'Sections')
  const features = section(prompt, 'Key features')
  const palette = section(prompt, 'Palette')
  const visual = (prompt.match(/Visual direction:\s*([^\n.]+)/i)?.[1] ?? 'Premium, modern, intentional').trim()
  const audience = (prompt.match(/It's for ([^\n.]+)/i)?.[1] ?? 'the target audience').trim()
  const fallbackSections = ['Hero', 'Features', 'Social proof', 'FAQ', 'Final CTA', 'Footer']
  const useSections = sections.length ? sections : fallbackSections

  push(0, { type: 'JOB_CREATED', jobId: `gen_${Date.now()}`, title, surface: surfaceLabel })

  // 1. Understanding
  push(150, { type: 'PHASE_STARTED', phaseId: 'understand' })
  push(500, { type: 'THOUGHT', phaseId: 'understand', text: 'Reading your request and what success looks like…' })
  push(700, { type: 'ANALYSIS', analysisKey: 'Surface', analysisValue: surfaceLabel })
  push(500, { type: 'ANALYSIS', analysisKey: 'Audience', analysisValue: audience })
  push(500, { type: 'LOG', phaseId: 'understand', text: 'Understanding prompt' })

  // 2. Expanding spec
  push(400, { type: 'PHASE_STARTED', phaseId: 'expand' })
  push(600, { type: 'THOUGHT', phaseId: 'expand', text: 'Expanding into a full generation specification…' })
  push(500, { type: 'LOG', phaseId: 'expand', text: 'Building specification' })

  // 3. Business analysis
  push(400, { type: 'PHASE_STARTED', phaseId: 'analysis' })
  push(650, { type: 'THOUGHT', phaseId: 'analysis', text: 'Inferring the business goal and conversion strategy…' })
  push(500, { type: 'ANALYSIS', analysisKey: 'Business goal', analysisValue: 'Convert visitors into the primary action' })
  push(450, { type: 'ANALYSIS', analysisKey: 'Conversion goals', analysisValue: ['Primary CTA clarity', 'Trust signals', 'Fast, focused path'] })

  // 4. Domain intelligence
  push(400, { type: 'PHASE_STARTED', phaseId: 'domain' })
  push(600, { type: 'THOUGHT', phaseId: 'domain', text: 'Applying domain patterns for this vertical…' })
  push(450, { type: 'ANALYSIS', analysisKey: 'Website type', analysisValue: surfaceLabel })

  // 5. Information architecture
  push(400, { type: 'PHASE_STARTED', phaseId: 'ia' })
  push(600, { type: 'THOUGHT', phaseId: 'ia', text: 'Planning the page sections and reading order…' })
  push(400, { type: 'ANALYSIS', analysisKey: 'Recommended sections', analysisValue: useSections })
  for (const s of useSections) push(160, { type: 'PHASE_PROGRESS', phaseId: 'ia', text: `Section · ${s}` })

  // 6. Design planning
  push(400, { type: 'PHASE_STARTED', phaseId: 'design' })
  push(600, { type: 'THOUGHT', phaseId: 'design', text: `Design direction: ${visual}.` })
  push(450, { type: 'ANALYSIS', analysisKey: 'Design direction', analysisValue: visual })
  push(400, { type: 'ANALYSIS', analysisKey: 'Color palette', analysisValue: palette.length ? palette : ['near-black canvas', 'soft off-white', 'one accent'] })
  push(400, { type: 'ANALYSIS', analysisKey: 'References', analysisValue: ['Linear', 'Stripe', 'Apple'] })

  // 7 & 8. Component + code generation
  push(450, { type: 'PHASE_STARTED', phaseId: 'components' })
  push(450, { type: 'FILE_CREATED', path: 'app/page.tsx' })
  push(220, { type: 'LOG', phaseId: 'components', text: 'Generating layout shell' })
  for (const s of useSections.slice(0, 7)) {
    const file = `components/${componentName(s)}`
    push(360, { type: 'THOUGHT', phaseId: 'components', text: `Writing ${componentName(s)}…` })
    push(220, { type: 'FILE_CREATED', path: file })
    push(180, { type: 'LOG', phaseId: 'components', text: `Generated ${componentName(s)}` })
  }
  push(350, { type: 'PHASE_STARTED', phaseId: 'code' })
  push(400, { type: 'FILE_UPDATED', path: 'app/page.tsx' })
  push(300, { type: 'LOG', phaseId: 'code', text: 'Wiring components into the page' })

  // 9. Optimization
  push(400, { type: 'PHASE_STARTED', phaseId: 'optimize' })
  push(500, { type: 'PHASE_PROGRESS', phaseId: 'optimize', text: 'Desktop ✓' })
  push(350, { type: 'PHASE_PROGRESS', phaseId: 'optimize', text: 'Tablet ✓' })
  push(350, { type: 'PHASE_PROGRESS', phaseId: 'optimize', text: 'Mobile ✓' })
  push(300, { type: 'LOG', phaseId: 'optimize', text: 'Responsive + accessibility pass' })

  // 10. Preview rendering (progressive)
  push(400, { type: 'PHASE_STARTED', phaseId: 'preview' })
  push(500, { type: 'PREVIEW_UPDATED', previewStage: 'wireframe', previewLabel: 'Wireframe generated' })
  push(700, { type: 'PREVIEW_UPDATED', previewStage: 'hero', previewLabel: 'Hero rendered' })
  push(700, { type: 'PREVIEW_UPDATED', previewStage: 'sections', previewLabel: 'Sections rendered' })
  push(700, { type: 'PREVIEW_UPDATED', previewStage: 'final', previewLabel: 'Final preview ready' })
  push(250, { type: 'LOG', phaseId: 'preview', text: 'Rendering preview' })

  // 11 & 12. Review + complete
  push(450, { type: 'PHASE_STARTED', phaseId: 'review' })
  push(600, { type: 'THOUGHT', phaseId: 'review', text: 'Scoring the result against premium standards…' })
  push(500, { type: 'PHASE_STARTED', phaseId: 'complete' })
  push(300, { type: 'COMPLETED', title })

  return steps
}
