import { createContext } from 'react'
import type { StorageBackend } from '@/storage/backend'

export const StorageContext = createContext<StorageBackend | null>(null)
