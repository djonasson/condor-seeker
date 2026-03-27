import { useEffect, useState } from 'react'
import { Center, Group, Loader, Paper, Stack, Text, Title } from '@mantine/core'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useStorage } from '@/hooks/useStorage'
import { useAppStore } from '@/stores/app-store'
import { formatDate } from '@/lib/date-format'
import { calculateCourseHandicap } from '@/lib/handicap'
import { TraditionalScorecard } from '@/features/round/components/TraditionalScorecard'
import type { Course, Player, Round } from '@/storage/types'
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
  const storage = useStorage()
  const dateFormat = useAppStore((s) => s.dateFormat)

  const [round, setRound] = useState<Round | null>(null)
  const [course, setCourse] = useState<Course | null>(null)
  const [playerMap, setPlayerMap] = useState<Record<string, Player>>({})
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
      const map: Record<string, Player> = {}
      for (const p of players) {
        map[p.id] = p
      }
      setPlayerMap(map)

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
      </Stack>
    )
  }

  const playerColumns: PlayerColumn[] = round.playerRounds.map((pr) => {
    const player = playerMap[pr.playerId]
    const tee = course.tees.find((te) => te.id === pr.teeId)
    const handicapIndex = player?.handicapIndex ?? 0
    const totalPar = course.holes.reduce((sum, h) => sum + (h.parByTee[pr.teeId] ?? 0), 0)
    const courseHcap = tee
      ? calculateCourseHandicap(handicapIndex, tee.slopeRating, tee.courseRating, totalPar)
      : 0

    return {
      playerId: pr.playerId,
      playerName: player?.name ?? pr.playerId,
      teeId: pr.teeId,
      handicapIndex,
      courseHandicap: courseHcap,
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
    }
  })

  return (
    <Stack gap="md">
      <Title order={2}>{t('history:viewDetails')}</Title>

      <Paper withBorder radius="sm" p="md">
        <Stack gap="xs">
          <Group gap="xs">
            <Text fw={500}>{t('history:date')}:</Text>
            <Text>{formatDate(round.date, dateFormat)}</Text>
          </Group>

          {course.clubName && (
            <Group gap="xs">
              <Text fw={500}>{t('history:club')}:</Text>
              <Text>{course.clubName}</Text>
            </Group>
          )}

          <Group gap="xs">
            <Text fw={500}>{t('history:course')}:</Text>
            <Text>{course.name}</Text>
          </Group>

          <Group gap="xs">
            <Text fw={500}>{t('round:scoringSystemLabel')}:</Text>
            <Text>{round.scoringSystem}</Text>
          </Group>
        </Stack>
      </Paper>

      {playerColumns.map((player) => (
        <Paper key={player.playerId} withBorder radius="sm" p="md">
          <TraditionalScorecard
            holes={course.holes}
            tees={course.tees}
            clubName={course.clubName}
            courseName={course.name}
            date={round.date}
            players={[player]}
            readOnly
            hideHeader
          />
        </Paper>
      ))}
    </Stack>
  )
}
