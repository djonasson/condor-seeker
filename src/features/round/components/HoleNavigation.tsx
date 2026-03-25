import { ActionIcon, Group, Text, UnstyledButton, Flex } from '@mantine/core'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'

type HoleNavigationProps = {
  currentHole: number
  totalHoles: number
  onPrev: () => void
  onNext: () => void
  onGoToHole: (hole: number) => void
}

export function HoleNavigation({
  currentHole,
  totalHoles,
  onPrev,
  onNext,
  onGoToHole,
}: HoleNavigationProps) {
  const { t } = useTranslation()

  return (
    <Flex direction="column" align="center" gap="xs">
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

        <Text fw={600} size="lg">
          {t('round:holeOf', {
            current: currentHole,
            total: totalHoles,
          })}
        </Text>

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

      <Group justify="center" gap={4}>
        {Array.from({ length: totalHoles }, (_, i) => i + 1).map((hole) => (
          <UnstyledButton
            key={hole}
            onClick={() => onGoToHole(hole)}
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: hole === currentHole ? 700 : 400,
              backgroundColor:
                hole === currentHole
                  ? 'var(--mantine-primary-color-6)'
                  : 'var(--mantine-color-default)',
              color:
                hole === currentHole ? 'var(--mantine-color-white)' : 'var(--mantine-color-text)',
              border: `1px solid ${hole === currentHole ? 'var(--mantine-primary-color-6)' : 'var(--mantine-color-default-border)'}`,
            }}
          >
            {hole}
          </UnstyledButton>
        ))}
      </Group>
    </Flex>
  )
}
