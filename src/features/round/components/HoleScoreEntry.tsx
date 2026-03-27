import { Group, Stack, Text } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import type { HoleScore } from '@/storage/types'
import { clampPutts, formatScoreToPar, getScoreToParColor } from '@/lib/score-formatting'
import { getVisibleStats } from '@/lib/stat-catalog'
import { useAppStore } from '@/stores/app-store'
import { SectionCard } from '@/components/SectionCard'
import { StatInput } from './StatInput'
import { NumberScrollPicker } from './NumberScrollPicker'

type HoleScoreEntryProps = {
  playerName: string
  teeName: string
  handicapIndex: number
  courseHandicap: number
  par: number
  distance?: number
  distanceUnitLabel: string
  handicap?: number
  handicapStrokes: number
  score: HoleScore | undefined
  netScore: number
  points?: number
  isStableford: boolean
  totalGross: number
  totalNet: number
  totalToPar: number
  totalPoints?: number
  onScoreChange: (update: Partial<HoleScore>) => void
}

function toMantineColor(color: ReturnType<typeof getScoreToParColor>): string | undefined {
  if (color === 'red') return 'red'
  if (color === 'blue') return 'blue'
  return undefined
}

export function HoleScoreEntry({
  playerName,
  teeName,
  handicapIndex,
  courseHandicap,
  par,
  distance,
  distanceUnitLabel,
  handicap,
  handicapStrokes,
  score,
  netScore,
  points,
  isStableford,
  totalGross,
  totalNet,
  totalToPar,
  totalPoints,
  onScoreChange,
}: HoleScoreEntryProps) {
  const { t } = useTranslation()
  const enabledStats = useAppStore((s) => s.enabledStats)
  const gross = score?.grossScore ?? 0

  const visibleStats = getVisibleStats(enabledStats, par, score ?? {})

  const handleGrossChange = (newGross: number) => {
    const update: Partial<HoleScore> = { grossScore: newGross }
    if (score?.putts !== undefined && score.putts > newGross) {
      update.putts = clampPutts(score.putts, newGross)
    }
    if (score?.penaltyStrokes !== undefined && score.penaltyStrokes >= newGross) {
      update.penaltyStrokes = Math.max(0, newGross - 1)
    }
    onScoreChange(update)
  }

  return (
    <SectionCard
      header={
        <Group justify="space-between">
          <Group gap={6}>
            <Text fw={600} size="sm" inherit>
              {playerName}
            </Text>
            {teeName && (
              <Text size="xs" opacity={0.8}>
                ({teeName})
              </Text>
            )}
          </Group>
          <Group gap="xs">
            <Text size="xs" opacity={0.8}>
              {t('round:handicapIndex')}: {handicapIndex.toFixed(1)}
            </Text>
            <Text size="xs" opacity={0.8}>
              {t('round:courseHandicap')}: {courseHandicap}
            </Text>
          </Group>
        </Group>
      }
      footer={
        <Group justify="center" gap="md">
          <Text size="xs" c="dimmed">
            {t('round:gross')}: {totalGross}
          </Text>
          <Text size="xs" c="dimmed">
            {t('round:net')}: {totalNet}
          </Text>
          <Text size="xs" fw={700} c={toMantineColor(getScoreToParColor(totalToPar))}>
            {formatScoreToPar(totalToPar)}
          </Text>
          {isStableford && totalPoints !== undefined && (
            <Text size="xs" fw={700} c="blue">
              {totalPoints} {t('round:points')}
            </Text>
          )}
        </Group>
      }
    >
      <Group justify="center" gap="lg">
        <Text size="xs" c="dimmed">
          {t('round:par')}: {par}
        </Text>
        {distance !== undefined && (
          <Text size="xs" c="dimmed">
            {t('round:distance')}: {distance} {distanceUnitLabel}
          </Text>
        )}
        {handicap !== undefined && (
          <Text size="xs" c="dimmed">
            {t('round:hcp')}: {handicap}
          </Text>
        )}
        {handicapStrokes > 0 && (
          <Text size="xs" c="dimmed">
            {t('round:strokes')}: {handicapStrokes}
          </Text>
        )}
      </Group>

      <Group justify="space-between" align="center">
        <Text size="xs" fw={500}>
          {t('round:gross')}
        </Text>
        <NumberScrollPicker
          value={gross || 1}
          min={1}
          max={20}
          onChange={handleGrossChange}
          size="sm"
        />
      </Group>

      <Group justify="center" gap="lg">
        <Text size="sm">
          {t('round:net')}: {gross > 0 ? netScore : '-'}
        </Text>
        {isStableford && (
          <Text size="sm">
            {t('round:points')}: {gross > 0 ? (points ?? 0) : '-'}
          </Text>
        )}
      </Group>

      {visibleStats.length > 0 && (
        <Stack gap="xs">
          {visibleStats.map((stat) => (
            <StatInput
              key={stat.id}
              stat={stat}
              value={score?.[stat.id]}
              score={score ?? {}}
              onChange={onScoreChange}
            />
          ))}
        </Stack>
      )}
    </SectionCard>
  )
}
