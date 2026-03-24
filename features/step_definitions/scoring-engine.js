import { Given, When, Then, DataTable } from 'vitest-cucumber-plugin'
import { expect } from 'vitest'
import { getScoringStrategy } from '../../src/features/round/scoring/index.ts'
import { allocateStrokes } from '../../src/lib/handicap.ts'

// --- Given steps ---

Given('the scoring system is {string}', (state, [system]) => {
  const strategy = getScoringStrategy(system)
  return { ...state, strategy, system }
})

Given('the following hole results:', (state, params, dataTable) => {
  const rows = DataTable(dataTable)
  const holeResults = rows.map((row) => {
    const grossScore = Number(row.grossScore)
    const par = Number(row.par)
    const handicapStrokes = Number(row.handicapStrokes)
    return state.strategy.calculateHoleScore(grossScore, par, handicapStrokes)
  })
  return { ...state, holeResults }
})

Given('a course with {int} holes', (state, [holeCount]) => {
  const holes = Array.from({ length: Number(holeCount) }, (_, i) => ({
    number: i + 1,
    handicapIndex: i + 1,
  }))
  return { ...state, holes, holeCount: Number(holeCount) }
})

Given('hole {int} has a handicap index of {int}', (state, [holeNum, handicapIndex]) => {
  const holes = [...state.holes]
  const idx = holes.findIndex((h) => h.number === Number(holeNum))
  if (idx >= 0) {
    holes[idx] = { ...holes[idx], handicapIndex: Number(handicapIndex) }
  }
  return { ...state, holes }
})

Given('a player with a course handicap of {int}', (state, [courseHandicap]) => {
  const holeHandicaps = state.holes.map((h) => h.handicapIndex)
  const strokes = allocateStrokes(Number(courseHandicap), holeHandicaps)
  return { ...state, courseHandicap: Number(courseHandicap), strokes }
})

// --- When steps ---

When(
  'a player takes {int} strokes on a par {int} hole with {int} handicap strokes',
  (state, [strokes, par, handicapStrokes]) => {
    const result = state.strategy.calculateHoleScore(
      Number(strokes),
      Number(par),
      Number(handicapStrokes),
    )
    return { ...state, result }
  },
)

// --- Then steps ---

Then('the gross score should be {int}', (state, [expected]) => {
  expect(state.result.grossScore).toBe(Number(expected))
  return state
})

Then('the net score should be {int}', (state, [expected]) => {
  expect(state.result.netScore).toBe(Number(expected))
  return state
})

Then('the score to par should be {int}', (state, [expected]) => {
  expect(state.result.scoreToPar).toBe(Number(expected))
  return state
})

Then('the formatted score should be {string}', (state, [expected]) => {
  const formatted = state.strategy.formatScore(state.result ?? state.holeResults?.[0])
  expect(formatted).toBe(expected)
  return state
})

Then('the stableford points should be {int}', (state, [expected]) => {
  expect(state.result.points).toBe(Number(expected))
  return state
})

Then('the total gross should be {int}', (state, [expected]) => {
  const total = state.roundTotal ?? state.strategy.calculateRoundTotal(state.holeResults)
  expect(total.totalGross).toBe(Number(expected))
  return { ...state, roundTotal: total }
})

Then('the total net should be {int}', (state, [expected]) => {
  const total = state.roundTotal ?? state.strategy.calculateRoundTotal(state.holeResults)
  expect(total.totalNet).toBe(Number(expected))
  return { ...state, roundTotal: total }
})

Then('the total to par should be {int}', (state, [expected]) => {
  const total = state.roundTotal ?? state.strategy.calculateRoundTotal(state.holeResults)
  expect(total.totalToPar).toBe(Number(expected))
  return { ...state, roundTotal: total }
})

Then('the total points should be {int}', (state, [expected]) => {
  const total = state.strategy.calculateRoundTotal(state.holeResults)
  expect(total.totalPoints).toBe(Number(expected))
  return { ...state, roundTotal: total }
})

Then('hole {int} should receive {int} handicap strokes', (state, [holeNum, expected]) => {
  const idx = Number(holeNum) - 1
  expect(state.strokes[idx]).toBe(Number(expected))
  return state
})
