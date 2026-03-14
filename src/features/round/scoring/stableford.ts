import type { HoleResult, RoundTotal, ScoringStrategy } from '../types'

function calculateStablefordPoints(netScore: number, par: number): number {
  const netToPar = netScore - par

  if (netToPar >= 2) return 0 // net double bogey or worse
  if (netToPar === 1) return 1 // net bogey
  if (netToPar === 0) return 2 // net par
  if (netToPar === -1) return 3 // net birdie
  if (netToPar === -2) return 4 // net eagle
  return 5 // net albatross or better
}

export const stablefordStrategy: ScoringStrategy = {
  name: 'stableford',

  calculateHoleScore(grossScore: number, par: number, handicapStrokes: number): HoleResult {
    const netScore = grossScore - handicapStrokes
    const scoreToPar = grossScore - par
    const points = calculateStablefordPoints(netScore, par)

    return {
      holeNumber: 0,
      grossScore,
      netScore,
      par,
      scoreToPar,
      points,
    }
  },

  calculateRoundTotal(holeResults: HoleResult[]): RoundTotal {
    let totalGross = 0
    let totalNet = 0
    let totalToPar = 0
    let totalPoints = 0

    for (const hole of holeResults) {
      totalGross += hole.grossScore
      totalNet += hole.netScore
      totalToPar += hole.scoreToPar
      totalPoints += hole.points ?? 0
    }

    return { totalGross, totalNet, totalToPar, totalPoints }
  },

  formatScore(score: HoleResult): string {
    const pts = score.points ?? 0
    return `${pts} pts`
  },
}
