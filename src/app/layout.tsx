import {
  ActionIcon,
  Anchor,
  AppShell,
  Breadcrumbs,
  Group,
  Text,
  UnstyledButton,
  useMantineColorScheme,
} from '@mantine/core'
import {
  IconArrowLeft,
  IconHome2,
  IconGolf,
  IconHistory,
  IconChartBar,
  IconSettings,
} from '@tabler/icons-react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { InstallPrompt } from '@/components/InstallPrompt'
import { getParentRoute, getBreadcrumbs } from '@/lib/route-hierarchy'

function BottomNav() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  const tabs = [
    { label: t('home'), path: '/', icon: IconHome2 },
    { label: t('round'), path: '/round/new', icon: IconGolf },
    { label: t('history'), path: '/history', icon: IconHistory },
    { label: t('stats'), path: '/stats', icon: IconChartBar },
    { label: t('settings'), path: '/settings', icon: IconSettings },
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
              color={isActive ? 'var(--mantine-color-green-6)' : 'var(--mantine-color-gray-6)'}
            />
            <Text size="xs" c={isActive ? 'green.6' : 'gray.6'} fw={isActive ? 600 : 400}>
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

export function Layout() {
  const { t } = useTranslation()
  const { colorScheme } = useMantineColorScheme()
  const navigate = useNavigate()
  const location = useLocation()

  const isHome = location.pathname === '/'
  const parentRoute = getParentRoute(location.pathname)

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
        <Group h="100%" px="md">
          {!isHome && parentRoute !== null && (
            <ActionIcon
              variant="subtle"
              color="green"
              onClick={() => navigate(parentRoute)}
              aria-label={t('common:back')}
            >
              <IconArrowLeft size={20} stroke={1.5} />
            </ActionIcon>
          )}
          <Text fw={700} size="lg" c="green">
            {t('appName')}
          </Text>
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
