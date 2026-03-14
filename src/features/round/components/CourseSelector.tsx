import { useState, useEffect, useCallback } from 'react'
import { Card, Group, Text, Stack, Badge, Loader, Center } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { useStorage } from '@/hooks/useStorage'
import type { Course } from '@/storage/types'

type CourseSelectorProps = {
  selectedCourseId: string
  onSelect: (course: Course) => void
}

export function CourseSelector({ selectedCourseId, onSelect }: CourseSelectorProps) {
  const { t } = useTranslation()
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

  useEffect(() => {
    void loadCourses()
  }, [loadCourses])

  if (loading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    )
  }

  if (courses.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        {t('course:noCourses', 'No courses available. Add a course first.')}
      </Text>
    )
  }

  return (
    <Stack gap="sm">
      {courses.map((course) => (
        <Card
          key={course.id}
          shadow="sm"
          padding="md"
          radius="md"
          withBorder
          style={{
            cursor: 'pointer',
            borderColor: selectedCourseId === course.id ? 'var(--mantine-color-blue-6)' : undefined,
            borderWidth: selectedCourseId === course.id ? 2 : undefined,
          }}
          onClick={() => onSelect(course)}
        >
          <Group justify="space-between" align="flex-start">
            <div>
              <Text fw={600}>{course.name}</Text>
              <Text size="sm" c="dimmed">
                {course.holes.length} {t('round:hole', 'holes')}
              </Text>
            </div>
            <Group gap="xs">
              {course.tees.map((tee) => (
                <Badge key={tee.id} variant="light" size="sm">
                  {tee.name}
                </Badge>
              ))}
            </Group>
          </Group>
        </Card>
      ))}
    </Stack>
  )
}
