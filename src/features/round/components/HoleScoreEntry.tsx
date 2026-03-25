import { ActionIcon, Box, Checkbox, Group, NumberInput, Paper, Stack, Text } from '@mantine/core'
import { IconMinus, IconPlus } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import type { HoleScore } from '@/storage/types'
import { clampPutts, formatScoreToPar, getScoreToParColor } from '@/lib/score-formatting'

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
  const gross = score?.grossScore ?? 0

  const handleGrossChange = (delta: number) => {
    const newGross = Math.max(1, gross + delta)
    const update: Partial<HoleScore> = { grossScore: newGross }
    if (score?.putts !== undefined && score.putts > newGross) {
      update.putts = clampPutts(score.putts, newGross)
    }
    onScoreChange(update)
  }

  const handleGrossInput = (val: string | number) => {
    const num = typeof val === 'string' ? parseInt(val, 10) : val
    if (!isNaN(num) && num >= 1) {
      const update: Partial<HoleScore> = { grossScore: num }
      if (score?.putts !== undefined && score.putts > num) {
        update.putts = clampPutts(score.putts, num)
      }
      onScoreChange(update)
    }
  }

  return (
    <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <Box bg="var(--mantine-color-gray-light)" px="sm" py="xs">
        <Group justify="space-between">
          <Group gap={6}>
            <Text fw={600} size="sm">
              {playerName}
            </Text>
            {teeName && (
              <Text size="xs" c="dimmed">
                ({teeName})
              </Text>
            )}
          </Group>
          <Group gap="xs">
            <Text size="xs" c="dimmed">
              {t('round:handicapIndex')}: {handicapIndex.toFixed(1)}
            </Text>
            <Text size="xs" c="dimmed">
              {t('round:courseHandicap')}: {courseHandicap}
            </Text>
          </Group>
        </Group>
      </Box>

      {/* Body */}
      <Stack gap="xs" px="sm" py="xs">
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

        <Group justify="center" align="center" gap="xs">
          <Text size="sm" c="dimmed">
            {t('round:gross')}
          </Text>
          <ActionIcon
            variant="default"
            size="md"
            onClick={() => handleGrossChange(-1)}
            disabled={gross <= 1}
            aria-label="Decrease score"
          >
            <IconMinus size={16} />
          </ActionIcon>
          <NumberInput
            value={gross || ''}
            onChange={handleGrossInput}
            min={1}
            max={20}
            w={60}
            size="sm"
            styles={{ input: { textAlign: 'center' } }}
            hideControls
          />
          <ActionIcon
            variant="default"
            size="md"
            onClick={() => handleGrossChange(1)}
            aria-label="Increase score"
          >
            <IconPlus size={16} />
          </ActionIcon>
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

        <Group justify="space-between" gap="xs">
          <Group gap="xs" align="flex-end">
            <Text size="xs" fw={500} mb={4}>
              {t('round:putts')}
            </Text>
            <ActionIcon
              variant="default"
              size="sm"
              onClick={() => {
                const currentPutts = score?.putts ?? 0
                if (currentPutts > 0) {
                  onScoreChange({ putts: currentPutts - 1 })
                }
              }}
              disabled={(score?.putts ?? 0) <= 0}
              aria-label={t('round:decreasePutts')}
            >
              <IconMinus size={14} />
            </ActionIcon>
            <NumberInput
              value={score?.putts ?? ''}
              onChange={(val) => {
                const num = typeof val === 'string' ? parseInt(val, 10) : val
                if (isNaN(num)) {
                  onScoreChange({ putts: undefined })
                } else {
                  onScoreChange({ putts: gross > 0 ? clampPutts(num, gross) : num })
                }
              }}
              min={0}
              max={gross > 0 ? gross : 10}
              w={50}
              size="xs"
              hideControls
              styles={{ input: { textAlign: 'center' } }}
            />
            <ActionIcon
              variant="default"
              size="sm"
              onClick={() => {
                const currentPutts = score?.putts ?? 0
                const newPutts = currentPutts + 1
                onScoreChange({ putts: gross > 0 ? clampPutts(newPutts, gross) : newPutts })
              }}
              disabled={gross > 0 && (score?.putts ?? 0) >= gross}
              aria-label={t('round:increasePutts')}
            >
              <IconPlus size={14} />
            </ActionIcon>
          </Group>
          {par > 3 && (
            <Checkbox
              label={t('round:fir')}
              checked={score?.fairwayHit ?? false}
              onChange={(e) =>
                onScoreChange({
                  fairwayHit: e.currentTarget.checked,
                })
              }
              size="xs"
            />
          )}
          <Checkbox
            label={t('round:gir')}
            checked={score?.greenInRegulation ?? false}
            onChange={(e) =>
              onScoreChange({
                greenInRegulation: e.currentTarget.checked,
              })
            }
            size="xs"
          />
        </Group>
      </Stack>

      {/* Footer */}
      <Box bg="var(--mantine-color-gray-light)" px="sm" py="xs">
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
      </Box>
    </Paper>
  )
}
