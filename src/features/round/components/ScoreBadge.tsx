import { Box, Text } from '@mantine/core'
import { getScoreBadgeVariant } from '@/features/round/lib/score-badge'

type ScoreBadgeProps = {
  score: number
  par: number
  size?: number
}

export function ScoreBadge({ score, par, size = 28 }: ScoreBadgeProps) {
  if (score <= 0) {
    return (
      <Box
        w={size}
        h={size}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Text size="xs" ta="center">
          -
        </Text>
      </Box>
    )
  }

  const { shape, color } = getScoreBadgeVariant(score, par)

  const borderColor =
    color === 'red'
      ? 'var(--mantine-color-red-6)'
      : color === 'yellow'
        ? 'var(--mantine-color-yellow-6)'
        : 'var(--mantine-color-blue-6)'
  const bgColor = color === 'grey' ? 'var(--mantine-color-gray-2)' : undefined

  const baseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: size,
    height: size,
    lineHeight: 1,
  }

  if (shape === 'star') {
    const starSize = size + 6
    return (
      <Box
        style={{
          ...baseStyle,
          width: starSize,
          height: starSize,
          position: 'relative',
        }}
      >
        <svg
          width={starSize}
          height={starSize}
          viewBox="0 0 36 36"
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <polygon
            points="18,2 22.5,13 34,13 24.5,21 28,32 18,25 8,32 11.5,21 2,13 13.5,13"
            fill="var(--mantine-color-yellow-3)"
            stroke="var(--mantine-color-yellow-6)"
            strokeWidth="1.5"
          />
        </svg>
        <Text size="xs" fw={700} style={{ position: 'relative', zIndex: 1 }}>
          {score}
        </Text>
      </Box>
    )
  }

  if (shape === 'none') {
    return (
      <Box
        style={{
          ...baseStyle,
          backgroundColor: bgColor,
          borderRadius: 4,
        }}
      >
        <Text size="xs" fw={600}>
          {score}
        </Text>
      </Box>
    )
  }

  if (shape === 'circle') {
    return (
      <Box
        style={{
          ...baseStyle,
          border: `1px solid ${borderColor}`,
          borderRadius: '50%',
        }}
      >
        <Text size="xs" fw={600} c="red.7">
          {score}
        </Text>
      </Box>
    )
  }

  if (shape === 'double-circle') {
    return (
      <Box
        style={{
          ...baseStyle,
          border: `1px solid ${borderColor}`,
          borderRadius: '50%',
          padding: 2,
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            border: `1px solid ${borderColor}`,
            borderRadius: '50%',
          }}
        >
          <Text size="xs" fw={600} c="red.7">
            {score}
          </Text>
        </Box>
      </Box>
    )
  }

  if (shape === 'filled-circle') {
    return (
      <Box
        style={{
          ...baseStyle,
          backgroundColor: 'var(--mantine-color-red-6)',
          borderRadius: '50%',
        }}
      >
        <Text size="xs" fw={600} c="white">
          {score}
        </Text>
      </Box>
    )
  }

  if (shape === 'rectangle') {
    return (
      <Box
        style={{
          ...baseStyle,
          border: `1px solid ${borderColor}`,
          borderRadius: 2,
        }}
      >
        <Text size="xs" fw={600} c="blue.7">
          {score}
        </Text>
      </Box>
    )
  }

  if (shape === 'double-rectangle') {
    return (
      <Box
        style={{
          ...baseStyle,
          border: `1px solid ${borderColor}`,
          borderRadius: 2,
          padding: 2,
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            border: `1px solid ${borderColor}`,
            borderRadius: 2,
          }}
        >
          <Text size="xs" fw={600} c="blue.7">
            {score}
          </Text>
        </Box>
      </Box>
    )
  }

  // filled-rectangle (triple bogey or worse)
  return (
    <Box
      style={{
        ...baseStyle,
        backgroundColor: 'var(--mantine-color-blue-6)',
        borderRadius: 2,
      }}
    >
      <Text size="xs" fw={600} c="white">
        {score}
      </Text>
    </Box>
  )
}
