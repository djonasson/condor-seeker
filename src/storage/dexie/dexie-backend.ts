import type { StorageBackend } from '@/storage/backend'
import { DEFAULT_SETTINGS } from '@/storage/backend'
import type { CondorSeekerDB } from '@/storage/dexie/db'
import type { AppData, Course, Player, Round, Settings } from '@/storage/types'

const SETTINGS_ID = 'default'

export class DexieStorageBackend implements StorageBackend {
  private db: CondorSeekerDB

  constructor(db: CondorSeekerDB) {
    this.db = db
  }

  // Courses

  async getCourses(): Promise<Course[]> {
    return this.db.courses.toArray()
  }

  async getCourse(id: string): Promise<Course | undefined> {
    return this.db.courses.get(id)
  }

  async saveCourse(course: Course): Promise<void> {
    await this.db.courses.put(course)
  }

  async deleteCourse(id: string): Promise<void> {
    await this.db.courses.delete(id)
  }

  // Players

  async getPlayers(): Promise<Player[]> {
    return this.db.players.toArray()
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    return this.db.players.get(id)
  }

  async savePlayer(player: Player): Promise<void> {
    await this.db.players.put(player)
  }

  async deletePlayer(id: string): Promise<void> {
    await this.db.players.delete(id)
  }

  // Rounds

  async getRounds(): Promise<Round[]> {
    return this.db.rounds.toArray()
  }

  async getRound(id: string): Promise<Round | undefined> {
    return this.db.rounds.get(id)
  }

  async saveRound(round: Round): Promise<void> {
    await this.db.rounds.put(round)
  }

  async deleteRound(id: string): Promise<void> {
    await this.db.rounds.delete(id)
  }

  // Settings

  async getSettings(): Promise<Settings> {
    const row = await this.db.settings.get(SETTINGS_ID)
    if (!row) {
      return DEFAULT_SETTINGS
    }
    return {
      distanceUnit: row.distanceUnit,
      temperatureUnit: row.temperatureUnit,
      theme: row.theme,
      primaryColor: row.primaryColor ?? 'cyan',
      language: row.language,
      storageBackend: row.storageBackend,
      golfCourseApiKey: row.golfCourseApiKey ?? '',
      enabledStats: row.enabledStats ?? ['putts', 'fairwayResult', 'greenInRegulation'],
    }
  }

  async saveSettings(settings: Settings): Promise<void> {
    await this.db.settings.put({ ...settings, id: SETTINGS_ID })
  }

  // Import/Export

  async exportAll(): Promise<AppData> {
    const [courses, players, rounds, settings] = await Promise.all([
      this.getCourses(),
      this.getPlayers(),
      this.getRounds(),
      this.getSettings(),
    ])

    return {
      courses,
      players,
      rounds,
      settings,
      exportedAt: new Date().toISOString(),
    }
  }

  async importAll(data: AppData): Promise<void> {
    await this.db.transaction(
      'rw',
      [this.db.courses, this.db.players, this.db.rounds, this.db.settings],
      async () => {
        await this.db.courses.clear()
        await this.db.players.clear()
        await this.db.rounds.clear()
        await this.db.settings.clear()

        await this.db.courses.bulkPut(data.courses)
        await this.db.players.bulkPut(data.players)
        await this.db.rounds.bulkPut(data.rounds)
        await this.saveSettings(data.settings)
      },
    )
  }
}
