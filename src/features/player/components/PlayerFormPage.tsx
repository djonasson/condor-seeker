import {
  Button,
  Center,
  Group,
  Loader,
  NumberInput,
  Paper,
  Select,
  Stack,
  TextInput,
  Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { useStorage } from '@/hooks/useStorage'
import type { Club, Player } from '@/storage/types'
import { ClubForm } from './ClubForm'
import { ClubList } from './ClubList'
import { usePlayerForm } from '../hooks/usePlayerForm'

export default function PlayerFormPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const storage = useStorage()
  const [loading, setLoading] = useState(!!id)
  const [clubs, setClubs] = useState<Club[]>([])
  const [editingClub, setEditingClub] = useState<Club | undefined>(undefined)
  const [clubModalOpened, { open: openClubModal, close: closeClubModal }] = useDisclosure(false)
  const form = usePlayerForm()

  const isEdit = !!id

  const loadPlayer = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const player = await storage.getPlayer(id)
      if (player) {
        form.setValues({
          name: player.name,
          handicapIndex: player.handicapIndex,
          gender: player.gender,
        })
        setClubs(player.clubs)
      }
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, storage])

  useEffect(() => {
    void loadPlayer()
  }, [loadPlayer])

  const handleSave = async (values: { name: string; handicapIndex: number; gender: string }) => {
    const player: Player = {
      id: id ?? uuidv4(),
      name: values.name,
      handicapIndex: values.handicapIndex,
      gender: values.gender,
      clubs,
    }
    await storage.savePlayer(player)
    navigate('/player')
  }

  const handleClubSave = (club: Club) => {
    setClubs((prev) => {
      const existing = prev.findIndex((c) => c.id === club.id)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = club
        return updated
      }
      return [...prev, club]
    })
    setEditingClub(undefined)
  }

  const handleClubEdit = (club: Club) => {
    setEditingClub(club)
    openClubModal()
  }

  const handleClubDelete = (clubId: string) => {
    setClubs((prev) => prev.filter((c) => c.id !== clubId))
  }

  const handleAddClub = () => {
    setEditingClub(undefined)
    openClubModal()
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
      <Title order={2}>{isEdit ? t('player:editPlayer') : t('player:addPlayer')}</Title>

      <Paper withBorder radius="sm" p="md">
        <form onSubmit={form.onSubmit((values) => void handleSave(values))}>
          <Stack>
            <TextInput
              label={t('player:name')}
              placeholder={t('player:namePlaceholder')}
              withAsterisk
              {...form.getInputProps('name')}
            />
            <NumberInput
              label={t('player:handicap')}
              min={0}
              max={54}
              decimalScale={1}
              {...form.getInputProps('handicapIndex')}
            />
            <Select
              label={t('player:gender')}
              data={[
                { value: 'male', label: t('player:male') },
                { value: 'female', label: t('player:female') },
                { value: 'other', label: t('player:other') },
              ]}
              {...form.getInputProps('gender')}
            />

            <Group justify="space-between" mt="md">
              <Title order={4}>{t('player:clubs')}</Title>
              <Button variant="light" size="xs" onClick={handleAddClub}>
                {t('player:addClub')}
              </Button>
            </Group>

            <ClubList clubs={clubs} onEdit={handleClubEdit} onDelete={handleClubDelete} />

            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={() => navigate('/player')}>
                {t('common:cancel', 'Cancel')}
              </Button>
              <Button type="submit">{t('common:save', 'Save')}</Button>
            </Group>
          </Stack>
        </form>
      </Paper>

      <ClubForm
        opened={clubModalOpened}
        onClose={closeClubModal}
        onSave={handleClubSave}
        initialValues={editingClub}
      />
    </Stack>
  )
}
