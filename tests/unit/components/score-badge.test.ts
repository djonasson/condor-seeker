import { describe, it, expect } from 'vitest'
import { getScoreBadgeVariant } from '@/features/round/lib/score-badge'

describe('getScoreBadgeVariant', () => {
  it('returns star for hole-in-one on par 3', () => {
    expect(getScoreBadgeVariant(1, 3)).toEqual({ shape: 'star' })
  })

  it('returns star for hole-in-one on par 4', () => {
    expect(getScoreBadgeVariant(1, 4)).toEqual({ shape: 'star' })
  })

  it('returns framed-filled-circle for albatross (3 under par)', () => {
    expect(getScoreBadgeVariant(2, 5)).toEqual({ shape: 'framed-filled-circle' })
  })

  it('returns double-circle for eagle (2 under par)', () => {
    expect(getScoreBadgeVariant(3, 5)).toEqual({ shape: 'double-circle' })
  })

  it('returns circle for birdie (1 under par)', () => {
    expect(getScoreBadgeVariant(3, 4)).toEqual({ shape: 'circle' })
  })

  it('returns none for par', () => {
    expect(getScoreBadgeVariant(4, 4)).toEqual({ shape: 'none' })
  })

  it('returns rectangle for bogey (1 over par)', () => {
    expect(getScoreBadgeVariant(5, 4)).toEqual({ shape: 'rectangle' })
  })

  it('returns double-rectangle for double bogey (2 over par)', () => {
    expect(getScoreBadgeVariant(6, 4)).toEqual({ shape: 'double-rectangle' })
  })

  it('returns framed-filled-rectangle for triple bogey (3 over par)', () => {
    expect(getScoreBadgeVariant(7, 4)).toEqual({ shape: 'framed-filled-rectangle' })
  })

  it('returns framed-filled-rectangle for worse than triple bogey', () => {
    expect(getScoreBadgeVariant(8, 4)).toEqual({ shape: 'framed-filled-rectangle' })
  })
})
