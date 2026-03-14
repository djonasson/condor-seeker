import { useMemo, type ReactNode } from 'react'
import { StorageContext } from '@/storage/context'
import { CondorSeekerDB } from '@/storage/dexie/db'
import { DexieStorageBackend } from '@/storage/dexie/dexie-backend'

type StorageProviderProps = {
  children: ReactNode
}

export function StorageProvider({ children }: StorageProviderProps) {
  const backend = useMemo(() => {
    const db = new CondorSeekerDB()
    return new DexieStorageBackend(db)
  }, [])

  return <StorageContext.Provider value={backend}>{children}</StorageContext.Provider>
}
