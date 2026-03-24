import { Given, When, Then } from 'vitest-cucumber-plugin'
import { expect } from 'vitest'
import { v4 as uuidv4 } from 'uuid'
import { DexieStorageBackend } from '../../src/storage/dexie/dexie-backend.ts'
import { CondorSeekerDB } from '../../src/storage/dexie/db.ts'
import { useRoundStore } from '../../src/stores/round-store.ts'

function getStorage() {
  const db = new CondorSeekerDB()
  return new DexieStorageBackend(db)
}

function validatePlayer(player) {
  const errors = []
  if (!player.name || player.name.trim() === '') {
    errors.push('Name is required')
  }
  if (player.handicapIndex < 0 || player.handicapIndex > 54) {
    errors.push('Handicap must be between 0 and 54')
  }
  return errors
}

// --- Given steps ---

Given('I am on the add player page', () => {
  const storage = getStorage()
  return { storage, player: { id: uuidv4(), name: '', handicapIndex: 0, gender: '', clubs: [] } }
})

Given('a player {string} exists with handicap index {float}', async (state, [name, handicap]) => {
  const storage = getStorage()
  const player = { id: uuidv4(), name, handicapIndex: parseFloat(handicap), gender: 'male', clubs: [] }
  await storage.savePlayer(player)
  return { ...state, storage, existingPlayer: player }
})

Given('I am on the edit page for player {string}', async (state, [name]) => {
  const players = await state.storage.getPlayers()
  const player = players.find((p) => p.name === name)
  return { ...state, player: { ...player } }
})

Given('I am on the player list page', (state) => {
  return { ...state, onListPage: true }
})

Given('I have entered {string} as the player name', (state, [name]) => {
  return { ...state, player: { ...state.player, name } }
})

Given(
  'I am on the player form page with a {string} club by {string} with carry distance {int}',
  (state, [clubType, brand, distance]) => {
    const storage = getStorage()
    const club = { id: uuidv4(), type: clubType, brand, carryDistance: parseInt(distance) }
    const player = { id: uuidv4(), name: 'Test Player', handicapIndex: 10, gender: 'male', clubs: [club] }
    return { storage, player, clubs: player.clubs }
  },
)

// --- When steps ---

When('I enter {string} as the player name', (state, [name]) => {
  return { ...state, player: { ...state.player, name } }
})

When('I enter {float} as the handicap index', (state, [handicap]) => {
  return { ...state, player: { ...state.player, handicapIndex: parseFloat(handicap) } }
})

When('I select {string} as the gender', (state, [gender]) => {
  return { ...state, player: { ...state.player, gender } }
})

When('I save the player', async (state) => {
  const errors = validatePlayer(state.player)
  if (errors.length > 0) {
    return { ...state, validationErrors: errors }
  }
  await state.storage.savePlayer(state.player)
  return state
})

When('I leave the player name empty', (state) => {
  return { ...state, player: { ...state.player, name: '' } }
})

When('I attempt to save the player', async (state) => {
  const errors = validatePlayer(state.player)
  if (errors.length > 0) {
    return { ...state, validationErrors: errors }
  }
  await state.storage.savePlayer(state.player)
  return state
})

When('I change the player name to {string}', (state, [name]) => {
  return { ...state, player: { ...state.player, name } }
})

When('I change the handicap index to {float}', (state, [handicap]) => {
  return { ...state, player: { ...state.player, handicapIndex: parseFloat(handicap) } }
})

When('I click delete on player {string}', async (state, [name]) => {
  const players = await state.storage.getPlayers()
  const player = players.find((p) => p.name === name)
  return { ...state, pendingDeletePlayer: player, showDeleteConfirmation: true }
})

When('I confirm the deletion', async (state) => {
  if (state.pendingDeletePlayer) {
    await state.storage.deletePlayer(state.pendingDeletePlayer.id)
    return { ...state, showDeleteConfirmation: false, pendingDeletePlayer: null }
  }
  if (state.pendingDeleteCourse) {
    await state.storage.deleteCourse(state.pendingDeleteCourse.id)
    return { ...state, showDeleteConfirmation: false, pendingDeleteCourse: null }
  }
  if (state.pendingDeleteRound) {
    await state.storage.deleteRound(state.pendingDeleteRound.id)
    return { ...state, showDeleteConfirmation: false, pendingDeleteRound: null }
  }
  return { ...state, showDeleteConfirmation: false }
})

When('I cancel the deletion', (state) => {
  return { ...state, showDeleteConfirmation: false, pendingDeletePlayer: null, pendingDeleteCourse: null }
})

When('I click {string}', (state, [action]) => {
  if (action === 'Add Club') {
    return { ...state, editingClub: { id: uuidv4(), type: '', brand: '', carryDistance: 0 } }
  }
  if (action === 'Start Round') {
    useRoundStore.getState().initRound({
      courseId: state.selectedCourse.id,
      courseName: state.selectedCourse.name,
      scoringSystem: state.selectedScoring,
      players: state.selectedPlayers,
      totalHoles: state.selectedCourse.holes.length,
    })
    return { ...state, navigatedTo: 'scorecard' }
  }
  return state
})

When('I select {string} as the club type', (state, [clubType]) => {
  return { ...state, editingClub: { ...state.editingClub, type: clubType } }
})

When('I enter {string} as the club brand', (state, [brand]) => {
  return { ...state, editingClub: { ...state.editingClub, brand } }
})

When('I enter {int} as the carry distance', (state, [distance]) => {
  return { ...state, editingClub: { ...state.editingClub, carryDistance: parseInt(distance) } }
})

When('I save the club', (state) => {
  const clubs = [...state.player.clubs]
  const existingIndex = clubs.findIndex((c) => c.id === state.editingClub.id)
  if (existingIndex >= 0) {
    clubs[existingIndex] = state.editingClub
  } else {
    clubs.push(state.editingClub)
  }
  return { ...state, player: { ...state.player, clubs }, editingClub: null }
})

When('I click edit on the {string} club', (state, [clubType]) => {
  const club = state.player.clubs.find((c) => c.type === clubType)
  return { ...state, editingClub: { ...club } }
})

When('I change the carry distance to {int}', (state, [distance]) => {
  return { ...state, editingClub: { ...state.editingClub, carryDistance: parseInt(distance) } }
})

When('I click delete on the {string} club', (state, [clubType]) => {
  const clubs = state.player.clubs.filter((c) => c.type !== clubType)
  return { ...state, player: { ...state.player, clubs } }
})

// --- Then steps ---

Then('a player named {string} should exist', async (state, [name]) => {
  const players = await state.storage.getPlayers()
  const found = players.find((p) => p.name === name)
  expect(found).toBeDefined()
  return state
})

Then('the player {string} should have a handicap index of {float}', async (state, [name, handicap]) => {
  const players = await state.storage.getPlayers()
  const found = players.find((p) => p.name === name)
  expect(found.handicapIndex).toBe(parseFloat(handicap))
  return state
})

Then('I should see a validation error {string}', (state, [message]) => {
  expect(state.validationErrors).toBeDefined()
  expect(state.validationErrors).toContain(message)
  return state
})

Then('I should see a delete confirmation dialog', (state) => {
  expect(state.showDeleteConfirmation).toBe(true)
  return state
})

Then('player {string} should no longer exist', async (state, [name]) => {
  const players = await state.storage.getPlayers()
  const found = players.find((p) => p.name === name)
  expect(found).toBeUndefined()
  return state
})

Then('the player\'s club list should contain a {string} by {string}', (state, [clubType, brand]) => {
  const club = state.player.clubs.find((c) => c.type === clubType && c.brand === brand)
  expect(club).toBeDefined()
  return state
})

Then('the {string} club should have a carry distance of {int}', (state, [clubType, distance]) => {
  const club = state.player.clubs.find((c) => c.type === clubType)
  expect(club).toBeDefined()
  expect(club.carryDistance).toBe(parseInt(distance))
  return state
})

Then('the player\'s club list should not contain a {string} club', (state, [clubType]) => {
  const club = state.player.clubs.find((c) => c.type === clubType)
  expect(club).toBeUndefined()
  return state
})
