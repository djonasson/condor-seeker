import { Table, Text, UnstyledButton } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import type { HoleResult, RoundTotal } from '@/features/round/types'
import type { Hole } from '@/storage/types'

type PlayerColumn = {
  playerId: string
  playerName: string
  teeId: string
  holeResults: HoleResult[]
  total: RoundTotal
}

type ScorecardTableProps = {
  holes: Hole[]
  players: PlayerColumn[]
  readOnly?: boolean
  onCellClick?: (playerId: string, holeNumber: number) => void
}

function getSubtotal(
  results: HoleResult[],
  from: number,
  to: number,
): { gross: number; net: number } {
  let gross = 0
  let net = 0
  for (const r of results) {
    if (r.holeNumber >= from && r.holeNumber <= to) {
      gross += r.grossScore
      net += r.netScore
    }
  }
  return { gross, net }
}

function getParSubtotal(holes: Hole[], teeId: string, from: number, to: number): number {
  return holes
    .filter((h) => h.number >= from && h.number <= to)
    .reduce((sum, h) => sum + (h.parByTee[teeId] ?? 0), 0)
}

export function ScorecardTable({
  holes,
  players,
  readOnly = false,
  onCellClick,
}: ScorecardTableProps) {
  const { t } = useTranslation()
  const sortedHoles = holes.slice().sort((a, b) => a.number - b.number)
  const has18 = sortedHoles.length >= 18
  const firstTeeId = players[0]?.teeId ?? ''

  const renderCell = (playerId: string, holeNumber: number, value: string | number) => {
    if (readOnly || !onCellClick) {
      return (
        <Table.Td key={`${playerId}-${holeNumber}`} ta="center">
          <Text size="xs">{value || '-'}</Text>
        </Table.Td>
      )
    }

    return (
      <Table.Td key={`${playerId}-${holeNumber}`} ta="center" p={0}>
        <UnstyledButton
          onClick={() => onCellClick(playerId, holeNumber)}
          w="100%"
          p={4}
          style={{ minHeight: 28 }}
        >
          <Text size="xs">{value || '-'}</Text>
        </UnstyledButton>
      </Table.Td>
    )
  }

  const renderSubtotalRow = (label: string, from: number, to: number) => (
    <Table.Tr key={label} bg="var(--mantine-color-gray-light)">
      <Table.Td>
        <Text size="xs" fw={700}>
          {label}
        </Text>
      </Table.Td>
      <Table.Td ta="center">
        <Text size="xs" fw={700}>
          {getParSubtotal(sortedHoles, firstTeeId, from, to)}
        </Text>
      </Table.Td>
      {players.flatMap((player) => {
        const sub = getSubtotal(player.holeResults, from, to)
        return [
          <Table.Td key={`${player.playerId}-${label}-g`} ta="center">
            <Text size="xs" fw={700}>
              {sub.gross || '-'}
            </Text>
          </Table.Td>,
          <Table.Td key={`${player.playerId}-${label}-n`} ta="center">
            <Text size="xs" fw={700}>
              {sub.net || '-'}
            </Text>
          </Table.Td>,
        ]
      })}
    </Table.Tr>
  )

  return (
    <Table.ScrollContainer minWidth={300}>
      <Table striped highlightOnHover={!readOnly} withTableBorder withColumnBorders fz="xs">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>
              <Text size="xs" fw={700}>
                {t('round:hole')}
              </Text>
            </Table.Th>
            <Table.Th ta="center">
              <Text size="xs" fw={700}>
                {t('round:par')}
              </Text>
            </Table.Th>
            {players.map((player) => (
              <Table.Th key={player.playerId} colSpan={2} ta="center">
                <Text size="xs" fw={700}>
                  {player.playerName}
                </Text>
              </Table.Th>
            ))}
          </Table.Tr>
          <Table.Tr>
            <Table.Th />
            <Table.Th />
            {players.map((player) => [
              <Table.Th key={`${player.playerId}-g`} ta="center">
                <Text size="xs" c="dimmed">
                  {t('round:gross')}
                </Text>
              </Table.Th>,
              <Table.Th key={`${player.playerId}-n`} ta="center">
                <Text size="xs" c="dimmed">
                  {t('round:net')}
                </Text>
              </Table.Th>,
            ])}
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {sortedHoles.slice(0, 9).map((hole) => (
            <Table.Tr key={hole.number}>
              <Table.Td>
                <Text size="xs">{hole.number}</Text>
              </Table.Td>
              <Table.Td ta="center">
                <Text size="xs">{hole.parByTee[firstTeeId] ?? '-'}</Text>
              </Table.Td>
              {players.flatMap((player) => {
                const result = player.holeResults.find((r) => r.holeNumber === hole.number)
                return [
                  renderCell(player.playerId, hole.number, result?.grossScore ?? ''),
                  <Table.Td key={`${player.playerId}-${hole.number}-n`} ta="center">
                    <Text size="xs">{result?.netScore ?? '-'}</Text>
                  </Table.Td>,
                ]
              })}
            </Table.Tr>
          ))}

          {sortedHoles.length >= 9 && renderSubtotalRow(t('round:front9'), 1, 9)}

          {has18 &&
            sortedHoles.slice(9, 18).map((hole) => (
              <Table.Tr key={hole.number}>
                <Table.Td>
                  <Text size="xs">{hole.number}</Text>
                </Table.Td>
                <Table.Td ta="center">
                  <Text size="xs">{hole.parByTee[firstTeeId] ?? '-'}</Text>
                </Table.Td>
                {players.flatMap((player) => {
                  const result = player.holeResults.find((r) => r.holeNumber === hole.number)
                  return [
                    renderCell(player.playerId, hole.number, result?.grossScore ?? ''),
                    <Table.Td key={`${player.playerId}-${hole.number}-n`} ta="center">
                      <Text size="xs">{result?.netScore ?? '-'}</Text>
                    </Table.Td>,
                  ]
                })}
              </Table.Tr>
            ))}

          {has18 && renderSubtotalRow(t('round:back9'), 10, 18)}

          <Table.Tr bg="var(--mantine-color-gray-light)">
            <Table.Td>
              <Text size="xs" fw={700}>
                {t('round:total')}
              </Text>
            </Table.Td>
            <Table.Td ta="center">
              <Text size="xs" fw={700}>
                {getParSubtotal(sortedHoles, firstTeeId, 1, sortedHoles.length)}
              </Text>
            </Table.Td>
            {players.flatMap((player) => [
              <Table.Td key={`${player.playerId}-total-g`} ta="center">
                <Text size="xs" fw={700}>
                  {player.total.totalGross || '-'}
                </Text>
              </Table.Td>,
              <Table.Td key={`${player.playerId}-total-n`} ta="center">
                <Text size="xs" fw={700}>
                  {player.total.totalNet || '-'}
                </Text>
              </Table.Td>,
            ])}
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  )
}
