import {
  Building2,
  Coffee,
  Globe,
  LayoutDashboard,
  ShoppingBag,
  User,
  type LucideIcon,
} from 'lucide-react'

/**
 * The generation-surface catalog. PromptSite is website-only for now, focused
 * on three proving verticals — SaaS, Cafe, and Real Estate. A surface morphs
 * the composer (placeholder) and reveals its verticals (progressive
 * disclosure) with contextual suggestions. Other builders (slides, image,
 * design, research, mobile, desktop, games, …) are intentionally out of scope.
 */

export interface SubSurface {
  id: string
  label: string
  suggestions: string[]
}

export interface Surface {
  id: string
  label: string
  icon: LucideIcon
  live: boolean
  /** Placeholder the composer morphs to when this surface is active. */
  placeholder: string
  /** "What kind of website?" options (progressive disclosure). */
  subSurfaces: SubSurface[]
  /** Surface-level suggestions shown when no sub-surface is selected. */
  suggestions: string[]
}

export const SURFACES: Surface[] = [
  {
    id: 'website',
    label: 'Website',
    icon: Globe,
    live: true,
    placeholder: 'Describe your business — PromptSite builds the website…',
    suggestions: [
      'A SaaS product website with a clear demo CTA',
      'A cozy cafe website with menu, hours and reservations',
      'A real-estate agency site with listings and enquiry forms',
      'A designer portfolio that wins premium clients',
    ],
    subSurfaces: [
      {
        id: 'saas',
        label: 'SaaS',
        suggestions: [
          'A SaaS product website with a clear demo CTA',
          'A B2B tool launch page with pricing and social proof',
          'A developer-tools marketing site with docs and signup',
        ],
      },
      {
        id: 'cafe',
        label: 'Cafe',
        suggestions: [
          'A cozy neighbourhood cafe website with menu and hours',
          'A specialty coffee roaster site with online ordering',
          'A cafe website with table reservations and gallery',
        ],
      },
      {
        id: 'real-estate',
        label: 'Real Estate',
        suggestions: [
          'A real-estate agency site with listings and enquiry forms',
          'A luxury property developer site with a flagship project',
          'A property consultancy website with site-visit booking',
        ],
      },
      {
        id: 'portfolio',
        label: 'Personal Portfolio',
        suggestions: [
          'A designer portfolio that wins premium clients',
          'A photographer showcase portfolio with selected work',
          'A developer portfolio with projects and case studies',
        ],
      },
    ],
  },
]

/** Light icons reused for sub-surface / vertical visuals. */
export const SUB_ICONS = { Building2, Coffee, LayoutDashboard, ShoppingBag, User }
