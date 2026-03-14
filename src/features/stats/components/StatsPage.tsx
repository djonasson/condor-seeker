import { Group, LoadingOverlay, Select, SimpleGrid, Stack, Table, Text, Title } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { useStats } from '../hooks/useStats'
import { StatCard } from './StatCard'
import { StatsChart } from './StatsChart'
import type { DateRangeOption } from '../hooks/useStats'

export default function StatsPage() {
  const { t } = useTranslation('stats')
  const { stats, loading, filters, setFilters, courses } = useStats()

  const dateRangeOptions = [
    { value: 'last30', label: t('last30') },
    { value: 'last90', label: t('last90') },
    { value: 'all', label: t('allTime') },
  ]

  const courseOptions = [
    { value: '', label: t('allCourses') },
    ...courses.map((c) => ({ value: c.id, label: c.name })),
  ]

  return (
    <Stack pos="relative" gap="lg">
      <LoadingOverlay visible={loading} />
      <Title order={2}>{t('title')}</Title>

      <Group>
        <Select
          label={t('dateRange')}
          data={dateRangeOptions}
          value={filters.dateRange}
          onChange={(val) => setFilters({ dateRange: (val ?? 'all') as DateRangeOption })}
          allowDeselect={false}
        />
        <Select
          label={t('courseFilter')}
          data={courseOptions}
          value={filters.courseId ?? ''}
          onChange={(val) => setFilters({ courseId: val || null })}
          allowDeselect={false}
        />
      </Group>

      {stats.roundsPlayed === 0 ? (
        <Text c="dimmed">{t('noStats')}</Text>
      ) : (
        <>
          <SimpleGrid cols={{ base: 2, sm: 3, md: 6 }}>
            <StatCard label={t('scoringAvg')} value={stats.scoringAvg ?? '-'} />
            <StatCard label={t('puttsAvg')} value={stats.puttsAvg ?? '-'} />
            <StatCard
              label={t('firPercent')}
              value={stats.firPercent != null ? `${stats.firPercent}%` : '-'}
            />
            <StatCard
              label={t('girPercent')}
              value={stats.girPercent != null ? `${stats.girPercent}%` : '-'}
            />
            <StatCard label={t('bestRound')} value={stats.bestRound ?? '-'} />
            <StatCard label={t('roundsPlayed')} value={stats.roundsPlayed} />
          </SimpleGrid>

          <Title order={3}>{t('trends')}</Title>
          <StatsChart data={stats.scoringTrend} />

          {stats.courseBreakdown.length > 1 && (
            <>
              <Title order={3}>{t('courseBreakdown')}</Title>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{t('course')}</Table.Th>
                    <Table.Th>{t('rounds')}</Table.Th>
                    <Table.Th>{t('avgScore')}</Table.Th>
                    <Table.Th>{t('bestRound')}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {stats.courseBreakdown.map((cs) => (
                    <Table.Tr key={cs.courseId}>
                      <Table.Td>{cs.courseName}</Table.Td>
                      <Table.Td>{cs.roundsPlayed}</Table.Td>
                      <Table.Td>{cs.scoringAvg.toFixed(1)}</Table.Td>
                      <Table.Td>{cs.bestRound}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </>
          )}

          {stats.holeAverages.length > 0 && (
            <>
              <Title order={3}>{t('holeAverages')}</Title>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{t('hole')}</Table.Th>
                    <Table.Th>{t('par')}</Table.Th>
                    <Table.Th>{t('avg')}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {stats.holeAverages.map((ha) => (
                    <Table.Tr key={ha.holeNumber}>
                      <Table.Td>{ha.holeNumber}</Table.Td>
                      <Table.Td>{ha.par}</Table.Td>
                      <Table.Td>{ha.avgScore.toFixed(1)}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </>
          )}
        </>
      )}
    </Stack>
  )
}
