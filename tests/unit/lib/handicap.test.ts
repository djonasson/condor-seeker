import { describe, it, expect } from 'vitest'
import { calculateCourseHandicap, allocateStrokes } from '@/lib/handicap'

describe('calculateCourseHandicap', () => {
  it('calculates course handicap with standard values', () => {
    // handicapIndex=15, slopeRating=113, courseRating=72, par=72
    // 15 * (113/113) + (72-72) = 15
    expect(calculateCourseHandicap(15, 113, 72, 72)).toBe(15)
  })

  it('adjusts for slope rating above 113', () => {
    // handicapIndex=15, slopeRating=140, courseRating=72, par=72
    // 15 * (140/113) + 0 = 18.58 → 19
    expect(calculateCourseHandicap(15, 140, 72, 72)).toBe(19)
  })

  it('adjusts for course rating different from par', () => {
    // handicapIndex=10, slopeRating=113, courseRating=74.5, par=72
    // 10 * (113/113) + (74.5-72) = 12.5 → 13
    expect(calculateCourseHandicap(10, 113, 74.5, 72)).toBe(13)
  })

  it('returns 0 for a scratch golfer on standard course', () => {
    expect(calculateCourseHandicap(0, 113, 72, 72)).toBe(0)
  })

  it('handles high handicap players', () => {
    // handicapIndex=36, slopeRating=130, courseRating=73, par=72
    // 36 * (130/113) + (73-72) = 41.4 + 1 = 42.4 → 42
    expect(calculateCourseHandicap(36, 130, 73, 72)).toBe(42)
  })
})

describe('allocateStrokes', () => {
  it('allocates 0 strokes when course handicap is 0', () => {
    const holeHandicaps = [1, 2, 3, 4, 5]
    expect(allocateStrokes(0, holeHandicaps)).toEqual([0, 0, 0, 0, 0])
  })

  it('allocates 0 strokes when course handicap is negative', () => {
    const holeHandicaps = [1, 2, 3]
    expect(allocateStrokes(-2, holeHandicaps)).toEqual([0, 0, 0])
  })

  it('allocates 1 stroke to hardest holes (handicap <= courseHandicap)', () => {
    const holeHandicaps = [1, 2, 3, 4, 5]
    // Course handicap 3: holes with handicap 1, 2, 3 get 1 stroke
    expect(allocateStrokes(3, holeHandicaps)).toEqual([1, 1, 1, 0, 0])
  })

  it('allocates 1 stroke to all holes when course handicap equals hole count', () => {
    const holeHandicaps = [1, 2, 3]
    expect(allocateStrokes(3, holeHandicaps)).toEqual([1, 1, 1])
  })

  it('allocates 1 stroke to all 18 holes when handicap is 18', () => {
    const holeHandicaps = Array.from({ length: 18 }, (_, i) => i + 1)
    const result = allocateStrokes(18, holeHandicaps)
    expect(result.every((s) => s === 1)).toBe(true)
  })

  it('allocates 2 strokes to hardest holes when handicap > 18', () => {
    const holeHandicaps = Array.from({ length: 18 }, (_, i) => i + 1)
    // Course handicap 20: extra = 20-18 = 2
    // Holes with handicap <= 2 get 2 strokes, rest get 1
    const result = allocateStrokes(20, holeHandicaps)
    expect(result[0]).toBe(2) // hole handicap 1
    expect(result[1]).toBe(2) // hole handicap 2
    expect(result[2]).toBe(1) // hole handicap 3
    expect(result[17]).toBe(1) // hole handicap 18
  })

  it('allocates 2 strokes to all holes when handicap is 36', () => {
    const holeHandicaps = Array.from({ length: 18 }, (_, i) => i + 1)
    const result = allocateStrokes(36, holeHandicaps)
    expect(result.every((s) => s === 2)).toBe(true)
  })
})
