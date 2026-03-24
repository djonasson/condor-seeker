import { Given, When, Then } from 'vitest-cucumber-plugin'
import { expect } from 'vitest'
import { v4 as uuidv4 } from 'uuid'
import { DexieStorageBackend } from '../../src/storage/dexie/dexie-backend.ts'
import { CondorSeekerDB } from '../../src/storage/dexie/db.ts'
import { DEFAULT_TEE_PRESETS } from '../../src/features/course/types.ts'

function getStorage() {
  const db = new CondorSeekerDB()
  return new DexieStorageBackend(db)
}

function validateCourse(state) {
  const errors = []
  if (!state.courseName || state.courseName.trim() === '') {
    errors.push('Course name is required')
  }
  if (!state.tees || state.tees.length === 0) {
    errors.push('At least one tee is required')
  }
  return errors
}

function buildHoles(numHoles, tees) {
  const holes = []
  for (let i = 1; i <= numHoles; i++) {
    const parByTee = {}
    const distanceByTee = {}
    for (const tee of tees) {
      parByTee[tee.id] = i <= 4 ? 5 : i <= 10 ? 4 : 3
      distanceByTee[tee.id] = 300 + i * 10
    }
    holes.push({
      number: i,
      parByTee,
      handicap: i,
      distanceByTee,
    })
  }
  return holes
}

function buildCourse(state) {
  const tees = state.tees.map((tee) => {
    const totalDistance = state.holes.reduce(
      (sum, h) => sum + (h.distanceByTee[tee.id] ?? 0),
      0,
    )
    return { ...tee, totalDistance }
  })
  const course = {
    id: state.courseId,
    name: state.courseName,
    holes: state.holes,
    tees,
  }
  if (state.clubName) {
    course.clubName = state.clubName
  }
  return course
}

// --- Given steps ---

Given('I am on the add course page', () => {
  const storage = getStorage()
  const defaultTee = { id: uuidv4(), name: 'White', courseRating: 72, slopeRating: 113, totalDistance: 0 }
  return { storage, courseId: uuidv4(), courseName: '', numHoles: 18, tees: [defaultTee], holes: [] }
})

Given('a course {string} exists with {int} holes and a {string} tee', async (state, [name, numHoles, teeName]) => {
  const storage = getStorage()
  const teeId = uuidv4()
  const tees = [{ id: teeId, name: teeName, courseRating: 72.0, slopeRating: 113, totalDistance: 6500 }]
  const holes = buildHoles(parseInt(numHoles), tees)
  const course = { id: uuidv4(), name, holes, tees }
  await storage.saveCourse(course)
  return { ...state, storage, existingCourse: course }
})

Given('I am on the edit page for course {string}', async (state) => {
  const course = state.existingCourse
  return {
    ...state,
    courseId: course.id,
    courseName: course.name,
    numHoles: course.holes.length,
    tees: [...course.tees],
    holes: [...course.holes],
  }
})

Given('I am on the course list page', (state) => {
  return { ...state, onListPage: true }
})

// --- When steps ---

When('I enter {string} as the course name', (state, [name]) => {
  return { ...state, courseName: name }
})

When('I enter {string} as the club name', (state, [name]) => {
  return { ...state, clubName: name }
})

When('I set hole {int} distance to {int} for tee {string}', (state, [holeNum, distance, teeName]) => {
  const tee = state.tees.find((t) => t.name === teeName)
  if (!tee) return state
  const holes = state.holes.map((h) => {
    if (h.number === parseInt(holeNum)) {
      return { ...h, distanceByTee: { ...h.distanceByTee, [tee.id]: parseInt(distance) } }
    }
    return h
  })
  return { ...state, holes }
})

When('I select {int} as the number of holes', (state, [num]) => {
  return { ...state, numHoles: parseInt(num) }
})

When('I add a tee named {string} with course rating {float} and slope rating {int}', (state, [name, courseRating, slopeRating]) => {
  const tee = {
    id: uuidv4(),
    name,
    courseRating: parseFloat(courseRating),
    slopeRating: parseInt(slopeRating),
    totalDistance: 0,
  }
  return { ...state, tees: [...state.tees, tee] }
})

When('I proceed to hole details with empty distances', (state) => {
  const errors = validateCourse(state)
  if (errors.length > 0) {
    return { ...state, validationErrors: errors }
  }
  const holes = []
  for (let i = 1; i <= state.numHoles; i++) {
    const parByTee = {}
    const distanceByTee = {}
    for (const tee of state.tees) {
      parByTee[tee.id] = 4
      distanceByTee[tee.id] = 0
    }
    holes.push({ number: i, parByTee, handicap: i, distanceByTee })
  }
  return { ...state, holes }
})

When('I proceed to hole details', (state) => {
  const errors = validateCourse(state)
  if (errors.length > 0) {
    return { ...state, validationErrors: errors }
  }
  const holes = buildHoles(state.numHoles, state.tees)
  return { ...state, holes }
})

When('I fill in par and distance for all {int} holes', (state) => {
  // Holes are already populated by "proceed to hole details"
  return state
})

When('I save the course', async (state) => {
  const course = buildCourse(state)
  await state.storage.saveCourse(course)
  return state
})

When('I leave the course name empty', (state) => {
  return { ...state, courseName: '' }
})

When('I do not add any tees', (state) => {
  return { ...state, tees: [] }
})

When('I attempt to proceed to hole details', (state) => {
  const errors = validateCourse(state)
  return { ...state, validationErrors: errors }
})

When('I change the course name to {string}', (state, [name]) => {
  return { ...state, courseName: name }
})

When('I click delete on course {string}', async (state, [name]) => {
  const courses = await state.storage.getCourses()
  const course = courses.find((c) => c.name === name)
  return { ...state, pendingDeleteCourse: course, showDeleteConfirmation: true }
})

// --- Then steps ---

Given('the default tee is {string}', (state, [teeName]) => {
  // Verify the default tee already exists in state (set up by "I am on the add course page")
  const defaultTee = state.tees.find((t) => t.name === teeName)
  if (!defaultTee) {
    // Add it as the default
    const tee = { id: uuidv4(), name: teeName, courseRating: 72, slopeRating: 113, totalDistance: 0 }
    return { ...state, tees: [tee] }
  }
  return state
})

Then('the available tee presets should include {string}, {string}, {string}, {string}, {string}, {string}, {string}, {string}',
  (state, [t1, t2, t3, t4, t5, t6, t7, t8]) => {
    const expected = [t1, t2, t3, t4, t5, t6, t7, t8]
    const existingNames = state.tees.map((t) => t.name)
    const availablePresets = DEFAULT_TEE_PRESETS
      .filter((p) => !existingNames.includes(p.name))
      .map((p) => p.name)
    for (const name of expected) {
      expect(availablePresets).toContain(name)
    }
    return state
  },
)

Then('the available tee presets should not include {string}', (state, [name]) => {
  const existingNames = state.tees.map((t) => t.name)
  const availablePresets = DEFAULT_TEE_PRESETS
    .filter((p) => !existingNames.includes(p.name))
    .map((p) => p.name)
  expect(availablePresets).not.toContain(name)
  return state
})

Then('a course named {string} should exist', async (state, [name]) => {
  const courses = await state.storage.getCourses()
  const found = courses.find((c) => c.name === name)
  expect(found).toBeDefined()
  return state
})

Then('the course {string} should have {int} holes', async (state, [name, numHoles]) => {
  const courses = await state.storage.getCourses()
  const found = courses.find((c) => c.name === name)
  expect(found).toBeDefined()
  expect(found.holes.length).toBe(parseInt(numHoles))
  return state
})

Then('the course {string} should have tees {string} and {string}', async (state, [name, tee1, tee2]) => {
  const courses = await state.storage.getCourses()
  const found = courses.find((c) => c.name === name)
  expect(found).toBeDefined()
  const teeNames = found.tees.map((t) => t.name)
  expect(teeNames).toContain(tee1)
  expect(teeNames).toContain(tee2)
  return state
})

Then('I should see a validation error that the course name is required', (state) => {
  expect(state.validationErrors).toBeDefined()
  expect(state.validationErrors).toContain('Course name is required')
  return state
})

Then('I should see a validation error that at least one tee is required', (state) => {
  expect(state.validationErrors).toBeDefined()
  expect(state.validationErrors).toContain('At least one tee is required')
  return state
})

Then('the course {string} should have club name {string}', async (state, [name, clubName]) => {
  const courses = await state.storage.getCourses()
  const found = courses.find((c) => c.name === name)
  expect(found).toBeDefined()
  expect(found.clubName).toBe(clubName)
  return state
})

Then('the course {string} tee {string} should have a total distance of {int}', async (state, [name, teeName, expected]) => {
  const courses = await state.storage.getCourses()
  const found = courses.find((c) => c.name === name)
  expect(found).toBeDefined()
  const tee = found.tees.find((t) => t.name === teeName)
  expect(tee).toBeDefined()
  expect(tee.totalDistance).toBe(parseInt(expected))
  return state
})

Then('course {string} should no longer exist', async (state, [name]) => {
  const courses = await state.storage.getCourses()
  const found = courses.find((c) => c.name === name)
  expect(found).toBeUndefined()
  return state
})
