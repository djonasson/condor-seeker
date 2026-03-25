import { useEffect, useState } from 'react'
import { Button, Center, Group, Loader, Modal, Stack, Text, Title } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useRoundStore } from '@/stores/round-store'
import { useRound } from '@/features/round/hooks/useRound'
import { computeHoleDefaults } from '@/lib/score-defaults'
import { HoleScoreEntry } from './HoleScoreEntry'
import { HoleNavigation } from './HoleNavigation'

export default function ScorecardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const isActive = useRoundStore((s) => s.isActive)
  const clearRound = useRoundStore((s) => s.clearRound)
  const [abandonModalOpen, setAbandonModalOpen] = useState(false)

  const handleAbandonRound = () => {
    clearRound()
    navigate('/')
  }

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
    distanceUnitLabel,
    setScore,
    nextHole,
    prevHole,
    goToHole,
    completeRound,
  } = useRound()

  // Apply defaults on first visit to a hole
  useEffect(() => {
    if (!course || loading || currentHoleInfo.length === 0) return

    for (const playerInfo of currentHoleInfo) {
      const playerScores = scores[playerInfo.playerId] ?? []
      const existing = playerScores.find((s) => s.holeNumber === currentHole)
      if (!existing) {
        const defaults = computeHoleDefaults(
          playerInfo.holeInfo.par,
          playerInfo.holeInfo.handicapStrokes,
        )
        setScore(playerInfo.playerId, currentHole, {
          grossScore: defaults.grossScore,
          putts: defaults.putts,
          fairwayHit: defaults.fairwayHit,
          greenInRegulation: defaults.greenInRegulation,
        })
      }
    }
  }, [currentHole, course, loading, currentHoleInfo, scores, setScore])

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
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Title order={3}>{courseName}</Title>
        <Button variant="subtle" size="xs" onClick={() => void navigate('/round/play/table')}>
          {t('round:tableView')}
        </Button>
      </Group>

      {currentHoleInfo.map((playerInfo) => {
        const playerScores = scores[playerInfo.playerId] ?? []
        const holeScore = playerScores.find((s) => s.holeNumber === currentHole)

        const playerResult = playerResults.find((r) => r.playerId === playerInfo.playerId)
        const holeResult = playerResult?.holeResults.find((r) => r.holeNumber === currentHole)

        const netScore = holeScore ? holeScore.grossScore - playerInfo.holeInfo.handicapStrokes : 0

        const playerTotal = playerResult?.total

        return (
          <HoleScoreEntry
            key={playerInfo.playerId}
            playerName={playerInfo.playerName}
            teeName={playerInfo.teeName}
            handicapIndex={playerInfo.handicapIndex}
            courseHandicap={playerInfo.courseHandicap}
            par={playerInfo.holeInfo.par}
            distance={playerInfo.holeInfo.distance}
            distanceUnitLabel={distanceUnitLabel}
            handicap={playerInfo.holeInfo.handicap}
            handicapStrokes={playerInfo.holeInfo.handicapStrokes}
            score={holeScore}
            netScore={netScore}
            points={holeResult?.points}
            isStableford={isStableford}
            totalGross={playerTotal?.totalGross ?? 0}
            totalNet={playerTotal?.totalNet ?? 0}
            totalToPar={playerTotal?.totalToPar ?? 0}
            totalPoints={playerTotal?.totalPoints}
            onScoreChange={(update) => setScore(playerInfo.playerId, currentHole, update)}
          />
        )
      })}

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

      <Button variant="subtle" color="red" size="xs" onClick={() => setAbandonModalOpen(true)}>
        {t('round:abandonRound')}
      </Button>

      <Modal
        opened={abandonModalOpen}
        onClose={() => setAbandonModalOpen(false)}
        title={t('round:abandonRound')}
        centered
        size="sm"
      >
        <Stack>
          <Text>{t('round:abandonConfirm')}</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setAbandonModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button color="red" onClick={handleAbandonRound}>
              {t('round:abandonRound')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
}
