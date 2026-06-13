import type { PlannerInput, VerticalPlanner, WebsitePlan } from '@/lib/intent/types'

/** GENERIC — the default when intent is unclear. Deliberately restrained:
 *  a strong narrative skeleton that the design system elevates, rather than
 *  a guessed vertical that fights the real content. */
export const genericPlanner: VerticalPlanner = {
  type: 'CUSTOM',
  label: 'Custom / Unclassified',
  typePhrases: [],
  signals: { strong: [], weak: [] },
  plan({ brandName }: PlannerInput): WebsitePlan {
    const name = brandName ?? 'the brand'
    return {
      websiteType: 'CUSTOM',
      styleGuide: {
        direction: 'Let the real content choose the direction; default to disciplined editorial',
        palette: ['one accent', 'a warm or cool neutral family — not pure black/white'],
        typography: { display: 'A display face with character', body: 'Clean, readable sans' },
        mood: 'Intentional, premium, content-led',
        motion: 'Subtle scroll reveals; nothing decorative',
      },
      sections: [
        { id: 'hero', name: 'Lead', job: 'State what this is and why it matters', components: ['headline', 'subhead', 'primary CTA'], copyGuidance: 'Specific, no filler' },
        { id: 'value', name: 'What & why', job: 'Explain the core offer', components: ['narrative or 2–3 points'], copyGuidance: 'Plain, benefit-led' },
        { id: 'proof', name: 'Proof', job: 'Build trust with something real', components: ['testimonial / numbers / logos'], copyGuidance: 'Only if genuine' },
        { id: 'cta', name: 'Next step', job: 'One clear action', components: ['CTA panel'], copyGuidance: 'Match the real goal' },
      ],
      primaryCta: { label: 'Get in touch', action: '#cta' },
      features: ['Adaptive — only sections the content earns'],
      navStyle: 'Clean minimal bar',
      responsiveStrategy: 'Mobile-first',
      seo: { titlePattern: `${name}`, focus: 'derived from content' },
      antiPatterns: ['No reflexive sections added "because websites have them"', 'No template feel'],
    }
  },
}
