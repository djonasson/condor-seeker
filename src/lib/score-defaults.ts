import type { HoleScore } from '@/storage/types'

export function computeHoleDefaults(
  par: number,
  handicapStrokes: number,
  enabledStats: string[],
): Partial<HoleScore> {
  const defaults: Partial<HoleScore> = {
    grossScore: par + handicapStrokes,
  }
  if (enabledStats.includes('putts')) defaults.putts = 2
  if (enabledStats.includes('fairwayResult') && par > 3) defaults.fairwayResult = 'hit'
  if (enabledStats.includes('greenInRegulation')) defaults.greenInRegulation = true
  if (enabledStats.includes('bunkerHit')) defaults.bunkerHit = false
  if (enabledStats.includes('penaltyStrokes')) defaults.penaltyStrokes = 0
  return defaults
}
