import type { AppData, Course, Player, Round, Settings } from '@/storage/types'

export const DEFAULT_SETTINGS: Settings = {
  distanceUnit: 'meters',
  temperatureUnit: 'celsius',
  theme: 'light',
  language: 'en',
  storageBackend: 'local',
}

export interface StorageBackend {
  // Courses
  getCourses(): Promise<Course[]>
  getCourse(id: string): Promise<Course | undefined>
  saveCourse(course: Course): Promise<void>
  deleteCourse(id: string): Promise<void>

  // Players
  getPlayers(): Promise<Player[]>
  getPlayer(id: string): Promise<Player | undefined>
  savePlayer(player: Player): Promise<void>
  deletePlayer(id: string): Promise<void>

  // Rounds
  getRounds(): Promise<Round[]>
  getRound(id: string): Promise<Round | undefined>
  saveRound(round: Round): Promise<void>
  deleteRound(id: string): Promise<void>

  // Settings
  getSettings(): Promise<Settings>
  saveSettings(settings: Settings): Promise<void>

  // Import/Export
  exportAll(): Promise<AppData>
  importAll(data: AppData): Promise<void>
}
