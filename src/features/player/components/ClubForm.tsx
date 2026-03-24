import { Button, Group, Modal, NumberInput, Select, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useTranslation } from 'react-i18next'
import { v4 as uuidv4 } from 'uuid'
import type { Club } from '@/storage/types'
import { CLUB_TYPES } from '../types'
import { useAppStore } from '@/stores/app-store'
import { displayDistance, toMeters, getUnitLabel } from '@/lib/distance'

interface ClubFormProps {
  opened: boolean
  onClose: () => void
  onSave: (club: Club) => void
  initialValues?: Club
}

export function ClubForm({ opened, onClose, onSave, initialValues }: ClubFormProps) {
  const { t } = useTranslation()
  const distanceUnit = useAppStore((s) => s.distanceUnit)
  const unitLabel = getUnitLabel(distanceUnit)

  const form = useForm({
    initialValues: {
      type: initialValues?.type ?? '',
      brand: initialValues?.brand ?? '',
      carryDistance: initialValues ? displayDistance(initialValues.carryDistance, distanceUnit) : 0,
    },
    validate: {
      type: (value) => (value ? null : 'Club type is required'),
    },
  })

  const handleSubmit = form.onSubmit((values) => {
    onSave({
      id: initialValues?.id ?? uuidv4(),
      type: values.type,
      brand: values.brand,
      carryDistance: toMeters(values.carryDistance, distanceUnit),
    })
    form.reset()
    onClose()
  })

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={initialValues ? t('player:editClub') : t('player:addClub')}
    >
      <form onSubmit={handleSubmit}>
        <Select
          label={t('player:clubType')}
          data={CLUB_TYPES.map((c) => ({ value: c, label: c }))}
          {...form.getInputProps('type')}
          mb="sm"
        />
        <TextInput label={t('player:clubBrand')} {...form.getInputProps('brand')} mb="sm" />
        <NumberInput
          label={`${t('player:carryDistance')} (${unitLabel})`}
          min={0}
          max={400}
          {...form.getInputProps('carryDistance')}
          mb="md"
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            {t('common:cancel', 'Cancel')}
          </Button>
          <Button type="submit">{t('common:save', 'Save')}</Button>
        </Group>
      </form>
    </Modal>
  )
}
