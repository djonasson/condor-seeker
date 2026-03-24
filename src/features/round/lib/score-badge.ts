export type ScoreBadgeShape =
  | 'none'
  | 'circle'
  | 'double-circle'
  | 'filled-circle'
  | 'rectangle'
  | 'double-rectangle'
  | 'filled-rectangle'
  | 'star'
export type ScoreBadgeColor = 'red' | 'blue' | 'grey' | 'yellow'

export type ScoreBadgeVariant = {
  shape: ScoreBadgeShape
  color: ScoreBadgeColor
}

export function getScoreBadgeVariant(grossScore: number, par: number): ScoreBadgeVariant {
  if (grossScore === 1) return { shape: 'star', color: 'yellow' }

  const diff = grossScore - par

  if (diff <= -3) return { shape: 'filled-circle', color: 'red' }
  if (diff === -2) return { shape: 'double-circle', color: 'red' }
  if (diff === -1) return { shape: 'circle', color: 'red' }
  if (diff === 0) return { shape: 'none', color: 'grey' }
  if (diff === 1) return { shape: 'rectangle', color: 'blue' }
  if (diff === 2) return { shape: 'double-rectangle', color: 'blue' }
  return { shape: 'filled-rectangle', color: 'blue' }
}
