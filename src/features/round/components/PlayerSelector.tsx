import { useState, useEffect, useCallback } from 'react'
import {
  Checkbox,
  Group,
  Select,
  Stack,
  TextInput,
  Button,
  Text,
  Loader,
  Center,
  Paper,
} from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { useStorage } from '@/hooks/useStorage'
import type { Course, Player, Tee } from '@/storage/types'

export type SelectedPlayer = {
  playerId: string
  playerName: string
  teeId: string
  handicapIndex: number
}

type PlayerSelectorProps = {
  course: Course | null
  selectedPlayers: SelectedPlayer[]
  onChange: (players: SelectedPlayer[]) => void
}

export function PlayerSelector({ course, selectedPlayers, onChange }: PlayerSelectorProps) {
  const { t } = useTranslation()
  const storage = useStorage()
  const [savedPlayers, setSavedPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [adHocName, setAdHocName] = useState('')

  const loadPlayers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await storage.getPlayers()
      setSavedPlayers(data)
    } finally {
      setLoading(false)
    }
  }, [storage])

  useEffect(() => {
    void loadPlayers()
  }, [loadPlayers])

  const tees: Tee[] = course?.tees ?? []
  const defaultTeeId = tees.length > 0 ? tees[0].id : ''

  // Use the first selected player's tee as the default for new players
  const currentDefaultTeeId = selectedPlayers.length > 0 ? selectedPlayers[0].teeId : defaultTeeId

  const teeOptions = tees.map((tee) => ({
    value: tee.id,
    label: tee.name,
  }))

  const isSelected = (playerId: string) => selectedPlayers.some((p) => p.playerId === playerId)

  const handleTogglePlayer = (player: Player, checked: boolean) => {
    if (checked) {
      onChange([
        ...selectedPlayers,
        {
          playerId: player.id,
          playerName: player.name,
          teeId: currentDefaultTeeId,
          handicapIndex: player.handicapIndex,
        },
      ])
    } else {
      onChange(selectedPlayers.filter((p) => p.playerId !== player.id))
    }
  }

  const handleTeeChange = (playerId: string, teeId: string) => {
    onChange(selectedPlayers.map((p) => (p.playerId === playerId ? { ...p, teeId } : p)))
  }

  const handleAddAdHoc = () => {
    const trimmed = adHocName.trim()
    if (!trimmed) return

    const adHocId = `adhoc-${Date.now()}`
    onChange([
      ...selectedPlayers,
      {
        playerId: adHocId,
        playerName: trimmed,
        teeId: currentDefaultTeeId,
        handicapIndex: 0,
      },
    ])
    setAdHocName('')
  }

  const handleRemoveAdHoc = (playerId: string) => {
    onChange(selectedPlayers.filter((p) => p.playerId !== playerId))
  }

  if (loading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    )
  }

  const adHocPlayers = selectedPlayers.filter((p) => p.playerId.startsWith('adhoc-'))

  return (
    <Stack gap="md">
      {savedPlayers.length > 0 && (
        <Stack gap="xs">
          {savedPlayers.map((player) => (
            <Paper key={player.id} p="sm" withBorder radius="sm">
              <Group justify="space-between" wrap="nowrap">
                <Checkbox
                  label={player.name}
                  checked={isSelected(player.id)}
                  onChange={(e) => handleTogglePlayer(player, e.currentTarget.checked)}
                />
                {isSelected(player.id) && teeOptions.length > 1 && (
                  <Select
                    size="xs"
                    label={t('round:selectTee')}
                    data={teeOptions}
                    value={
                      selectedPlayers.find((p) => p.playerId === player.id)?.teeId ?? defaultTeeId
                    }
                    onChange={(value) => handleTeeChange(player.id, value ?? defaultTeeId)}
                    w={160}
                  />
                )}
              </Group>
            </Paper>
          ))}
        </Stack>
      )}

      {adHocPlayers.map((player) => (
        <Paper key={player.playerId} p="sm" withBorder radius="sm">
          <Group justify="space-between" wrap="nowrap">
            <Group gap="xs">
              <Text size="sm">{player.playerName}</Text>
              <Button
                variant="subtle"
                color="red"
                size="compact-xs"
                onClick={() => handleRemoveAdHoc(player.playerId)}
              >
                ✕
              </Button>
            </Group>
            {teeOptions.length > 1 && (
              <Select
                size="xs"
                label={t('round:selectTee')}
                data={teeOptions}
                value={player.teeId}
                onChange={(value) => handleTeeChange(player.playerId, value ?? defaultTeeId)}
                w={160}
              />
            )}
          </Group>
        </Paper>
      ))}

      <Group gap="xs" align="flex-end">
        <TextInput
          placeholder={t('round:addPlayer')}
          value={adHocName}
          onChange={(e) => setAdHocName(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAddAdHoc()
          }}
          style={{ flex: 1 }}
        />
        <Button variant="light" onClick={handleAddAdHoc} disabled={!adHocName.trim()}>
          {t('round:addPlayer')}
        </Button>
      </Group>
    </Stack>
  )
}
