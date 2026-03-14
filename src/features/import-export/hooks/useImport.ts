import { useCallback, useState } from 'react'
import { useStorage } from '@/hooks/useStorage'
import type { AppData } from '@/storage/types'

export type ImportPreview = {
  courses: number
  players: number
  rounds: number
}

function isValidAppData(data: unknown): data is AppData {
  if (typeof data !== 'object' || data === null) return false
  const obj = data as Record<string, unknown>
  return (
    Array.isArray(obj.courses) &&
    Array.isArray(obj.players) &&
    Array.isArray(obj.rounds) &&
    typeof obj.settings === 'object' &&
    obj.settings !== null
  )
}

export function useImport() {
  const storage = useStorage()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [parsedData, setParsedData] = useState<AppData | null>(null)

  const loadPreview = useCallback(async (file: File) => {
    setError(null)
    setPreview(null)
    setParsedData(null)
    try {
      const text = await file.text()
      const data: unknown = JSON.parse(text)
      if (!isValidAppData(data)) {
        setError('Invalid file format')
        return
      }
      setPreview({
        courses: data.courses.length,
        players: data.players.length,
        rounds: data.rounds.length,
      })
      setParsedData(data)
    } catch {
      setError('Failed to read file')
    }
  }, [])

  const importData = useCallback(async () => {
    if (!parsedData) return
    setLoading(true)
    setError(null)
    try {
      await storage.importAll(parsedData)
    } catch {
      setError('Failed to import data')
    } finally {
      setLoading(false)
    }
  }, [storage, parsedData])

  const reset = useCallback(() => {
    setPreview(null)
    setParsedData(null)
    setError(null)
  }, [])

  return { loadPreview, importData, loading, error, preview, reset }
}
