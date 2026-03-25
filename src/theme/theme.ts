import { Card, Container, createTheme, Paper, rem, Select } from '@mantine/core'
import type { MantineThemeOverride } from '@mantine/core'

const CONTAINER_SIZES: Record<string, string> = {
  xxs: rem('300px'),
  xs: rem('480px'),
  sm: rem('640px'),
  md: rem('768px'),
  lg: rem('960px'),
  xl: rem('1200px'),
  xxl: rem('1400px'),
}

export function createAppTheme(primaryColor: string): MantineThemeOverride {
  return createTheme({
    fontSizes: {
      xs: rem('12px'),
      sm: rem('14px'),
      md: rem('16px'),
      lg: rem('18px'),
      xl: rem('20px'),
      '2xl': rem('24px'),
      '3xl': rem('30px'),
      '4xl': rem('36px'),
      '5xl': rem('48px'),
    },
    spacing: {
      '3xs': rem('4px'),
      '2xs': rem('8px'),
      xs: rem('10px'),
      sm: rem('12px'),
      md: rem('16px'),
      lg: rem('20px'),
      xl: rem('24px'),
      '2xl': rem('28px'),
      '3xl': rem('32px'),
    },
    primaryColor,
    components: {
      Container: Container.extend({
        vars: (_, { size, fluid }) => ({
          root: {
            '--container-size': fluid
              ? '100%'
              : size !== undefined && size in CONTAINER_SIZES
                ? CONTAINER_SIZES[size]
                : rem(size),
          },
        }),
      }),
      Paper: Paper.extend({
        defaultProps: {
          shadow: 'xs',
          radius: 'md',
        },
      }),
      Card: Card.extend({
        defaultProps: {
          p: 'md',
          shadow: 'xs',
          radius: 'md',
          withBorder: true,
        },
      }),
      Select: Select.extend({
        defaultProps: {
          checkIconPosition: 'right',
        },
      }),
    },
    other: {
      style: 'mantine',
    },
  })
}
