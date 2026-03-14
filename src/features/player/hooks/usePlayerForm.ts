import { useForm } from '@mantine/form'
import type { Player } from '@/storage/types'

interface PlayerFormValues {
  name: string
  handicapIndex: number
  gender: string
}

export function usePlayerForm(initialValues?: Partial<Player>) {
  return useForm<PlayerFormValues>({
    initialValues: {
      name: initialValues?.name ?? '',
      handicapIndex: initialValues?.handicapIndex ?? 0,
      gender: initialValues?.gender ?? 'male',
    },
    validate: {
      name: (value) => (value.trim().length > 0 ? null : 'Name is required'),
      handicapIndex: (value) =>
        value >= 0 && value <= 54 ? null : 'Handicap must be between 0 and 54',
    },
  })
}
