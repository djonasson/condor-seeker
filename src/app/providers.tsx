import { MantineProvider } from '@mantine/core'
import { BrowserRouter } from 'react-router-dom'
import type { ReactNode } from 'react'
import { theme } from '@/theme/theme'
import { StorageProvider } from '@/storage/provider'
import { AppInitializer } from './AppInitializer'
import '@mantine/core/styles.css'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
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
