import { create } from 'zustand'
import type { Settings } from '@/storage/types'

type AppState = {
  theme: 'light' | 'dark'
  language: string
  distanceUnit: 'meters' | 'yards'
  temperatureUnit: 'celsius' | 'fahrenheit'
  initialized: boolean
  setTheme: (theme: 'light' | 'dark') => void
  setLanguage: (language: string) => void
  setDistanceUnit: (unit: 'meters' | 'yards') => void
  setTemperatureUnit: (unit: 'celsius' | 'fahrenheit') => void
  hydrate: (settings: Settings) => void
}

export const useAppStore = create<AppState>()((set) => ({
  theme: 'light',
  language: 'en',
  distanceUnit: 'meters',
  temperatureUnit: 'celsius',
  initialized: false,
  setTheme: (theme) => set({ theme }),
  setLanguage: (language) => set({ language }),
  setDistanceUnit: (distanceUnit) => set({ distanceUnit }),
  setTemperatureUnit: (temperatureUnit) => set({ temperatureUnit }),
  hydrate: (settings) =>
    set({
      theme: settings.theme,
      language: settings.language,
      distanceUnit: settings.distanceUnit,
      temperatureUnit: settings.temperatureUnit,
      initialized: true,
    }),
}))
