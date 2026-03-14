import { useEffect } from 'react'
import { useMantineColorScheme } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { useStorage } from '@/hooks/useStorage'
import { useAppStore } from '@/stores/app-store'

export function useInitApp(): { initialized: boolean } {
  const storage = useStorage()
  const { setColorScheme } = useMantineColorScheme()
  const { i18n } = useTranslation()
  const initialized = useAppStore((s) => s.initialized)
  const hydrate = useAppStore((s) => s.hydrate)

  useEffect(() => {
    if (initialized) return

    let cancelled = false

    async function init() {
      const settings = await storage.getSettings()
      if (cancelled) return

      hydrate(settings)
      setColorScheme(settings.theme)
      await i18n.changeLanguage(settings.language)
    }

    void init()

    return () => {
      cancelled = true
    }
  }, [initialized, storage, hydrate, setColorScheme, i18n])

  return { initialized }
}
