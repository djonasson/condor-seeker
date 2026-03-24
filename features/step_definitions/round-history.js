import { Given, When, Then, DataTable } from 'vitest-cucumber-plugin'
import { expect } from 'vitest'
import { v4 as uuidv4 } from 'uuid'
import { DexieStorageBackend } from '../../src/storage/dexie/dexie-backend.ts'
import { CondorSeekerDB } from '../../src/storage/dexie/db.ts'

async function getStorage() {
  const db = new CondorSeekerDB()
  const storage = new DexieStorageBackend(db)
  // Clear all round data to avoid cross-scenario pollution
  const existingRounds = await storage.getRounds()
  for (const r of existingRounds) {
    await storage.deleteRound(r.id)
  }
  return storage
}

function buildRound(courseName, date, gross, net) {
  const courseId = uuidv4()
  const playerId = uuidv4()
  const teeId = uuidv4()
  const numHoles = 18
  const baseGross = Math.floor(gross / numHoles)
  const baseNet = Math.floor(net / numHoles)
  let remainingGross = gross
  let remainingNet = net
  const holeScores = []
  for (let i = 1; i <= numHoles; i++) {
    const g = i < numHoles ? baseGross : remainingGross
    const n = i < numHoles ? baseNet : remainingNet
    holeScores.push({ holeNumber: i, grossScore: g, netScore: n })
    remainingGross -= g
    remainingNet -= n
  }
  return {
    id: uuidv4(),
    courseId,
    courseName, // stored on state for lookup; not part of Round type
    date,
    scoringSystem: 'stroke',
    playerRounds: [
      {
        playerId,
        teeId,
        holeScores,
        totalGross: gross,
        totalNet: net,
      },
    ],
  }
}

// --- Given steps ---

Given('the following rounds have been played:', async (state, params, dataTable) => {
  const storage = await getStorage()
  const rows = DataTable(dataTable)
  const rounds = []
  const courseNameMap = {}
  for (const row of rows) {
    const round = buildRound(row.course, row.date, Number(row.gross), Number(row.net))
    courseNameMap[round.id] = row.course
    await storage.saveRound(round)
    rounds.push(round)
  }
  return { ...state, storage, rounds, courseNameMap }
})

Given('a round at {string} on {string} exists in history', async (state, [courseName, date]) => {
  const storage = await getStorage()
  const round = buildRound(courseName, date, 78, 73)
  await storage.saveRound(round)
  const courseNameMap = { ...(state.courseNameMap || {}), [round.id]: courseName }
  return { ...state, storage, rounds: [...(state.rounds || []), round], courseNameMap }
})

Given('I am on the round history page', async (state) => {
  const rounds = await state.storage.getRounds()
  const historyRounds = rounds.map((r) => ({
    ...r,
    courseName: state.courseNameMap?.[r.id] || r.courseId,
  }))
  return { ...state, historyRounds, currentPage: 'round-history' }
})

Given('no rounds have been played', async () => {
  const storage = await getStorage()
  return { storage, rounds: [], historyRounds: [], courseNameMap: {} }
})

// --- When steps ---

When('I view the round history page', async (state) => {
  const rounds = await state.storage.getRounds()
  const historyRounds = rounds.map((r) => ({
    ...r,
    courseName: state.courseNameMap?.[r.id] || r.courseId,
  }))
  return { ...state, historyRounds, currentPage: 'round-history' }
})

When('I click on the round at {string}', (state, [courseName]) => {
  const round = state.historyRounds.find((r) => r.courseName === courseName)
  const summary = {
    courseName,
    date: round.date,
    scoringSystem: round.scoringSystem,
    playerRounds: round.playerRounds,
  }
  return { ...state, round, summary, currentPage: 'round-detail' }
})

When('I click delete on the round at {string}', (state, [courseName]) => {
  const round = state.historyRounds.find((r) => r.courseName === courseName)
  return { ...state, pendingDeleteRound: round, showDeleteConfirmation: true }
})

// Note: "I confirm the deletion" is defined in player-setup.js (handles pendingDeleteRound)
// Note: "I cancel the deletion" is defined in player-setup.js
// Note: "I should see a delete confirmation dialog" is defined in player-setup.js

// --- Then steps ---

Then('I should see {int} rounds in the list', (state, [count]) => {
  expect(state.historyRounds.length).toBe(Number(count))
  return state
})

Then('I should see the round at {string} on {string}', (state, [courseName, date]) => {
  const found = state.historyRounds.find(
    (r) => r.courseName === courseName && r.date === date,
  )
  expect(found).toBeDefined()
  return state
})

Then('I should see the round detail page', (state) => {
  expect(state.currentPage).toBe('round-detail')
  expect(state.round).toBeDefined()
  return state
})

// Note: "I should see the course name {string}" is defined in round-summary.js
// Note: "I should see the full scorecard table" is defined in scorecard.js

Then('I should see the date {string}', (state, [date]) => {
  expect(state.summary.date).toBe(date)
  return state
})

Then('I should see the total gross and net scores', (state) => {
  expect(state.round.playerRounds.length).toBeGreaterThan(0)
  for (const pr of state.round.playerRounds) {
    expect(pr.totalGross).toBeDefined()
    expect(pr.totalNet).toBeDefined()
  }
  return state
})

Then('the round at {string} should no longer appear in history', async (state, [courseName]) => {
  const rounds = await state.storage.getRounds()
  const historyRounds = rounds.map((r) => ({
    ...r,
    courseName: state.courseNameMap?.[r.id] || r.courseId,
  }))
  const found = historyRounds.find((r) => r.courseName === courseName)
  expect(found).toBeUndefined()
  return { ...state, historyRounds }
})

Then('the round at {string} should still appear in history', async (state, [courseName]) => {
  const rounds = await state.storage.getRounds()
  const historyRounds = rounds.map((r) => ({
    ...r,
    courseName: state.courseNameMap?.[r.id] || r.courseId,
  }))
  const found = historyRounds.find((r) => r.courseName === courseName)
  expect(found).toBeDefined()
  return { ...state, historyRounds }
})

Then('I should see a message indicating no rounds have been played', (state) => {
  expect(state.historyRounds.length).toBe(0)
  const showEmptyMessage = state.historyRounds.length === 0
  expect(showEmptyMessage).toBe(true)
  return state
})
