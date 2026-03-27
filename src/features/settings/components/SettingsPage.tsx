import {
  Button,
  ColorSwatch,
  Divider,
  Paper,
  Title,
  Stack,
  SegmentedControl,
  Select,
  Tabs,
  Text,
  UnstyledButton,
  Group,
  PasswordInput,
  Anchor,
  useMantineTheme,
} from '@mantine/core'
import { IconCheck } from '@tabler/icons-react'
import { useMantineColorScheme } from '@mantine/core'
import { IconChevronRight, IconUsers, IconGolf, IconDatabaseExport } from '@tabler/icons-react'

const PRIMARY_COLOR_OPTIONS = [
  'red',
  'pink',
  'grape',
  'violet',
  'indigo',
  'blue',
  'cyan',
  'teal',
  'green',
  'lime',
  'yellow',
  'orange',
] as const
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useStorage } from '@/hooks/useStorage'
import { useAppStore } from '@/stores/app-store'
import { StatsConfig } from './StatsConfig'

export default function SettingsPage() {
  const { t } = useTranslation('settings')
  const { t: tCommon } = useTranslation('common')
  const storage = useStorage()
  const navigate = useNavigate()
  const { setColorScheme } = useMantineColorScheme()
  const { i18n } = useTranslation()

  const [apiKey, setApiKey] = useState('')

  const mantineTheme = useMantineTheme()
  const theme = useAppStore((s) => s.theme)
  const primaryColor = useAppStore((s) => s.primaryColor)
  const distanceUnit = useAppStore((s) => s.distanceUnit)
  const temperatureUnit = useAppStore((s) => s.temperatureUnit)
  const language = useAppStore((s) => s.language)

  const setTheme = useAppStore((s) => s.setTheme)
  const setPrimaryColor = useAppStore((s) => s.setPrimaryColor)
  const setDistanceUnit = useAppStore((s) => s.setDistanceUnit)
  const setTemperatureUnit = useAppStore((s) => s.setTemperatureUnit)
  const setLanguage = useAppStore((s) => s.setLanguage)
  const enabledStats = useAppStore((s) => s.enabledStats)
  const setEnabledStats = useAppStore((s) => s.setEnabledStats)

  useEffect(() => {
    void storage.getSettings().then((s) => setApiKey(s.golfCourseApiKey))
  }, [storage])

  async function saveApiKey() {
    const current = await storage.getSettings()
    await storage.saveSettings({ ...current, golfCourseApiKey: apiKey })
  }

  async function saveSettings(
    patch: Partial<{
      theme: 'light' | 'dark'
      primaryColor: string
      distanceUnit: 'meters' | 'yards'
      temperatureUnit: 'celsius' | 'fahrenheit'
      language: string
      enabledStats: string[]
    }>,
  ) {
    const current = await storage.getSettings()
    await storage.saveSettings({ ...current, ...patch })
  }

  function handleThemeChange(value: string) {
    const next = value as 'light' | 'dark'
    setTheme(next)
    setColorScheme(next)
    void saveSettings({ theme: next })
  }

  function handlePrimaryColorChange(color: string) {
    setPrimaryColor(color)
    void saveSettings({ primaryColor: color })
  }

  function handleDistanceUnitChange(value: string) {
    const next = value as 'meters' | 'yards'
    setDistanceUnit(next)
    void saveSettings({ distanceUnit: next })
  }

  function handleTemperatureUnitChange(value: string) {
    const next = value as 'celsius' | 'fahrenheit'
    setTemperatureUnit(next)
    void saveSettings({ temperatureUnit: next })
  }

  function handleLanguageChange(value: string | null) {
    if (!value) return
    setLanguage(value)
    void i18n.changeLanguage(value)
    void saveSettings({ language: value })
  }

  function handleEnabledStatsChange(stats: string[]) {
    setEnabledStats(stats)
    void saveSettings({ enabledStats: stats })
  }

  return (
    <Stack gap="md">
      <Title order={2}>{t('title')}</Title>

      <Paper withBorder radius="sm" p="md">
        <Tabs defaultValue="general">
          <Tabs.List grow>
            <Tabs.Tab value="general">{t('tabGeneral')}</Tabs.Tab>
            <Tabs.Tab value="scoring">{t('tabScoring')}</Tabs.Tab>
            <Tabs.Tab value="data">{t('tabData')}</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="general" pt="md">
            <Stack gap="lg">
              <div>
                <Text fw={500} mb="xs">
                  {t('theme')}
                </Text>
                <SegmentedControl
                  value={theme}
                  onChange={handleThemeChange}
                  data={[
                    { label: t('light'), value: 'light' },
                    { label: t('dark'), value: 'dark' },
                  ]}
                  fullWidth
                />
              </div>

              <div>
                <Text fw={500} mb="xs">
                  {t('primaryColor')}
                </Text>
                <Group gap="xs">
                  {PRIMARY_COLOR_OPTIONS.map((color) => (
                    <UnstyledButton key={color} onClick={() => handlePrimaryColorChange(color)}>
                      <ColorSwatch
                        color={mantineTheme.colors[color]?.[6] ?? color}
                        size={32}
                        style={{ cursor: 'pointer' }}
                      >
                        {primaryColor === color && <IconCheck size={16} color="white" />}
                      </ColorSwatch>
                    </UnstyledButton>
                  ))}
                </Group>
              </div>

              <div>
                <Text fw={500} mb="xs">
                  {t('language')}
                </Text>
                <Select
                  value={language}
                  onChange={handleLanguageChange}
                  data={[{ label: 'English', value: 'en' }]}
                />
              </div>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="scoring" pt="md">
            <Stack gap="lg">
              <StatsConfig enabledStats={enabledStats} onChange={handleEnabledStatsChange} />

              <div>
                <Text fw={500} mb="xs">
                  {t('distanceUnit')}
                </Text>
                <SegmentedControl
                  value={distanceUnit}
                  onChange={handleDistanceUnitChange}
                  data={[
                    { label: t('meters'), value: 'meters' },
                    { label: t('yards'), value: 'yards' },
                  ]}
                  fullWidth
                />
              </div>

              <div>
                <Text fw={500} mb="xs">
                  {t('temperatureUnit')}
                </Text>
                <SegmentedControl
                  value={temperatureUnit}
                  onChange={handleTemperatureUnitChange}
                  data={[
                    { label: t('celsius'), value: 'celsius' },
                    { label: t('fahrenheit'), value: 'fahrenheit' },
                  ]}
                  fullWidth
                />
              </div>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="data" pt="md">
            <Stack gap="lg">
              <div>
                <Text fw={500} mb="xs">
                  {t('manage')}
                </Text>
                <Stack gap="xs">
                  <UnstyledButton
                    onClick={() => navigate('/player')}
                    style={{
                      padding: 'var(--mantine-spacing-sm)',
                      borderRadius: 'var(--mantine-radius-sm)',
                      border: '1px solid var(--mantine-color-default-border)',
                    }}
                  >
                    <Group justify="space-between">
                      <Group gap="sm">
                        <IconUsers size={20} stroke={1.5} />
                        <Text>{tCommon('managePlayers')}</Text>
                      </Group>
                      <IconChevronRight
                        size={16}
                        stroke={1.5}
                        color="var(--mantine-color-dimmed)"
                      />
                    </Group>
                  </UnstyledButton>
                  <UnstyledButton
                    onClick={() => navigate('/course')}
                    style={{
                      padding: 'var(--mantine-spacing-sm)',
                      borderRadius: 'var(--mantine-radius-sm)',
                      border: '1px solid var(--mantine-color-default-border)',
                    }}
                  >
                    <Group justify="space-between">
                      <Group gap="sm">
                        <IconGolf size={20} stroke={1.5} />
                        <Text>{tCommon('manageCourses')}</Text>
                      </Group>
                      <IconChevronRight
                        size={16}
                        stroke={1.5}
                        color="var(--mantine-color-dimmed)"
                      />
                    </Group>
                  </UnstyledButton>
                  <UnstyledButton
                    onClick={() => navigate('/import-export')}
                    style={{
                      padding: 'var(--mantine-spacing-sm)',
                      borderRadius: 'var(--mantine-radius-sm)',
                      border: '1px solid var(--mantine-color-default-border)',
                    }}
                  >
                    <Group justify="space-between">
                      <Group gap="sm">
                        <IconDatabaseExport size={20} stroke={1.5} />
                        <Text>{tCommon('importExport')}</Text>
                      </Group>
                      <IconChevronRight
                        size={16}
                        stroke={1.5}
                        color="var(--mantine-color-dimmed)"
                      />
                    </Group>
                  </UnstyledButton>
                </Stack>
              </div>

              <div>
                <Text fw={500} mb="xs">
                  {t('apiSection')}
                </Text>
                <PasswordInput
                  label={t('apiKey')}
                  description={
                    <>
                      {t('apiKeyHelper')}{' '}
                      <Anchor href="https://golfcourseapi.com/" target="_blank" size="xs">
                        golfcourseapi.com
                      </Anchor>
                    </>
                  }
                  placeholder={t('apiKeyPlaceholder')}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.currentTarget.value)}
                  onBlur={() => void saveApiKey()}
                />
              </div>

              {import.meta.env.DEV && (
                <>
                  <Divider />
                  <div>
                    <Text fw={500} mb="xs" c="orange">
                      {t('developer', 'Developer')}
                    </Text>
                    <Button
                      variant="light"
                      color="orange"
                      fullWidth
                      onClick={() => {
                        void import('@/lib/seed-data').then(async ({ SEED_DATA }) => {
                          await storage.importAll(SEED_DATA)
                          window.location.reload()
                        })
                      }}
                    >
                      {t('seedData', 'Load Sample Data')}
                    </Button>
                  </div>
                </>
              )}
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </Stack>
  )
}
