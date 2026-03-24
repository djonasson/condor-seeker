export type ScoreToParColor = 'red' | 'blue' | 'default'

export function getScoreToParColor(scoreToPar: number): ScoreToParColor {
  if (scoreToPar < 0) return 'red'
  if (scoreToPar > 0) return 'blue'
  return 'default'
}

export function clampPutts(putts: number, grossScore: number): number {
  return Math.min(putts, grossScore)
}

export function formatScoreToPar(scoreToPar: number): string {
  if (scoreToPar === 0) return 'E'
  if (scoreToPar > 0) return `+${scoreToPar}`
  return String(scoreToPar)
}
