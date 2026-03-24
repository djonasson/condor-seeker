import { describe, it, expect } from 'vitest'
import { getScoreToParColor, formatScoreToPar, clampPutts } from '@/lib/score-formatting'

describe('getScoreToParColor', () => {
  it('returns red for under par', () => {
    expect(getScoreToParColor(-1)).toBe('red')
    expect(getScoreToParColor(-3)).toBe('red')
  })

  it('returns default for even par', () => {
    expect(getScoreToParColor(0)).toBe('default')
  })

  it('returns blue for over par', () => {
    expect(getScoreToParColor(1)).toBe('blue')
    expect(getScoreToParColor(5)).toBe('blue')
  })
})

describe('formatScoreToPar', () => {
  it('formats even par as E', () => {
    expect(formatScoreToPar(0)).toBe('E')
  })

  it('formats under par with minus', () => {
    expect(formatScoreToPar(-1)).toBe('-1')
    expect(formatScoreToPar(-3)).toBe('-3')
  })

  it('formats over par with plus', () => {
    expect(formatScoreToPar(1)).toBe('+1')
    expect(formatScoreToPar(5)).toBe('+5')
  })
})

describe('clampPutts', () => {
  it('returns putts unchanged when less than gross score', () => {
    expect(clampPutts(2, 5)).toBe(2)
  })

  it('returns putts unchanged when equal to gross score', () => {
    expect(clampPutts(3, 3)).toBe(3)
  })

  it('clamps putts to gross score when putts exceed it', () => {
    expect(clampPutts(4, 3)).toBe(3)
  })

  it('returns 0 when gross score is 0', () => {
    expect(clampPutts(2, 0)).toBe(0)
  })

  it('handles hole-in-one (gross 1, max 1 putt)', () => {
    expect(clampPutts(2, 1)).toBe(1)
  })

  it('allows 0 putts (chip-in)', () => {
    expect(clampPutts(0, 4)).toBe(0)
  })
})
