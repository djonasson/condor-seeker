import { useEffect, useState } from 'react'
import { Button, Center, Group, Loader, Stack, Text, Title } from '@mantine/core'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useStorage } from '@/hooks/useStorage'
import { ScorecardTable } from '@/features/round/components/ScorecardTable'
import type { Course, Round } from '@/storage/types'
import type { HoleResult, RoundTotal } from '@/features/round/types'

type PlayerColumn = {
  playerId: string
  playerName: string
  teeId: string
  holeResults: HoleResult[]
  total: RoundTotal
}

export default function RoundDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const storage = useStorage()

  const [round, setRound] = useState<Round | null>(null)
  const [course, setCourse] = useState<Course | null>(null)
  const [playerNames, setPlayerNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!id) return
      const r = await storage.getRound(id)
      if (!r) {
        setLoading(false)
        return
      }
      setRound(r)

      const c = await storage.getCourse(r.courseId)
      if (c) setCourse(c)

      const players = await storage.getPlayers()
      const names: Record<string, string> = {}
      for (const p of players) {
        names[p.id] = p.name
      }
      setPlayerNames(names)

      setLoading(false)
    }
    void load()
  }, [id, storage])

  if (loading) {
    return (
      <Center h="50vh">
        <Loader color="green" />
      </Center>
    )
  }

  if (!round || !course) {
    return (
      <Stack gap="md">
        <Title order={2}>{t('history:viewDetails')}</Title>
        <Text>{t('history:roundNotFound')}</Text>
        <Button variant="light" onClick={() => navigate('/history')}>
          {t('history:backToHistory')}
        </Button>
      </Stack>
    )
  }

  const playerColumns: PlayerColumn[] = round.playerRounds.map((pr) => ({
    playerId: pr.playerId,
    playerName: playerNames[pr.playerId] ?? pr.playerId,
    teeId: pr.teeId,
    holeResults: pr.holeScores.map((hs) => {
      const hole = course.holes.find((h) => h.number === hs.holeNumber)
      const par = hole?.parByTee[pr.teeId] ?? 0
      return {
        holeNumber: hs.holeNumber,
        grossScore: hs.grossScore,
        netScore: hs.netScore,
        par,
        scoreToPar: hs.grossScore - par,
      }
    }),
    total: {
      totalGross: pr.totalGross,
      totalNet: pr.totalNet,
      totalToPar:
        pr.totalGross - course.holes.reduce((sum, h) => sum + (h.parByTee[pr.teeId] ?? 0), 0),
    },
  }))

  return (
    <Stack gap="md">
      <Title order={2}>{t('history:viewDetails')}</Title>

      <Group gap="xs">
        <Text fw={500}>{t('history:date')}:</Text>
        <Text>{new Date(round.date).toLocaleDateString()}</Text>
      </Group>

      <Group gap="xs">
        <Text fw={500}>{t('history:course')}:</Text>
        <Text>{course.name}</Text>
      </Group>

      <Group gap="xs">
        <Text fw={500}>{t('round:scoringSystemLabel')}:</Text>
        <Text>{round.scoringSystem}</Text>
      </Group>

      <ScorecardTable holes={course.holes} players={playerColumns} readOnly />

      <Title order={4}>{t('round:total')}</Title>
      {playerColumns.map((pc) => (
        <Group key={pc.playerId} gap="lg">
          <Text fw={500}>{pc.playerName}</Text>
          <Text>
            {t('round:gross')}: {pc.total.totalGross}
          </Text>
          <Text>
            {t('round:net')}: {pc.total.totalNet}
          </Text>
        </Group>
      ))}

      <Button variant="light" onClick={() => navigate('/history')}>
        {t('history:backToHistory')}
      </Button>
    </Stack>
  )
}
