import { Badge, Chip, Group, Stack, Text } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { STAT_CATALOG } from '@/lib/stat-catalog'

type StatsConfigProps = {
  enabledStats: string[]
  onChange: (stats: string[]) => void
}

export function StatsConfig({ enabledStats, onChange }: StatsConfigProps) {
  const { t } = useTranslation('settings')

  return (
    <div>
      <Text fw={500} mb="xs">
        {t('statsToTrack')}
      </Text>
      <Stack gap="xs">
        <Chip.Group multiple value={enabledStats} onChange={onChange}>
          <Group gap="xs">
            {STAT_CATALOG.map((stat) => (
              <Chip key={stat.id} value={stat.id} variant="filled" size="sm">
                <Group gap={4} wrap="nowrap">
                  {t(`stat_${stat.id}`)}
                  <Badge size="xs" variant="light" color={stat.tier === 'basic' ? 'blue' : 'grape'}>
                    {t(stat.tier === 'basic' ? 'statTierBasic' : 'statTierAdvanced')}
                  </Badge>
                </Group>
              </Chip>
            ))}
          </Group>
        </Chip.Group>
      </Stack>
    </div>
  )
}
