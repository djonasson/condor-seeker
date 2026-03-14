import {
  Container,
  Divider,
  Title,
  Stack,
  SegmentedControl,
  Select,
  Text,
  UnstyledButton,
  Group,
} from '@mantine/core'
import { useMantineColorScheme } from '@mantine/core'
import { IconChevronRight, IconUsers, IconGolf } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useStorage } from '@/hooks/useStorage'
import { useAppStore } from '@/stores/app-store'

export default function SettingsPage() {
  const { t } = useTranslation('settings')
  const { t: tCommon } = useTranslation('common')
  const storage = useStorage()
  const navigate = useNavigate()
  const { setColorScheme } = useMantineColorScheme()
  const { i18n } = useTranslation()

  const theme = useAppStore((s) => s.theme)
  const distanceUnit = useAppStore((s) => s.distanceUnit)
  const temperatureUnit = useAppStore((s) => s.temperatureUnit)
  const language = useAppStore((s) => s.language)

  const setTheme = useAppStore((s) => s.setTheme)
  const setDistanceUnit = useAppStore((s) => s.setDistanceUnit)
  const setTemperatureUnit = useAppStore((s) => s.setTemperatureUnit)
  const setLanguage = useAppStore((s) => s.setLanguage)

  async function saveSettings(
    patch: Partial<{
      theme: 'light' | 'dark'
      distanceUnit: 'meters' | 'yards'
      temperatureUnit: 'celsius' | 'fahrenheit'
      language: string
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

  return (
    <Container size="sm" py="xl">
      <Title order={2} mb="lg">
        {t('title')}
      </Title>

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

        <div>
          <Select
            label={t('language')}
            value={language}
            onChange={handleLanguageChange}
            data={[{ label: 'English', value: 'en' }]}
          />
        </div>

        <Divider />

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
                <IconChevronRight size={16} stroke={1.5} color="var(--mantine-color-dimmed)" />
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
                <IconChevronRight size={16} stroke={1.5} color="var(--mantine-color-dimmed)" />
              </Group>
            </UnstyledButton>
          </Stack>
        </div>
      </Stack>
    </Container>
  )
}
