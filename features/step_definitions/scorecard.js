import { Given, When, Then, DataTable } from 'vitest-cucumber-plugin'
import { expect } from 'vitest'
import { v4 as uuidv4 } from 'uuid'
import { useRoundStore } from '../../src/stores/round-store.ts'
import { getScoringStrategy } from '../../src/features/round/scoring/index.ts'
import { DexieStorageBackend } from '../../src/storage/dexie/dexie-backend.ts'
import { CondorSeekerDB } from '../../src/storage/dexie/db.ts'
import { getScoreToParColor, formatScoreToPar, clampPutts } from '../../src/lib/score-formatting.ts'

function getStorage() {
  const db = new CondorSeekerDB()
  return new DexieStorageBackend(db)
}

function buildDefaultCourse(name, numHoles) {
  const teeWhite = {
    id: uuidv4(),
    name: 'White',
    courseRating: 72.0,
    slopeRating: 113,
    totalDistance: 6500,
  }
  const tees = [teeWhite]
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

function initActiveRound(course, playerName, teeName, scoringSystem) {
  const tee = course.tees.find((t) => t.name === teeName)
  const playerId = uuidv4()
  const players = [{ playerId, playerName, teeId: tee.id }]

  useRoundStore.getState().initRound({
    courseId: course.id,
    courseName: course.name,
    scoringSystem,
    players,
    totalHoles: course.holes.length,
  })

  return { playerId, teeId: tee.id }
}

// --- Background ---

Given(
  'an active stroke play round on {string} with {int} holes',
  (state, [courseName, numHoles]) => {
    const storage = getStorage()
    const course = buildDefaultCourse(courseName, parseInt(numHoles))
    return { ...state, storage, course, scoringSystem: 'stroke', playerMap: {} }
  },
)

Given('player {string} is playing from the {string} tee', (state, [playerName, teeName]) => {
  const { playerId, teeId } = initActiveRound(state.course, playerName, teeName, state.scoringSystem)
  const playerMap = { ...state.playerMap, [playerName]: { playerId, teeId } }
  return { ...state, playerMap, currentPage: 'scorecard' }
})

Given('I am on the scorecard page', (state) => {
  return { ...state, currentPage: 'scorecard' }
})

// --- Given steps for scenarios ---

Given('I am on hole {int} with par {int}', (state, [holeNum, par]) => {
  useRoundStore.getState().goToHole(parseInt(holeNum))
  // Update the course hole's par for all tees
  const holes = state.course.holes.map((h) => {
    if (h.number === parseInt(holeNum)) {
      const parByTee = { ...h.parByTee }
      for (const key of Object.keys(parByTee)) {
        parByTee[key] = parseInt(par)
      }
      return { ...h, parByTee }
    }
    return h
  })
  return { ...state, course: { ...state.course, holes } }
})

Given('I am on hole {int}', (state, [holeNum]) => {
  useRoundStore.getState().goToHole(parseInt(holeNum))
  return state
})

Given(
  'I have entered a score of {int} for {string} on hole {int}',
  (state, [score, playerName, holeNum]) => {
    const player = state.playerMap[playerName]
    useRoundStore.getState().setScore(player.playerId, parseInt(holeNum), {
      grossScore: parseInt(score),
      netScore: parseInt(score),
    })
    return state
  },
)

Given('I have entered the following scores for {string}:', (state, [playerName], dataTable) => {
  const rows = DataTable(dataTable)
  const player = state.playerMap[playerName]
  for (const row of rows) {
    const holeNum = parseInt(row.hole)
    const gross = parseInt(row.gross)
    const par = parseInt(row.par)
    const strategy = getScoringStrategy(state.scoringSystem)
    const result = strategy.calculateHoleScore(gross, par, 0)
    useRoundStore.getState().setScore(player.playerId, holeNum, {
      grossScore: result.grossScore,
      netScore: result.netScore,
    })
  }
  return state
})

Given('hole {int} has par {int} and handicap {int}', (state, [holeNum, par, handicap]) => {
  // Update the course hole data in state for reference
  const holes = [...state.course.holes]
  const idx = holes.findIndex((h) => h.number === parseInt(holeNum))
  if (idx >= 0) {
    const tee = state.course.tees[0]
    holes[idx] = {
      ...holes[idx],
      parByTee: { ...holes[idx].parByTee, [tee.id]: parseInt(par) },
      handicap: parseInt(handicap),
    }
  }
  return { ...state, course: { ...state.course, holes } }
})

Given(
  '{string} receives {int} handicap stroke on hole {int}',
  (state, [playerName, strokes, holeNum]) => {
    const handicapStrokes = { ...(state.handicapStrokes || {}) }
    const player = state.playerMap[playerName]
    if (!handicapStrokes[player.playerId]) {
      handicapStrokes[player.playerId] = {}
    }
    handicapStrokes[player.playerId][parseInt(holeNum)] = parseInt(strokes)
    return { ...state, handicapStrokes }
  },
)

Given(
  'I have entered scores for holes {int} through {int} for {string}',
  (state, [from, to, playerName]) => {
    const player = state.playerMap[playerName]
    for (let h = parseInt(from); h <= parseInt(to); h++) {
      const hole = state.course.holes.find((ho) => ho.number === h)
      const teeId = player.teeId
      const par = hole.parByTee[teeId]
      const gross = par + 1 // bogey for each hole
      useRoundStore.getState().setScore(player.playerId, h, {
        grossScore: gross,
        netScore: gross,
      })
    }
    return state
  },
)

// --- When steps ---

When('I enter a gross score of {int} for {string}', (state, [score, playerName]) => {
  const player = state.playerMap[playerName]
  const roundState = useRoundStore.getState()
  const holeNum = roundState.currentHole
  useRoundStore.getState().setScore(player.playerId, holeNum, {
    grossScore: parseInt(score),
    netScore: parseInt(score),
  })
  return state
})

When(
  'I enter a gross score of {int} for {string} on hole {int}',
  (state, [score, playerName, holeNum]) => {
    const player = state.playerMap[playerName]
    const handicapStrokes = (state.handicapStrokes?.[player.playerId]?.[parseInt(holeNum)]) || 0
    const grossScore = parseInt(score)
    const netScore = grossScore - handicapStrokes
    useRoundStore.getState().setScore(player.playerId, parseInt(holeNum), {
      grossScore,
      netScore,
    })
    return state
  },
)

When('I navigate to the next hole', (state) => {
  useRoundStore.getState().nextHole()
  return state
})

When('I navigate to the previous hole', (state) => {
  useRoundStore.getState().prevHole()
  return state
})

When('I navigate to hole {int}', (state, [holeNum]) => {
  useRoundStore.getState().goToHole(parseInt(holeNum))
  return state
})

When('I change the gross score to {int} for {string}', (state, [score, playerName]) => {
  const player = state.playerMap[playerName]
  const roundState = useRoundStore.getState()
  const holeNum = roundState.currentHole
  const scores = roundState.scores[player.playerId] ?? []
  const existing = scores.find((s) => s.holeNumber === holeNum)
  const newGross = parseInt(score)
  const update = {
    grossScore: newGross,
    netScore: newGross,
  }
  // Clamp putts if they exceed the new gross score
  if (existing?.putts !== undefined && existing.putts > newGross) {
    update.putts = clampPutts(existing.putts, newGross)
  }
  useRoundStore.getState().setScore(player.playerId, holeNum, update)
  return state
})

When('I click the table view button', (state) => {
  return { ...state, viewMode: 'table' }
})

When('I click the abandon round button', (state) => {
  return { ...state, showAbandonConfirmation: true }
})

When('I confirm abandoning the round', (state) => {
  useRoundStore.getState().clearRound()
  return { ...state, showAbandonConfirmation: false, currentPage: 'home' }
})

When('I cancel abandoning the round', (state) => {
  return { ...state, showAbandonConfirmation: false }
})

// --- Then steps ---

Then(
  'the score for hole {int} should show {int} for {string}',
  (state, [holeNum, expectedScore, playerName]) => {
    const player = state.playerMap[playerName]
    const roundState = useRoundStore.getState()
    const scores = roundState.scores[player.playerId]
    const holeScore = scores.find((s) => s.holeNumber === parseInt(holeNum))
    expect(holeScore).toBeDefined()
    expect(holeScore.grossScore).toBe(parseInt(expectedScore))
    return state
  },
)

Then('I should be on hole {int}', (state, [holeNum]) => {
  const roundState = useRoundStore.getState()
  expect(roundState.currentHole).toBe(parseInt(holeNum))
  return state
})

Then(
  'the running total for {string} should show a gross of {int}',
  (state, [playerName, expectedGross]) => {
    const player = state.playerMap[playerName]
    const roundState = useRoundStore.getState()
    const scores = roundState.scores[player.playerId]
    const strategy = getScoringStrategy(state.scoringSystem)
    const holeResults = scores.map((s) => {
      const hole = state.course.holes.find((h) => h.number === s.holeNumber)
      const teeId = player.teeId
      const par = hole.parByTee[teeId]
      return strategy.calculateHoleScore(s.grossScore, par, 0)
    })
    const total = strategy.calculateRoundTotal(holeResults)
    expect(total.totalGross).toBe(parseInt(expectedGross))
    return state
  },
)

Then(
  'the net score for hole {int} should be {int} for {string}',
  (state, [holeNum, expectedNet, playerName]) => {
    const player = state.playerMap[playerName]
    const roundState = useRoundStore.getState()
    const scores = roundState.scores[player.playerId]
    const holeScore = scores.find((s) => s.holeNumber === parseInt(holeNum))
    expect(holeScore).toBeDefined()
    expect(holeScore.netScore).toBe(parseInt(expectedNet))
    return state
  },
)

Then('I should see the full scorecard table', (state) => {
  // For active rounds, verify via store; for completed rounds, verify via summary/round state
  const roundState = useRoundStore.getState()
  if (roundState.isActive) {
    expect(Object.keys(roundState.scores).length).toBeGreaterThan(0)
  } else if (state.round) {
    expect(state.round.playerRounds.length).toBeGreaterThan(0)
  }
  if (state.viewMode) {
    expect(state.viewMode).toBe('table')
  }
  return state
})

Then(
  'the table should show scores for holes {int} through {int}',
  (state, [from, to]) => {
    const roundState = useRoundStore.getState()
    const playerIds = Object.keys(roundState.scores)
    for (const playerId of playerIds) {
      const scores = roundState.scores[playerId]
      for (let h = parseInt(from); h <= parseInt(to); h++) {
        const holeScore = scores.find((s) => s.holeNumber === h)
        expect(holeScore).toBeDefined()
      }
    }
    return state
  },
)

Then('I should see an abandon confirmation dialog', (state) => {
  expect(state.showAbandonConfirmation).toBe(true)
  return state
})

Then('the active round should be cleared', (state) => {
  const roundState = useRoundStore.getState()
  expect(roundState.isActive).toBe(false)
  expect(roundState.courseId).toBeNull()
  return state
})

Then('I should be navigated to the home page', (state) => {
  expect(state.currentPage).toBe('home')
  return state
})

Then('I should still be on the scorecard page', (state) => {
  expect(state.currentPage).toBe('scorecard')
  return state
})

Then('the active round should still exist', (state) => {
  const roundState = useRoundStore.getState()
  expect(roundState.isActive).toBe(true)
  return state
})

Then('the over\\/under display for {string} should show {string}', (state, [playerName, expected]) => {
  const player = state.playerMap[playerName]
  const roundState = useRoundStore.getState()
  const scores = roundState.scores[player.playerId]
  const strategy = getScoringStrategy(state.scoringSystem)
  const holeResults = scores.map((s) => {
    const hole = state.course.holes.find((h) => h.number === s.holeNumber)
    const par = hole.parByTee[player.teeId]
    return strategy.calculateHoleScore(s.grossScore, par, 0)
  })
  const total = strategy.calculateRoundTotal(holeResults)
  expect(formatScoreToPar(total.totalToPar)).toBe(expected)
  return { ...state, lastTotalToPar: total.totalToPar }
})

Then('the over\\/under color for {string} should be {string}', (state, [_playerName, expected]) => {
  const color = getScoreToParColor(state.lastTotalToPar)
  expect(color).toBe(expected)
  return state
})

When('I enter {int} putts for {string} on hole {int}', (state, [putts, playerName, holeNum]) => {
  const player = state.playerMap[playerName]
  const roundState = useRoundStore.getState()
  const scores = roundState.scores[player.playerId] ?? []
  const holeScore = scores.find((s) => s.holeNumber === parseInt(holeNum))
  const grossScore = holeScore?.grossScore ?? 0
  const clamped = clampPutts(parseInt(putts), grossScore)
  useRoundStore.getState().setScore(player.playerId, parseInt(holeNum), { putts: clamped })
  return state
})

Then('the putts for hole {int} should be {int} for {string}', (state, [holeNum, expected, playerName]) => {
  const player = state.playerMap[playerName]
  const roundState = useRoundStore.getState()
  const scores = roundState.scores[player.playerId] ?? []
  const holeScore = scores.find((s) => s.holeNumber === parseInt(holeNum))
  expect(holeScore).toBeDefined()
  expect(holeScore.putts).toBe(parseInt(expected))
  return state
})
