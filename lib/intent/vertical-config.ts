import type {
  PlanCta,
  PlanSection,
  StyleGuide,
  VerticalCategory,
  VerticalPlanner,
  WebsitePlan,
  WebsiteType,
} from '@/lib/intent/types'

/**
 * A vertical encoded as data. The factory below turns one config into a
 * fully distinct VerticalPlanner — its own signals, sections, CTAs, design
 * language and SEO. This is how IVIS scales to every Indian industry without
 * 50 copy-pasted files, while keeping each vertical genuinely different.
 */
export interface VerticalConfig {
  type: WebsiteType
  label: string
  category: VerticalCategory
  /** Strong, unambiguous type phrases (weighted highest by the detector). */
  typePhrases: string[]
  strong: string[]
  weak: string[]
  design: {
    direction: string
    palette: string[]
    display: string
    body: string
    mono?: string
    mood: string
    motion: string
  }
  /** Ordered sections — name + the job it does in the narrative. */
  sections: { name: string; job: string }[]
  primaryCta: PlanCta
  secondaryCta?: PlanCta
  features: string[]
  seo: { titlePattern: string; focus: string }
  /** What this vertical must NOT do — keeps each one feeling native. */
  antiPatterns: string[]
  /** Optional escape hatch: override the generated plan for bespoke logic. */
  customize?: (plan: WebsitePlan, brandName: string) => WebsitePlan
}

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function toSection(s: { name: string; job: string }): PlanSection {
  return { id: slug(s.name), name: s.name, job: s.job, components: [], copyGuidance: s.job }
}

/** Build a distinct VerticalPlanner from a config. */
export function makePlanner(config: VerticalConfig): VerticalPlanner {
  return {
    type: config.type,
    label: config.label,
    typePhrases: config.typePhrases,
    signals: { strong: config.strong, weak: config.weak },
    plan({ brandName }): WebsitePlan {
      const name = brandName ?? config.label
      const styleGuide: StyleGuide = {
        direction: config.design.direction,
        palette: config.design.palette,
        typography: { display: config.design.display, body: config.design.body, mono: config.design.mono },
        mood: config.design.mood,
        motion: config.design.motion,
      }
      const plan: WebsitePlan = {
        websiteType: config.type,
        styleGuide,
        sections: config.sections.map(toSection),
        primaryCta: config.primaryCta,
        secondaryCta: config.secondaryCta,
        features: config.features,
        navStyle: 'Clean, vertical-appropriate nav with the primary CTA emphasised',
        responsiveStrategy: 'Mobile-first — most Indian users arrive on a phone',
        seo: config.seo,
        antiPatterns: config.antiPatterns,
      }
      return config.customize ? config.customize(plan, name) : plan
    },
  }
}
