import { Given, When, Then, DataTable } from 'vitest-cucumber-plugin'
import { expect } from 'vitest'
import { v4 as uuidv4 } from 'uuid'
import { DexieStorageBackend } from '../../src/storage/dexie/dexie-backend.ts'
import { CondorSeekerDB } from '../../src/storage/dexie/db.ts'

async function getStorage() {
  const db = new CondorSeekerDB()
  const storage = new DexieStorageBackend(db)
  // Clear all data to avoid cross-scenario pollution
  const existingRounds = await storage.getRounds()
  for (const r of existingRounds) {
    await storage.deleteRound(r.id)
  }
  const existingCourses = await storage.getCourses()
  for (const c of existingCourses) {
    await storage.deleteCourse(c.id)
  }
  return storage
}

function buildRoundWithScores(courseName, courseId, date, totalGross, totalNet) {
  const playerId = uuidv4()
  const teeId = uuidv4()
  const numHoles = 18
  const baseGross = Math.floor(totalGross / numHoles)
  const baseNet = Math.floor(totalNet / numHoles)
  let remainingGross = totalGross
  let remainingNet = totalNet
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
    date,
    scoringSystem: 'stroke',
    playerRounds: [{ playerId, teeId, holeScores, totalGross, totalNet }],
  }
}

function computeStats(rounds, courses, filters) {
  let filteredRounds = [...rounds]

  if (filters.dateRange && filters.dateRange !== 'all') {
    const now = new Date('2026-03-16')
    const days = filters.dateRange === 'last30' ? 30 : 90
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    filteredRounds = filteredRounds.filter((r) => new Date(r.date) >= cutoff)
  }

  if (filters.courseId) {
    filteredRounds = filteredRounds.filter((r) => r.courseId === filters.courseId)
  }

  if (filteredRounds.length === 0) {
    return {
      scoringAvg: null,
      puttsAvg: null,
      firPercent: null,
      girPercent: null,
      bestRound: null,
      roundsPlayed: 0,
    }
  }

  const allPlayerRounds = filteredRounds.flatMap((r) => r.playerRounds)
  const allHoleScores = allPlayerRounds.flatMap((pr) => pr.holeScores)

  // Scoring average
  const totalGross = allPlayerRounds.reduce((sum, pr) => sum + pr.totalGross, 0)
  const scoringAvg = totalGross / allPlayerRounds.length

  // Putts average
  const holesWithPutts = allHoleScores.filter((hs) => hs.putts != null)
  let puttsAvg = null
  if (holesWithPutts.length > 0) {
    const totalPutts = holesWithPutts.reduce((sum, hs) => sum + (hs.putts ?? 0), 0)
    const roundsWithPutts = allPlayerRounds.filter((pr) =>
      pr.holeScores.some((hs) => hs.putts != null),
    )
    puttsAvg = roundsWithPutts.length > 0 ? totalPutts / roundsWithPutts.length : null
  }

  // FIR%
  const courseMap = new Map(courses.map((c) => [c.id, c]))
  let fairwaysHit = 0
  let fairwayAttempts = 0
  for (const round of filteredRounds) {
    const course = courseMap.get(round.courseId)
    if (!course) continue
    for (const pr of round.playerRounds) {
      for (const hs of pr.holeScores) {
        if (hs.fairwayHit == null) continue
        const hole = course.holes.find((h) => h.number === hs.holeNumber)
        if (!hole) continue
        const par = hole.parByTee[pr.teeId] ?? 3
        if (par <= 3) continue
        fairwayAttempts++
        if (hs.fairwayHit) fairwaysHit++
      }
    }
  }
  const firPercent = fairwayAttempts > 0 ? (fairwaysHit / fairwayAttempts) * 100 : null

  // GIR%
  const holesWithGir = allHoleScores.filter((hs) => hs.greenInRegulation != null)
  const girPercent =
    holesWithGir.length > 0
      ? (holesWithGir.filter((hs) => hs.greenInRegulation).length / holesWithGir.length) * 100
      : null

  return {
    scoringAvg: Math.round(scoringAvg * 10) / 10,
    puttsAvg: puttsAvg != null ? Math.round(puttsAvg * 10) / 10 : null,
    firPercent: firPercent != null ? Math.round(firPercent * 10) / 10 : null,
    girPercent: girPercent != null ? Math.round(girPercent * 10) / 10 : null,
    bestRound: Math.min(...allPlayerRounds.map((pr) => pr.totalGross)),
    roundsPlayed: filteredRounds.length,
  }
}

// --- Given steps ---

Given('the following rounds have been completed:', async (state, params, dataTable) => {
  const storage = await getStorage()
  const rows = DataTable(dataTable)
  const rounds = []
  const courseIds = {}
  for (const row of rows) {
    if (!courseIds[row.course]) {
      courseIds[row.course] = uuidv4()
    }
    const round = buildRoundWithScores(
      row.course,
      courseIds[row.course],
      row.date,
      Number(row.gross),
      Number(row.net),
    )
    await storage.saveRound(round)
    rounds.push(round)
  }
  return { ...state, storage, rounds, courseIds, filters: { dateRange: 'all', courseId: null }, courses: [] }
})

Given('the following rounds have been completed with putts data:', async (state, params, dataTable) => {
  const storage = await getStorage()
  const rows = DataTable(dataTable)
  const rounds = []
  const courseIds = {}
  for (const row of rows) {
    if (!courseIds[row.course]) {
      courseIds[row.course] = uuidv4()
    }
    const courseId = courseIds[row.course]
    const playerId = uuidv4()
    const teeId = uuidv4()
    const totalPutts = Number(row.totalPutts)
    const numHoles = 18
    const basePutts = Math.floor(totalPutts / numHoles)
    let remainingPutts = totalPutts
    const holeScores = []
    for (let i = 1; i <= numHoles; i++) {
      const putts = i < numHoles ? basePutts : remainingPutts
      holeScores.push({ holeNumber: i, grossScore: 4, netScore: 4, putts })
      remainingPutts -= putts
    }
    const round = {
      id: uuidv4(),
      courseId,
      date: row.date,
      scoringSystem: 'stroke',
      playerRounds: [{ playerId, teeId, holeScores, totalGross: 72, totalNet: 72 }],
    }
    await storage.saveRound(round)
    rounds.push(round)
  }
  return { ...state, storage, rounds, courseIds, filters: { dateRange: 'all', courseId: null }, courses: [] }
})

Given('rounds have been completed with fairway data:', async (state, params, dataTable) => {
  const storage = await getStorage()
  const rows = DataTable(dataTable)
  const rounds = []
  const courseId = uuidv4()
  const teeId = uuidv4()

  // Build a course with par-4 holes so fairway data counts
  const courseHoles = []
  for (let i = 1; i <= 18; i++) {
    courseHoles.push({
      number: i,
      parByTee: { [teeId]: 4 },
      handicapByTee: { [teeId]: i },
      distanceByTee: { [teeId]: 400 },
    })
  }
  const course = { id: courseId, name: 'Test Course', holes: courseHoles, tees: [{ id: teeId, name: 'White', courseRating: 72, slopeRating: 113, totalDistance: 6500 }] }
  await storage.saveCourse(course)

  for (const row of rows) {
    const fairwaysHit = Number(row.fairwaysHit)
    const fairwayAttempts = Number(row.fairwayAttempts)
    const playerId = uuidv4()
    const holeScores = []
    for (let i = 1; i <= 18; i++) {
      const hs = { holeNumber: i, grossScore: 4, netScore: 4 }
      if (i <= fairwayAttempts) {
        hs.fairwayHit = i <= fairwaysHit
      }
      holeScores.push(hs)
    }
    const round = {
      id: uuidv4(),
      courseId,
      date: '2026-03-01',
      scoringSystem: 'stroke',
      playerRounds: [{ playerId, teeId, holeScores, totalGross: 72, totalNet: 72 }],
    }
    await storage.saveRound(round)
    rounds.push(round)
  }
  return { ...state, storage, rounds, courses: [course], courseIds: { 'Test Course': courseId }, filters: { dateRange: 'all', courseId: null } }
})

Given('rounds have been completed with green in regulation data:', async (state, params, dataTable) => {
  const storage = await getStorage()
  const rows = DataTable(dataTable)
  const rounds = []
  for (const row of rows) {
    const greensHit = Number(row.greensHit)
    const greensAttempted = Number(row.greensAttempted)
    const playerId = uuidv4()
    const teeId = uuidv4()
    const holeScores = []
    for (let i = 1; i <= greensAttempted; i++) {
      holeScores.push({
        holeNumber: i,
        grossScore: 4,
        netScore: 4,
        greenInRegulation: i <= greensHit,
      })
    }
    const round = {
      id: uuidv4(),
      courseId: uuidv4(),
      date: '2026-03-01',
      scoringSystem: 'stroke',
      playerRounds: [{ playerId, teeId, holeScores, totalGross: 72, totalNet: 72 }],
    }
    await storage.saveRound(round)
    rounds.push(round)
  }
  return { ...state, storage, rounds, courses: [], courseIds: {}, filters: { dateRange: 'all', courseId: null } }
})

Given('no rounds have been completed', async () => {
  const storage = await getStorage()
  return { storage, rounds: [], courses: [], courseIds: {}, filters: { dateRange: 'all', courseId: null } }
})

// --- When steps ---

When('I view the statistics page', async (state) => {
  const rounds = await state.storage.getRounds()
  const courses = state.courses.length > 0 ? state.courses : await state.storage.getCourses()
  const stats = computeStats(rounds, courses, state.filters)
  return { ...state, allRounds: rounds, courses, stats }
})

When('I filter by {string}', (state, [filterLabel]) => {
  let dateRange = 'all'
  if (filterLabel === 'last 30 days') dateRange = 'last30'
  if (filterLabel === 'last 90 days') dateRange = 'last90'
  const filters = { ...state.filters, dateRange }
  const stats = computeStats(state.allRounds, state.courses, filters)
  return { ...state, filters, stats }
})

When('I filter by course {string}', (state, [courseName]) => {
  const courseId = state.courseIds[courseName]
  const filters = { ...state.filters, courseId }
  const stats = computeStats(state.allRounds, state.courses, filters)
  return { ...state, filters, stats }
})

// --- Then steps ---

Then('the scoring average should be {float}', (state, [expected]) => {
  expect(state.stats.scoringAvg).toBe(parseFloat(expected))
  return state
})

Then('the putts average should be {float}', (state, [expected]) => {
  expect(state.stats.puttsAvg).toBe(parseFloat(expected))
  return state
})

Then('the FIR percentage should be {float}', (state, [expected]) => {
  expect(state.stats.firPercent).toBe(parseFloat(expected))
  return state
})

Then('the GIR percentage should be {float}', (state, [expected]) => {
  expect(state.stats.girPercent).toBe(parseFloat(expected))
  return state
})

Then('the scoring average should be calculated from {int} rounds', (state, [count]) => {
  expect(state.stats.roundsPlayed).toBe(Number(count))
  return state
})

Then('the stats should be based on {int} rounds', (state, [count]) => {
  expect(state.stats.roundsPlayed).toBe(Number(count))
  return state
})

Then('the scoring average should not be available', (state) => {
  expect(state.stats.scoringAvg).toBeNull()
  return state
})

Then('the putts average should not be available', (state) => {
  expect(state.stats.puttsAvg).toBeNull()
  return state
})

Then('the FIR percentage should not be available', (state) => {
  expect(state.stats.firPercent).toBeNull()
  return state
})

Then('the GIR percentage should not be available', (state) => {
  expect(state.stats.girPercent).toBeNull()
  return state
})

Then('the number of rounds played should be {int}', (state, [count]) => {
  expect(state.stats.roundsPlayed).toBe(Number(count))
  return state
})
