import type { ReactNode } from 'react'
import { useInitApp } from '@/hooks/useInitApp'

interface AppInitializerProps {
  children: ReactNode
}

export function AppInitializer({ children }: AppInitializerProps) {
  const { initialized } = useInitApp()

  if (!initialized) {
    return null
  }

  return <>{children}</>
}
