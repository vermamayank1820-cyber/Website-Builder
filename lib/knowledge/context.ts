import type { KnowledgeGraph } from './schema'

/** Compact text used to feed the keyword intent detector. */
export function graphSignalText(g: KnowledgeGraph): string {
  const parts: string[] = []
  if (g.person?.title) parts.push(g.person.title)
  if (g.person?.headline) parts.push(g.person.headline)
  if (g.company?.name) parts.push(g.company.name)
  parts.push(...(g.company?.industries ?? []))
  parts.push(...(g.company?.offerings ?? []))
  parts.push(...g.services)
  parts.push(...g.skills)
  if (g.brand?.industry) parts.push(g.brand.industry)
  parts.push(...(g.brand?.keywords ?? []))
  for (const p of g.projects) parts.push(p.title, ...p.technologies)
  return parts.filter(Boolean).join(' ')
}

export function brandName(g: KnowledgeGraph): string | undefined {
  return g.person?.name || g.company?.name || undefined
}

/** A readable knowledge block injected into generation (replaces raw text). */
export function buildKnowledgeContext(g: KnowledgeGraph): string {
  const lines: string[] = ['STRUCTURED KNOWLEDGE (extracted — generate from this, not raw documents):']

  if (g.person?.name) {
    lines.push(`PERSON: ${g.person.name}${g.person.title ? ` — ${g.person.title}` : ''}`)
    if (g.person.headline) lines.push(`  Headline: ${g.person.headline}`)
    if (g.person.bio) lines.push(`  Bio: ${g.person.bio}`)
    if (g.person.location) lines.push(`  Location: ${g.person.location}`)
  }
  if (g.company?.name) {
    lines.push(`COMPANY: ${g.company.name}${g.company.tagline ? ` — ${g.company.tagline}` : ''}`)
    if (g.company.mission) lines.push(`  Mission: ${g.company.mission}`)
    const industries = g.company.industries ?? []
    const offerings = g.company.offerings ?? []
    if (industries.length) lines.push(`  Industries: ${industries.join(', ')}`)
    if (offerings.length) lines.push(`  Offerings: ${offerings.join(', ')}`)
  }
  if (g.services.length) lines.push(`SERVICES: ${g.services.join(', ')}`)
  if (g.experience.length) {
    lines.push('EXPERIENCE:')
    for (const e of g.experience.slice(0, 6)) {
      lines.push(`  - ${[e.role, e.org, e.period].filter(Boolean).join(' · ')}${e.summary ? ` — ${e.summary}` : ''}`)
    }
  }
  if (g.projects.length) {
    lines.push('PROJECTS:')
    for (const p of g.projects.slice(0, 6)) {
      lines.push(`  - ${p.title}${p.outcomes ? ` (${p.outcomes})` : ''}: ${p.description}`)
    }
  }
  if (g.skills.length) lines.push(`SKILLS: ${g.skills.join(', ')}`)
  if (g.education.length) lines.push(`EDUCATION: ${g.education.join('; ')}`)
  if (g.testimonials.length) {
    lines.push('TESTIMONIALS:')
    for (const t of g.testimonials.slice(0, 4)) lines.push(`  - “${t.quote}” — ${t.author}${t.role ? `, ${t.role}` : ''}`)
  }
  const brand = g.brand
  if (brand && (brand.tone?.length || brand.personality?.length || brand.visualDirection)) {
    lines.push(`BRAND: tone ${(brand.tone ?? []).join('/')} · personality ${(brand.personality ?? []).join('/')}${brand.visualDirection ? ` · ${brand.visualDirection}` : ''}`)
  }
  if (g.contentBlocks.length) {
    lines.push('SUGGESTED SECTIONS (priority order):')
    for (const b of [...g.contentBlocks].sort((a, c) => a.priority - c.priority).slice(0, 8)) {
      lines.push(`  - ${b.heading}: ${b.body}`)
    }
  }
  return lines.join('\n')
}

/** Counts/headlines for the dev debug view. */
export function summarizeGraph(g: KnowledgeGraph) {
  return {
    name: g.person?.name || g.company?.name || '—',
    title: g.person?.title || g.company?.tagline || '—',
    isPerson: Boolean(g.person?.name),
    isCompany: Boolean(g.company?.name),
    counts: {
      projects: g.projects.length,
      services: g.services.length,
      experience: g.experience.length,
      skills: g.skills.length,
      education: g.education.length,
      testimonials: g.testimonials.length,
      contentBlocks: g.contentBlocks.length,
    },
    industry: g.brand?.industry || g.company?.industries?.[0] || '—',
    tone: g.brand?.tone ?? [],
  }
}
