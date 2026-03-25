export type Course = {
  id: string
  name: string
  clubName?: string
  starred?: boolean
  holes: Hole[]
  tees: Tee[]
}

export type Hole = {
  number: number
  parByTee: Record<string, number>
  handicapByTee: Record<string, number>
  distanceByTee: Record<string, number>
}

export type Tee = {
  id: string
  name: string
  courseRating: number
  slopeRating: number
  totalDistance: number
}

export type Player = {
  id: string
  name: string
  handicapIndex: number
  gender: string
  clubs: Club[]
}

export type Club = {
  id: string
  type: string
  brand: string
  carryDistance: number
}

export type Round = {
  id: string
  courseId: string
  date: string
  scoringSystem: string
  playerRounds: PlayerRound[]
}

export type PlayerRound = {
  playerId: string
  teeId: string
  holeScores: HoleScore[]
  totalGross: number
  totalNet: number
}

export type HoleScore = {
  holeNumber: number
  grossScore: number
  netScore: number
  putts?: number
  fairwayHit?: boolean
  greenInRegulation?: boolean
}

export type Settings = {
  distanceUnit: 'meters' | 'yards'
  temperatureUnit: 'celsius' | 'fahrenheit'
  theme: 'light' | 'dark'
  language: string
  storageBackend: 'local'
  golfCourseApiKey: string
}

export type AppData = {
  courses: Course[]
  players: Player[]
  rounds: Round[]
  settings: Settings
  exportedAt: string
}
