import {
  AudioLines,
  BarChart3,
  CalendarClock,
  Gamepad2,
  Globe,
  ImageIcon,
  LayoutDashboard,
  MonitorPlay,
  Palette,
  Presentation,
  ShoppingBag,
  Smartphone,
  Telescope,
  User,
  Video,
  type LucideIcon,
} from 'lucide-react'

/**
 * The generation-surface catalog — the backbone of PromptSite as a creation
 * operating system. A surface morphs the composer (placeholder), reveals
 * sub-surfaces (progressive disclosure) and contextual suggestions. Driven by
 * the platform vision (001-PRD §3); only Website is live today.
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
  /** "What would you like to build?" options (progressive disclosure). */
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
    placeholder: 'Describe the website you want to build…',
    suggestions: [
      'A premium landing page for an AI startup',
      'A portfolio site that feels editorial',
      'A restaurant site with reservations',
    ],
    subSurfaces: [
      {
        id: 'landing',
        label: 'Landing Page',
        suggestions: ['Build a waitlist landing page', 'Event registration landing page', 'Product launch page'],
      },
      {
        id: 'portfolio',
        label: 'Portfolio',
        suggestions: ['Photographer showcase portfolio', 'Developer portfolio with projects', 'Architecture studio portfolio'],
      },
      {
        id: 'dashboard',
        label: 'Dashboard',
        suggestions: ['Analytics dashboard for a SaaS', 'CRM overview dashboard', 'Finance dashboard'],
      },
      {
        id: 'ecommerce',
        label: 'E-commerce',
        suggestions: ['Single-product launch store', 'Fashion boutique storefront', 'Marketplace homepage'],
      },
    ],
  },
  {
    id: 'slides',
    label: 'Slides',
    icon: Presentation,
    live: false,
    placeholder: 'Describe your presentation topic…',
    suggestions: ['An investor pitch deck with projections', 'A sales deck for enterprise buyers', 'A research summary deck'],
    subSurfaces: [
      { id: 'pitch', label: 'Pitch Deck', suggestions: ['Seed-stage investor pitch deck', 'Pre-seed pitch with traction', 'Product vision deck'] },
      { id: 'sales', label: 'Sales Deck', suggestions: ['Enterprise sales deck', 'Product demo deck', 'Partnership proposal deck'] },
      { id: 'investor', label: 'Investor Deck', suggestions: ['Series A deck with metrics', 'Fund LP update deck', 'Board review deck'] },
    ],
  },
  {
    id: 'image',
    label: 'Image',
    icon: ImageIcon,
    live: false,
    placeholder: 'Describe the image you want to create…',
    suggestions: ['A cinematic hero image, mountains at dawn', 'On-brand product photography', 'An abstract editorial cover'],
    subSurfaces: [],
  },
  {
    id: 'design',
    label: 'Design',
    icon: Palette,
    live: false,
    placeholder: 'Describe the design you want to create…',
    suggestions: ['A modern logo for a fintech brand', 'A launch poster for a product', 'A brand identity system'],
    subSurfaces: [
      { id: 'logo', label: 'Logo', suggestions: ['Minimal wordmark logo', 'Geometric app icon', 'Monogram for a studio'] },
      { id: 'poster', label: 'Poster', suggestions: ['Event poster', 'Product launch poster', 'Editorial poster'] },
      { id: 'brand', label: 'Brand Identity', suggestions: ['Full brand kit for a cafe', 'Startup visual identity', 'Rebrand system'] },
    ],
  },
  {
    id: 'research',
    label: 'Wide Research',
    icon: Telescope,
    live: false,
    placeholder: 'What should we research, in depth?',
    suggestions: ['Market sizing for AI customer service', 'Competitor benchmarking study', 'Customer personas & journey maps'],
    subSurfaces: [
      { id: 'market', label: 'Market Analysis', suggestions: ['TAM/SAM/SOM market sizing', 'Industry growth projections', 'Market entry analysis'] },
      { id: 'competitive', label: 'Competitive Analysis', suggestions: ['Competitor benchmarking', 'Feature & pricing comparison', 'Positioning map'] },
      { id: 'diligence', label: 'Due Diligence', suggestions: ['Investment due diligence', 'Technical due diligence', 'Risk assessment'] },
    ],
  },
  { id: 'mobile', label: 'Mobile Apps', icon: Smartphone, live: false, placeholder: 'Describe the mobile app you want to build…', suggestions: [], subSurfaces: [] },
  { id: 'desktop', label: 'Desktop', icon: MonitorPlay, live: false, placeholder: 'Describe the desktop app / PWA you want…', suggestions: [], subSurfaces: [] },
  { id: 'games', label: 'Games', icon: Gamepad2, live: false, placeholder: 'Describe the game you want to build…', suggestions: [], subSurfaces: [] },
  { id: 'video', label: 'Video', icon: Video, live: false, placeholder: 'Describe the video you want to create…', suggestions: [], subSurfaces: [] },
  { id: 'audio', label: 'Audio', icon: AudioLines, live: false, placeholder: 'Describe the audio you want to create…', suggestions: [], subSurfaces: [] },
  { id: 'viz', label: 'Visualisation', icon: BarChart3, live: false, placeholder: 'Describe the data you want to visualise…', suggestions: [], subSurfaces: [] },
  { id: 'scheduled', label: 'Scheduled', icon: CalendarClock, live: false, placeholder: 'Describe the recurring task to automate…', suggestions: [], subSurfaces: [] },
]

/** Light icons reused for sub-surface visuals. */
export const SUB_ICONS = { LayoutDashboard, ShoppingBag, User }
