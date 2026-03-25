import { Box, Group, Paper, Stack, Table, Text } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { ScoreBadge } from './ScoreBadge'
import type { HoleResult, RoundTotal } from '@/features/round/types'
import type { Hole, Tee } from '@/storage/types'

type PlayerData = {
  playerId: string
  playerName: string
  teeId: string
  holeResults: HoleResult[]
  total: RoundTotal
}

type TraditionalScorecardProps = {
  holes: Hole[]
  players: PlayerData[]
  tees: Tee[]
  clubName?: string
  courseName: string
  date?: string
  readOnly?: boolean
  onCellClick?: (playerId: string, holeNumber: number) => void
}

function getSubtotal(results: HoleResult[], from: number, to: number): number {
  let gross = 0
  for (const r of results) {
    if (r.holeNumber >= from && r.holeNumber <= to) {
      gross += r.grossScore
    }
  }
  return gross
}

function getNetSubtotal(results: HoleResult[], from: number, to: number): number {
  let net = 0
  for (const r of results) {
    if (r.holeNumber >= from && r.holeNumber <= to) {
      net += r.netScore
    }
  }
  return net
}

function getParSubtotal(holes: Hole[], teeId: string, from: number, to: number): number {
  return holes
    .filter((h) => h.number >= from && h.number <= to)
    .reduce((sum, h) => sum + (h.parByTee[teeId] ?? 0), 0)
}

function NineHoleSection({
  label,
  totalLabel,
  holes,
  players,
  readOnly,
  onCellClick,
  t,
}: {
  label: string
  totalLabel: string
  holes: Hole[]
  players: PlayerData[]
  readOnly: boolean
  onCellClick?: (playerId: string, holeNumber: number) => void
  t: (key: string) => string
}) {
  const sortedHoles = holes.slice().sort((a, b) => a.number - b.number)
  const firstTeeId = players[0]?.teeId ?? ''
  const from = sortedHoles[0]?.number ?? 1
  const to = sortedHoles[sortedHoles.length - 1]?.number ?? 9

  const headerBg = 'var(--mantine-color-green-7)'
  const headerColor = 'white'

  return (
    <Table.ScrollContainer minWidth={400}>
      <Table
        withTableBorder
        withColumnBorders
        fz="xs"
        styles={{
          table: { borderCollapse: 'collapse' },
          th: { padding: '4px 6px' },
          td: { padding: '4px 6px' },
        }}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th bg={headerBg} c={headerColor} style={{ minWidth: 50 }}>
              <Text size="xs" fw={700} c={headerColor}>
                {label}
              </Text>
            </Table.Th>
            {sortedHoles.map((hole) => (
              <Table.Th key={hole.number} bg={headerBg} ta="center">
                <Text size="xs" fw={700} c={headerColor}>
                  {hole.number}
                </Text>
              </Table.Th>
            ))}
            <Table.Th bg={headerBg} ta="center">
              <Text size="xs" fw={700} c={headerColor}>
                {totalLabel}
              </Text>
            </Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {/* HCP row */}
          <Table.Tr>
            <Table.Td>
              <Text size="xs" c="dimmed">
                {t('round:hcp')}
              </Text>
            </Table.Td>
            {sortedHoles.map((hole) => (
              <Table.Td key={hole.number} ta="center">
                <Text size="xs" c="dimmed">
                  {hole.handicapByTee[firstTeeId] ?? '-'}
                </Text>
              </Table.Td>
            ))}
            <Table.Td />
          </Table.Tr>

          {/* Par row */}
          <Table.Tr>
            <Table.Td>
              <Text size="xs">{t('round:par')}</Text>
            </Table.Td>
            {sortedHoles.map((hole) => (
              <Table.Td key={hole.number} ta="center">
                <Text size="xs">{hole.parByTee[firstTeeId] ?? '-'}</Text>
              </Table.Td>
            ))}
            <Table.Td ta="center">
              <Text size="xs" fw={600}>
                {getParSubtotal(sortedHoles, firstTeeId, from, to)}
              </Text>
            </Table.Td>
          </Table.Tr>

          {/* Player score + net rows grouped per player */}
          {players.map((player) => {
            const teeId = player.teeId
            const sub = getSubtotal(player.holeResults, from, to)
            const netSub = getNetSubtotal(player.holeResults, from, to)
            const showName = players.length > 1

            return [
              <Table.Tr key={player.playerId}>
                <Table.Td>
                  <Text size="xs" fw={600}>
                    {showName ? player.playerName : t('round:score')}
                  </Text>
                </Table.Td>
                {sortedHoles.map((hole) => {
                  const result = player.holeResults.find((r) => r.holeNumber === hole.number)
                  const par = hole.parByTee[teeId] ?? hole.parByTee[firstTeeId] ?? 0
                  const gross = result?.grossScore ?? 0

                  return (
                    <Table.Td
                      key={hole.number}
                      ta="center"
                      p={2}
                      style={{ cursor: !readOnly && onCellClick ? 'pointer' : undefined }}
                      onClick={
                        !readOnly && onCellClick
                          ? () => onCellClick(player.playerId, hole.number)
                          : undefined
                      }
                    >
                      <Box style={{ display: 'flex', justifyContent: 'center' }}>
                        <ScoreBadge score={gross} par={par} />
                      </Box>
                    </Table.Td>
                  )
                })}
                <Table.Td ta="center">
                  <Text size="xs" fw={700}>
                    {sub || '-'}
                  </Text>
                </Table.Td>
              </Table.Tr>,
              <Table.Tr key={`${player.playerId}-net`}>
                <Table.Td>
                  <Text size="xs" c="dimmed">
                    {t('round:net')}
                  </Text>
                </Table.Td>
                {sortedHoles.map((hole) => {
                  const result = player.holeResults.find((r) => r.holeNumber === hole.number)
                  return (
                    <Table.Td key={hole.number} ta="center">
                      <Text size="xs" c="dimmed">
                        {result ? result.netScore : '-'}
                      </Text>
                    </Table.Td>
                  )
                })}
                <Table.Td ta="center">
                  <Text size="xs" fw={600} c="dimmed">
                    {netSub || '-'}
                  </Text>
                </Table.Td>
              </Table.Tr>,
            ]
          })}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  )
}

export function TraditionalScorecard({
  holes,
  players,
  tees,
  clubName,
  courseName,
  date,
  readOnly = false,
  onCellClick,
}: TraditionalScorecardProps) {
  const { t } = useTranslation()
  const sortedHoles = holes.slice().sort((a, b) => a.number - b.number)
  const frontNine = sortedHoles.filter((h) => h.number <= 9)
  const backNine = sortedHoles.filter((h) => h.number > 9 && h.number <= 18)
  const has18 = backNine.length > 0
  const firstTeeId = players[0]?.teeId ?? ''
  const tee = tees.find((te) => te.id === firstTeeId)

  const totalPar = getParSubtotal(sortedHoles, firstTeeId, 1, sortedHoles.length)

  return (
    <Stack gap="xs">
      {/* Course header */}
      <Group justify="space-between" align="flex-start">
        <Box>
          {clubName && (
            <Text size="sm" c="dimmed">
              {clubName}
            </Text>
          )}
          <Text size="sm" fw={600}>
            {courseName}
          </Text>
        </Box>
        <Box ta="right">
          {date && (
            <Text size="sm" c="dimmed">
              {new Date(date).toLocaleDateString()}
            </Text>
          )}
          {tee && (
            <Text size="sm" c="dimmed">
              {tee.name}
            </Text>
          )}
        </Box>
      </Group>

      {/* Player info */}
      {players.map((player) => (
        <Text key={player.playerId} size="sm" fw={600}>
          {player.playerName}
        </Text>
      ))}

      {/* Front nine */}
      {frontNine.length > 0 && (
        <NineHoleSection
          label={t('round:hole')}
          totalLabel={t('round:out')}
          holes={frontNine}
          players={players}
          readOnly={readOnly}
          onCellClick={onCellClick}
          t={t}
        />
      )}

      {/* Back nine */}
      {has18 && (
        <NineHoleSection
          label={t('round:hole')}
          totalLabel={t('round:in')}
          holes={backNine}
          players={players}
          readOnly={readOnly}
          onCellClick={onCellClick}
          t={t}
        />
      )}

      {/* Course info footer */}
      {tee && (
        <Paper withBorder p="xs" radius="md">
          <Group justify="space-around" gap="xs">
            <Text size="sm">
              {t('round:courseRating')} {tee.courseRating}
            </Text>
            <Text size="sm">
              {t('round:score')}{' '}
              <Text span fw={700}>
                {players[0]?.total.totalGross || '-'}/{totalPar}
              </Text>
            </Text>
            <Text size="sm">
              {t('round:slope')} {tee.slopeRating}
            </Text>
          </Group>
        </Paper>
      )}
    </Stack>
  )
}
