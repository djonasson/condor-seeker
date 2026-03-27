import { Group, Text } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import type { StatDefinition } from '@/lib/stat-catalog'
import type { HoleScore } from '@/storage/types'
import { clampPutts } from '@/lib/score-formatting'
import { SegmentPicker } from '@/components/SegmentPicker'
import { NumberScrollPicker } from './NumberScrollPicker'

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
        <SegmentPicker
          size="sm"
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
        <SegmentPicker
          size="sm"
          value={(value as string) ?? ''}
          onChange={(val) => onChange({ [stat.id]: val || undefined })}
          data={options}
        />
      </Group>
    )
  }

  // number input — use NumberScrollPicker
  const numValue = (value as number) ?? 0
  const isPutts = stat.id === 'putts'
  const gross = score.grossScore ?? 0

  const maxValue =
    typeof stat.maxValue === 'function' ? stat.maxValue(score) : (stat.maxValue ?? 20)

  const handleChange = (newVal: number) => {
    if (isPutts && gross > 0) {
      onChange({ [stat.id]: clampPutts(newVal, gross) })
    } else {
      onChange({ [stat.id]: Math.max(0, Math.min(newVal, maxValue)) })
    }
  }

  return (
    <Group justify="space-between" align="center">
      <Text size="xs" fw={500}>
        {t(stat.id)}
      </Text>
      <NumberScrollPicker
        value={numValue}
        min={0}
        max={maxValue}
        onChange={handleChange}
        size="sm"
      />
    </Group>
  )
}
