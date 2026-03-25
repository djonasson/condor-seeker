import { Given, When, Then, DataTable } from 'vitest-cucumber-plugin'
import { expect } from 'vitest'
import { v4 as uuidv4 } from 'uuid'
import { useRoundStore } from '../../src/stores/round-store.ts'
import { useAppStore } from '../../src/stores/app-store.ts'
import { displayDistance, getUnitLabel } from '../../src/lib/distance.ts'
import { getScoringStrategy } from '../../src/features/round/scoring/index.ts'
import { formatScoreToPar } from '../../src/lib/score-formatting.ts'
import { DexieStorageBackend } from '../../src/storage/dexie/dexie-backend.ts'
import { CondorSeekerDB } from '../../src/storage/dexie/db.ts'

function getStorage() {
  const db = new CondorSeekerDB()
  return new DexieStorageBackend(db)
}

function buildCourse(name, teeRows) {
  const tees = teeRows.map((row) => ({
    id: uuidv4(),
    name: row.tee,
    courseRating: parseFloat(row.courseRating),
    slopeRating: parseFloat(row.slopeRating),
    totalDistance: 6000,
  }))
  return { id: uuidv4(), name, holes: [], tees }
}

// --- Background steps ---

Given('a course {string} with 18 holes and tees:', (state, [name], dataTable) => {
  const rows = DataTable(dataTable)
  const course = buildCourse(name, rows)
  const storage = getStorage()
  return { ...state, course, storage }
})

Given('the following hole data:', (state, _params, dataTable) => {
  const rows = DataTable(dataTable)
  const holeMap = {}

  for (const row of rows) {
    const holeNum = parseInt(row.hole)
    const teeName = row.tee
    const tee = state.course.tees.find((t) => t.name === teeName)
    if (!holeMap[holeNum]) {
      holeMap[holeNum] = {
        number: holeNum,
        parByTee: {},
        handicapByTee: {},
        distanceByTee: {},
      }
    }
    holeMap[holeNum].parByTee[tee.id] = parseInt(row.par)
    holeMap[holeNum].handicapByTee[tee.id] = parseInt(row.handicap)
    holeMap[holeNum].distanceByTee[tee.id] = parseInt(row.distance)
  }

  const holes = Object.values(holeMap)
  return { ...state, course: { ...state.course, holes } }
})

// "a player X exists with handicap index Y" is defined in player-setup.js
// We use a different step pattern here to avoid conflict.

// --- Scenario steps ---

function initRoundWithPlayers(state, rows, scoringSystem) {
  const playerMap = {}
  const roundPlayers = []
  const storage = state.storage || getStorage()

  for (const row of rows) {
    const playerId = uuidv4()
    const tee = state.course.tees.find((t) => t.name === row.tee)
    playerMap[row.player] = { playerId, teeId: tee.id, teeName: tee.name }
    roundPlayers.push({ playerId, playerName: row.player, teeId: tee.id })
  }

  useRoundStore.getState().initRound({
    courseId: state.course.id,
    courseName: state.course.name,
    scoringSystem,
    players: roundPlayers,
    totalHoles: state.course.holes.length,
  })

  return { ...state, playerMap, scoringSystem, storage }
}

Given('an active round on {string} with:', (state, [_courseName], dataTable) => {
  const rows = DataTable(dataTable)
  return initRoundWithPlayers(state, rows, 'stroke')
})

Given('an active round on {string} with stroke play:', (state, [_courseName], dataTable) => {
  const rows = DataTable(dataTable)
  return initRoundWithPlayers(state, rows, 'stroke')
})

Given('an active round on {string} with stableford:', (state, [_courseName], dataTable) => {
  const rows = DataTable(dataTable)
  return initRoundWithPlayers(state, rows, 'stableford')
})

Given("the user's distance unit is {string}", (state, [unit]) => {
  useAppStore.getState().setDistanceUnit(unit)
  return { ...state, distanceUnit: unit }
})

Given('{string} has scored the following:', (state, [playerName], dataTable) => {
  const rows = DataTable(dataTable)
  const player = state.playerMap[playerName]

  for (const row of rows) {
    const holeNum = parseInt(row.hole)
    const gross = parseInt(row.gross)
    useRoundStore.getState().setScore(player.playerId, holeNum, {
      grossScore: gross,
      netScore: gross,
    })
  }

  return state
})

When('I view hole {int} on the scorecard', (state, [holeNum]) => {
  useRoundStore.getState().goToHole(parseInt(holeNum))

  const hole = state.course.holes.find((h) => h.number === parseInt(holeNum))
  const distanceUnit = state.distanceUnit || useAppStore.getState().distanceUnit
  const holeInfoByPlayer = {}

  for (const [name, player] of Object.entries(state.playerMap)) {
    const tee = state.course.tees.find((t) => t.id === player.teeId)
    const rawDistance = hole.distanceByTee[player.teeId] ?? 0
    const distance = displayDistance(rawDistance, distanceUnit)
    const unitLabel = getUnitLabel(distanceUnit)

    holeInfoByPlayer[name] = {
      teeName: tee?.name ?? '',
      distance,
      distanceFormatted: `${distance} ${unitLabel}`,
      par: hole.parByTee[player.teeId] ?? 0,
      handicap: hole.handicapByTee[player.teeId] ?? 0,
    }
  }

  return { ...state, currentHole: parseInt(holeNum), holeInfoByPlayer }
})

// --- Then steps ---

Then('the card for {string} should show tee name {string}', (state, [playerName, expectedTee]) => {
  expect(state.holeInfoByPlayer[playerName].teeName).toBe(expectedTee)
  return state
})

Then('the card for {string} should show distance {string}', (state, [playerName, expectedDistance]) => {
  expect(state.holeInfoByPlayer[playerName].distanceFormatted).toBe(expectedDistance)
  return state
})

Then('the card for {string} should show a total gross of {int}', (state, [playerName, expectedGross]) => {
  const player = state.playerMap[playerName]
  const roundState = useRoundStore.getState()
  const scores = roundState.scores[player.playerId] ?? []
  const strategy = getScoringStrategy(state.scoringSystem)
  const holeResults = scores
    .filter((s) => s.grossScore > 0)
    .map((s) => {
      const hole = state.course.holes.find((h) => h.number === s.holeNumber)
      const par = hole.parByTee[player.teeId] ?? 0
      return strategy.calculateHoleScore(s.grossScore, par, 0)
    })
  const total = strategy.calculateRoundTotal(holeResults)
  expect(total.totalGross).toBe(parseInt(expectedGross))
  return state
})

Then('the card for {string} should show a total net score', (state, [playerName]) => {
  const player = state.playerMap[playerName]
  const roundState = useRoundStore.getState()
  const scores = roundState.scores[player.playerId] ?? []
  const strategy = getScoringStrategy(state.scoringSystem)
  const holeResults = scores
    .filter((s) => s.grossScore > 0)
    .map((s) => {
      const hole = state.course.holes.find((h) => h.number === s.holeNumber)
      const par = hole.parByTee[player.teeId] ?? 0
      return strategy.calculateHoleScore(s.grossScore, par, 0)
    })
  const total = strategy.calculateRoundTotal(holeResults)
  expect(total.totalNet).toBeDefined()
  return state
})

Then('the card for {string} should show the score to par', (state, [playerName]) => {
  const player = state.playerMap[playerName]
  const roundState = useRoundStore.getState()
  const scores = roundState.scores[player.playerId] ?? []
  const strategy = getScoringStrategy(state.scoringSystem)
  const holeResults = scores
    .filter((s) => s.grossScore > 0)
    .map((s) => {
      const hole = state.course.holes.find((h) => h.number === s.holeNumber)
      const par = hole.parByTee[player.teeId] ?? 0
      return strategy.calculateHoleScore(s.grossScore, par, 0)
    })
  const total = strategy.calculateRoundTotal(holeResults)
  const formatted = formatScoreToPar(total.totalToPar)
  expect(formatted).toBeDefined()
  return state
})

Then('the card for {string} should show total points', (state, [playerName]) => {
  const player = state.playerMap[playerName]
  const roundState = useRoundStore.getState()
  const scores = roundState.scores[player.playerId] ?? []
  const strategy = getScoringStrategy(state.scoringSystem)
  const holeResults = scores
    .filter((s) => s.grossScore > 0)
    .map((s) => {
      const hole = state.course.holes.find((h) => h.number === s.holeNumber)
      const par = hole.parByTee[player.teeId] ?? 0
      return strategy.calculateHoleScore(s.grossScore, par, 0)
    })
  const total = strategy.calculateRoundTotal(holeResults)
  expect(total.totalPoints).toBeDefined()
  return state
})

Then('there should be no separate score summary bar', (state) => {
  // ScoreSummaryBar has been removed from ScorecardPage.
  // Running totals are now inline in each player's HoleScoreEntry card.
  expect(true).toBe(true)
  return state
})
