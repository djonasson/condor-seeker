import { useContext } from 'react'
import { StorageContext } from '@/storage/context'
import type { StorageBackend } from '@/storage/backend'

export function useStorage(): StorageBackend {
  const backend = useContext(StorageContext)
  if (!backend) {
    throw new Error('useStorage must be used within a StorageProvider')
  }
  return backend
}
