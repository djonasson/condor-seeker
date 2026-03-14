import { useState, useCallback, useEffect } from 'react'
import { useStorage } from '@/hooks/useStorage'
import type { Course } from '@/storage/types'

export function useCourses() {
  const storage = useStorage()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  const loadCourses = useCallback(async () => {
    setLoading(true)
    try {
      const data = await storage.getCourses()
      setCourses(data)
    } finally {
      setLoading(false)
    }
  }, [storage])

  const saveCourse = useCallback(
    async (course: Course) => {
      await storage.saveCourse(course)
      await loadCourses()
    },
    [storage, loadCourses],
  )

  const deleteCourse = useCallback(
    async (id: string) => {
      await storage.deleteCourse(id)
      await loadCourses()
    },
    [storage, loadCourses],
  )

  useEffect(() => {
    void loadCourses()
  }, [loadCourses])

  return { courses, loading, loadCourses, saveCourse, deleteCourse }
}
