import { Group, UnstyledButton } from '@mantine/core'
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

  const padding = size === 'xs' ? '4px 8px' : '6px 12px'
  const fontSize = size === 'xs' ? 'var(--mantine-font-size-xs)' : 'var(--mantine-font-size-sm)'
  const iconSize = size === 'xs' ? 12 : 14

  return (
    <Group
      gap={0}
      wrap="nowrap"
      style={{
        border: '1px solid var(--mantine-color-default-border)',
        borderRadius: 'var(--mantine-radius-sm)',
        overflow: 'hidden',
      }}
    >
      {canDecrease && (
        <UnstyledButton
          onClick={() => onChange(value - 1)}
          aria-label="Decrease"
          style={{
            padding,
            fontSize,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRight: '1px solid var(--mantine-color-default-border)',
            color: 'var(--mantine-color-dimmed)',
          }}
        >
          <IconMinus size={iconSize} />
        </UnstyledButton>
      )}
      {numbers.map((n, i) => {
        const selected = n === value
        const showLeftBorder = i > 0 || canDecrease
        return (
          <UnstyledButton
            key={n}
            onClick={() => onChange(n)}
            style={{
              padding,
              fontSize,
              fontWeight: 500,
              textAlign: 'center',
              minWidth: size === 'xs' ? 28 : 34,
              whiteSpace: 'nowrap',
              background: selected ? 'var(--mantine-primary-color-filled)' : 'transparent',
              color: selected ? 'white' : 'var(--mantine-color-text)',
              borderLeft: showLeftBorder
                ? '1px solid var(--mantine-color-default-border)'
                : undefined,
              transition: 'background 150ms ease, color 150ms ease',
            }}
          >
            {n}
          </UnstyledButton>
        )
      })}
      {canIncrease && (
        <UnstyledButton
          onClick={() => onChange(value + 1)}
          aria-label="Increase"
          style={{
            padding,
            fontSize,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderLeft: '1px solid var(--mantine-color-default-border)',
            color: 'var(--mantine-color-dimmed)',
          }}
        >
          <IconPlus size={iconSize} />
        </UnstyledButton>
      )}
    </Group>
  )
}
