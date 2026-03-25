import { MantineProvider } from '@mantine/core'
import { BrowserRouter } from 'react-router-dom'
import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { createAppTheme } from '@/theme/theme'
import { useAppStore } from '@/stores/app-store'
import { StorageProvider } from '@/storage/provider'
import { AppInitializer } from './AppInitializer'
import '@mantine/core/styles.css'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const primaryColor = useAppStore((s) => s.primaryColor)
  const theme = useMemo(() => createAppTheme(primaryColor), [primaryColor])

  return (
    <BrowserRouter>
      <MantineProvider theme={theme} defaultColorScheme="auto">
        <StorageProvider>
          <AppInitializer>{children}</AppInitializer>
        </StorageProvider>
      </MantineProvider>
    </BrowserRouter>
  )
}
