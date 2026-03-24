import { describe, it, expect } from 'vitest'
import { getParentRoute, getBreadcrumbs } from '@/lib/route-hierarchy'

describe('getParentRoute', () => {
  it('returns null for home page', () => {
    expect(getParentRoute('/')).toBeNull()
  })

  it('returns / for top-level pages', () => {
    expect(getParentRoute('/settings')).toBe('/')
    expect(getParentRoute('/history')).toBe('/')
    expect(getParentRoute('/stats')).toBe('/')
    expect(getParentRoute('/import-export')).toBe('/')
  })

  it('returns /player for player sub-pages', () => {
    expect(getParentRoute('/player/new')).toBe('/player')
  })

  it('returns /player for player edit with dynamic id', () => {
    expect(getParentRoute('/player/abc123/edit')).toBe('/player')
  })

  it('returns /course for course sub-pages', () => {
    expect(getParentRoute('/course/new')).toBe('/course')
    expect(getParentRoute('/course/import')).toBe('/course')
  })

  it('returns /course for course edit with dynamic id', () => {
    expect(getParentRoute('/course/xyz789/edit')).toBe('/course')
  })

  it('returns / for round pages', () => {
    expect(getParentRoute('/round/new')).toBe('/')
    expect(getParentRoute('/round/play')).toBe('/')
  })

  it('returns /round/play for table view', () => {
    expect(getParentRoute('/round/play/table')).toBe('/round/play')
  })

  it('returns /history for history detail with dynamic id', () => {
    expect(getParentRoute('/history/some-round-id')).toBe('/history')
  })

  it('returns / for round summary with dynamic id', () => {
    expect(getParentRoute('/round/summary/some-id')).toBe('/')
  })

  it('returns null for unknown routes', () => {
    expect(getParentRoute('/unknown')).toBeNull()
    expect(getParentRoute('/foo/bar/baz')).toBeNull()
  })
})

describe('getBreadcrumbs', () => {
  const t = (key: string) => {
    const map: Record<string, string> = {
      'common:home': 'Home',
      'common:managePlayers': 'Players',
      'common:manageCourses': 'Courses',
      'player:addPlayer': 'Add Player',
      'player:editPlayer': 'Edit Player',
      'course:addCourse': 'Add Course',
      'course:editCourse': 'Edit Course',
      'course:importCourse': 'Import Course',
      'round:setup': 'Round Setup',
      'round:scorecard': 'Scorecard',
      'round:tableView': 'Table View',
      'round:summary': 'Round Summary',
      'history:title': 'Round History',
      'history:viewDetails': 'Round Detail',
      'stats:title': 'Statistics',
      'settings:title': 'Settings',
      'import-export:title': 'Import / Export',
    }
    return map[key] ?? key
  }

  it('returns single breadcrumb for home', () => {
    const crumbs = getBreadcrumbs('/', t)
    expect(crumbs).toEqual([{ label: 'Home', path: '/' }])
  })

  it('returns 2 breadcrumbs for top-level page', () => {
    const crumbs = getBreadcrumbs('/settings', t)
    expect(crumbs).toEqual([
      { label: 'Home', path: '/' },
      { label: 'Settings', path: '/settings' },
    ])
  })

  it('returns 3 breadcrumbs for nested page', () => {
    const crumbs = getBreadcrumbs('/player/new', t)
    expect(crumbs).toEqual([
      { label: 'Home', path: '/' },
      { label: 'Players', path: '/player' },
      { label: 'Add Player', path: '/player/new' },
    ])
  })

  it('handles dynamic player edit route', () => {
    const crumbs = getBreadcrumbs('/player/abc123/edit', t)
    expect(crumbs).toEqual([
      { label: 'Home', path: '/' },
      { label: 'Players', path: '/player' },
      { label: 'Edit Player', path: '/player/abc123/edit' },
    ])
  })

  it('handles dynamic history detail route', () => {
    const crumbs = getBreadcrumbs('/history/round-id-123', t)
    expect(crumbs).toEqual([
      { label: 'Home', path: '/' },
      { label: 'Round History', path: '/history' },
      { label: 'Round Detail', path: '/history/round-id-123' },
    ])
  })

  it('handles scorecard table view (3 levels)', () => {
    const crumbs = getBreadcrumbs('/round/play/table', t)
    expect(crumbs).toEqual([
      { label: 'Home', path: '/' },
      { label: 'Scorecard', path: '/round/play' },
      { label: 'Table View', path: '/round/play/table' },
    ])
  })

  it('returns empty for unknown route', () => {
    const crumbs = getBreadcrumbs('/unknown/path', t)
    expect(crumbs).toEqual([])
  })
})
