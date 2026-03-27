import { Group, UnstyledButton } from '@mantine/core'

type SegmentPickerProps = {
  data: Array<{ label: string; value: string }>
  value: string
  onChange: (value: string) => void
  size?: 'xs' | 'sm'
  fullWidth?: boolean
}

export function SegmentPicker({
  data,
  value,
  onChange,
  size = 'sm',
  fullWidth = false,
}: SegmentPickerProps) {
  const padding = size === 'xs' ? '4px 8px' : '6px 12px'
  const fontSize = size === 'xs' ? 'var(--mantine-font-size-xs)' : 'var(--mantine-font-size-sm)'

  return (
    <Group
      gap={0}
      wrap="nowrap"
      style={{
        border: '1px solid var(--mantine-color-default-border)',
        borderRadius: 'var(--mantine-radius-sm)',
        overflow: 'hidden',
        flex: fullWidth ? 1 : undefined,
      }}
    >
      {data.map((item, i) => {
        const selected = item.value === value
        return (
          <UnstyledButton
            key={item.value}
            onClick={() => onChange(item.value)}
            style={{
              padding,
              fontSize,
              fontWeight: 500,
              textAlign: 'center',
              flex: fullWidth ? 1 : undefined,
              whiteSpace: 'nowrap',
              background: selected ? 'var(--mantine-primary-color-filled)' : 'transparent',
              color: selected ? 'white' : 'var(--mantine-color-text)',
              borderLeft: i > 0 ? '1px solid var(--mantine-color-default-border)' : undefined,
              transition: 'background 150ms ease, color 150ms ease',
            }}
          >
            {item.label}
          </UnstyledButton>
        )
      })}
    </Group>
  )
}
