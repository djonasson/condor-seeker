import { Table, NumberInput, ScrollArea, Text } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { displayDistance, toMeters, getUnitLabel } from '@/lib/distance'

interface TeeInfo {
  id: string
  name: string
}

interface HoleData {
  number: number
  parByTee: Record<string, number>
  handicapByTee: Record<string, number>
  distanceByTee: Record<string, number>
}

interface HoleDataTableProps {
  holes: HoleData[]
  tees: TeeInfo[]
  onUpdateHole: (holeNumber: number, field: string, value: number, teeId?: string) => void
  distanceUnit: 'meters' | 'yards'
}

export function HoleDataTable({ holes, tees, onUpdateHole, distanceUnit }: HoleDataTableProps) {
  const { t } = useTranslation()
  const unitLabel = getUnitLabel(distanceUnit)

  return (
    <ScrollArea>
      <Table striped highlightOnHover withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ minWidth: 50 }}>{t('course:hole')}</Table.Th>
            {tees.map((tee) => (
              <Table.Th key={`par-${tee.id}`} style={{ minWidth: 70 }}>
                <Text size="xs">
                  {t('course:par')} ({tee.name})
                </Text>
              </Table.Th>
            ))}
            {tees.map((tee) => (
              <Table.Th key={`hcp-${tee.id}`} style={{ minWidth: 70 }}>
                <Text size="xs">
                  {t('course:handicap')} ({tee.name})
                </Text>
              </Table.Th>
            ))}
            {tees.map((tee) => (
              <Table.Th key={`dist-${tee.id}`} style={{ minWidth: 80 }}>
                <Text size="xs">
                  {t('course:distance')} ({tee.name}) ({unitLabel})
                </Text>
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {holes.map((hole) => (
            <Table.Tr key={hole.number}>
              <Table.Td>
                <Text fw={600} ta="center">
                  {hole.number}
                </Text>
              </Table.Td>
              {tees.map((tee) => (
                <Table.Td key={`par-${tee.id}-${hole.number}`} p={2}>
                  <NumberInput
                    size="xs"
                    min={3}
                    max={6}
                    value={hole.parByTee[tee.id] ?? 4}
                    onChange={(val) =>
                      onUpdateHole(hole.number, 'par', typeof val === 'number' ? val : 4, tee.id)
                    }
                    hideControls
                    styles={{ input: { textAlign: 'center', padding: 4 } }}
                  />
                </Table.Td>
              ))}
              {tees.map((tee) => (
                <Table.Td key={`hcp-${tee.id}-${hole.number}`} p={2}>
                  <NumberInput
                    size="xs"
                    min={1}
                    max={18}
                    value={hole.handicapByTee[tee.id] ?? 1}
                    onChange={(val) =>
                      onUpdateHole(
                        hole.number,
                        'handicap',
                        typeof val === 'number' ? val : 1,
                        tee.id,
                      )
                    }
                    hideControls
                    styles={{ input: { textAlign: 'center', padding: 4 } }}
                  />
                </Table.Td>
              ))}
              {tees.map((tee) => (
                <Table.Td key={`dist-${tee.id}-${hole.number}`} p={2}>
                  <NumberInput
                    size="xs"
                    min={0}
                    max={700}
                    value={displayDistance(hole.distanceByTee[tee.id] ?? 0, distanceUnit)}
                    onChange={(val) =>
                      onUpdateHole(
                        hole.number,
                        'distance',
                        toMeters(typeof val === 'number' ? val : 0, distanceUnit),
                        tee.id,
                      )
                    }
                    hideControls
                    styles={{ input: { textAlign: 'center', padding: 4 } }}
                  />
                </Table.Td>
              ))}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  )
}
