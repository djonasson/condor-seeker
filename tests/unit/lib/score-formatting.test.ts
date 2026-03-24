import { describe, it, expect } from 'vitest'
import { getScoreToParColor, formatScoreToPar } from '@/lib/score-formatting'

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
