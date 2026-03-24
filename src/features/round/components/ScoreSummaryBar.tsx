import { Group, Paper, Text } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import type { RoundTotal } from '@/features/round/types'
import { getScoreToParColor, formatScoreToPar } from '@/lib/score-formatting'

type PlayerSummary = {
  playerName: string
  total: RoundTotal
}

type ScoreSummaryBarProps = {
  players: PlayerSummary[]
  isStableford: boolean
}

function toMantineColor(color: ReturnType<typeof getScoreToParColor>): string | undefined {
  if (color === 'red') return 'red'
  if (color === 'blue') return 'blue'
  return undefined
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
              c={toMantineColor(getScoreToParColor(player.total.totalToPar))}
            >
              {formatScoreToPar(player.total.totalToPar)}
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
