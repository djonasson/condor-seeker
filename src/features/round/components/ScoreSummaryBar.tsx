import { Group, Paper, Text } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import type { RoundTotal } from '@/features/round/types'

type PlayerSummary = {
  playerName: string
  total: RoundTotal
}

type ScoreSummaryBarProps = {
  players: PlayerSummary[]
  isStableford: boolean
}

function formatToPar(toPar: number): string {
  if (toPar === 0) return 'E'
  if (toPar > 0) return `+${toPar}`
  return String(toPar)
}

export function ScoreSummaryBar({ players, isStableford }: ScoreSummaryBarProps) {
  const { t } = useTranslation()

  return (
    <Paper withBorder p="xs" radius="md">
      <Group justify="space-around" gap="xs" wrap="wrap">
        {players.map((player) => (
          <Group key={player.playerName} gap={6}>
            <Text size="xs" fw={600} truncate>
              {player.playerName}
            </Text>
            <Text size="xs" c="dimmed">
              {t('round:gross')}: {player.total.totalGross}
            </Text>
            <Text size="xs" c="dimmed">
              {t('round:net')}: {player.total.totalNet}
            </Text>
            <Text
              size="xs"
              fw={700}
              c={
                player.total.totalToPar > 0
                  ? 'red'
                  : player.total.totalToPar < 0
                    ? 'green'
                    : undefined
              }
            >
              {formatToPar(player.total.totalToPar)}
            </Text>
            {isStableford && player.total.totalPoints !== undefined && (
              <Text size="xs" fw={700} c="blue">
                {player.total.totalPoints} {t('round:points')}
              </Text>
            )}
          </Group>
        ))}
      </Group>
    </Paper>
  )
}
