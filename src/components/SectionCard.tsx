import { Box, Paper, Stack } from '@mantine/core'
import type { ReactNode } from 'react'

type SectionCardProps = {
  header?: ReactNode
  footer?: ReactNode
  children: ReactNode
}

const HEADER_BG = 'var(--mantine-primary-color-filled)'
const FOOTER_BG = 'var(--mantine-primary-color-light)'

export function SectionCard({ header, footer, children }: SectionCardProps) {
  return (
    <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
      {header && (
        <Box bg={HEADER_BG} c="white" px="sm" py="xs">
          {header}
        </Box>
      )}
      <Stack gap="xs" px="sm" py="xs">
        {children}
      </Stack>
      {footer && (
        <Box bg={FOOTER_BG} px="sm" py="xs">
          {footer}
        </Box>
      )}
    </Paper>
  )
}
