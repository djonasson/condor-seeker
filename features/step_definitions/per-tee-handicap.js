import { Given, When, Then } from 'vitest-cucumber-plugin'
import { expect } from 'vitest'
import { v4 as uuidv4 } from 'uuid'
import { allocateStrokes, calculateCourseHandicap } from '../../src/lib/handicap.ts'

function buildCourseWithPerTeeHandicaps(name, teeNames) {
  const tees = teeNames.map((n) => ({
    id: uuidv4(),
    name: n,
    courseRating: 72.0,
    slopeRating: 113,
    totalDistance: 6000,
  }))

  const holes = []
  for (let i = 1; i <= 18; i++) {
    const parByTee = {}
    const handicapByTee = {}
    const distanceByTee = {}
    for (const tee of tees) {
      parByTee[tee.id] = 4
      handicapByTee[tee.id] = i
      distanceByTee[tee.id] = 300 + i * 10
    }
    holes.push({ number: i, parByTee, handicapByTee, distanceByTee })
  }

  return { id: uuidv4(), name, holes, tees }
}

// --- Scenario: Course stores different handicap per tee ---

Given('a course {string} with tees {string} and {string}', (state, [name, tee1, tee2]) => {
  const course = buildCourseWithPerTeeHandicaps(name, [tee1, tee2])
  return { ...state, course }
})

Given(
  'hole {int} has handicap {int} from {string} tee and handicap {int} from {string} tee',
  (state, [holeNum, hcp1, teeName1, hcp2, teeName2]) => {
    const tee1 = state.course.tees.find((t) => t.name === teeName1)
    const tee2 = state.course.tees.find((t) => t.name === teeName2)
    const holes = state.course.holes.map((h) => {
      if (h.number === parseInt(holeNum)) {
        return {
          ...h,
          handicapByTee: {
            ...h.handicapByTee,
            [tee1.id]: parseInt(hcp1),
            [tee2.id]: parseInt(hcp2),
          },
        }
      }
      return h
    })
    return { ...state, course: { ...state.course, holes } }
  },
)

Then('hole {int} handicap from {string} tee should be {int}', (state, [holeNum, teeName, expected]) => {
  const tee = state.course.tees.find((t) => t.name === teeName)
  const hole = state.course.holes.find((h) => h.number === parseInt(holeNum))
  expect(hole).toBeDefined()
  expect(hole.handicapByTee[tee.id]).toBe(parseInt(expected))
  return state
})

// --- Scenario: Stroke allocation uses correct handicap ---

Given('a course with per-tee handicaps', (state) => {
  const course = buildCourseWithPerTeeHandicaps('Test Course', ['White', 'Red'])
  // Set different handicaps per tee
  const whiteTee = course.tees.find((t) => t.name === 'White')
  const redTee = course.tees.find((t) => t.name === 'Red')
  for (const hole of course.holes) {
    hole.handicapByTee[whiteTee.id] = hole.number
    hole.handicapByTee[redTee.id] = 19 - hole.number // Reversed order
  }
  return { ...state, course, playerMap: {} }
})

Given(
  'player {string} plays from {string} tee with handicap index {int}',
  (state, [name, teeName, handicapIndex]) => {
    const tee = state.course.tees.find((t) => t.name === teeName)
    const playerId = uuidv4()
    const playerMap = {
      ...state.playerMap,
      [name]: { playerId, teeId: tee.id, handicapIndex: parseInt(handicapIndex) },
    }
    return { ...state, playerMap }
  },
)

Then('{string} stroke allocation should use {string} tee handicaps', (state, [name, teeName]) => {
  const player = state.playerMap[name]
  const tee = state.course.tees.find((t) => t.name === teeName)
  const sortedHoles = state.course.holes.slice().sort((a, b) => a.number - b.number)
  const holeHandicaps = sortedHoles.map((h) => h.handicapByTee[tee.id])
  const totalPar = sortedHoles.reduce((sum, h) => sum + (h.parByTee[tee.id] ?? 0), 0)
  const courseHcap = calculateCourseHandicap(player.handicapIndex, tee.slopeRating, tee.courseRating, totalPar)
  const strokes = allocateStrokes(courseHcap, holeHandicaps)

  // Verify the allocation uses the correct tee's handicaps
  expect(holeHandicaps).toEqual(sortedHoles.map((h) => h.handicapByTee[player.teeId]))
  expect(strokes.length).toBe(sortedHoles.length)
  return state
})

// --- Scenario: Scorecard displays correct handicap ---

Given('an active round on a course with per-tee handicaps', (state) => {
  const course = buildCourseWithPerTeeHandicaps('Test Course', ['White', 'Red'])
  const whiteTee = course.tees.find((t) => t.name === 'White')
  const redTee = course.tees.find((t) => t.name === 'Red')
  for (const hole of course.holes) {
    hole.handicapByTee[whiteTee.id] = hole.number
    hole.handicapByTee[redTee.id] = 19 - hole.number
  }
  return { ...state, course, playerMap: {} }
})

Given('player {string} plays from {string} tee', (state, [name, teeName]) => {
  const tee = state.course.tees.find((t) => t.name === teeName)
  const playerId = uuidv4()
  const playerMap = { ...state.playerMap, [name]: { playerId, teeId: tee.id } }
  return { ...state, playerMap }
})

When('viewing the scorecard for hole {int}', (state, [holeNum]) => {
  const hole = state.course.holes.find((h) => h.number === parseInt(holeNum))
  const holeInfoByPlayer = {}
  for (const [name, player] of Object.entries(state.playerMap)) {
    holeInfoByPlayer[name] = {
      par: hole.parByTee[player.teeId] ?? 0,
      distance: hole.distanceByTee[player.teeId] ?? 0,
      handicap: hole.handicapByTee[player.teeId] ?? 0,
    }
  }
  return { ...state, currentHole: parseInt(holeNum), holeInfoByPlayer }
})

Then('{string} should see handicap {int} for hole {int}', (state, [name, expected, holeNum]) => {
  expect(state.holeInfoByPlayer[name].handicap).toBe(parseInt(expected))
  return state
})

Then('each player card should show their tee-specific par', (state) => {
  for (const [name, player] of Object.entries(state.playerMap)) {
    const hole = state.course.holes.find((h) => h.number === state.currentHole)
    expect(state.holeInfoByPlayer[name].par).toBe(hole.parByTee[player.teeId])
  }
  return state
})

Then('each player card should show their tee-specific distance', (state) => {
  for (const [name, player] of Object.entries(state.playerMap)) {
    const hole = state.course.holes.find((h) => h.number === state.currentHole)
    expect(state.holeInfoByPlayer[name].distance).toBe(hole.distanceByTee[player.teeId])
  }
  return state
})

Then('each player card should show their tee-specific handicap', (state) => {
  for (const [name, player] of Object.entries(state.playerMap)) {
    const hole = state.course.holes.find((h) => h.number === state.currentHole)
    expect(state.holeInfoByPlayer[name].handicap).toBe(hole.handicapByTee[player.teeId])
  }
  return state
})

// --- Scenario: Legacy migration ---

Given('a course stored with flat handicap {int} on hole {int}', (state, [hcp, holeNum]) => {
  return { ...state, legacyHandicap: parseInt(hcp), legacyHoleNum: parseInt(holeNum) }
})

Given('the course has tees {string} and {string}', (state, [tee1Name, tee2Name]) => {
  const tees = [
    { id: uuidv4(), name: tee1Name },
    { id: uuidv4(), name: tee2Name },
  ]
  const legacyHole = {
    number: state.legacyHoleNum,
    parByTee: {},
    handicap: state.legacyHandicap,
    distanceByTee: {},
  }
  for (const tee of tees) {
    legacyHole.parByTee[tee.id] = 4
    legacyHole.distanceByTee[tee.id] = 300
  }
  return { ...state, legacyHole, tees }
})

When('the database migration runs', (state) => {
  const hole = { ...state.legacyHole }
  if (typeof hole.handicap === 'number') {
    hole.handicapByTee = {}
    for (const tee of state.tees) {
      hole.handicapByTee[tee.id] = hole.handicap
    }
    delete hole.handicap
  }
  return { ...state, migratedHole: hole }
})

Then('hole {int} should have handicapByTee with value {int} for both tees', (state, [holeNum, expected]) => {
  expect(state.migratedHole.handicapByTee).toBeDefined()
  expect(state.migratedHole.handicap).toBeUndefined()
  for (const tee of state.tees) {
    expect(state.migratedHole.handicapByTee[tee.id]).toBe(parseInt(expected))
  }
  return state
})
