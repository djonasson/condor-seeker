import Dexie from 'dexie'
import type { Course, Player, Round, Settings } from '@/storage/types'

export class CondorSeekerDB extends Dexie {
  courses!: Dexie.Table<Course, string>
  players!: Dexie.Table<Player, string>
  rounds!: Dexie.Table<Round, string>
  settings!: Dexie.Table<Settings & { id: string }, string>

  constructor() {
    super('CondorSeekerDB')

    this.version(1).stores({
      courses: 'id, name',
      players: 'id, name',
      rounds: 'id, courseId, date',
      settings: 'id',
    })
  }
}
