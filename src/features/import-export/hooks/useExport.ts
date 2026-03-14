import { useCallback, useState } from 'react'
import { useStorage } from '@/hooks/useStorage'

export function useExport() {
  const storage = useStorage()
  const [loading, setLoading] = useState(false)

  const exportData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await storage.exportAll()
      const json = JSON.stringify(data, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)

      const date = new Date().toISOString().slice(0, 10)
      const a = document.createElement('a')
      a.href = url
      a.download = `condor-seeker-export-${date}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }, [storage])

  return { exportData, loading }
}
