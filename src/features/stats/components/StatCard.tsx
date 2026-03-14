import { Card, Text } from '@mantine/core'

type StatCardProps = {
  label: string
  value: string | number
  unit?: string
}

export function StatCard({ label, value, unit }: StatCardProps) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Text size="sm" c="dimmed" fw={500}>
        {label}
      </Text>
      <Text size="xl" fw={700} mt="xs">
        {value}
        {unit ? (
          <Text span size="sm" c="dimmed" ml={4}>
            {unit}
          </Text>
        ) : null}
      </Text>
    </Card>
  )
}
