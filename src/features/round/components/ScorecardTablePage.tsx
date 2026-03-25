import { useEffect } from 'react'
import { Button, Center, Group, Loader, Stack, Text } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useRoundStore } from '@/stores/round-store'
import { useRound } from '@/features/round/hooks/useRound'
import { TraditionalScorecard } from './TraditionalScorecard'
import { ScoreSummaryBar } from './ScoreSummaryBar'

export default function ScorecardTablePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const isActive = useRoundStore((s) => s.isActive)

  useEffect(() => {
    if (!isActive) {
      void navigate('/round/new')
    }
  }, [isActive, navigate])

  const {
    courseName,
    scoringSystem,
    currentHole,
    totalHoles,
    loading,
    course,
    playerResults,
    goToHole,
    completeRound,
  } = useRound()

  if (!isActive) {
    return null
  }

  if (loading) {
    return (
      <Center h="50vh">
        <Loader color="green" />
      </Center>
    )
  }

  if (!course) {
    return (
      <Center h="50vh">
        <Text>{t('round:courseNotFound')}</Text>
      </Center>
    )
  }

  const isStableford = scoringSystem === 'stableford'
  const isLastHole = currentHole === totalHoles

  const handleCellClick = (_playerId: string, holeNumber: number) => {
    goToHole(holeNumber)
    void navigate('/round/play')
  }

  return (
    <Stack gap="md">
      <Group justify="flex-end">
        <Button variant="subtle" size="xs" onClick={() => void navigate('/round/play')}>
          {t('round:holeView')}
        </Button>
      </Group>

      <TraditionalScorecard
        holes={course.holes}
        tees={course.tees}
        clubName={course.clubName}
        courseName={courseName}
        players={playerResults.map((r) => ({
          playerId: r.playerId,
          playerName: r.playerName,
          teeId:
            useRoundStore.getState().players.find((p) => p.playerId === r.playerId)?.teeId ?? '',
          holeResults: r.holeResults,
          total: r.total,
        }))}
        onCellClick={handleCellClick}
      />

      <ScoreSummaryBar
        players={playerResults.map((r) => ({
          playerName: r.playerName,
          total: r.total,
        }))}
        isStableford={isStableford}
      />

      {isLastHole && (
        <Button color="green" size="md" fullWidth onClick={() => void completeRound()}>
          {t('round:completeRound')}
        </Button>
      )}
    </Stack>
  )
}
