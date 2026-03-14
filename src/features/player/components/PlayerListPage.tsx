import {
  ActionIcon,
  Badge,
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
import { useDisclosure } from '@mantine/hooks'
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { usePlayers } from '../hooks/usePlayers'

export default function PlayerListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { players, loading, deletePlayer } = usePlayers()
  const [confirmOpened, { open: openConfirm, close: closeConfirm }] = useDisclosure(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleDeleteClick = (id: string) => {
    setDeleteId(id)
    openConfirm()
  }

  const handleConfirmDelete = async () => {
    if (deleteId) {
      await deletePlayer(deleteId)
      setDeleteId(null)
      closeConfirm()
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
    <Stack>
      <Group justify="space-between">
        <Title order={2}>{t('player:title')}</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={() => navigate('/player/new')}>
          {t('player:addPlayer')}
        </Button>
      </Group>

      {players.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">
          {t('player:noPlayers')}
        </Text>
      ) : (
        players.map((player) => (
          <Card key={player.id} withBorder shadow="sm" padding="md">
            <Group justify="space-between">
              <div>
                <Text fw={600}>{player.name}</Text>
                <Group gap="xs" mt={4}>
                  <Badge variant="light" size="sm">
                    {t('player:handicap')}: {player.handicapIndex}
                  </Badge>
                  <Badge variant="light" size="sm" color="gray">
                    {t('player:clubs')}: {player.clubs.length}
                  </Badge>
                </Group>
              </div>
              <Group gap="xs">
                <ActionIcon
                  variant="subtle"
                  onClick={() => navigate(`/player/${player.id}/edit`)}
                  aria-label="Edit player"
                >
                  <IconEdit size={18} />
                </ActionIcon>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={() => handleDeleteClick(player.id)}
                  aria-label="Delete player"
                >
                  <IconTrash size={18} />
                </ActionIcon>
              </Group>
            </Group>
          </Card>
        ))
      )}

      <Modal
        opened={confirmOpened}
        onClose={closeConfirm}
        title={t('common:confirm', 'Confirm')}
        size="sm"
      >
        <Text>{t('player:deleteConfirm')}</Text>
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={closeConfirm}>
            {t('common:cancel', 'Cancel')}
          </Button>
          <Button color="red" onClick={() => void handleConfirmDelete()}>
            {t('common:delete', 'Delete')}
          </Button>
        </Group>
      </Modal>
    </Stack>
  )
}
