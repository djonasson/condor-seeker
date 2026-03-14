import { Alert, Button, Group, Text } from '@mantine/core'
import { IconDownload } from '@tabler/icons-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'

export function InstallPrompt() {
  const { t } = useTranslation()
  const { canInstall, promptInstall } = useInstallPrompt()
  const [dismissed, setDismissed] = useState(false)

  if (!canInstall || dismissed) return null

  return (
    <Alert
      variant="light"
      color="green"
      mb="md"
      withCloseButton
      closeButtonLabel={t('common:cancel')}
      onClose={() => setDismissed(true)}
      icon={<IconDownload size={20} />}
    >
      <Group justify="space-between" align="center" wrap="nowrap">
        <Text size="sm">{t('installApp')}</Text>
        <Button size="compact-sm" color="green" onClick={() => void promptInstall()}>
          {t('install')}
        </Button>
      </Group>
    </Alert>
  )
}
