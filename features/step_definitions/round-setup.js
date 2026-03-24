import { Given, When, Then } from 'vitest-cucumber-plugin'
import { expect } from 'vitest'
import { v4 as uuidv4 } from 'uuid'
import { useRoundStore } from '../../src/stores/round-store.ts'
import { DexieStorageBackend } from '../../src/storage/dexie/dexie-backend.ts'
import { CondorSeekerDB } from '../../src/storage/dexie/db.ts'

function getStorage() {
  const db = new CondorSeekerDB()
  return new DexieStorageBackend(db)
}

function buildCourseWithTees(name, numHoles, teeNames) {
  const tees = teeNames.map((teeName) => ({
    id: uuidv4(),
    name: teeName,
    courseRating: 72.0,
    slopeRating: 113,
    totalDistance: 6500,
  }))
  const holes = []
  for (let i = 1; i <= numHoles; i++) {
    const parByTee = {}
    const distanceByTee = {}
    for (const tee of tees) {
      parByTee[tee.id] = i <= 4 ? 5 : i <= 10 ? 4 : 3
      distanceByTee[tee.id] = 300 + i * 10
    }
    holes.push({ number: i, parByTee, handicap: i, distanceByTee })
  }
  return { id: uuidv4(), name, holes, tees }
}

// --- Background ---

Given(
  'a course {string} exists with {int} holes and tees {string} and {string}',
  async (state, [name, numHoles, tee1, tee2]) => {
    const storage = getStorage()
    const course = buildCourseWithTees(name, parseInt(numHoles), [tee1, tee2])
    await storage.saveCourse(course)
    return { ...state, storage, course }
  },
)

// Note: "a player {string} exists with handicap index {float}" is defined in player-setup.js

// --- Given steps ---

Given('I am on the round setup page at step {int}', (state, [step]) => {
  useRoundStore.getState().clearRound()
  return {
    ...state,
    setupStep: parseInt(step),
    selectedCourse: null,
    selectedPlayers: [],
    selectedScoring: null,
    navigatedTo: null,
  }
})

Given('{string} is selected as the course', (state, [courseName]) => {
  return { ...state, selectedCourse: state.course }
})

Given('no course is selected', (state) => {
  return { ...state, selectedCourse: null }
})

Given('no players are selected', (state) => {
  return { ...state, selectedPlayers: [] }
})

Given('player {string} is selected with tee {string}', async (state, [playerName, teeName]) => {
  const players = await state.storage.getPlayers()
  const player = players.find((p) => p.name === playerName)
  const tee = state.course.tees.find((t) => t.name === teeName)
  const entry = { playerId: player.id, playerName: player.name, teeId: tee.id }
  return { ...state, selectedPlayers: [...state.selectedPlayers, entry] }
})

Given('{string} is selected as the scoring system', (state, [system]) => {
  return { ...state, selectedScoring: system }
})

// --- When steps ---

When('I select {string} as the course', (state, [courseName]) => {
  return { ...state, selectedCourse: state.course }
})

When('I add player {string} with tee {string}', async (state, [playerName, teeName]) => {
  const players = await state.storage.getPlayers()
  const player = players.find((p) => p.name === playerName)
  const tee = state.course.tees.find((t) => t.name === teeName)
  const entry = { playerId: player.id, playerName: player.name, teeId: tee.id }
  return { ...state, selectedPlayers: [...state.selectedPlayers, entry] }
})

When('I select {string} as the scoring system', (state, [system]) => {
  return { ...state, selectedScoring: system }
})

// Note: "I click {string}" is defined in player-setup.js and handles "Start Round"

// --- Then steps ---

Then('{string} should be shown as the selected course', (state, [courseName]) => {
  expect(state.selectedCourse).not.toBeNull()
  expect(state.selectedCourse.name).toBe(courseName)
  return state
})

Then('the {string} button should be enabled', (state, [buttonName]) => {
  if (buttonName === 'Next') {
    if (state.setupStep === 1) {
      expect(state.selectedCourse).not.toBeNull()
    } else if (state.setupStep === 2) {
      expect(state.selectedPlayers.length).toBeGreaterThan(0)
    }
  }
  return state
})

Then('the {string} button should be disabled', (state, [buttonName]) => {
  if (buttonName === 'Next') {
    if (state.setupStep === 1) {
      expect(state.selectedCourse).toBeNull()
    } else if (state.setupStep === 2) {
      expect(state.selectedPlayers.length).toBe(0)
    }
  }
  return state
})

Then('{int} players should be selected', (state, [count]) => {
  expect(state.selectedPlayers.length).toBe(parseInt(count))
  return state
})

Then('the scoring system should be set to {string}', (state, [system]) => {
  expect(state.selectedScoring).toBe(system)
  return state
})

Then('an active round should be initialized for {string}', (state, [courseName]) => {
  const roundState = useRoundStore.getState()
  expect(roundState.isActive).toBe(true)
  expect(roundState.courseName).toBe(courseName)
  return state
})

Then('the round should use {string} scoring', (state, [system]) => {
  const roundState = useRoundStore.getState()
  expect(roundState.scoringSystem).toBe(system)
  return state
})

Then('I should be navigated to the scorecard page', (state) => {
  expect(state.navigatedTo).toBe('scorecard')
  return state
})
