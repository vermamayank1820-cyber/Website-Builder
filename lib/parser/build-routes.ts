import type { PageRoute, PageSection } from '@/types'

const SKIPPED_ROUTE_NAMES = new Set(['cta', 'footer'])
const HOME_NAMES = new Set(['hero', 'header'])

/**
 * Derives a virtual route list from page sections for the preview's
 * browser-chrome navigation. Routes are presentation-only — selecting one
 * scrolls the preview iframe to the matching section, no real routing occurs.
 */
export function buildRoutes(sections: PageSection[]): PageRoute[] {
  const routes: PageRoute[] = []
  const seenPaths = new Set<string>()

  sections.forEach((section) => {
    const lower = section.name.toLowerCase()

    if (section.index === 0 || HOME_NAMES.has(lower)) {
      if (!seenPaths.has('/')) {
        routes.push({ path: '/', label: 'Home', sectionIndex: section.index })
        seenPaths.add('/')
      }
      return
    }

    if (SKIPPED_ROUTE_NAMES.has(lower)) return

    const path = `/${kebabCase(section.name)}`
    if (seenPaths.has(path)) return

    seenPaths.add(path)
    routes.push({ path, label: section.name, sectionIndex: section.index })
  })

  if (routes.length === 0 || routes[0].path !== '/') {
    routes.unshift({ path: '/', label: 'Home', sectionIndex: 0 })
  }

  return routes
}

function kebabCase(value: string): string {
  return value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}
