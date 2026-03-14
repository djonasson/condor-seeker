import type { HoleResult, RoundTotal, ScoringStrategy } from '../types'

export const strokePlayStrategy: ScoringStrategy = {
  name: 'stroke',

  calculateHoleScore(grossScore: number, par: number, handicapStrokes: number): HoleResult {
    const netScore = grossScore - handicapStrokes
    const scoreToPar = grossScore - par

    return {
      holeNumber: 0,
      grossScore,
      netScore,
      par,
      scoreToPar,
    }
  },

  calculateRoundTotal(holeResults: HoleResult[]): RoundTotal {
    let totalGross = 0
    let totalNet = 0
    let totalToPar = 0

    for (const hole of holeResults) {
      totalGross += hole.grossScore
      totalNet += hole.netScore
      totalToPar += hole.scoreToPar
    }

    return { totalGross, totalNet, totalToPar }
  },

  formatScore(score: HoleResult): string {
    if (score.scoreToPar === 0) {
      return 'E'
    }
    if (score.scoreToPar > 0) {
      return `+${score.scoreToPar}`
    }
    return String(score.scoreToPar)
  },
}
