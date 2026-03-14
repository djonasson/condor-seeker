import { useCallback, useEffect, useRef, useState } from 'react'
import { useStorage } from '@/hooks/useStorage'
import type { Round } from '@/storage/types'

export type RoundWithCourseName = Round & {
  courseName: string
}

export function useRoundHistory() {
  const storage = useStorage()
  const [rounds, setRounds] = useState<RoundWithCourseName[]>([])
  const [loading, setLoading] = useState(true)
  const didLoad = useRef(false)

  useEffect(() => {
    if (didLoad.current) return
    didLoad.current = true

    async function load() {
      const allRounds = await storage.getRounds()
      const courses = await storage.getCourses()
      const courseMap = new Map(courses.map((c) => [c.id, c.name]))

      const withNames: RoundWithCourseName[] = allRounds
        .map((r) => ({
          ...r,
          courseName: courseMap.get(r.courseId) ?? '',
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      setRounds(withNames)
      setLoading(false)
    }

    void load()
  }, [storage])

  const deleteRound = useCallback(
    async (id: string) => {
      await storage.deleteRound(id)
      setRounds((prev) => prev.filter((r) => r.id !== id))
    },
    [storage],
  )

  return {
    rounds,
    loading,
    deleteRound,
    reload: useCallback(() => {
      didLoad.current = false
    }, []),
  }
}
