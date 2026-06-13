import { baseSpec, ideaHas, type ExpandInput, type PromptSpec } from './types'

/** Landing-page archetypes inferred from the idea (goal inference). */
function landingSpec(idea: string): PromptSpec {
  if (ideaHas(idea, 'waitlist', 'early access', 'coming soon')) {
    return baseSpec({
      title: 'Waitlist landing page',
      goal: 'Build a high-converting waitlist landing page that turns curiosity into sign-ups.',
      businessContext: 'For a product that is launching soon and needs early demand.',
      audience: 'early adopters and prospective customers evaluating whether to join.',
      requiredSections: ['Hero with a single sharp value proposition + email capture', 'How it works (3 steps)', 'Why it matters / benefits', 'Social proof or "as seen in"', 'FAQ', 'Final call-to-action', 'Minimal footer'],
      requiredFeatures: ['Email capture form with inline validation', 'Referral / "skip the line" incentive', 'Spots-remaining or countdown element', 'Success state after sign-up'],
      interactions: ['Subtle scroll reveals', 'Hover states on the primary CTA', 'Magnetic submit button'],
      visualStyle: 'Calm, premium, focused — large type, strong hierarchy, a single accent used sparingly',
      colorPalette: ['near-black canvas', 'soft off-white text', 'one confident accent'],
      requirements: ['One clear primary action above the fold.', 'No clutter — the email capture is the hero.', 'Responsive and accessible (WCAG AA).'],
    })
  }
  if (ideaHas(idea, 'event', 'conference', 'registration', 'webinar')) {
    return baseSpec({
      title: 'Event registration landing page',
      goal: 'Build an event landing page that drives registrations and communicates the experience.',
      businessContext: 'For an upcoming event that needs attendees.',
      audience: 'prospective attendees deciding whether the event is worth their time.',
      requiredSections: ['Hero with event name, date, location + register CTA', 'About the event', 'Agenda / schedule', 'Speakers', 'Venue & logistics', 'Pricing / ticket tiers', 'FAQ', 'Footer'],
      requiredFeatures: ['Registration CTA persistent in the nav', 'Countdown to the event', 'Add-to-calendar', 'Speaker cards'],
      interactions: ['Sticky register button', 'Scroll-reveal agenda', 'Hover on speaker cards'],
      visualStyle: 'Energetic but refined — editorial layout, strong event identity',
      colorPalette: ['deep base', 'one vivid event accent', 'neutral support'],
    })
  }
  if (ideaHas(idea, 'launch', 'product launch', 'newsletter', 'signup')) {
    return baseSpec({
      title: 'Product launch landing page',
      goal: 'Build a launch page that announces the product and converts interest into action.',
      businessContext: 'For a product going to market.',
      audience: 'prospective customers and press encountering the product for the first time.',
      requiredSections: ['Hero with the launch headline + primary CTA', 'Feature highlights (3)', 'Product showcase / rendered UI', 'Social proof', 'Pricing or signup', 'FAQ', 'Footer'],
      requiredFeatures: ['Primary CTA (signup/buy)', 'Rendered product surface (no fake screenshots)', 'Feature sections tied to real benefits'],
      interactions: ['Scroll reveals', 'Magnetic CTA', 'Subtle parallax on the product visual'],
      visualStyle: 'Linear/Stripe register — precise, confident, product-first',
      colorPalette: ['neutral canvas', 'one surgical accent', 'signal colours for product UI'],
    })
  }
  return baseSpec({
    title: 'Landing page',
    goal: 'Build a high-converting landing page with a single, clear objective.',
    audience: 'visitors arriving from ads, search, or social who need to be convinced fast.',
    requiredSections: ['Hero (value prop + CTA)', 'Benefits / features', 'How it works', 'Social proof', 'Final CTA', 'Footer'],
    requiredFeatures: ['One primary conversion action', 'Trust signals', 'Mobile-first layout'],
    interactions: ['Scroll reveals', 'CTA hover/active states'],
    visualStyle: 'Premium, modern, conversion-focused with strong hierarchy',
    colorPalette: ['neutral foundation', 'one confident accent'],
  })
}

function portfolioSpec(idea: string): PromptSpec {
  const who = ideaHas(idea, 'photograph') ? 'a photographer' : ideaHas(idea, 'develop', 'engineer') ? 'a developer' : ideaHas(idea, 'architect') ? 'an architect' : ideaHas(idea, 'creator', 'content') ? 'a creator' : 'a designer'
  return baseSpec({
    title: `Portfolio for ${who}`,
    goal: `Build an editorial personal portfolio that could only belong to ${who}.`,
    businessContext: `Showcasing ${who}'s best work to win clients or roles.`,
    audience: `prospective clients, collaborators, and hiring managers evaluating ${who}.`,
    requiredSections: ['Hero / statement of who they are', 'Selected work (case-study tiles)', 'About / point of view', 'Experience or services', 'Contact / get in touch'],
    requiredFeatures: ['3–5 real project case studies', 'A single confident contact action', 'A signature visual moment unique to them'],
    interactions: ['Scroll reveals', 'Hover lift on work tiles', 'One bespoke signature interaction'],
    visualStyle: 'Editorial, typography-led, intentional — feels handcrafted, not templated',
    colorPalette: ['one ink + one neutral', 'a single signature accent derived from the person'],
    references: ['Aesop', 'Linear', 'top studio sites — for craft, not layout'],
  })
}

function dashboardSpec(): PromptSpec {
  return baseSpec({
    title: 'Product dashboard',
    goal: 'Build a polished product dashboard marketing surface (or app shell) that reads as a real, premium tool.',
    audience: 'engineering / ops / business users who value clarity and density done well.',
    requiredSections: ['Top bar with context + actions', 'Key metrics row', 'A primary data visualisation', 'A list/table surface', 'A detail or activity panel'],
    requiredFeatures: ['Rendered product UI (CSS/SVG, never fake screenshots)', 'Clear information hierarchy', 'Empty/loading states'],
    interactions: ['Hover/active on rows', 'Tab or filter switching', 'Subtle transitions, no layout thrash'],
    visualStyle: 'Calm, exact, data-respecting — Linear/Vercel register, restraint over decoration',
    colorPalette: ['near-neutral canvas', 'one accent', 'accessible chart colours'],
  })
}

function ecommerceSpec(): PromptSpec {
  return baseSpec({
    title: 'E-commerce storefront',
    goal: 'Build a premium storefront that makes browsing feel desirable and buying feel effortless.',
    audience: 'shoppers deciding whether to trust and buy from this brand.',
    requiredSections: ['Hero / brand statement', 'Featured products', 'Categories or collections', 'Why-buy / guarantees', 'Reviews / social proof', 'Footer with policies'],
    requiredFeatures: ['Product cards with price + quick add', 'Persistent cart entry', 'Trust badges'],
    interactions: ['Hover on product cards', 'Add-to-cart feedback', 'Smooth category switching'],
    visualStyle: 'Editorial-commerce — confident product photography treatment, refined PDP-style sections',
    colorPalette: ['brand-led base', 'one accent', 'neutral support'],
  })
}

export function expandWebsitePrompt(input: ExpandInput): PromptSpec {
  switch (input.subSurfaceId) {
    case 'portfolio':
      return portfolioSpec(input.idea)
    case 'dashboard':
      return dashboardSpec()
    case 'ecommerce':
      return ecommerceSpec()
    case 'landing':
    default:
      return landingSpec(input.idea)
  }
}
