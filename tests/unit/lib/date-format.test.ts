import { describe, it, expect } from 'vitest'
import { formatDate } from '@/lib/date-format'

describe('formatDate', () => {
  const iso = '2026-03-15T14:00:00.000Z'

  it('formats as DD/MM/YYYY', () => {
    expect(formatDate(iso, 'DD/MM/YYYY')).toBe('15/03/2026')
  })

  it('formats as MM/DD/YYYY', () => {
    expect(formatDate(iso, 'MM/DD/YYYY')).toBe('03/15/2026')
  })

  it('formats as YYYY-MM-DD', () => {
    expect(formatDate(iso, 'YYYY-MM-DD')).toBe('2026-03-15')
  })

  it('pads single-digit day and month', () => {
    const jan = '2026-01-05T10:00:00.000Z'
    expect(formatDate(jan, 'DD/MM/YYYY')).toBe('05/01/2026')
    expect(formatDate(jan, 'MM/DD/YYYY')).toBe('01/05/2026')
    expect(formatDate(jan, 'YYYY-MM-DD')).toBe('2026-01-05')
  })
})
