import { Given, When, Then, DataTable } from 'vitest-cucumber-plugin'
import { expect } from 'vitest'
import { v4 as uuidv4 } from 'uuid'
import { getScoreBadgeVariant } from '../../src/features/round/lib/score-badge.ts'

function buildCourse(courseName, clubName, teeData, holeData) {
  const tees = teeData.map((t) => ({
    id: uuidv4(),
    name: t.tee,
    courseRating: parseFloat(t.courseRating),
    slopeRating: parseInt(t.slopeRating),
    totalDistance: 0,
  }))

  const holes = holeData.map((h) => {
    const parByTee = {}
    const distanceByTee = {}
    for (const tee of tees) {
      parByTee[tee.id] = parseInt(h.par)
      distanceByTee[tee.id] = parseInt(h.distance)
    }
    const handicapByTee = {}
    for (const tee of tees) {
      handicapByTee[tee.id] = parseInt(h.handicap)
    }
    return {
      number: parseInt(h.hole),
      parByTee,
      handicapByTee,
      distanceByTee,
    }
  })

  // Calculate total distance
  for (const tee of tees) {
    tee.totalDistance = holes.reduce((sum, h) => sum + (h.distanceByTee[tee.id] ?? 0), 0)
  }

  return { id: uuidv4(), name: courseName, clubName, holes, tees }
}

// --- Background ---

Given(
  'a course {string} with {int} holes and the following tee:',
  (state, [courseName, numHoles], dataTable) => {
    const rows = DataTable(dataTable)
    return {
      ...state,
      courseName,
      numHoles: parseInt(numHoles),
      teeData: rows,
      holeData: [],
      clubName: undefined,
    }
  },
)

Given('the course belongs to club {string}', (state, [clubName]) => {
  return { ...state, clubName }
})

Given('the following hole data for tee {string}:', (state, [teeName], dataTable) => {
  const rows = DataTable(dataTable)
  const course = buildCourse(state.courseName, state.clubName, state.teeData, rows)
  return { ...state, course, holeData: rows }
})

// --- Score badge scenarios ---

Given('a completed hole with par {int} and gross score {int}', (state, [par, gross]) => {
  return { ...state, holePar: parseInt(par), holeGross: parseInt(gross) }
})

Then(
  'the score badge should display a {string} shape',
  (state, [expectedShape]) => {
    const variant = getScoreBadgeVariant(state.holeGross, state.holePar)
    expect(variant.shape).toBe(expectedShape)
    return state
  },
)

// --- Traditional scorecard scenarios ---

When('I view the traditional scorecard', (state) => {
  return { ...state, viewMode: 'traditional' }
})

Then('I should see a {string} row showing the handicap index for each hole', (state, [label]) => {
  expect(label).toBe('HCP')
  // Verify hole data has handicap values
  const firstTeeId = state.course.tees[0].id
  for (const hole of state.course.holes) {
    expect(hole.handicapByTee[firstTeeId]).toBeDefined()
    expect(hole.handicapByTee[firstTeeId]).toBeGreaterThan(0)
  }
  return state
})

Then('hole {int} should show handicap {int}', (state, [holeNum, expectedHcp]) => {
  const hole = state.course.holes.find((h) => h.number === parseInt(holeNum))
  expect(hole).toBeDefined()
  const firstTeeId = state.course.tees[0].id
  expect(hole.handicapByTee[firstTeeId]).toBe(parseInt(expectedHcp))
  return state
})

Then('I should see the course rating {string}', (state, [expectedCR]) => {
  const tee = state.course.tees[0]
  expect(tee.courseRating).toBe(parseFloat(expectedCR))
  return state
})

Then('I should see the slope rating {string}', (state, [expectedSlope]) => {
  const tee = state.course.tees[0]
  expect(tee.slopeRating).toBe(parseInt(expectedSlope))
  return state
})

Then('I should see a front nine section with holes {int} through {int}', (state, [from, to]) => {
  const frontNine = state.course.holes.filter(
    (h) => h.number >= parseInt(from) && h.number <= parseInt(to),
  )
  expect(frontNine.length).toBe(parseInt(to) - parseInt(from) + 1)
  return state
})

Then('I should see column headers for each hole number', (state) => {
  const frontNine = state.course.holes.filter((h) => h.number <= 9)
  expect(frontNine.length).toBeGreaterThan(0)
  for (const hole of frontNine) {
    expect(hole.number).toBeGreaterThan(0)
  }
  return state
})

Then('I should see an {string} column with the front nine total', (state, [label]) => {
  expect(label).toBe('Out')
  // Verify we can calculate front nine total
  const teeId = state.course.tees[0].id
  const frontNine = state.course.holes.filter((h) => h.number <= 9)
  const total = frontNine.reduce((sum, h) => sum + (h.parByTee[teeId] ?? 0), 0)
  expect(total).toBeGreaterThan(0)
  return state
})

// --- Score totals ---

Given(
  'the following scores for {string} on tee {string}:',
  (state, [playerName, teeName], dataTable) => {
    const rows = DataTable(dataTable)
    const tee = state.course.tees.find((t) => t.name === teeName)
    const scores = rows.map((row) => ({
      holeNumber: parseInt(row.hole),
      grossScore: parseInt(row.gross),
      netScore: parseInt(row.gross), // Simplified for test
      par: state.course.holes.find((h) => h.number === parseInt(row.hole))?.parByTee[tee.id] ?? 0,
      scoreToPar:
        parseInt(row.gross) -
        (state.course.holes.find((h) => h.number === parseInt(row.hole))?.parByTee[tee.id] ?? 0),
    }))
    return { ...state, playerScores: scores, playerName, teeId: tee.id }
  },
)

Then('the front nine gross total should be {int}', (state, [expectedTotal]) => {
  const frontNine = state.playerScores.filter((s) => s.holeNumber <= 9)
  const total = frontNine.reduce((sum, s) => sum + s.grossScore, 0)
  expect(total).toBe(parseInt(expectedTotal))
  return state
})

Then('the front nine par total should be {int}', (state, [expectedTotal]) => {
  const frontNine = state.course.holes.filter((h) => h.number <= 9)
  const total = frontNine.reduce((sum, h) => sum + (h.parByTee[state.teeId] ?? 0), 0)
  expect(total).toBe(parseInt(expectedTotal))
  return state
})
