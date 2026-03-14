import { ActionIcon, Group, Table, Text } from '@mantine/core'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import type { Club } from '@/storage/types'

interface ClubListProps {
  clubs: Club[]
  onEdit: (club: Club) => void
  onDelete: (id: string) => void
}

export function ClubList({ clubs, onEdit, onDelete }: ClubListProps) {
  const { t } = useTranslation()

  if (clubs.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="md">
        {t('player:noClubs', 'No clubs added yet.')}
      </Text>
    )
  }

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>{t('player:clubType')}</Table.Th>
          <Table.Th>{t('player:clubBrand')}</Table.Th>
          <Table.Th>{t('player:carryDistance')}</Table.Th>
          <Table.Th />
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {clubs.map((club) => (
          <Table.Tr key={club.id}>
            <Table.Td>{club.type}</Table.Td>
            <Table.Td>{club.brand}</Table.Td>
            <Table.Td>{club.carryDistance}</Table.Td>
            <Table.Td>
              <Group gap="xs" justify="flex-end">
                <ActionIcon variant="subtle" onClick={() => onEdit(club)} aria-label="Edit club">
                  <IconEdit size={16} />
                </ActionIcon>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={() => onDelete(club.id)}
                  aria-label="Delete club"
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )
}
