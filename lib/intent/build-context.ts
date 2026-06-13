import type { WebsitePlan } from '@/lib/intent/types'

/**
 * Turns a WebsitePlan into the vertical-specific directive injected into the
 * existing website-generation prompt (lib/prompts/system-prompt.ts). This is
 * the seam between "what to build" (planner) and "how to render it"
 * (generator) — the generator stays one engine; the plan makes it diverge.
 */
export function buildPlanContext(plan: WebsitePlan): string {
  const sections = plan.sections
    .map((s, i) => `  ${i + 1}. ${s.name} — ${s.job} [${s.components.join(', ')}]\n     copy: ${s.copyGuidance}`)
    .join('\n')

  const sg = plan.styleGuide
  const secondary = plan.secondaryCta ? ` · secondary: "${plan.secondaryCta.label}" → ${plan.secondaryCta.action}` : ''

  return [
    `WEBSITE TYPE: ${plan.websiteType} — generate a site that is unmistakably this vertical.`,
    ``,
    `ART DIRECTION`,
    `- Direction: ${sg.direction}`,
    `- Palette: ${sg.palette.join(' · ')}`,
    `- Type: ${sg.typography.display} (display) / ${sg.typography.body} (body)${sg.typography.mono ? ` / ${sg.typography.mono} (mono)` : ''}`,
    `- Mood: ${sg.mood}`,
    `- Motion: ${sg.motion}`,
    ``,
    `SECTIONS (in order — each must earn its place):`,
    sections,
    ``,
    `PRIMARY CTA: "${plan.primaryCta.label}" → ${plan.primaryCta.action}${secondary}`,
    `FEATURES: ${plan.features.join(', ')}`,
    `NAV: ${plan.navStyle}`,
    `RESPONSIVE: ${plan.responsiveStrategy}`,
    `SEO: title "${plan.seo.titlePattern}" · focus ${plan.seo.focus}`,
    ``,
    `DO NOT (anti-patterns for this vertical):`,
    plan.antiPatterns.map((a) => `- ${a}`).join('\n'),
  ].join('\n')
}
