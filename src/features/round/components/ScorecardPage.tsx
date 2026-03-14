import { useEffect } from 'react'
import { Button, Center, Container, Group, Loader, Stack, Text, Title } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useRoundStore } from '@/stores/round-store'
import { useRound } from '@/features/round/hooks/useRound'
import { HoleScoreEntry } from './HoleScoreEntry'
import { HoleNavigation } from './HoleNavigation'
import { ScoreSummaryBar } from './ScoreSummaryBar'

export default function ScorecardPage() {
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
    scores,
    currentHole,
    totalHoles,
    loading,
    course,
    currentHoleInfo,
    playerResults,
    setScore,
    nextHole,
    prevHole,
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

  return (
    <Container size="sm" py="md">
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Title order={3}>{courseName}</Title>
          <Button variant="subtle" size="xs" onClick={() => void navigate('/round/play/table')}>
            {t('round:tableView')}
          </Button>
        </Group>

        {currentHoleInfo.length > 0 && (
          <Group justify="center" gap="lg">
            <Text size="sm" c="dimmed">
              {t('round:par')}: {currentHoleInfo[0].holeInfo.par}
            </Text>
            <Text size="sm" c="dimmed">
              {t('round:distance')}: {currentHoleInfo[0].holeInfo.distance}
            </Text>
            <Text size="sm" c="dimmed">
              {t('round:handicap')}: {currentHoleInfo[0].holeInfo.handicap}
            </Text>
          </Group>
        )}

        {currentHoleInfo.map((playerInfo) => {
          const playerScores = scores[playerInfo.playerId] ?? []
          const holeScore = playerScores.find((s) => s.holeNumber === currentHole)

          const playerResult = playerResults.find((r) => r.playerId === playerInfo.playerId)
          const holeResult = playerResult?.holeResults.find((r) => r.holeNumber === currentHole)

          const netScore = holeScore
            ? holeScore.grossScore - playerInfo.holeInfo.handicapStrokes
            : 0

          return (
            <HoleScoreEntry
              key={playerInfo.playerId}
              playerName={playerInfo.playerName}
              par={playerInfo.holeInfo.par}
              handicapStrokes={playerInfo.holeInfo.handicapStrokes}
              score={holeScore}
              netScore={netScore}
              points={holeResult?.points}
              isStableford={isStableford}
              onScoreChange={(update) => setScore(playerInfo.playerId, currentHole, update)}
            />
          )
        })}

        <ScoreSummaryBar
          players={playerResults.map((r) => ({
            playerName: r.playerName,
            total: r.total,
          }))}
          isStableford={isStableford}
        />

        <HoleNavigation
          currentHole={currentHole}
          totalHoles={totalHoles}
          onPrev={prevHole}
          onNext={nextHole}
          onGoToHole={goToHole}
        />

        {isLastHole && (
          <Button color="green" size="md" fullWidth onClick={() => void completeRound()}>
            {t('round:completeRound')}
          </Button>
        )}
      </Stack>
    </Container>
  )
}
