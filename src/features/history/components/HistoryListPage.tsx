import { useState } from 'react'
import {
  ActionIcon,
  Button,
  Card,
  Center,
  Group,
  Loader,
  Modal,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { IconTrash } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useRoundHistory } from '@/features/history/hooks/useRoundHistory'
import { useAppStore } from '@/stores/app-store'
import { formatDate } from '@/lib/date-format'

export default function HistoryListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { rounds, loading, deleteRound } = useRoundHistory()
  const dateFormat = useAppStore((s) => s.dateFormat)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleDelete = async () => {
    if (deleteId) {
      await deleteRound(deleteId)
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
      <Title order={2}>{t('history:title')}</Title>

      {rounds.length === 0 ? (
        <Text c="dimmed">{t('history:noRounds')}</Text>
      ) : (
        rounds.map((round) => (
          <Card
            key={round.id}
            shadow="sm"
            padding="md"
            radius="md"
            withBorder
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/history/${round.id}`)}
          >
            <Group justify="space-between" wrap="nowrap">
              <Stack gap={4}>
                <Text fw={500}>{round.courseName || t('history:unknownCourse')}</Text>
                <Text size="sm" c="dimmed">
                  {formatDate(round.date, dateFormat)}
                </Text>
                <Group gap="md">
                  {round.playerRounds.map((pr) => (
                    <Text key={pr.playerId} size="sm">
                      {t('round:gross')}: {pr.totalGross} / {t('round:net')}: {pr.totalNet}
                    </Text>
                  ))}
                </Group>
              </Stack>
              <ActionIcon
                color="red"
                variant="subtle"
                onClick={(e) => {
                  e.stopPropagation()
                  setDeleteId(round.id)
                }}
                aria-label={t('history:deleteRound')}
              >
                <IconTrash size={18} />
              </ActionIcon>
            </Group>
          </Card>
        ))
      )}

      <Modal
        opened={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title={t('history:deleteConfirmTitle')}
        centered
      >
        <Stack gap="md">
          <Text>{t('history:deleteConfirm')}</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeleteId(null)}>
              {t('common:cancel')}
            </Button>
            <Button color="red" onClick={() => void handleDelete()}>
              {t('common:delete')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
}
