import type { HoleScore } from '@/storage/types'

export type StatInputType = 'boolean' | 'enum' | 'number'
export type StatTier = 'basic' | 'advanced'

export type StatDefinition = {
  id: keyof HoleScore
  inputType: StatInputType
  options?: string[]
  tier: StatTier
  showCondition?: (context: { par: number; score: Partial<HoleScore> }) => boolean
  defaultValue?: (par: number) => unknown
  maxValue?: number | ((score: Partial<HoleScore>) => number)
}

export const STAT_CATALOG: StatDefinition[] = [
  {
    id: 'putts',
    inputType: 'number',
    tier: 'basic',
    defaultValue: () => 2,
    maxValue: (score) => score.grossScore ?? 20,
  },
  {
    id: 'fairwayResult',
    inputType: 'enum',
    options: ['left', 'hit', 'right'],
    tier: 'basic',
    showCondition: ({ par }) => par > 3,
    defaultValue: () => 'hit',
  },
  {
    id: 'greenInRegulation',
    inputType: 'boolean',
    tier: 'basic',
    defaultValue: () => true,
  },
  {
    id: 'greenMissDirection',
    inputType: 'enum',
    options: ['left', 'short', 'long', 'right'],
    tier: 'advanced',
    showCondition: ({ score }) => score.greenInRegulation === false,
  },
  {
    id: 'bunkerHit',
    inputType: 'boolean',
    tier: 'advanced',
    defaultValue: () => false,
  },
  {
    id: 'sandSave',
    inputType: 'boolean',
    tier: 'advanced',
    showCondition: ({ score }) => score.bunkerHit === true,
  },
  {
    id: 'penaltyStrokes',
    inputType: 'number',
    tier: 'advanced',
    defaultValue: () => 0,
    maxValue: (score) => Math.max(0, (score.grossScore ?? 1) - 1),
  },
]

export const DEFAULT_ENABLED_STATS = ['putts', 'fairwayResult', 'greenInRegulation']

export function getVisibleStats(
  enabledStats: string[],
  par: number,
  score: Partial<HoleScore>,
): StatDefinition[] {
  return STAT_CATALOG.filter((stat) => {
    if (!enabledStats.includes(stat.id)) return false
    if (stat.showCondition && !stat.showCondition({ par, score })) return false
    return true
  })
}
