import type { Template } from '@/types'

import { aiAgencyTemplateCode } from './pages/ai-agency'
import { consultingTemplateCode } from './pages/consulting'
import { ecommerceTemplateCode } from './pages/ecommerce'
import { financeTemplateCode } from './pages/finance'
import { healthcareTemplateCode } from './pages/healthcare'
import { portfolioTemplateCode } from './pages/portfolio'
import { realEstateTemplateCode } from './pages/real-estate'
import { restaurantTemplateCode } from './pages/restaurant'
import { saasTemplateCode } from './pages/saas'
import { startupTemplateCode } from './pages/startup'

/**
 * Built-in starter templates. Shipped in code (not the DB) so the
 * Templates tab is always populated with zero seeding — "Use template"
 * copies the code into a brand-new project, leaving the original intact.
 */
export const TEMPLATE_CATALOG: Template[] = [
  {
    id: 'startup',
    category: 'Startup',
    title: 'Northwind',
    description: 'Bright launch page for a pre-seed product: hero, proof, steps, and waitlist.',
    code: startupTemplateCode,
    prompt: 'A launch landing page for an early-stage startup with a waitlist signup',
  },
  {
    id: 'saas',
    category: 'SaaS',
    title: 'Pulseboard',
    description: 'Dark analytics SaaS page with a live dashboard mockup and two-tier pricing.',
    code: saasTemplateCode,
    prompt: 'A dark-themed SaaS landing page for a product analytics tool with pricing',
  },
  {
    id: 'ai-agency',
    category: 'AI Agency',
    title: 'Synthetiq',
    description: 'Premium AI studio site with services, case-study outcomes, and process timeline.',
    code: aiAgencyTemplateCode,
    prompt: 'A landing page for an AI implementation agency with case studies and process',
  },
  {
    id: 'restaurant',
    category: 'Luxury Restaurant',
    title: 'Maison Noir',
    description: 'Editorial fine-dining page: full-bleed hero, tasting menu, chef story, reservations.',
    code: restaurantTemplateCode,
    prompt: 'An elegant landing page for a Michelin-starred French restaurant with reservations',
  },
  {
    id: 'real-estate',
    category: 'Real Estate',
    title: 'Meridian Estates',
    description: 'Boutique brokerage site with featured listings, proof stats, and inquiry form.',
    code: realEstateTemplateCode,
    prompt: 'A landing page for a boutique real estate brokerage with featured listings',
  },
  {
    id: 'portfolio',
    category: 'Portfolio',
    title: 'Ana Reyes',
    description: 'Warm editorial portfolio with grid-breaking project cards and a bold contact CTA.',
    code: portfolioTemplateCode,
    prompt: 'A personal portfolio landing page for a brand designer with selected work',
  },
  {
    id: 'consulting',
    category: 'Consulting',
    title: 'Harbor & Gray',
    description: 'Authoritative consultancy page: practice areas, measured outcomes, testimonial.',
    code: consultingTemplateCode,
    prompt: 'A landing page for a management consulting firm with practice areas and results',
  },
  {
    id: 'ecommerce',
    category: 'E-commerce',
    title: 'Field & Form',
    description: 'Natural-tones storefront with best sellers, brand story, and review wall.',
    code: ecommerceTemplateCode,
    prompt: 'An e-commerce landing page for a sustainable apparel brand with best sellers',
  },
  {
    id: 'healthcare',
    category: 'Healthcare',
    title: 'Bluebird Health',
    description: 'Trustworthy clinic page with appointment widget, services, steps, and FAQ.',
    code: healthcareTemplateCode,
    prompt: 'A landing page for a modern primary care clinic with appointment booking',
  },
  {
    id: 'finance',
    category: 'Finance',
    title: 'Ledgerline',
    description: 'Dark fintech page with treasury dashboard mockup, security proof, and CTA.',
    code: financeTemplateCode,
    prompt: 'A landing page for a business banking and treasury fintech product',
  },
]
