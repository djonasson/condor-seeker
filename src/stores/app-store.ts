import { create } from 'zustand'
import type { Settings } from '@/storage/types'

type AppState = {
  theme: 'light' | 'dark'
  primaryColor: string
  language: string
  distanceUnit: 'meters' | 'yards'
  temperatureUnit: 'celsius' | 'fahrenheit'
  enabledStats: string[]
  initialized: boolean
  setTheme: (theme: 'light' | 'dark') => void
  setPrimaryColor: (color: string) => void
  setLanguage: (language: string) => void
  setDistanceUnit: (unit: 'meters' | 'yards') => void
  setTemperatureUnit: (unit: 'celsius' | 'fahrenheit') => void
  setEnabledStats: (stats: string[]) => void
  hydrate: (settings: Settings) => void
}

export const useAppStore = create<AppState>()((set) => ({
  theme: 'light',
  primaryColor: 'cyan',
  language: 'en',
  distanceUnit: 'meters',
  temperatureUnit: 'celsius',
  enabledStats: ['putts', 'fairwayResult', 'greenInRegulation'],
  initialized: false,
  setTheme: (theme) => set({ theme }),
  setPrimaryColor: (primaryColor) => set({ primaryColor }),
  setLanguage: (language) => set({ language }),
  setDistanceUnit: (distanceUnit) => set({ distanceUnit }),
  setTemperatureUnit: (temperatureUnit) => set({ temperatureUnit }),
  setEnabledStats: (enabledStats) => set({ enabledStats }),
  hydrate: (settings) =>
    set({
      theme: settings.theme,
      primaryColor: settings.primaryColor ?? 'cyan',
      language: settings.language,
      distanceUnit: settings.distanceUnit,
      temperatureUnit: settings.temperatureUnit,
      enabledStats: settings.enabledStats ?? ['putts', 'fairwayResult', 'greenInRegulation'],
      initialized: true,
    }),
}))
