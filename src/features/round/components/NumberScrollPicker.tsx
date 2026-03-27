import { ActionIcon, Group, SegmentedControl } from '@mantine/core'
import { IconMinus, IconPlus } from '@tabler/icons-react'

type NumberScrollPickerProps = {
  value: number
  min: number
  max: number
  onChange: (value: number) => void
  size?: 'xs' | 'sm'
}

const VISIBLE_COUNT = 5

export function NumberScrollPicker({
  value,
  min,
  max,
  onChange,
  size = 'sm',
}: NumberScrollPickerProps) {
  const start = Math.max(min, value - 2)
  const numbers = Array.from({ length: VISIBLE_COUNT }, (_, i) => start + i)

  const canDecrease = value > min
  const canIncrease = value < max

  const iconSize = size === 'xs' ? 14 : 16
  const actionSize = size === 'xs' ? 'sm' : 'md'

  return (
    <Group gap={4} align="center" wrap="nowrap">
      {canDecrease ? (
        <ActionIcon
          variant="default"
          size={actionSize}
          onClick={() => onChange(value - 1)}
          aria-label="Decrease"
        >
          <IconMinus size={iconSize} />
        </ActionIcon>
      ) : (
        <ActionIcon
          size={actionSize}
          variant="transparent"
          disabled
          style={{ visibility: 'hidden' }}
        />
      )}
      <SegmentedControl
        size={size}
        radius="sm"
        fullWidth
        transitionDuration={500}
        transitionTimingFunction="linear"
        color="var(--mantine-primary-color-filled)"
        value={String(value)}
        onChange={(val) => onChange(parseInt(val, 10))}
        data={numbers.map((n) => ({ label: String(n), value: String(n) }))}
      />
      {canIncrease ? (
        <ActionIcon
          variant="default"
          size={actionSize}
          onClick={() => onChange(value + 1)}
          aria-label="Increase"
        >
          <IconPlus size={iconSize} />
        </ActionIcon>
      ) : (
        <ActionIcon
          size={actionSize}
          variant="transparent"
          disabled
          style={{ visibility: 'hidden' }}
        />
      )}
    </Group>
  )
}
