export type { Course, Hole, Tee } from '@/storage/types'

export const DEFAULT_TEE_PRESETS = [
  { name: 'Red' },
  { name: 'Yellow' },
  { name: 'White' },
  { name: 'Blue' },
  { name: 'Black' },
] as const
