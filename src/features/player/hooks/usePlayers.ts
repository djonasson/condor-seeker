import { useState, useEffect, useCallback } from 'react'
import { useStorage } from '@/hooks/useStorage'
import type { Player } from '@/storage/types'

export function usePlayers() {
  const storage = useStorage()
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  const loadPlayers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await storage.getPlayers()
      setPlayers(data)
    } finally {
      setLoading(false)
    }
  }, [storage])

  useEffect(() => {
    void loadPlayers()
  }, [loadPlayers])

  const savePlayer = useCallback(
    async (player: Player) => {
      await storage.savePlayer(player)
      await loadPlayers()
    },
    [storage, loadPlayers],
  )

  const deletePlayer = useCallback(
    async (id: string) => {
      await storage.deletePlayer(id)
      await loadPlayers()
    },
    [storage, loadPlayers],
  )

  return { players, loading, loadPlayers, savePlayer, deletePlayer }
}
