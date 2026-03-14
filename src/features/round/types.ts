export type { Round, PlayerRound, HoleScore } from '@/storage/types'

export type HoleResult = {
  holeNumber: number
  grossScore: number
  netScore: number
  par: number
  scoreToPar: number
  points?: number
}

export type RoundTotal = {
  totalGross: number
  totalNet: number
  totalToPar: number
  totalPoints?: number
}

export type ScoringStrategy = {
  name: string
  calculateHoleScore(grossScore: number, par: number, handicapStrokes: number): HoleResult
  calculateRoundTotal(holeResults: HoleResult[]): RoundTotal
  formatScore(score: HoleResult): string
}
