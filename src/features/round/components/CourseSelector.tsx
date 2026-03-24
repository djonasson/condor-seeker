import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  ActionIcon,
  Button,
  Card,
  Group,
  Text,
  Stack,
  Badge,
  Loader,
  Center,
  TextInput,
  Pagination,
} from '@mantine/core'
import { IconPlus, IconFileImport, IconStar, IconStarFilled, IconSearch } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useStorage } from '@/hooks/useStorage'
import type { Course } from '@/storage/types'

const PAGE_SIZE = 10

type CourseSelectorProps = {
  selectedCourseId: string
  onSelect: (course: Course) => void
}

function sortCoursesStarredFirst(courses: Course[]): Course[] {
  return [...courses].sort((a, b) => {
    if (a.starred && !b.starred) return -1
    if (!a.starred && b.starred) return 1
    return a.name.localeCompare(b.name)
  })
}

export function CourseSelector({ selectedCourseId, onSelect }: CourseSelectorProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const storage = useStorage()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

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

  const toggleStar = useCallback(
    async (e: React.MouseEvent, course: Course) => {
      e.stopPropagation()
      const updated = { ...course, starred: !course.starred }
      await storage.saveCourse(updated)
      setCourses((prev) => prev.map((c) => (c.id === course.id ? updated : c)))
    },
    [storage],
  )

  const filtered = useMemo(() => {
    let result = courses
    if (searchQuery.trim()) {
      const lower = searchQuery.toLowerCase()
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(lower) ||
          (c.clubName && c.clubName.toLowerCase().includes(lower)),
      )
    }
    return sortCoursesStarredFirst(result)
  }, [courses, searchQuery])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  if (loading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    )
  }

  if (courses.length === 0) {
    return (
      <Stack align="center" gap="md" py="xl">
        <Text c="dimmed">{t('course:noCourses')}</Text>
        <Group>
          <Button
            variant="light"
            leftSection={<IconPlus size={16} />}
            onClick={() => navigate('/course/new')}
          >
            {t('course:addCourse')}
          </Button>
          <Button
            variant="light"
            leftSection={<IconFileImport size={16} />}
            onClick={() => navigate('/course/import')}
          >
            {t('course:importCourse')}
          </Button>
        </Group>
      </Stack>
    )
  }

  return (
    <Stack gap="sm">
      <TextInput
        placeholder={t('course:searchPlaceholder')}
        leftSection={<IconSearch size={16} />}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.currentTarget.value)}
      />

      {filtered.length === 0 && (
        <Text c="dimmed" ta="center" py="md">
          {t('course:noResults')}
        </Text>
      )}

      {paginated.map((course) => (
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
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <div style={{ flex: 1, minWidth: 0 }}>
              {course.clubName && course.clubName !== course.name && (
                <Text size="xs" c="dimmed">
                  {course.clubName}
                </Text>
              )}
              <Text fw={600}>{course.name}</Text>
              <Text size="sm" c="dimmed">
                {course.holes.length} {t('round:hole', 'holes')}
                {course.tees[0] &&
                  (() => {
                    const teeId = course.tees[0].id
                    const par = course.holes.reduce((sum, h) => sum + (h.parByTee[teeId] ?? 0), 0)
                    return (
                      <>
                        {' '}
                        &middot; {t('course:par')} {par}
                      </>
                    )
                  })()}
              </Text>
              <Group gap={4} mt={4}>
                {course.tees.map((tee) => (
                  <Badge key={tee.id} variant="light" size="sm">
                    {tee.name}
                  </Badge>
                ))}
              </Group>
            </div>
            <ActionIcon
              variant="subtle"
              color={course.starred ? 'yellow' : 'gray'}
              onClick={(e) => void toggleStar(e, course)}
              aria-label={course.starred ? t('course:unstar', 'Unstar') : t('course:star', 'Star')}
            >
              {course.starred ? <IconStarFilled size={18} /> : <IconStar size={18} />}
            </ActionIcon>
          </Group>
        </Card>
      ))}

      {totalPages > 1 && (
        <Center>
          <Pagination total={totalPages} value={currentPage} onChange={setCurrentPage} size="sm" />
        </Center>
      )}

      <Group>
        <Button
          variant="subtle"
          size="xs"
          leftSection={<IconPlus size={14} />}
          onClick={() => navigate('/course/new')}
        >
          {t('course:addCourse')}
        </Button>
        <Button
          variant="subtle"
          size="xs"
          leftSection={<IconFileImport size={14} />}
          onClick={() => navigate('/course/import')}
        >
          {t('course:importCourse')}
        </Button>
      </Group>
    </Stack>
  )
}
