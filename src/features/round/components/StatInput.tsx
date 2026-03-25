import { ActionIcon, Group, NumberInput, SegmentedControl, Text } from '@mantine/core'
import { IconMinus, IconPlus } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import type { StatDefinition } from '@/lib/stat-catalog'
import type { HoleScore } from '@/storage/types'
import { clampPutts } from '@/lib/score-formatting'

type StatInputProps = {
  stat: StatDefinition
  value: unknown
  score: Partial<HoleScore>
  onChange: (update: Partial<HoleScore>) => void
}

export function StatInput({ stat, value, score, onChange }: StatInputProps) {
  const { t } = useTranslation('round')

  if (stat.inputType === 'boolean') {
    return (
      <Group justify="space-between" align="center">
        <Text size="xs" fw={500}>
          {t(stat.id)}
        </Text>
        <SegmentedControl
          size="sm"
          radius="sm"
          fullWidth={true}
          transitionDuration={500}
          transitionTimingFunction="linear"
          color="var(--mantine-primary-color-filled)"
          value={value === true ? 'yes' : value === false ? 'no' : ''}
          onChange={(val) => onChange({ [stat.id]: val === 'yes' })}
          data={[
            { label: t('yes'), value: 'yes' },
            { label: t('no'), value: 'no' },
          ]}
        />
      </Group>
    )
  }

  if (stat.inputType === 'enum') {
    const options = (stat.options ?? []).map((opt) => ({
      label: t(`${stat.id}_${opt}`),
      value: opt,
    }))
    return (
      <Group justify="space-between" align="center">
        <Text size="xs" fw={500}>
          {t(stat.id)}
        </Text>
        <SegmentedControl
          size="sm"
          radius="sm"
          fullWidth={true}
          transitionDuration={500}
          transitionTimingFunction="linear"
          color="var(--mantine-primary-color-filled)"
          value={(value as string) ?? ''}
          onChange={(val) => onChange({ [stat.id]: val || undefined })}
          data={options}
        />
      </Group>
    )
  }

  // number input
  const numValue = (value as number) ?? 0
  const isPutts = stat.id === 'putts'
  const gross = score.grossScore ?? 0

  const maxValue =
    typeof stat.maxValue === 'function' ? stat.maxValue(score) : (stat.maxValue ?? 20)

  const handleDecrease = () => {
    if (numValue > 0) {
      onChange({ [stat.id]: numValue - 1 })
    }
  }

  const handleIncrease = () => {
    const newVal = numValue + 1
    if (isPutts && gross > 0) {
      onChange({ [stat.id]: clampPutts(newVal, gross) })
    } else {
      onChange({ [stat.id]: Math.min(newVal, maxValue) })
    }
  }

  const handleInput = (val: string | number) => {
    const num = typeof val === 'string' ? parseInt(val, 10) : val
    if (isNaN(num)) {
      onChange({ [stat.id]: undefined })
    } else if (isPutts && gross > 0) {
      onChange({ [stat.id]: clampPutts(num, gross) })
    } else {
      onChange({ [stat.id]: Math.max(0, Math.min(num, maxValue)) })
    }
  }

  return (
    <Group gap="xs" align="center">
      <Text size="xs" fw={500}>
        {t(stat.id)}
      </Text>
      <ActionIcon
        variant="default"
        size="sm"
        onClick={handleDecrease}
        disabled={numValue <= 0}
        aria-label={t('decrease', { stat: t(stat.id) })}
      >
        <IconMinus size={14} />
      </ActionIcon>
      <NumberInput
        value={numValue}
        onChange={handleInput}
        min={0}
        max={maxValue}
        w={50}
        size="xs"
        hideControls
        styles={{ input: { textAlign: 'center' } }}
      />
      <ActionIcon
        variant="default"
        size="sm"
        onClick={handleIncrease}
        disabled={numValue >= maxValue}
        aria-label={t('increase', { stat: t(stat.id) })}
      >
        <IconPlus size={14} />
      </ActionIcon>
    </Group>
  )
}
