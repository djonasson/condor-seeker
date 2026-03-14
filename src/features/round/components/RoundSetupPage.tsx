import { useState } from 'react'
import { Button, Container, Group, Stack, Stepper, Title } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useRoundStore } from '@/stores/round-store'
import type { Course } from '@/storage/types'
import { CourseSelector } from './CourseSelector'
import { PlayerSelector } from './PlayerSelector'
import type { SelectedPlayer } from './PlayerSelector'
import { ScoringSystemSelector } from './ScoringSystemSelector'

export default function RoundSetupPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const initRound = useRoundStore((s) => s.initRound)

  const [active, setActive] = useState(0)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [selectedPlayers, setSelectedPlayers] = useState<SelectedPlayer[]>([])
  const [scoringSystem, setScoringSystem] = useState<'stroke' | 'stableford'>('stroke')

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
    <Container size="sm" py="md">
      <Title order={2} mb="lg">
        {t('round:setup')}
      </Title>

      <Stepper active={active} onStepClick={setActive}>
        <Stepper.Step label={t('round:selectCourse')} allowStepSelect={active > 0}>
          <Stack gap="md" mt="md">
            <CourseSelector
              selectedCourseId={selectedCourse?.id ?? ''}
              onSelect={setSelectedCourse}
            />
          </Stack>
        </Stepper.Step>

        <Stepper.Step label={t('round:selectPlayers')} allowStepSelect={active > 1}>
          <Stack gap="md" mt="md">
            <PlayerSelector
              course={selectedCourse}
              selectedPlayers={selectedPlayers}
              onChange={setSelectedPlayers}
            />
          </Stack>
        </Stepper.Step>

        <Stepper.Step label={t('round:scoringSystem')} allowStepSelect={active > 2}>
          <Stack gap="md" mt="md">
            <ScoringSystemSelector
              value={scoringSystem}
              onChange={(v) => setScoringSystem(v as 'stroke' | 'stableford')}
            />
          </Stack>
        </Stepper.Step>
      </Stepper>

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
    </Container>
  )
}
