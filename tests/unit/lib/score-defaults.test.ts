import { describe, it, expect } from 'vitest'
import { computeHoleDefaults } from '@/lib/score-defaults'

const ALL_BASIC = ['putts', 'fairwayResult', 'greenInRegulation']
const ALL_STATS = [...ALL_BASIC, 'bunkerHit', 'sandSave', 'penaltyStrokes', 'greenMissDirection']

describe('computeHoleDefaults', () => {
  it('returns par + handicap strokes as gross', () => {
    const result = computeHoleDefaults(4, 1, ALL_BASIC)
    expect(result.grossScore).toBe(5)
  })

  it('returns 2 putts', () => {
    const result = computeHoleDefaults(4, 0, ALL_BASIC)
    expect(result.putts).toBe(2)
  })

  it('returns fairwayResult hit for par 4', () => {
    const result = computeHoleDefaults(4, 0, ALL_BASIC)
    expect(result.fairwayResult).toBe('hit')
  })

  it('returns fairwayResult hit for par 5', () => {
    const result = computeHoleDefaults(5, 0, ALL_BASIC)
    expect(result.fairwayResult).toBe('hit')
  })

  it('returns fairwayResult undefined for par 3', () => {
    const result = computeHoleDefaults(3, 0, ALL_BASIC)
    expect(result.fairwayResult).toBeUndefined()
  })

  it('returns greenInRegulation true', () => {
    const result = computeHoleDefaults(4, 0, ALL_BASIC)
    expect(result.greenInRegulation).toBe(true)
  })

  it('handles zero handicap strokes', () => {
    const result = computeHoleDefaults(4, 0, ALL_BASIC)
    expect(result.grossScore).toBe(4)
  })

  it('handles multiple handicap strokes', () => {
    const result = computeHoleDefaults(3, 2, ALL_BASIC)
    expect(result.grossScore).toBe(5)
  })

  it('only sets defaults for enabled stats', () => {
    const result = computeHoleDefaults(4, 0, ['putts'])
    expect(result.putts).toBe(2)
    expect(result.fairwayResult).toBeUndefined()
    expect(result.greenInRegulation).toBeUndefined()
  })

  it('sets bunkerHit false when enabled', () => {
    const result = computeHoleDefaults(4, 0, ALL_STATS)
    expect(result.bunkerHit).toBe(false)
  })

  it('sets penaltyStrokes 0 when enabled', () => {
    const result = computeHoleDefaults(4, 0, ALL_STATS)
    expect(result.penaltyStrokes).toBe(0)
  })

  it('returns no stat defaults when enabledStats is empty', () => {
    const result = computeHoleDefaults(4, 0, [])
    expect(result.grossScore).toBe(4)
    expect(result.putts).toBeUndefined()
    expect(result.fairwayResult).toBeUndefined()
    expect(result.greenInRegulation).toBeUndefined()
  })
})
