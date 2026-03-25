import { describe, it, expect } from 'vitest'
import { computeHoleDefaults } from '@/lib/score-defaults'

describe('computeHoleDefaults', () => {
  it('returns par + handicap strokes as gross', () => {
    const result = computeHoleDefaults(4, 1)
    expect(result.grossScore).toBe(5)
  })

  it('returns 2 putts', () => {
    const result = computeHoleDefaults(4, 0)
    expect(result.putts).toBe(2)
  })

  it('returns fairwayHit true for par 4', () => {
    const result = computeHoleDefaults(4, 0)
    expect(result.fairwayHit).toBe(true)
  })

  it('returns fairwayHit true for par 5', () => {
    const result = computeHoleDefaults(5, 0)
    expect(result.fairwayHit).toBe(true)
  })

  it('returns fairwayHit undefined for par 3', () => {
    const result = computeHoleDefaults(3, 0)
    expect(result.fairwayHit).toBeUndefined()
  })

  it('returns greenInRegulation true', () => {
    const result = computeHoleDefaults(4, 0)
    expect(result.greenInRegulation).toBe(true)
  })

  it('handles zero handicap strokes', () => {
    const result = computeHoleDefaults(4, 0)
    expect(result.grossScore).toBe(4)
  })

  it('handles multiple handicap strokes', () => {
    const result = computeHoleDefaults(3, 2)
    expect(result.grossScore).toBe(5)
  })
})
