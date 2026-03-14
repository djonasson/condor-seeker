import { useCallback, useEffect, useMemo, useState } from 'react'
import { useStorage } from '@/hooks/useStorage'
import type { Course, Round } from '@/storage/types'

export type DateRangeOption = 'last30' | 'last90' | 'all'

export type StatsFilters = {
  dateRange: DateRangeOption
  courseId: string | null
}

export type CourseStats = {
  courseId: string
  courseName: string
  roundsPlayed: number
  scoringAvg: number
  bestRound: number
}

export type HoleAverage = {
  holeNumber: number
  avgScore: number
  par: number
}

export type StatsResult = {
  scoringAvg: number | null
  puttsAvg: number | null
  firPercent: number | null
  girPercent: number | null
  bestRound: number | null
  roundsPlayed: number
  scoringTrend: Array<{ date: string; score: number }>
  courseBreakdown: CourseStats[]
  holeAverages: HoleAverage[]
}

export function useStats() {
  const storage = useStorage()
  const [rounds, setRounds] = useState<Round[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<StatsFilters>({
    dateRange: 'all',
    courseId: null,
  })

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const [r, c] = await Promise.all([storage.getRounds(), storage.getCourses()])
      if (!cancelled) {
        setRounds(r)
        setCourses(c)
        setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [storage])

  const filteredRounds = useMemo(() => {
    let result = rounds

    if (filters.dateRange !== 'all') {
      const now = new Date()
      const days = filters.dateRange === 'last30' ? 30 : 90
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
      result = result.filter((r) => new Date(r.date) >= cutoff)
    }

    if (filters.courseId) {
      result = result.filter((r) => r.courseId === filters.courseId)
    }

    return result
  }, [rounds, filters])

  const stats: StatsResult = useMemo(() => {
    if (filteredRounds.length === 0) {
      return {
        scoringAvg: null,
        puttsAvg: null,
        firPercent: null,
        girPercent: null,
        bestRound: null,
        roundsPlayed: 0,
        scoringTrend: [],
        courseBreakdown: [],
        holeAverages: [],
      }
    }

    const allPlayerRounds = filteredRounds.flatMap((r) => r.playerRounds)
    const allHoleScores = allPlayerRounds.flatMap((pr) => pr.holeScores)

    // Scoring average
    const totalGross = allPlayerRounds.reduce((sum, pr) => sum + pr.totalGross, 0)
    const scoringAvg = totalGross / allPlayerRounds.length

    // Putts average
    const holesWithPutts = allHoleScores.filter((hs) => hs.putts != null)
    let puttsAvg: number | null = null
    if (holesWithPutts.length > 0) {
      const totalPutts = holesWithPutts.reduce((sum, hs) => sum + (hs.putts ?? 0), 0)
      // Average putts per round: total putts / number of player rounds
      const roundsWithPutts = allPlayerRounds.filter((pr) =>
        pr.holeScores.some((hs) => hs.putts != null),
      )
      puttsAvg = roundsWithPutts.length > 0 ? totalPutts / roundsWithPutts.length : null
    }

    // FIR% - fairways hit on non-par-3 holes
    const courseMap = new Map(courses.map((c) => [c.id, c]))
    let fairwaysHit = 0
    let fairwayAttempts = 0
    for (const round of filteredRounds) {
      const course = courseMap.get(round.courseId)
      if (!course) continue
      for (const pr of round.playerRounds) {
        for (const hs of pr.holeScores) {
          if (hs.fairwayHit == null) continue
          const hole = course.holes.find((h) => h.number === hs.holeNumber)
          if (!hole) continue
          const par = hole.parByTee[pr.teeId] ?? 3
          if (par <= 3) continue // skip par 3s
          fairwayAttempts++
          if (hs.fairwayHit) fairwaysHit++
        }
      }
    }
    const firPercent = fairwayAttempts > 0 ? (fairwaysHit / fairwayAttempts) * 100 : null

    // GIR%
    const holesWithGir = allHoleScores.filter((hs) => hs.greenInRegulation != null)
    const girPercent =
      holesWithGir.length > 0
        ? (holesWithGir.filter((hs) => hs.greenInRegulation).length / holesWithGir.length) * 100
        : null

    // Best round
    const bestRound = Math.min(...allPlayerRounds.map((pr) => pr.totalGross))

    // Scoring trend (sorted by date)
    const sorted = [...filteredRounds].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )
    const scoringTrend = sorted.flatMap((r) =>
      r.playerRounds.map((pr) => ({
        date: r.date,
        score: pr.totalGross,
      })),
    )

    // Per-course breakdown
    const byCourse = new Map<string, { grosses: number[]; roundCount: number }>()
    for (const round of filteredRounds) {
      const entry = byCourse.get(round.courseId) ?? {
        grosses: [],
        roundCount: 0,
      }
      entry.roundCount++
      for (const pr of round.playerRounds) {
        entry.grosses.push(pr.totalGross)
      }
      byCourse.set(round.courseId, entry)
    }
    const courseBreakdown: CourseStats[] = []
    for (const [courseId, data] of byCourse) {
      const course = courseMap.get(courseId)
      courseBreakdown.push({
        courseId,
        courseName: course?.name ?? courseId,
        roundsPlayed: data.roundCount,
        scoringAvg: data.grosses.reduce((a, b) => a + b, 0) / data.grosses.length,
        bestRound: Math.min(...data.grosses),
      })
    }

    // Per-hole averages for selected course
    const holeAverages: HoleAverage[] = []
    if (filters.courseId) {
      const course = courseMap.get(filters.courseId)
      if (course) {
        const courseRounds = filteredRounds.filter((r) => r.courseId === filters.courseId)
        for (const hole of course.holes) {
          const scores: number[] = []
          for (const round of courseRounds) {
            for (const pr of round.playerRounds) {
              const hs = pr.holeScores.find((s) => s.holeNumber === hole.number)
              if (hs) scores.push(hs.grossScore)
            }
          }
          const firstTeeId = course.tees[0]?.id ?? ''
          holeAverages.push({
            holeNumber: hole.number,
            avgScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
            par: hole.parByTee[firstTeeId] ?? 3,
          })
        }
      }
    }

    return {
      scoringAvg: Math.round(scoringAvg * 10) / 10,
      puttsAvg: puttsAvg != null ? Math.round(puttsAvg * 10) / 10 : null,
      firPercent: firPercent != null ? Math.round(firPercent * 10) / 10 : null,
      girPercent: girPercent != null ? Math.round(girPercent * 10) / 10 : null,
      bestRound,
      roundsPlayed: filteredRounds.length,
      scoringTrend,
      courseBreakdown,
      holeAverages,
    }
  }, [filteredRounds, courses, filters.courseId])

  const updateFilters = useCallback((partial: Partial<StatsFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }))
  }, [])

  return { stats, loading, filters, setFilters: updateFilters, courses }
}
