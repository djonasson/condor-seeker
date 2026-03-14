import {
  Button,
  Card,
  FileInput,
  Group,
  List,
  LoadingOverlay,
  Modal,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useExport } from '../hooks/useExport'
import { useImport } from '../hooks/useImport'

export default function ImportExportPage() {
  const { t } = useTranslation('import-export')
  const { exportData, loading: exportLoading } = useExport()
  const { loadPreview, importData, loading: importLoading, error, preview, reset } = useImport()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [exportDone, setExportDone] = useState(false)
  const [importDone, setImportDone] = useState(false)

  const handleFileChange = (file: File | null) => {
    reset()
    setImportDone(false)
    if (file) {
      void loadPreview(file)
    }
  }

  const handleExport = async () => {
    await exportData()
    setExportDone(true)
  }

  const handleImport = async () => {
    await importData()
    setConfirmOpen(false)
    setImportDone(true)
  }

  return (
    <Stack pos="relative" gap="lg">
      <LoadingOverlay visible={exportLoading || importLoading} />
      <Title order={2}>{t('title')}</Title>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Title order={3} mb="sm">
          {t('export')}
        </Title>
        <Text c="dimmed" mb="md">
          {t('exportDescription')}
        </Text>
        <Button onClick={() => void handleExport()} loading={exportLoading}>
          {t('export')}
        </Button>
        {exportDone && (
          <Text c="green" mt="sm">
            {t('exportSuccess')}
          </Text>
        )}
      </Card>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Title order={3} mb="sm">
          {t('import')}
        </Title>
        <Text c="dimmed" mb="md">
          {t('importDescription')}
        </Text>

        <FileInput label={t('selectFile')} accept=".json" onChange={handleFileChange} mb="md" />

        {error && (
          <Text c="red" mb="md">
            {t('importError')}
          </Text>
        )}

        {preview && (
          <Card withBorder padding="sm" mb="md">
            <Text fw={500} mb="xs">
              {t('preview')}
            </Text>
            <List>
              <List.Item>{t('previewCourses', { count: preview.courses })}</List.Item>
              <List.Item>{t('previewPlayers', { count: preview.players })}</List.Item>
              <List.Item>{t('previewRounds', { count: preview.rounds })}</List.Item>
            </List>
          </Card>
        )}

        <Button disabled={!preview} onClick={() => setConfirmOpen(true)}>
          {t('import')}
        </Button>

        {importDone && (
          <Text c="green" mt="sm">
            {t('importSuccess')}
          </Text>
        )}
      </Card>

      <Modal opened={confirmOpen} onClose={() => setConfirmOpen(false)} title={t('confirmTitle')}>
        <Text mb="lg">{t('importConfirm')}</Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setConfirmOpen(false)}>
            {t('cancel')}
          </Button>
          <Button color="red" onClick={() => void handleImport()} loading={importLoading}>
            {t('confirm')}
          </Button>
        </Group>
      </Modal>
    </Stack>
  )
}
