import {
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
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCourses } from '../hooks/useCourses'

export default function CourseListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { courses, loading, deleteCourse } = useCourses()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleDelete = async () => {
    if (deleteId) {
      await deleteCourse(deleteId)
      setDeleteId(null)
    }
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

      <Group grow>
        <Button color="green" onClick={() => navigate('/course/new')}>
          {t('course:addCourse')}
        </Button>
        <Button variant="light" onClick={() => navigate('/course/import')}>
          {t('course:importCourse')}
        </Button>
      </Group>

      {courses.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">
          {t('course:noCourses')}
        </Text>
      ) : (
        courses.map((course) => (
          <Card key={course.id} shadow="sm" padding="md" radius="md" withBorder>
            <Group justify="space-between" align="flex-start">
              <Stack gap={4}>
                <Text fw={600}>{course.name}</Text>
                <Text size="sm" c="dimmed">
                  {course.holes.length} {t('course:hole')}s
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
        ))
      )}

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
