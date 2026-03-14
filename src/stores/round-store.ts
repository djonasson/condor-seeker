import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { HoleScore } from '@/storage/types'

type RoundPlayer = {
  playerId: string
  playerName: string
  teeId: string
}

type RoundState = {
  courseId: string | null
  courseName: string
  scoringSystem: 'stroke' | 'stableford'
  players: RoundPlayer[]
  scores: Record<string, HoleScore[]>
  currentHole: number
  totalHoles: number
  isActive: boolean
  roundId: string | null
  initRound: (params: {
    courseId: string
    courseName: string
    scoringSystem: 'stroke' | 'stableford'
    players: RoundPlayer[]
    totalHoles: number
  }) => void
  setScore: (playerId: string, holeNumber: number, score: Partial<HoleScore>) => void
  nextHole: () => void
  prevHole: () => void
  goToHole: (n: number) => void
  completeRound: () => void
  clearRound: () => void
}

const initialState = {
  courseId: null as string | null,
  courseName: '',
  scoringSystem: 'stroke' as const,
  players: [] as RoundPlayer[],
  scores: {} as Record<string, HoleScore[]>,
  currentHole: 1,
  totalHoles: 18,
  isActive: false,
  roundId: null as string | null,
}

export const useRoundStore = create<RoundState>()((set) => ({
  ...initialState,
  initRound: (params) => {
    const scores: Record<string, HoleScore[]> = {}
    for (const player of params.players) {
      scores[player.playerId] = []
    }
    set({
      courseId: params.courseId,
      courseName: params.courseName,
      scoringSystem: params.scoringSystem,
      players: params.players,
      scores,
      currentHole: 1,
      totalHoles: params.totalHoles,
      isActive: true,
      roundId: uuidv4(),
    })
  },
  setScore: (playerId, holeNumber, score) =>
    set((state) => {
      const playerScores = [...(state.scores[playerId] ?? [])]
      const existingIndex = playerScores.findIndex((s) => s.holeNumber === holeNumber)
      if (existingIndex >= 0) {
        playerScores[existingIndex] = {
          ...playerScores[existingIndex],
          ...score,
        }
      } else {
        playerScores.push({
          holeNumber,
          grossScore: 0,
          netScore: 0,
          ...score,
        })
      }
      return {
        scores: {
          ...state.scores,
          [playerId]: playerScores,
        },
      }
    }),
  nextHole: () =>
    set((state) => ({
      currentHole: Math.min(state.currentHole + 1, state.totalHoles),
    })),
  prevHole: () =>
    set((state) => ({
      currentHole: Math.max(state.currentHole - 1, 1),
    })),
  goToHole: (n) =>
    set((state) => ({
      currentHole: Math.max(1, Math.min(n, state.totalHoles)),
    })),
  completeRound: () => set({ isActive: false }),
  clearRound: () => set({ ...initialState }),
}))
