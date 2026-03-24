import { describe, it, expect } from 'vitest'
import { getScoreBadgeVariant } from '@/features/round/lib/score-badge'

describe('getScoreBadgeVariant', () => {
  it('returns double-circle red for eagle (2 under par)', () => {
    expect(getScoreBadgeVariant(3, 5)).toEqual({ shape: 'double-circle', color: 'red' })
  })

  it('returns star yellow for hole-in-one on par 3', () => {
    expect(getScoreBadgeVariant(1, 3)).toEqual({ shape: 'star', color: 'yellow' })
  })

  it('returns star yellow for hole-in-one on par 4', () => {
    expect(getScoreBadgeVariant(1, 4)).toEqual({ shape: 'star', color: 'yellow' })
  })

  it('returns filled-circle red for albatross (3 under par)', () => {
    expect(getScoreBadgeVariant(2, 5)).toEqual({ shape: 'filled-circle', color: 'red' })
  })

  it('returns circle red for birdie (1 under par)', () => {
    expect(getScoreBadgeVariant(3, 4)).toEqual({ shape: 'circle', color: 'red' })
  })

  it('returns none grey for par', () => {
    expect(getScoreBadgeVariant(4, 4)).toEqual({ shape: 'none', color: 'grey' })
  })

  it('returns rectangle blue for bogey (1 over par)', () => {
    expect(getScoreBadgeVariant(5, 4)).toEqual({ shape: 'rectangle', color: 'blue' })
  })

  it('returns double-rectangle blue for double bogey (2 over par)', () => {
    expect(getScoreBadgeVariant(6, 4)).toEqual({ shape: 'double-rectangle', color: 'blue' })
  })

  it('returns filled-rectangle blue for triple bogey (3 over par)', () => {
    expect(getScoreBadgeVariant(6, 3)).toEqual({ shape: 'filled-rectangle', color: 'blue' })
  })

  it('returns filled-rectangle blue for worse than triple bogey', () => {
    expect(getScoreBadgeVariant(8, 4)).toEqual({ shape: 'filled-rectangle', color: 'blue' })
  })
})
