import { Table, NumberInput, ScrollArea, Text } from '@mantine/core'
import { useTranslation } from 'react-i18next'

interface TeeInfo {
  id: string
  name: string
}

interface HoleData {
  number: number
  parByTee: Record<string, number>
  handicap: number
  distanceByTee: Record<string, number>
}

interface HoleDataTableProps {
  holes: HoleData[]
  tees: TeeInfo[]
  onUpdateHole: (holeNumber: number, field: string, value: number, teeId?: string) => void
}

export function HoleDataTable({ holes, tees, onUpdateHole }: HoleDataTableProps) {
  const { t } = useTranslation()

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
            <Table.Th style={{ minWidth: 60 }}>{t('course:handicap')}</Table.Th>
            {tees.map((tee) => (
              <Table.Th key={`dist-${tee.id}`} style={{ minWidth: 80 }}>
                <Text size="xs">
                  {t('course:distance')} ({tee.name})
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
              <Table.Td p={2}>
                <NumberInput
                  size="xs"
                  min={1}
                  max={18}
                  value={hole.handicap}
                  onChange={(val) =>
                    onUpdateHole(hole.number, 'handicap', typeof val === 'number' ? val : 1)
                  }
                  hideControls
                  styles={{ input: { textAlign: 'center', padding: 4 } }}
                />
              </Table.Td>
              {tees.map((tee) => (
                <Table.Td key={`dist-${tee.id}-${hole.number}`} p={2}>
                  <NumberInput
                    size="xs"
                    min={0}
                    max={700}
                    value={hole.distanceByTee[tee.id] ?? 0}
                    onChange={(val) =>
                      onUpdateHole(
                        hole.number,
                        'distance',
                        typeof val === 'number' ? val : 0,
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
