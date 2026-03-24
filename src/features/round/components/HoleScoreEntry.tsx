import { ActionIcon, Checkbox, Group, NumberInput, Paper, Stack, Text } from '@mantine/core'
import { IconMinus, IconPlus } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import type { HoleScore } from '@/storage/types'
import { clampPutts } from '@/lib/score-formatting'

type HoleScoreEntryProps = {
  playerName: string
  par: number
  handicapStrokes: number
  score: HoleScore | undefined
  netScore: number
  points?: number
  isStableford: boolean
  onScoreChange: (update: Partial<HoleScore>) => void
}

export function HoleScoreEntry({
  playerName,
  par,
  handicapStrokes,
  score,
  netScore,
  points,
  isStableford,
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
    <Paper withBorder p="sm" radius="md">
      <Stack gap="xs">
        <Group justify="space-between">
          <Text fw={600} size="sm">
            {playerName}
          </Text>
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
          <NumberInput
            label={t('round:putts')}
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
            w={70}
            size="xs"
            hideControls
          />
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
    </Paper>
  )
}
