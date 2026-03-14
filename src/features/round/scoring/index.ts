import type { ScoringStrategy } from '../types'
import { stablefordStrategy } from './stableford'
import { strokePlayStrategy } from './stroke-play'

const strategies: Record<string, ScoringStrategy> = {
  stroke: strokePlayStrategy,
  stableford: stablefordStrategy,
}

export function getScoringStrategy(name: string): ScoringStrategy {
  const strategy = strategies[name]
  if (!strategy) {
    throw new Error(`Unknown scoring strategy: "${name}"`)
  }
  return strategy
}
