import type { TFunction } from 'i18next'

interface RouteNode {
  parent: string | null
  labelKey: string
}

/**
 * Static route definitions with their parent and translation key.
 * Dynamic segments (e.g. :id) are handled by pattern matching below.
 */
const staticRoutes: Record<string, RouteNode> = {
  '/': { parent: null, labelKey: 'common:home' },
  '/player': { parent: '/', labelKey: 'common:managePlayers' },
  '/player/new': { parent: '/player', labelKey: 'player:addPlayer' },
  '/course': { parent: '/', labelKey: 'common:manageCourses' },
  '/course/new': { parent: '/course', labelKey: 'course:addCourse' },
  '/course/import': { parent: '/course', labelKey: 'course:importCourse' },
  '/round/new': { parent: '/', labelKey: 'round:setup' },
  '/round/play': { parent: '/', labelKey: 'round:scorecard' },
  '/round/play/table': { parent: '/round/play', labelKey: 'round:tableView' },
  '/history': { parent: '/', labelKey: 'history:title' },
  '/stats': { parent: '/', labelKey: 'stats:title' },
  '/settings': { parent: '/', labelKey: 'settings:title' },
  '/import-export': { parent: '/', labelKey: 'import-export:title' },
  '/ui': { parent: '/', labelKey: 'common:uiShowcase' },
}

interface DynamicPattern {
  regex: RegExp
  parent: string
  labelKey: string
}

const dynamicPatterns: DynamicPattern[] = [
  {
    regex: /^\/player\/[^/]+\/edit$/,
    parent: '/player',
    labelKey: 'player:editPlayer',
  },
  {
    regex: /^\/course\/[^/]+\/edit$/,
    parent: '/course',
    labelKey: 'course:editCourse',
  },
  {
    regex: /^\/round\/summary\/[^/]+$/,
    parent: '/',
    labelKey: 'round:summary',
  },
  {
    regex: /^\/history\/[^/]+$/,
    parent: '/history',
    labelKey: 'history:viewDetails',
  },
]

function resolveRoute(pathname: string): RouteNode | null {
  const staticMatch = staticRoutes[pathname]
  if (staticMatch) {
    return staticMatch
  }

  for (const pattern of dynamicPatterns) {
    if (pattern.regex.test(pathname)) {
      return { parent: pattern.parent, labelKey: pattern.labelKey }
    }
  }

  return null
}

export function getParentRoute(pathname: string): string | null {
  const node = resolveRoute(pathname)
  return node?.parent ?? null
}

interface Breadcrumb {
  label: string
  path: string
}

export function getBreadcrumbs(pathname: string, t: TFunction): Breadcrumb[] {
  const crumbs: Breadcrumb[] = []
  let current: string | null = pathname

  while (current !== null) {
    const node = resolveRoute(current)
    if (!node) break
    crumbs.unshift({ label: t(node.labelKey), path: current })
    current = node.parent
  }

  return crumbs
}
