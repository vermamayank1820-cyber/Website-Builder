export interface ExamplePrompt {
  label: string
  prompt: string
}

export const EXAMPLE_PROMPTS: ExamplePrompt[] = [
  {
    label: 'Luxury restaurant',
    prompt:
      'Create a luxury restaurant website with online reservations and premium branding.',
  },
  {
    label: 'AI agency',
    prompt:
      'Design a premium AI agency landing page that showcases services, case studies, and a contact form.',
  },
  {
    label: 'Startup homepage',
    prompt:
      'Build a modern SaaS startup homepage with a bold hero, feature grid, pricing, and testimonials.',
  },
  {
    label: 'Real estate',
    prompt:
      'Create a real estate company landing page with featured listings, an agent showcase, and a contact CTA.',
  },
  {
    label: 'Personal portfolio',
    prompt:
      'Design a personal brand portfolio for a designer with a hero introduction, work gallery, and contact section.',
  },
]
