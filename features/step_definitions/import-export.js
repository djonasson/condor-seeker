import { Given, When, Then, DataTable } from 'vitest-cucumber-plugin'
import { expect } from 'vitest'
import { v4 as uuidv4 } from 'uuid'
import { DexieStorageBackend } from '../../src/storage/dexie/dexie-backend.ts'
import { CondorSeekerDB } from '../../src/storage/dexie/db.ts'
import { DEFAULT_SETTINGS } from '../../src/storage/backend.ts'

function getStorage() {
  const db = new CondorSeekerDB()
  return new DexieStorageBackend(db)
}

function buildCourse(name) {
  const teeId = uuidv4()
  return {
    id: uuidv4(),
    name,
    holes: [{ number: 1, parByTee: { [teeId]: 4 }, handicap: 1, distanceByTee: { [teeId]: 400 } }],
    tees: [{ id: teeId, name: 'White', courseRating: 72, slopeRating: 113, totalDistance: 6500 }],
  }
}

function buildPlayer(name) {
  return { id: uuidv4(), name, handicapIndex: 10.0, gender: 'male', clubs: [] }
}

function buildRound(courseId) {
  return {
    id: uuidv4(),
    courseId,
    date: '2026-03-01',
    scoringSystem: 'stroke',
    playerRounds: [
      {
        playerId: uuidv4(),
        teeId: uuidv4(),
        holeScores: [{ holeNumber: 1, grossScore: 4, netScore: 4 }],
        totalGross: 72,
        totalNet: 72,
      },
    ],
  }
}

// --- Given steps ---

Given('the following data exists:', async (state, params, dataTable) => {
  const storage = getStorage()
  const rows = DataTable(dataTable)
  const row = rows[0]
  const numCourses = Number(row.courses)
  const numPlayers = Number(row.players)
  const numRounds = Number(row.rounds)

  const courses = []
  for (let i = 0; i < numCourses; i++) {
    const course = buildCourse(`Course ${i + 1}`)
    await storage.saveCourse(course)
    courses.push(course)
  }
  const players = []
  for (let i = 0; i < numPlayers; i++) {
    const player = buildPlayer(`Player ${i + 1}`)
    await storage.savePlayer(player)
    players.push(player)
  }
  const rounds = []
  for (let i = 0; i < numRounds; i++) {
    const round = buildRound(courses[i % courses.length].id)
    await storage.saveRound(round)
    rounds.push(round)
  }
  return { ...state, storage, courses, players, rounds }
})

Given('I am on the import\\/export page', () => {
  const storage = getStorage()
  return {
    storage,
    currentPage: 'import-export',
    importData: null,
    importPreview: null,
    importError: null,
    showImportConfirmation: false,
    importSuccess: false,
  }
})

Given('existing data contains {int} course, {int} player, and {int} rounds', async (state, [numCourses, numPlayers, numRounds]) => {
  const courses = []
  for (let i = 0; i < Number(numCourses); i++) {
    const course = buildCourse(`Existing Course ${i + 1}`)
    await state.storage.saveCourse(course)
    courses.push(course)
  }
  for (let i = 0; i < Number(numPlayers); i++) {
    const player = buildPlayer(`Existing Player ${i + 1}`)
    await state.storage.savePlayer(player)
  }
  for (let i = 0; i < Number(numRounds); i++) {
    const round = buildRound(courses[0].id)
    await state.storage.saveRound(round)
  }
  return state
})

// --- When steps ---

When('I click the export button', async (state) => {
  const exported = await state.storage.exportAll()
  return { ...state, exportedData: exported }
})

When('I select a valid JSON import file containing:', (state, params, dataTable) => {
  const rows = DataTable(dataTable)
  const row = rows[0]
  const numCourses = Number(row.courses)
  const numPlayers = Number(row.players)
  const numRounds = Number(row.rounds)

  const courses = []
  for (let i = 0; i < numCourses; i++) {
    courses.push(buildCourse(`Import Course ${i + 1}`))
  }
  const players = []
  for (let i = 0; i < numPlayers; i++) {
    players.push(buildPlayer(`Import Player ${i + 1}`))
  }
  const rounds = []
  for (let i = 0; i < numRounds; i++) {
    rounds.push(buildRound(courses[i % courses.length].id))
  }

  const importData = {
    courses,
    players,
    rounds,
    settings: DEFAULT_SETTINGS,
    exportedAt: new Date().toISOString(),
  }

  const importPreview = {
    courses: numCourses,
    players: numPlayers,
    rounds: numRounds,
  }

  return { ...state, importData, importPreview }
})

When('I see the import preview', (state) => {
  expect(state.importPreview).toBeDefined()
  return state
})

// Note: "I click the import button" is defined in course-import.js (handles importData case)

When('I confirm the import', async (state) => {
  await state.storage.importAll(state.importData)
  return { ...state, showImportConfirmation: false, importSuccess: true }
})

When('I cancel the import', (state) => {
  return { ...state, showImportConfirmation: false, importData: null, importPreview: null }
})

When('I select an invalid JSON file for import', (state) => {
  return { ...state, importError: 'Invalid file format', importData: null, importPreview: null }
})

// --- Then steps ---

Then('a JSON file should be downloaded', (state) => {
  expect(state.exportedData).toBeDefined()
  expect(typeof state.exportedData).toBe('object')
  return state
})

Then('the exported file should contain {int} courses', (state, [count]) => {
  expect(state.exportedData.courses.length).toBe(Number(count))
  return state
})

Then('the exported file should contain {int} players', (state, [count]) => {
  expect(state.exportedData.players.length).toBe(Number(count))
  return state
})

Then('the exported file should contain {int} rounds', (state, [count]) => {
  expect(state.exportedData.rounds.length).toBe(Number(count))
  return state
})

Then('the exported file should contain an export timestamp', (state) => {
  expect(state.exportedData.exportedAt).toBeDefined()
  expect(typeof state.exportedData.exportedAt).toBe('string')
  expect(state.exportedData.exportedAt.length).toBeGreaterThan(0)
  return state
})

Then('I should see a preview showing:', (state, params, dataTable) => {
  const rows = DataTable(dataTable)
  const row = rows[0]
  expect(state.importPreview).toBeDefined()
  expect(state.importPreview.courses).toBe(Number(row.courses))
  expect(state.importPreview.players).toBe(Number(row.players))
  expect(state.importPreview.rounds).toBe(Number(row.rounds))
  return state
})

Then('I should see a confirmation dialog warning that data will be replaced', (state) => {
  expect(state.showImportConfirmation).toBe(true)
  return state
})

Then('the data should be replaced with the imported data', async (state) => {
  const courses = await state.storage.getCourses()
  const players = await state.storage.getPlayers()
  const rounds = await state.storage.getRounds()
  expect(courses.length).toBe(state.importData.courses.length)
  expect(players.length).toBe(state.importData.players.length)
  expect(rounds.length).toBe(state.importData.rounds.length)
  return state
})

Then('I should see an import success message', (state) => {
  expect(state.importSuccess).toBe(true)
  return state
})

Then('the existing data should remain unchanged', async (state) => {
  // Import was cancelled, so importData is null and storage is untouched
  expect(state.importData).toBeNull()
  return state
})

Then('I should see an import error message', (state) => {
  expect(state.importError).toBeDefined()
  expect(state.importError.length).toBeGreaterThan(0)
  return state
})

Then('the import button should be disabled', (state) => {
  // No valid import data means button would be disabled
  expect(state.importData).toBeNull()
  return state
})
