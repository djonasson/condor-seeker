import {
  ActionIcon,
  Stack,
  Title,
  Button,
  Card,
  Text,
  Group,
  Badge,
  Loader,
  Center,
  Modal,
} from '@mantine/core'
import { IconStar, IconStarFilled } from '@tabler/icons-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCourses } from '../hooks/useCourses'
import type { Course } from '@/storage/types'

function getCoursePar(course: Course): number {
  if (course.tees.length === 0 || course.holes.length === 0) return 0
  const teeId = course.tees[0].id
  return course.holes.reduce((sum, h) => sum + (h.parByTee[teeId] ?? 0), 0)
}

export default function CourseListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { courses, loading, deleteCourse, saveCourse } = useCourses()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleDelete = async () => {
    if (deleteId) {
      await deleteCourse(deleteId)
      setDeleteId(null)
    }
  }

  const toggleStar = async (course: Course) => {
    await saveCourse({ ...course, starred: !course.starred })
  }

  if (loading) {
    return (
      <Center h="50vh">
        <Loader color="green" />
      </Center>
    )
  }

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Title order={2}>{t('course:title')}</Title>
      </Group>

      {courses.length === 0 && (
        <Text c="dimmed" ta="center" py="xl">
          {t('course:noCourses')}
        </Text>
      )}

      <Group grow>
        <Button color="green" onClick={() => navigate('/course/new')}>
          {t('course:addCourse')}
        </Button>
        <Button variant="light" onClick={() => navigate('/course/import')}>
          {t('course:importCourse')}
        </Button>
      </Group>

      {courses.length > 0 &&
        courses.map((course) => (
          <Card key={course.id} shadow="sm" padding="md" radius="md" withBorder>
            <Group justify="space-between" align="flex-start">
              <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                {course.clubName && course.clubName !== course.name && (
                  <Text size="xs" c="dimmed">
                    {course.clubName}
                  </Text>
                )}
                <Text fw={600}>{course.name}</Text>
                <Text size="sm" c="dimmed">
                  {course.holes.length} {t('course:hole')}s &middot; {t('course:par')}{' '}
                  {getCoursePar(course)}
                </Text>
                <Group gap={4}>
                  {course.tees.map((tee) => (
                    <Badge key={tee.id} size="sm" variant="light">
                      {tee.name}
                    </Badge>
                  ))}
                </Group>
              </Stack>
              <Group gap="xs">
                <ActionIcon
                  variant="subtle"
                  color={course.starred ? 'yellow' : 'gray'}
                  onClick={() => void toggleStar(course)}
                  aria-label={
                    course.starred ? t('course:unstar', 'Unstar') : t('course:star', 'Star')
                  }
                >
                  {course.starred ? <IconStarFilled size={18} /> : <IconStar size={18} />}
                </ActionIcon>
                <Button
                  size="xs"
                  variant="light"
                  onClick={() => navigate(`/course/${course.id}/edit`)}
                >
                  {t('edit')}
                </Button>
                <Button
                  size="xs"
                  variant="light"
                  color="red"
                  onClick={() => setDeleteId(course.id)}
                >
                  {t('delete')}
                </Button>
              </Group>
            </Group>
          </Card>
        ))}

      <Modal
        opened={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title={t('delete')}
        centered
      >
        <Stack>
          <Text>{t('course:deleteConfirm')}</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeleteId(null)}>
              {t('cancel')}
            </Button>
            <Button color="red" onClick={() => void handleDelete()}>
              {t('delete')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
}
