const METERS_PER_YARD = 0.9144

export function yardsToMeters(yards: number): number {
  return yards * METERS_PER_YARD
}

export function metersToYards(meters: number): number {
  return meters / METERS_PER_YARD
}

export function toMeters(value: number, unit: 'meters' | 'yards'): number {
  return unit === 'yards' ? yardsToMeters(value) : value
}

export function fromMeters(meters: number, unit: 'meters' | 'yards'): number {
  return unit === 'yards' ? metersToYards(meters) : meters
}

export function displayDistance(meters: number, unit: 'meters' | 'yards'): number {
  return Math.round(fromMeters(meters, unit))
}

export type DistanceUnit = 'meters' | 'yards'

const UNIT_LABELS: Record<DistanceUnit, string> = {
  meters: 'm',
  yards: 'yd',
}

export function getUnitLabel(unit: DistanceUnit): string {
  return UNIT_LABELS[unit]
}
