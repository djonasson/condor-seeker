import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRoundStore } from '@/stores/round-store'
import { useStorage } from '@/hooks/useStorage'
import { useAppStore } from '@/stores/app-store'
import { displayDistance } from '@/lib/distance'
import { getScoringStrategy } from '@/features/round/scoring'
import { calculateCourseHandicap, allocateStrokes } from '@/lib/handicap'
import type { Course, Hole, Tee } from '@/storage/types'
import type { HoleResult, RoundTotal } from '@/features/round/types'

type HoleInfo = {
  number: number
  par: number
  distance: number
  handicap: number
  handicapStrokes: number
}

type PlayerHoleInfo = {
  playerId: string
  playerName: string
  teeId: string
  holeInfo: HoleInfo
}

type PlayerResult = {
  playerId: string
  playerName: string
  holeResults: HoleResult[]
  total: RoundTotal
}

export function useRound() {
  const navigate = useNavigate()
  const storage = useStorage()
  const distanceUnit = useAppStore((s) => s.distanceUnit)

  const courseId = useRoundStore((s) => s.courseId)
  const courseName = useRoundStore((s) => s.courseName)
  const scoringSystem = useRoundStore((s) => s.scoringSystem)
  const players = useRoundStore((s) => s.players)
  const scores = useRoundStore((s) => s.scores)
  const currentHole = useRoundStore((s) => s.currentHole)
  const totalHoles = useRoundStore((s) => s.totalHoles)
  const isActive = useRoundStore((s) => s.isActive)
  const roundId = useRoundStore((s) => s.roundId)
  const setScoreAction = useRoundStore((s) => s.setScore)
  const nextHoleAction = useRoundStore((s) => s.nextHole)
  const prevHoleAction = useRoundStore((s) => s.prevHole)
  const goToHoleAction = useRoundStore((s) => s.goToHole)
  const completeRoundAction = useRoundStore((s) => s.completeRound)
  const clearRound = useRoundStore((s) => s.clearRound)

  const [courseData, setCourseData] = useState<{
    course: Course | null
    loading: boolean
  }>({ course: null, loading: !!courseId })

  useEffect(() => {
    if (!courseId) return
    let cancelled = false
    void storage.getCourse(courseId).then((c) => {
      if (!cancelled) {
        setCourseData({ course: c ?? null, loading: false })
      }
    })
    return () => {
      cancelled = true
    }
  }, [courseId, storage])

  const course = courseData.course
  const loading = courseData.loading

  const strategy = useMemo(() => getScoringStrategy(scoringSystem), [scoringSystem])

  // We need player handicap indices - load them
  const [playerHandicaps, setPlayerHandicaps] = useState<Record<string, number>>({})

  useEffect(() => {
    if (players.length === 0) return
    let cancelled = false
    void Promise.all(players.map((p) => storage.getPlayer(p.playerId))).then((results) => {
      if (cancelled) return
      const hcaps: Record<string, number> = {}
      for (const player of results) {
        if (player) {
          hcaps[player.id] = player.handicapIndex
        }
      }
      setPlayerHandicaps(hcaps)
    })
    return () => {
      cancelled = true
    }
  }, [players, storage])

  const strokeAllocationsWithHandicap = useMemo(() => {
    if (!course) return {} as Record<string, number[]>

    const sortedHoles = course.holes.slice().sort((a, b) => a.number - b.number)

    const allocations: Record<string, number[]> = {}
    for (const player of players) {
      const tee = course.tees.find((t: Tee) => t.id === player.teeId)
      if (!tee) {
        allocations[player.playerId] = sortedHoles.map(() => 0)
        continue
      }
      const holeHandicaps = sortedHoles.map((h) => h.handicapByTee[player.teeId] ?? 0)
      const totalPar = course.holes.reduce(
        (sum, h: Hole) => sum + (h.parByTee[player.teeId] ?? 0),
        0,
      )
      const handicapIndex = playerHandicaps[player.playerId] ?? 0
      const courseHcap = calculateCourseHandicap(
        handicapIndex,
        tee.slopeRating,
        tee.courseRating,
        totalPar,
      )
      allocations[player.playerId] = allocateStrokes(courseHcap, holeHandicaps)
    }
    return allocations
  }, [course, players, playerHandicaps])

  const currentHoleInfo = useMemo((): PlayerHoleInfo[] => {
    if (!course) return []

    const sortedHoles = course.holes.slice().sort((a, b) => a.number - b.number)
    const hole = sortedHoles[currentHole - 1]
    if (!hole) return []

    return players.map((player) => {
      const alloc = strokeAllocationsWithHandicap[player.playerId] ?? []
      return {
        playerId: player.playerId,
        playerName: player.playerName,
        teeId: player.teeId,
        holeInfo: {
          number: hole.number,
          par: hole.parByTee[player.teeId] ?? 0,
          distance: displayDistance(hole.distanceByTee[player.teeId] ?? 0, distanceUnit),
          handicap: hole.handicapByTee[player.teeId] ?? 0,
          handicapStrokes: alloc[currentHole - 1] ?? 0,
        },
      }
    })
  }, [course, currentHole, players, strokeAllocationsWithHandicap, distanceUnit])

  const playerResults = useMemo((): PlayerResult[] => {
    if (!course) return []

    const sortedHoles = course.holes.slice().sort((a, b) => a.number - b.number)

    return players.map((player) => {
      const playerScores = scores[player.playerId] ?? []
      const alloc = strokeAllocationsWithHandicap[player.playerId] ?? []

      const holeResults: HoleResult[] = []
      for (const score of playerScores) {
        if (score.grossScore <= 0) continue
        const hole = sortedHoles[score.holeNumber - 1]
        if (!hole) continue
        const par = hole.parByTee[player.teeId] ?? 0
        const handicapStrokes = alloc[score.holeNumber - 1] ?? 0
        const result = strategy.calculateHoleScore(score.grossScore, par, handicapStrokes)
        holeResults.push({
          ...result,
          holeNumber: score.holeNumber,
        })
      }

      const total = strategy.calculateRoundTotal(holeResults)

      return {
        playerId: player.playerId,
        playerName: player.playerName,
        holeResults,
        total,
      }
    })
  }, [course, players, scores, strokeAllocationsWithHandicap, strategy])

  const getHoleInfoForAll = useCallback(
    (holeNumber: number): PlayerHoleInfo[] => {
      if (!course) return []

      const sortedHoles = course.holes.slice().sort((a, b) => a.number - b.number)
      const hole = sortedHoles[holeNumber - 1]
      if (!hole) return []

      return players.map((player) => {
        const alloc = strokeAllocationsWithHandicap[player.playerId] ?? []
        return {
          playerId: player.playerId,
          playerName: player.playerName,
          teeId: player.teeId,
          holeInfo: {
            number: hole.number,
            par: hole.parByTee[player.teeId] ?? 0,
            distance: displayDistance(hole.distanceByTee[player.teeId] ?? 0, distanceUnit),
            handicap: hole.handicapByTee[player.teeId] ?? 0,
            handicapStrokes: alloc[holeNumber - 1] ?? 0,
          },
        }
      })
    },
    [course, players, strokeAllocationsWithHandicap, distanceUnit],
  )

  const setScore = useCallback(
    (
      playerId: string,
      holeNumber: number,
      score: {
        grossScore?: number
        putts?: number
        fairwayHit?: boolean
        greenInRegulation?: boolean
      },
    ) => {
      const playerInfo = currentHoleInfo.find((p) => p.playerId === playerId)
      const handicapStrokes = playerInfo?.holeInfo.handicapStrokes ?? 0
      const gross = score.grossScore

      if (gross !== undefined) {
        const netScore = gross - handicapStrokes
        setScoreAction(playerId, holeNumber, {
          ...score,
          grossScore: gross,
          netScore,
        })
      } else {
        setScoreAction(playerId, holeNumber, score)
      }
    },
    [currentHoleInfo, setScoreAction],
  )

  const completeRound = useCallback(async () => {
    if (!course || !roundId) return

    const sortedHoles = course.holes.slice().sort((a, b) => a.number - b.number)

    const playerRounds = players.map((player) => {
      const playerScores = scores[player.playerId] ?? []
      const alloc = strokeAllocationsWithHandicap[player.playerId] ?? []

      const holeScores = playerScores.map((score) => {
        const handicapStrokes = alloc[score.holeNumber - 1] ?? 0
        const netScore = score.grossScore - handicapStrokes
        return {
          ...score,
          netScore,
        }
      })

      const results = playerScores
        .filter((s) => s.grossScore > 0)
        .map((score) => {
          const hole = sortedHoles[score.holeNumber - 1]
          const par = hole?.parByTee[player.teeId] ?? 0
          const handicapStrokes = alloc[score.holeNumber - 1] ?? 0
          return strategy.calculateHoleScore(score.grossScore, par, handicapStrokes)
        })

      const total = strategy.calculateRoundTotal(results)

      return {
        playerId: player.playerId,
        teeId: player.teeId,
        holeScores,
        totalGross: total.totalGross,
        totalNet: total.totalNet,
      }
    })

    const round = {
      id: roundId,
      courseId: course.id,
      date: new Date().toISOString(),
      scoringSystem,
      playerRounds,
    }

    await storage.saveRound(round)
    completeRoundAction()
    clearRound()
    void navigate(`/round/summary/${roundId}`)

    return roundId
  }, [
    course,
    roundId,
    players,
    scores,
    strokeAllocationsWithHandicap,
    strategy,
    scoringSystem,
    storage,
    completeRoundAction,
    clearRound,
    navigate,
  ])

  return {
    // State
    courseId,
    courseName,
    scoringSystem,
    players,
    scores,
    currentHole,
    totalHoles,
    isActive,
    loading,
    course,
    strategy,

    // Computed
    currentHoleInfo,
    playerResults,
    getHoleInfoForAll,

    // Actions
    setScore,
    nextHole: nextHoleAction,
    prevHole: prevHoleAction,
    goToHole: goToHoleAction,
    completeRound,
  }
}
