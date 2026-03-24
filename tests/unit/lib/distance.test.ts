import { describe, it, expect } from 'vitest'
import {
  yardsToMeters,
  metersToYards,
  toMeters,
  fromMeters,
  displayDistance,
  getUnitLabel,
} from '@/lib/distance'

describe('yardsToMeters', () => {
  it('converts 0 yards to 0 meters', () => {
    expect(yardsToMeters(0)).toBe(0)
  })

  it('converts 100 yards to 91.44 meters', () => {
    expect(yardsToMeters(100)).toBeCloseTo(91.44, 10)
  })

  it('converts 1 yard to 0.9144 meters', () => {
    expect(yardsToMeters(1)).toBe(0.9144)
  })
})

describe('metersToYards', () => {
  it('converts 0 meters to 0 yards', () => {
    expect(metersToYards(0)).toBe(0)
  })

  it('converts 91.44 meters to 100 yards', () => {
    expect(metersToYards(91.44)).toBeCloseTo(100, 10)
  })
})

describe('toMeters', () => {
  it('passes through meters unchanged', () => {
    expect(toMeters(150, 'meters')).toBe(150)
  })

  it('converts yards to meters', () => {
    expect(toMeters(100, 'yards')).toBeCloseTo(91.44, 10)
  })
})

describe('fromMeters', () => {
  it('passes through meters unchanged', () => {
    expect(fromMeters(150, 'meters')).toBe(150)
  })

  it('converts meters to yards', () => {
    expect(fromMeters(91.44, 'yards')).toBeCloseTo(100, 10)
  })
})

describe('displayDistance', () => {
  it('rounds to nearest integer for meters', () => {
    expect(displayDistance(150.7, 'meters')).toBe(151)
  })

  it('rounds to nearest integer for yards', () => {
    expect(displayDistance(91.44, 'yards')).toBe(100)
  })

  it('returns 0 for 0 meters', () => {
    expect(displayDistance(0, 'meters')).toBe(0)
    expect(displayDistance(0, 'yards')).toBe(0)
  })
})

describe('lossless round-trip conversion', () => {
  it('273 yards round-trips exactly', () => {
    const meters = toMeters(273, 'yards')
    const back = displayDistance(meters, 'yards')
    expect(back).toBe(273)
  })

  it('150 meters round-trips exactly', () => {
    const stored = toMeters(150, 'meters')
    const back = displayDistance(stored, 'meters')
    expect(back).toBe(150)
  })

  it('integer yard values round-trip for common golf distances', () => {
    const distances = [100, 150, 200, 250, 300, 350, 400, 450, 500, 550]
    for (const d of distances) {
      const meters = toMeters(d, 'yards')
      const back = displayDistance(meters, 'yards')
      expect(back).toBe(d)
    }
  })
})

describe('getUnitLabel', () => {
  it('returns "m" for meters', () => {
    expect(getUnitLabel('meters')).toBe('m')
  })

  it('returns "yd" for yards', () => {
    expect(getUnitLabel('yards')).toBe('yd')
  })
})
