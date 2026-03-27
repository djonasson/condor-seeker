import { useState } from 'react'
import {
  ActionIcon,
  Anchor,
  AppShell,
  Breadcrumbs,
  Button,
  Group,
  Modal,
  Stack,
  Text,
  UnstyledButton,
  useMantineColorScheme,
} from '@mantine/core'
import {
  IconHome2,
  IconGolf,
  IconHistory,
  IconChartBar,
  IconSettings,
  IconPalette,
  IconPlayerPlay,
  IconPlayerStop,
} from '@tabler/icons-react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { InstallPrompt } from '@/components/InstallPrompt'
import { getBreadcrumbs } from '@/lib/route-hierarchy'
import { useRoundStore } from '@/stores/round-store'

function BottomNav() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const isRoundActive = useRoundStore((s) => s.isActive)

  const tabs = [
    { label: t('home'), path: '/', icon: IconHome2 },
    { label: t('round'), path: isRoundActive ? '/round/play' : '/round/new', icon: IconGolf },
    { label: t('history'), path: '/history', icon: IconHistory },
    { label: t('stats'), path: '/stats', icon: IconChartBar },
    { label: t('settings'), path: '/settings', icon: IconSettings },
    ...(import.meta.env.DEV ? [{ label: 'UI', path: '/ui', icon: IconPalette }] : []),
  ]

  return (
    <Group grow gap={0} h="100%">
      {tabs.map((tab) => {
        const isActive =
          tab.path === '/' ? location.pathname === '/' : location.pathname.startsWith(tab.path)
        const Icon = tab.icon
        return (
          <UnstyledButton
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}
            aria-label={tab.label}
          >
            <Icon
              size={22}
              stroke={1.5}
              color={isActive ? 'var(--mantine-primary-color-6)' : 'var(--mantine-color-gray-6)'}
            />
            <Text
              size="xs"
              c={isActive ? 'var(--mantine-primary-color-6)' : 'gray.6'}
              fw={isActive ? 600 : 400}
            >
              {tab.label}
            </Text>
          </UnstyledButton>
        )
      })}
    </Group>
  )
}

function PageBreadcrumbs() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  const breadcrumbs = getBreadcrumbs(location.pathname, t)

  if (breadcrumbs.length <= 1) return null

  return (
    <Breadcrumbs
      mb="xs"
      separatorMargin={4}
      styles={{
        root: { flexWrap: 'nowrap' },
        separator: { color: 'var(--mantine-color-dimmed)' },
      }}
    >
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1
        if (isLast) {
          return (
            <Text key={crumb.path} size="xs" c="dimmed" truncate>
              {crumb.label}
            </Text>
          )
        }
        return (
          <Anchor
            key={crumb.path}
            size="xs"
            c="dimmed"
            underline="hover"
            onClick={(e) => {
              e.preventDefault()
              navigate(crumb.path)
            }}
            truncate
          >
            {crumb.label}
          </Anchor>
        )
      })}
    </Breadcrumbs>
  )
}

function HeaderActions() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const isActive = useRoundStore((s) => s.isActive)
  const clearRound = useRoundStore((s) => s.clearRound)
  const [abandonModalOpen, setAbandonModalOpen] = useState(false)

  if (!isActive) return null

  const onScorecard =
    location.pathname === '/round/play' || location.pathname === '/round/play/table'

  const handleAbandonRound = () => {
    setAbandonModalOpen(false)
    clearRound()
    navigate('/')
  }

  return (
    <>
      <Group gap="xs">
        {!onScorecard && (
          <ActionIcon
            variant="outline"
            color="green"
            size="md"
            aria-label={t('common:continueRound')}
            onClick={() => navigate('/round/play')}
          >
            <IconPlayerPlay size={18} style={{ fill: 'var(--mantine-color-green-6)' }} />
          </ActionIcon>
        )}
        <ActionIcon
          variant="outline"
          color="red"
          size="md"
          aria-label={t('round:abandonRound')}
          onClick={() => setAbandonModalOpen(true)}
        >
          <IconPlayerStop size={18} style={{ fill: 'var(--mantine-color-red-6)' }} />
        </ActionIcon>
      </Group>
      <Modal
        opened={abandonModalOpen}
        onClose={() => setAbandonModalOpen(false)}
        title={t('round:abandonRound')}
        centered
        size="sm"
      >
        <Stack>
          <Text>{t('round:abandonConfirm')}</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setAbandonModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button color="red" onClick={handleAbandonRound}>
              {t('round:abandonRound')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}

export function Layout() {
  const { t } = useTranslation()
  const { colorScheme } = useMantineColorScheme()
  const navigate = useNavigate()

  return (
    <AppShell
      header={{ height: 50 }}
      footer={{ height: 60 }}
      padding="md"
      styles={{
        main: {
          backgroundColor:
            colorScheme === 'dark' ? 'var(--mantine-color-dark-8)' : 'var(--mantine-color-gray-0)',
        },
      }}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Anchor
            fw={700}
            size="lg"
            c="var(--mantine-primary-color-filled)"
            underline="never"
            onClick={(e) => {
              e.preventDefault()
              navigate('/')
            }}
            style={{ cursor: 'pointer' }}
          >
            {t('appName')}
          </Anchor>
          <HeaderActions />
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <InstallPrompt />
        <PageBreadcrumbs />
        <Outlet />
      </AppShell.Main>

      <AppShell.Footer>
        <BottomNav />
      </AppShell.Footer>
    </AppShell>
  )
}
