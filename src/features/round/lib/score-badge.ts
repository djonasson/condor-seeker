export type ScoreBadgeShape =
  | 'none'
  | 'circle'
  | 'double-circle'
  | 'framed-filled-circle'
  | 'rectangle'
  | 'double-rectangle'
  | 'framed-filled-rectangle'
  | 'star'

export type ScoreBadgeVariant = {
  shape: ScoreBadgeShape
}

export function getScoreBadgeVariant(grossScore: number, par: number): ScoreBadgeVariant {
  if (grossScore === 1) return { shape: 'star' }

  const diff = grossScore - par

  if (diff <= -3) return { shape: 'framed-filled-circle' }
  if (diff === -2) return { shape: 'double-circle' }
  if (diff === -1) return { shape: 'circle' }
  if (diff === 0) return { shape: 'none' }
  if (diff === 1) return { shape: 'rectangle' }
  if (diff === 2) return { shape: 'double-rectangle' }
  return { shape: 'framed-filled-rectangle' }
}
