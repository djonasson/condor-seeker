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

    this.version(2)
      .stores({
        courses: 'id, name',
        players: 'id, name',
        rounds: 'id, courseId, date',
        settings: 'id',
      })
      .upgrade((tx) => {
        return tx
          .table('courses')
          .toCollection()
          .modify((course: Record<string, unknown>) => {
            const holes = course.holes as Array<Record<string, unknown>>
            const tees = course.tees as Array<{ id: string }>
            for (const hole of holes) {
              if (typeof hole.handicap === 'number') {
                const handicapByTee: Record<string, number> = {}
                for (const tee of tees) {
                  handicapByTee[tee.id] = hole.handicap as number
                }
                hole.handicapByTee = handicapByTee
                delete hole.handicap
              }
            }
          })
      })
  }
}
