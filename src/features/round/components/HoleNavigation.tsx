import { useState } from 'react'
import { ActionIcon, Box, Group, Modal, Stack, Text, UnstyledButton } from '@mantine/core'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'

type HoleNavigationProps = {
  currentHole: number
  totalHoles: number
  onPrev: () => void
  onNext: () => void
  onGoToHole: (hole: number) => void
}

function HoleButton({
  hole,
  currentHole,
  onGoToHole,
}: {
  hole: number
  currentHole: number
  onGoToHole: (hole: number) => void
}) {
  return (
    <UnstyledButton
      onClick={() => onGoToHole(hole)}
      style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 15,
        fontWeight: hole === currentHole ? 700 : 400,
        backgroundColor:
          hole === currentHole ? 'var(--mantine-primary-color-6)' : 'var(--mantine-color-default)',
        color: hole === currentHole ? 'var(--mantine-color-white)' : 'var(--mantine-color-text)',
        border: `1px solid ${hole === currentHole ? 'var(--mantine-primary-color-6)' : 'var(--mantine-color-default-border)'}`,
      }}
    >
      {hole}
    </UnstyledButton>
  )
}

export function HoleNavigationBar({
  currentHole,
  totalHoles,
  onPrev,
  onNext,
  onGoToHole,
}: HoleNavigationProps) {
  const { t } = useTranslation()
  const [selectorOpen, setSelectorOpen] = useState(false)

  const holes = Array.from({ length: totalHoles }, (_, i) => i + 1)
  const rowSize = Math.ceil(totalHoles / 3)
  const rows = [
    holes.slice(0, rowSize),
    holes.slice(rowSize, rowSize * 2),
    holes.slice(rowSize * 2),
  ].filter((r) => r.length > 0)

  const handleGoToHole = (hole: number) => {
    onGoToHole(hole)
    setSelectorOpen(false)
  }

  return (
    <>
      <Box
        style={{
          position: 'fixed',
          bottom: 60,
          left: 0,
          right: 0,
          zIndex: 100,
          backgroundColor: 'var(--mantine-color-body)',
          borderTop: '1px solid var(--mantine-color-default-border)',
          padding: 'var(--mantine-spacing-xs) var(--mantine-spacing-md)',
        }}
      >
        <Group justify="center" gap="md">
          <ActionIcon
            variant="default"
            size="lg"
            onClick={onPrev}
            disabled={currentHole <= 1}
            aria-label={t('round:previousHole')}
          >
            <IconChevronLeft size={20} />
          </ActionIcon>

          <UnstyledButton onClick={() => setSelectorOpen(true)}>
            <Text fw={600} size="lg" td="underline" style={{ textDecorationStyle: 'dotted' }}>
              {t('round:holeOf', {
                current: currentHole,
                total: totalHoles,
              })}
            </Text>
          </UnstyledButton>

          <ActionIcon
            variant="default"
            size="lg"
            onClick={onNext}
            disabled={currentHole >= totalHoles}
            aria-label={t('round:nextHole')}
          >
            <IconChevronRight size={20} />
          </ActionIcon>
        </Group>
      </Box>

      <Modal
        opened={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        title={t('round:goToHole', 'Go to Hole')}
        centered
        size="sm"
      >
        <Stack gap="sm" align="center">
          {rows.map((row, i) => (
            <Group key={i} justify="center" gap={8} wrap="nowrap">
              {row.map((hole) => (
                <HoleButton
                  key={hole}
                  hole={hole}
                  currentHole={currentHole}
                  onGoToHole={handleGoToHole}
                />
              ))}
            </Group>
          ))}
        </Stack>
      </Modal>
    </>
  )
}
