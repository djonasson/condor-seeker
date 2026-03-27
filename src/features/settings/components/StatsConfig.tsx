import { Chip, Group, Stack, Text } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { STAT_CATALOG } from '@/lib/stat-catalog'

type StatsConfigProps = {
  enabledStats: string[]
  onChange: (stats: string[]) => void
}

export function StatsConfig({ enabledStats, onChange }: StatsConfigProps) {
  const { t } = useTranslation('settings')

  const basicStats = STAT_CATALOG.filter((s) => s.tier === 'basic')
  const advancedStats = STAT_CATALOG.filter((s) => s.tier === 'advanced')

  return (
    <div>
      <Text fw={500} mb="xs">
        {t('statsToTrack')}
      </Text>
      <Chip.Group multiple value={enabledStats} onChange={onChange}>
        <Stack gap="sm">
          <div>
            <Text size="xs" c="dimmed" fw={500} mb={4}>
              {t('statTierBasic')}
            </Text>
            <Group gap="xs">
              {basicStats.map((stat) => (
                <Chip key={stat.id} value={stat.id} variant="filled" size="sm">
                  {t(`stat_${stat.id}`)}
                </Chip>
              ))}
            </Group>
          </div>
          <div>
            <Text size="xs" c="dimmed" fw={500} mb={4}>
              {t('statTierAdvanced')}
            </Text>
            <Group gap="xs">
              {advancedStats.map((stat) => (
                <Chip key={stat.id} value={stat.id} variant="filled" size="sm">
                  {t(`stat_${stat.id}`)}
                </Chip>
              ))}
            </Group>
          </div>
        </Stack>
      </Chip.Group>
    </div>
  )
}
