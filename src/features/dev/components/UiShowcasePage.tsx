import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  ColorSwatch,
  Divider,
  Group,
  NumberInput,
  Paper,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
  useMantineTheme,
} from '@mantine/core'
import { IconMinus, IconPlus, IconGolf, IconSettings, IconTrash } from '@tabler/icons-react'
import { useState } from 'react'
import { SectionCard } from '@/components/SectionCard'

const COLOR_NAMES = [
  'dark',
  'gray',
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

function ColorPalette() {
  const theme = useMantineTheme()

  return (
    <Stack gap="xs">
      <Title order={4}>Color Palette</Title>
      <Text size="sm" c="dimmed">
        Primary color: {theme.primaryColor}
      </Text>
      {COLOR_NAMES.map((name) => (
        <Group key={name} gap="xs" align="center">
          <Text size="xs" w={50} fw={name === theme.primaryColor ? 700 : 400}>
            {name}
          </Text>
          {theme.colors[name]?.map((color, i) => (
            <ColorSwatch key={i} color={color} size={24} withShadow={false}>
              <Text size="xs" c={i < 5 ? 'dark' : 'white'} fw={700} style={{ fontSize: 8 }}>
                {i}
              </Text>
            </ColorSwatch>
          ))}
        </Group>
      ))}
    </Stack>
  )
}

function PrimaryColorTokens() {
  const tokens = [
    { label: 'primary-color-filled', var: 'var(--mantine-primary-color-filled)' },
    { label: 'primary-color-light', var: 'var(--mantine-primary-color-light)' },
    { label: 'primary-color-light-color', var: 'var(--mantine-primary-color-light-color)' },
    ...Array.from({ length: 10 }, (_, i) => ({
      label: `primary-color-${i}`,
      var: `var(--mantine-primary-color-${i})`,
    })),
  ]

  return (
    <Stack gap="xs">
      <Title order={4}>Primary Color Tokens</Title>
      <SimpleGrid cols={3}>
        {tokens.map((t) => (
          <Group key={t.label} gap="xs" align="center">
            <Box
              w={32}
              h={32}
              style={{
                borderRadius: 4,
                background: t.var,
                border: '1px solid var(--mantine-color-default-border)',
              }}
            />
            <Text size="xs">{t.label}</Text>
          </Group>
        ))}
      </SimpleGrid>
    </Stack>
  )
}

function ThemeTokens() {
  const tokens = [
    { label: 'color-gray-light', var: 'var(--mantine-color-gray-light)' },
    { label: 'color-default', var: 'var(--mantine-color-default)' },
    { label: 'color-default-border', var: 'var(--mantine-color-default-border)' },
    { label: 'color-body', var: 'var(--mantine-color-body)' },
    { label: 'color-dimmed', var: 'var(--mantine-color-dimmed)' },
  ]

  return (
    <Stack gap="xs">
      <Title order={4}>Theme Tokens</Title>
      <SimpleGrid cols={3}>
        {tokens.map((t) => (
          <Group key={t.label} gap="xs" align="center">
            <Box
              w={32}
              h={32}
              style={{
                borderRadius: 4,
                background: t.var,
                border: '1px solid var(--mantine-color-default-border)',
              }}
            />
            <Text size="xs">{t.label}</Text>
          </Group>
        ))}
      </SimpleGrid>
    </Stack>
  )
}

function ButtonShowcase() {
  return (
    <Stack gap="xs">
      <Title order={4}>Buttons</Title>
      <Group>
        <Button>Filled (default)</Button>
        <Button variant="light">Light</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="subtle">Subtle</Button>
        <Button variant="default">Default</Button>
      </Group>
      <Group>
        <Button color="red">Red</Button>
        <Button color="orange">Orange</Button>
        <Button color="green">Green</Button>
        <Button color="blue">Blue</Button>
        <Button disabled>Disabled</Button>
      </Group>
      <Group>
        <Button size="xs">XS</Button>
        <Button size="sm">SM</Button>
        <Button size="md">MD</Button>
        <Button size="lg">LG</Button>
      </Group>
      <Group>
        <Button leftSection={<IconGolf size={16} />}>With Icon</Button>
        <Button variant="subtle" color="red" size="xs">
          Danger Subtle
        </Button>
        <ActionIcon variant="default" size="md">
          <IconSettings size={16} />
        </ActionIcon>
        <ActionIcon variant="filled" size="md">
          <IconPlus size={16} />
        </ActionIcon>
        <ActionIcon variant="light" size="md" color="red">
          <IconTrash size={16} />
        </ActionIcon>
      </Group>
    </Stack>
  )
}

function CardShowcase() {
  return (
    <Stack gap="xs">
      <Title order={4}>Cards & Paper</Title>
      <SimpleGrid cols={2}>
        <Card>
          <Text fw={500}>Default Card</Text>
          <Text size="sm" c="dimmed">
            Uses theme defaults: withBorder, shadow xs, radius md
          </Text>
        </Card>
        <Paper withBorder p="md">
          <Text fw={500}>Paper with border</Text>
          <Text size="sm" c="dimmed">
            Paper component with border
          </Text>
        </Paper>
        <SectionCard
          header={
            <Text fw={600} size="sm">
              SectionCard with header + footer
            </Text>
          }
          footer={
            <Text size="xs" c="dimmed">
              Footer content
            </Text>
          }
        >
          <Text size="sm">Body content goes here</Text>
        </SectionCard>
        <SectionCard
          header={
            <Text fw={600} size="sm">
              SectionCard with header only
            </Text>
          }
        >
          <Text size="sm">No footer in this one</Text>
        </SectionCard>
      </SimpleGrid>
    </Stack>
  )
}

function InputShowcase() {
  const [value, setValue] = useState(5)

  return (
    <Stack gap="xs">
      <Title order={4}>Inputs</Title>
      <SimpleGrid cols={2}>
        <TextInput label="Text Input" placeholder="Enter text..." />
        <NumberInput
          label="Number Input"
          value={value}
          onChange={(v) => setValue(typeof v === 'number' ? v : 0)}
        />
      </SimpleGrid>
      <Group>
        <Checkbox label="Checkbox" />
        <Checkbox label="Checked" defaultChecked />
        <Checkbox label="Disabled" disabled />
      </Group>
      <Group>
        <SegmentedControl data={['Option A', 'Option B', 'Option C']} />
      </Group>
      <Group align="center" gap="xs">
        <Text size="sm">Stepper pattern:</Text>
        <ActionIcon variant="default" size="sm">
          <IconMinus size={14} />
        </ActionIcon>
        <NumberInput
          value={value}
          w={60}
          size="sm"
          hideControls
          styles={{ input: { textAlign: 'center' } }}
        />
        <ActionIcon variant="default" size="sm">
          <IconPlus size={14} />
        </ActionIcon>
      </Group>
    </Stack>
  )
}

function TypographyShowcase() {
  return (
    <Stack gap="xs">
      <Title order={4}>Typography</Title>
      <Title order={1}>Heading 1</Title>
      <Title order={2}>Heading 2</Title>
      <Title order={3}>Heading 3</Title>
      <Title order={4}>Heading 4</Title>
      <Group>
        <Text size="xs">xs text</Text>
        <Text size="sm">sm text</Text>
        <Text size="md">md text</Text>
        <Text size="lg">lg text</Text>
        <Text size="xl">xl text</Text>
      </Group>
      <Group>
        <Text c="dimmed">Dimmed</Text>
        <Text fw={700}>Bold</Text>
        <Text fw={700} c="red">
          Red bold
        </Text>
        <Text fw={700} c="blue">
          Blue bold
        </Text>
      </Group>
      <Group>
        <Badge>Default</Badge>
        <Badge color="red">Red</Badge>
        <Badge color="green">Green</Badge>
        <Badge variant="light">Light</Badge>
        <Badge variant="outline">Outline</Badge>
      </Group>
    </Stack>
  )
}

function SpacingShowcase() {
  const sizes = ['3xs', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const

  return (
    <Stack gap="xs">
      <Title order={4}>Spacing</Title>
      {sizes.map((size) => (
        <Group key={size} gap="xs" align="center">
          <Text size="xs" w={30}>
            {size}
          </Text>
          <Box
            h={12}
            style={{
              width: `var(--mantine-spacing-${size})`,
              background: 'var(--mantine-primary-color-filled)',
              borderRadius: 2,
            }}
          />
        </Group>
      ))}
    </Stack>
  )
}

export default function UiShowcasePage() {
  return (
    <Stack gap="xl">
      <Title order={2}>UI Showcase (Dev Only)</Title>

      <ColorPalette />
      <Divider />
      <PrimaryColorTokens />
      <Divider />
      <ThemeTokens />
      <Divider />
      <ButtonShowcase />
      <Divider />
      <CardShowcase />
      <Divider />
      <InputShowcase />
      <Divider />
      <TypographyShowcase />
      <Divider />
      <SpacingShowcase />
    </Stack>
  )
}
