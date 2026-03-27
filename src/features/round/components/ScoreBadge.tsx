import { Box, Text } from '@mantine/core'
import { getScoreBadgeVariant } from '@/features/round/lib/score-badge'

type ScoreBadgeProps = {
  score: number
  par: number
  size?: number
}

const COLOR = 'var(--mantine-color-text)'
const BG = 'var(--mantine-color-text)'
const FILLED_TEXT = 'var(--mantine-color-body)'

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

  const { shape } = getScoreBadgeVariant(score, par)

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
        <Text size="xs" fw={700} style={{ position: 'relative', zIndex: 1, color: FILLED_TEXT }}>
          {score}
        </Text>
      </Box>
    )
  }

  // Par — no decoration
  if (shape === 'none') {
    return (
      <Box style={baseStyle}>
        <Text size="xs" fw={600}>
          {score}
        </Text>
      </Box>
    )
  }

  // Birdie — circle outline
  if (shape === 'circle') {
    return (
      <Box
        style={{
          ...baseStyle,
          border: `1.5px solid ${COLOR}`,
          borderRadius: '50%',
        }}
      >
        <Text size="xs" fw={600}>
          {score}
        </Text>
      </Box>
    )
  }

  // Eagle — double circle outline
  if (shape === 'double-circle') {
    return (
      <Box
        style={{
          ...baseStyle,
          border: `1.5px solid ${COLOR}`,
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
            border: `1.5px solid ${COLOR}`,
            borderRadius: '50%',
          }}
        >
          <Text size="xs" fw={600}>
            {score}
          </Text>
        </Box>
      </Box>
    )
  }

  // Albatross or better — solid circle with frame
  if (shape === 'framed-filled-circle') {
    return (
      <Box
        style={{
          ...baseStyle,
          border: `1.5px solid ${COLOR}`,
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
            backgroundColor: BG,
            borderRadius: '50%',
          }}
        >
          <Text size="xs" fw={600} style={{ color: FILLED_TEXT }}>
            {score}
          </Text>
        </Box>
      </Box>
    )
  }

  // Bogey — square outline
  if (shape === 'rectangle') {
    return (
      <Box
        style={{
          ...baseStyle,
          border: `1.5px solid ${COLOR}`,
          borderRadius: 2,
        }}
      >
        <Text size="xs" fw={600}>
          {score}
        </Text>
      </Box>
    )
  }

  // Double bogey — double square outline
  if (shape === 'double-rectangle') {
    return (
      <Box
        style={{
          ...baseStyle,
          border: `1.5px solid ${COLOR}`,
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
            border: `1.5px solid ${COLOR}`,
            borderRadius: 2,
          }}
        >
          <Text size="xs" fw={600}>
            {score}
          </Text>
        </Box>
      </Box>
    )
  }

  // Triple bogey or worse — solid square with frame
  return (
    <Box
      style={{
        ...baseStyle,
        border: `1.5px solid ${COLOR}`,
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
          backgroundColor: BG,
          borderRadius: 2,
        }}
      >
        <Text size="xs" fw={600} style={{ color: FILLED_TEXT }}>
          {score}
        </Text>
      </Box>
    </Box>
  )
}
