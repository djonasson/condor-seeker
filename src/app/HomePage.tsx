import { Stack, Title, Button, Card, Text, Group, SimpleGrid, Skeleton } from '@mantine/core'
import { IconGolf, IconHistory, IconChartBar, IconUsers, IconMap } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { useStorage } from '@/hooks/useStorage'
import { useAppStore } from '@/stores/app-store'
import { formatDate } from '@/lib/date-format'
import type { Round, Course } from '@/storage/types'

export default function HomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const storage = useStorage()
  const dateFormat = useAppStore((s) => s.dateFormat)

  const [recentRound, setRecentRound] = useState<Round | null>(null)
  const [courseName, setCourseName] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadRecent() {
      try {
        const rounds = await storage.getRounds()
        if (cancelled) return

        if (rounds.length > 0) {
          const sorted = [...rounds].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          )
          const latest = sorted[0]
          setRecentRound(latest)

          const course: Course | undefined = await storage.getCourse(latest.courseId)
          if (!cancelled) {
            setCourseName(course?.name ?? t('history:unknownCourse'))
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadRecent()
    return () => {
      cancelled = true
    }
  }, [storage, t])

  return (
    <Stack gap="lg">
      <Title order={2}>{t('appName')}</Title>

      {/* Primary action */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Text fw={500}>{t('round:newRound')}</Text>
          <Button
            fullWidth
            size="md"
            leftSection={<IconGolf size={18} />}
            onClick={() => navigate('/round/new')}
          >
            {t('startRound')}
          </Button>
        </Stack>
      </Card>

      {/* Quick actions */}
      <SimpleGrid cols={2}>
        <Button
          variant="light"
          size="md"
          leftSection={<IconHistory size={18} />}
          onClick={() => navigate('/history')}
        >
          {t('viewHistory')}
        </Button>
        <Button
          variant="light"
          size="md"
          leftSection={<IconChartBar size={18} />}
          onClick={() => navigate('/stats')}
        >
          {t('viewStats')}
        </Button>
      </SimpleGrid>

      {/* Recent round */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="sm">
          <Text fw={500} size="sm" c="dimmed">
            {t('recentRound')}
          </Text>
          {loading ? (
            <Stack gap="xs">
              <Skeleton height={16} width="60%" />
              <Skeleton height={14} width="40%" />
            </Stack>
          ) : recentRound ? (
            <Group justify="space-between" align="center">
              <Stack gap={2}>
                <Text fw={500}>{courseName}</Text>
                <Text size="sm" c="dimmed">
                  {formatDate(recentRound.date, dateFormat)}
                </Text>
              </Stack>
              <Stack gap={2} align="flex-end">
                {recentRound.playerRounds[0] && (
                  <Text fw={700} size="lg">
                    {recentRound.playerRounds[0].totalGross}
                  </Text>
                )}
                <Button
                  variant="subtle"
                  size="compact-xs"
                  onClick={() => navigate(`/history/${recentRound.id}`)}
                >
                  {t('history:viewDetails')}
                </Button>
              </Stack>
            </Group>
          ) : (
            <Text size="sm" c="dimmed">
              {t('noRecentRounds')}
            </Text>
          )}
        </Stack>
      </Card>

      {/* Management links */}
      <SimpleGrid cols={2}>
        <Button
          variant="subtle"
          leftSection={<IconUsers size={18} />}
          onClick={() => navigate('/player')}
        >
          {t('managePlayers')}
        </Button>
        <Button
          variant="subtle"
          leftSection={<IconMap size={18} />}
          onClick={() => navigate('/course')}
        >
          {t('manageCourses')}
        </Button>
      </SimpleGrid>
    </Stack>
  )
}
