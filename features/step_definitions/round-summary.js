import { Given, When, Then } from 'vitest-cucumber-plugin'
import { expect } from 'vitest'
import { v4 as uuidv4 } from 'uuid'
import { DexieStorageBackend } from '../../src/storage/dexie/dexie-backend.ts'
import { CondorSeekerDB } from '../../src/storage/dexie/db.ts'

function getStorage() {
  const db = new CondorSeekerDB()
  return new DexieStorageBackend(db)
}

function buildCompletedRound(courseId, courseName, scoringSystem, playerRounds) {
  return {
    id: uuidv4(),
    courseId,
    date: new Date().toISOString().split('T')[0],
    scoringSystem,
    playerRounds,
  }
}

// --- Background ---

Given(
  'a completed stroke play round on {string} with {int} holes',
  (state, [courseName, numHoles]) => {
    const storage = getStorage()
    const courseId = uuidv4()
    return {
      ...state,
      storage,
      courseId,
      courseName,
      scoringSystem: 'stroke',
      numHoles: parseInt(numHoles),
      playerRounds: [],
      summary: null,
    }
  },
)

Given('player {string} played from the {string} tee', (state, [playerName, teeName]) => {
  const teeId = uuidv4()
  return { ...state, primaryPlayer: { name: playerName, playerId: uuidv4(), teeId }, primaryTeeName: teeName }
})

Given(
  '{string} scored a total gross of {int} and net of {int}',
  (state, [playerName, totalGross, totalNet]) => {
    const player = state.primaryPlayer && state.primaryPlayer.name === playerName
      ? state.primaryPlayer
      : state.additionalPlayer
    const holeScores = []
    const numHoles = state.numHoles
    const baseGross = Math.floor(parseInt(totalGross) / numHoles)
    const baseNet = Math.floor(parseInt(totalNet) / numHoles)
    let remainingGross = parseInt(totalGross)
    let remainingNet = parseInt(totalNet)
    for (let i = 1; i <= numHoles; i++) {
      const gross = i < numHoles ? baseGross : remainingGross
      const net = i < numHoles ? baseNet : remainingNet
      holeScores.push({ holeNumber: i, grossScore: gross, netScore: net })
      remainingGross -= gross
      remainingNet -= net
    }
    const playerRound = {
      playerId: player.playerId,
      teeId: player.teeId,
      holeScores,
      totalGross: parseInt(totalGross),
      totalNet: parseInt(totalNet),
    }
    const playerRounds = [...state.playerRounds, playerRound]
    const playerMap = { ...(state.playerMap || {}), [playerName]: player }
    const round = buildCompletedRound(state.courseId, state.courseName, state.scoringSystem, playerRounds)
    return { ...state, playerRounds, playerMap, round }
  },
)

// --- Additional player for multi-player scenario ---

Given('player {string} also played from the {string} tee', (state, [playerName, teeName]) => {
  const teeId = uuidv4()
  return { ...state, additionalPlayer: { name: playerName, playerId: uuidv4(), teeId } }
})

// --- When steps ---

When('I view the round summary', (state) => {
  const summary = {
    courseName: state.courseName,
    date: state.round.date,
    scoringSystem: state.scoringSystem,
    playerRounds: state.round.playerRounds,
  }
  return { ...state, summary }
})

When('the round is completed', async (state) => {
  await state.storage.saveRound(state.round)
  return state
})

// --- Then steps ---

Then('I should see the course name {string}', (state, [courseName]) => {
  expect(state.summary.courseName).toBe(courseName)
  return state
})

Then('I should see the date of the round', (state) => {
  expect(state.summary.date).toBeDefined()
  expect(state.summary.date.length).toBeGreaterThan(0)
  return state
})

Then('I should see the scoring system {string}', (state, [system]) => {
  expect(state.summary.scoringSystem).toBe(system)
  return state
})

// Note: "I should see the full scorecard table" is defined in scorecard.js

Then('I should see gross score {int} for {string}', (state, [gross, playerName]) => {
  const player = state.playerMap[playerName]
  const playerRound = state.round.playerRounds.find((pr) => pr.playerId === player.playerId)
  expect(playerRound).toBeDefined()
  expect(playerRound.totalGross).toBe(parseInt(gross))
  return state
})

Then('I should see net score {int} for {string}', (state, [net, playerName]) => {
  const player = state.playerMap[playerName]
  const playerRound = state.round.playerRounds.find((pr) => pr.playerId === player.playerId)
  expect(playerRound).toBeDefined()
  expect(playerRound.totalNet).toBe(parseInt(net))
  return state
})

Then('the round should appear in the round history', async (state) => {
  const rounds = await state.storage.getRounds()
  const found = rounds.find((r) => r.id === state.round.id)
  expect(found).toBeDefined()
  return state
})

Then('the saved round should have course {string}', async (state, [courseName]) => {
  const rounds = await state.storage.getRounds()
  const found = rounds.find((r) => r.id === state.round.id)
  expect(found).toBeDefined()
  expect(found.courseId).toBe(state.courseId)
  return state
})

Then(
  'the saved round should have a total gross of {int} for {string}',
  async (state, [gross, playerName]) => {
    const player = state.playerMap[playerName]
    const rounds = await state.storage.getRounds()
    const found = rounds.find((r) => r.id === state.round.id)
    expect(found).toBeDefined()
    const playerRound = found.playerRounds.find((pr) => pr.playerId === player.playerId)
    expect(playerRound).toBeDefined()
    expect(playerRound.totalGross).toBe(parseInt(gross))
    return state
  },
)
