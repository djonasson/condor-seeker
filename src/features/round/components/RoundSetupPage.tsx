import { useState } from 'react'
import { Button, Group, Stack, Text, Title, UnstyledButton } from '@mantine/core'
import { IconCheck } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useRoundStore } from '@/stores/round-store'
import type { Course } from '@/storage/types'
import { CourseSelector } from './CourseSelector'
import { PlayerSelector } from './PlayerSelector'
import type { SelectedPlayer } from './PlayerSelector'
import { ScoringSystemSelector } from './ScoringSystemSelector'

const STEP_COUNT = 3

function StepIndicator({
  active,
  stepLabels,
  onStepClick,
}: {
  active: number
  stepLabels: string[]
  onStepClick: (step: number) => void
}) {
  return (
    <Group gap="xs" align="center" wrap="nowrap">
      {Array.from({ length: STEP_COUNT }, (_, i) => {
        const completed = i < active
        const current = i === active
        return (
          <UnstyledButton
            key={i}
            onClick={() => {
              if (completed) onStepClick(i)
            }}
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'var(--mantine-font-size-xs)',
              fontWeight: 600,
              flexShrink: 0,
              cursor: completed ? 'pointer' : 'default',
              background: completed
                ? 'var(--mantine-primary-color-filled)'
                : current
                  ? 'transparent'
                  : 'var(--mantine-color-default-hover)',
              color: completed
                ? 'white'
                : current
                  ? 'var(--mantine-primary-color-filled)'
                  : 'var(--mantine-color-dimmed)',
              border: current
                ? '2px solid var(--mantine-primary-color-filled)'
                : '2px solid transparent',
            }}
          >
            {completed ? <IconCheck size={14} /> : i + 1}
          </UnstyledButton>
        )
      })}
      <Text size="sm" fw={500} ml="xs">
        {stepLabels[active]}
      </Text>
    </Group>
  )
}

export default function RoundSetupPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const initRound = useRoundStore((s) => s.initRound)

  const [active, setActive] = useState(0)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [selectedPlayers, setSelectedPlayers] = useState<SelectedPlayer[]>([])
  const [scoringSystem, setScoringSystem] = useState<'stroke' | 'stableford'>('stroke')

  const stepLabels = [t('round:selectCourse'), t('round:selectPlayers'), t('round:scoringSystem')]

  const canProceedFromStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return selectedCourse !== null
      case 1:
        return selectedPlayers.length > 0
      case 2:
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (canProceedFromStep(active)) {
      setActive((prev) => Math.min(prev + 1, 2))
    }
  }

  const handleBack = () => {
    setActive((prev) => Math.max(prev - 1, 0))
  }

  const handleStartRound = () => {
    if (!selectedCourse || selectedPlayers.length === 0) return

    initRound({
      courseId: selectedCourse.id,
      courseName: selectedCourse.name,
      scoringSystem,
      players: selectedPlayers.map((p) => ({
        playerId: p.playerId,
        playerName: p.playerName,
        teeId: p.teeId,
      })),
      totalHoles: selectedCourse.holes.length,
    })

    void navigate('/round/play')
  }

  return (
    <Stack gap="md">
      <Title order={2}>{t('round:setup')}</Title>

      <StepIndicator active={active} stepLabels={stepLabels} onStepClick={setActive} />

      {active === 0 && (
        <Stack gap="md">
          <CourseSelector
            selectedCourseId={selectedCourse?.id ?? ''}
            onSelect={setSelectedCourse}
          />
        </Stack>
      )}

      {active === 1 && (
        <Stack gap="md">
          <PlayerSelector
            course={selectedCourse}
            selectedPlayers={selectedPlayers}
            onChange={setSelectedPlayers}
          />
        </Stack>
      )}

      {active === 2 && (
        <Stack gap="md">
          <ScoringSystemSelector
            value={scoringSystem}
            onChange={(v) => setScoringSystem(v as 'stroke' | 'stableford')}
          />
        </Stack>
      )}

      <Group justify="space-between" mt="xl">
        <Button variant="default" onClick={handleBack} disabled={active === 0}>
          {t('common:back')}
        </Button>

        {active < 2 ? (
          <Button onClick={handleNext} disabled={!canProceedFromStep(active)}>
            {t('common:next')}
          </Button>
        ) : (
          <Button
            onClick={handleStartRound}
            disabled={!selectedCourse || selectedPlayers.length === 0}
          >
            {t('round:startRound')}
          </Button>
        )}
      </Group>
    </Stack>
  )
}
