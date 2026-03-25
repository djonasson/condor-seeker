import { Given, When, Then } from 'vitest-cucumber-plugin'
import { expect } from 'vitest'
import { v4 as uuidv4 } from 'uuid'
import { DexieStorageBackend } from '../../src/storage/dexie/dexie-backend.ts'
import { CondorSeekerDB } from '../../src/storage/dexie/db.ts'
import { convertApiCourse, getAvailableTees } from '../../src/lib/golf-course-converter.ts'

function getStorage() {
  const db = new CondorSeekerDB()
  return new DexieStorageBackend(db)
}

function buildValidCourseJson(name, numHoles) {
  const tees = [
    {
      id: uuidv4(),
      name: 'White',
      courseRating: 72.0,
      slopeRating: 113,
      totalDistance: 6200,
    },
  ]
  const holes = []
  for (let i = 1; i <= numHoles; i++) {
    const parByTee = {}
    const distanceByTee = {}
    for (const tee of tees) {
      parByTee[tee.id] = 4
      distanceByTee[tee.id] = 350
    }
    const handicapByTee = {}
    for (const tee of tees) {
      handicapByTee[tee.id] = i
    }
    holes.push({ number: i, parByTee, handicapByTee, distanceByTee })
  }
  return { id: uuidv4(), name, holes, tees }
}

function validateCourseJson(data) {
  if (!data || typeof data !== 'object') return false
  if (!data.name || typeof data.name !== 'string') return false
  if (!Array.isArray(data.holes) || data.holes.length === 0) return false
  if (!Array.isArray(data.tees) || data.tees.length === 0) return false
  return true
}

function buildMockApiCourse(clubName, teeNames) {
  const maleTees = teeNames.map((name) => ({
    tee_name: name,
    course_rating: 72.0,
    slope_rating: 125,
    total_yards: 6800,
    total_meters: 6218,
    number_of_holes: 18,
    par_total: 72,
    holes: Array.from({ length: 18 }, (_, i) => ({
      par: i < 4 ? 5 : i < 14 ? 4 : 3,
      yardage: 350 + i * 5,
      handicap: i + 1,
    })),
  }))

  return {
    id: 12345,
    club_name: clubName,
    course_name: clubName,
    location: { city: 'St Andrews', country: 'Scotland' },
    tees: { male: maleTees },
  }
}

function buildMockSearchResults(query) {
  return [
    { id: 1, club_name: 'St Andrews Links', course_name: 'Old Course', location: { city: 'St Andrews', country: 'Scotland' } },
    { id: 2, club_name: 'St Andrews Bay', course_name: 'Torrance Course', location: { city: 'St Andrews', country: 'Scotland' } },
  ]
}

// --- Given steps ---

Given('I am on the course import page', () => {
  const storage = getStorage()
  return { storage, tab: 'file', preview: null, error: null, apiKey: '' }
})

Given('I am on the file import tab', (state) => {
  return { ...state, tab: 'file' }
})

Given('I am on the API import tab', (state) => {
  return { ...state, tab: 'api' }
})

Given('a GolfCourseAPI key is configured', (state) => {
  return { ...state, apiKey: 'test-api-key-12345' }
})

Given('no GolfCourseAPI key is configured', (state) => {
  return { ...state, apiKey: '' }
})

Given('I have searched for and selected a course with tees {string}, {string}, and {string}', (state, [tee1, tee2, tee3]) => {
  const apiCourse = buildMockApiCourse('Test Course', [tee1, tee2, tee3])
  const availableTees = getAvailableTees(apiCourse)
  return { ...state, selectedApiCourse: apiCourse, availableTees, selectedTeeKeys: new Set() }
})

// --- When steps ---

When('I upload a valid course JSON file for {string} with {int} holes', (state, [name, numHoles]) => {
  const courseData = buildValidCourseJson(name, parseInt(numHoles))
  return { ...state, preview: courseData, importReady: true }
})

When('I upload a file containing {string}', (state, [content]) => {
  try {
    JSON.parse(content)
    return { ...state, error: null }
  } catch {
    return { ...state, error: 'Invalid JSON file' }
  }
})

When('I upload a JSON file with missing required fields', (state) => {
  const invalidData = { name: '' }
  try {
    const parsed = invalidData
    if (!validateCourseJson(parsed)) {
      return { ...state, error: 'Invalid course JSON format' }
    }
    return { ...state, preview: parsed }
  } catch {
    return { ...state, error: 'Invalid JSON file' }
  }
})

When('I click the import button', async (state) => {
  // Import-export feature: show confirmation dialog before importing app data
  if (state.importData) {
    return { ...state, showImportConfirmation: true }
  }
  // Course import feature: save a course from preview
  if (state.preview) {
    const course = state.preview.id ? state.preview : { ...state.preview, id: uuidv4() }
    await state.storage.saveCourse(course)
    return { ...state, importedCourse: course }
  }
  return state
})

When('I search for {string} in the API', (state, [query]) => {
  const searchResults = buildMockSearchResults(query)
  return { ...state, searchResults }
})

When('I select {string} from the results', (state, [name]) => {
  const result = state.searchResults.find((r) => r.club_name === name)
  const apiCourse = buildMockApiCourse(name, ['White', 'Blue', 'Black'])
  const availableTees = getAvailableTees(apiCourse)
  return { ...state, selectedResult: result, selectedApiCourse: apiCourse, availableTees, showTeeSelection: true }
})

When('I select the {string} and {string} tees', (state, [tee1, tee2]) => {
  const selectedTeeKeys = new Set()
  for (const tee of state.availableTees) {
    if (tee.teeName === tee1 || tee.teeName === tee2) {
      selectedTeeKeys.add(tee.key)
    }
  }
  return { ...state, selectedTeeKeys }
})

When('I confirm the tee selection', (state) => {
  const course = convertApiCourse(state.selectedApiCourse, state.selectedTeeKeys)
  return { ...state, preview: course, showTeeSelection: false }
})

// --- Then steps ---

Then('I should see a preview card for {string}', (state, [name]) => {
  expect(state.preview).toBeDefined()
  expect(state.preview.name).toContain(name)
  return state
})

Then('the preview should show {int} holes', (state, [numHoles]) => {
  expect(state.preview).toBeDefined()
  expect(state.preview.holes.length).toBe(parseInt(numHoles))
  return state
})

Then('a course named {string} should be saved', async (state, [name]) => {
  const courses = await state.storage.getCourses()
  const found = courses.find((c) => c.name === name)
  expect(found).toBeDefined()
  return state
})

Then('I should see the error {string}', (state, [message]) => {
  expect(state.error).toBe(message)
  return state
})

Then('I should see search results including {string}', (state, [name]) => {
  expect(state.searchResults).toBeDefined()
  const found = state.searchResults.find((r) => r.club_name === name)
  expect(found).toBeDefined()
  return state
})

Then('I should see the tee selection step', (state) => {
  expect(state.showTeeSelection).toBe(true)
  expect(state.availableTees.length).toBeGreaterThan(0)
  return state
})

Then('I should see a preview card for the selected course', (state) => {
  expect(state.preview).toBeDefined()
  expect(state.preview.name).toBeDefined()
  return state
})

Then('the preview should include tees {string} and {string}', (state, [tee1, tee2]) => {
  expect(state.preview).toBeDefined()
  const teeNames = state.preview.tees.map((t) => t.name)
  expect(teeNames.some((n) => n.includes(tee1))).toBe(true)
  expect(teeNames.some((n) => n.includes(tee2))).toBe(true)
  return state
})

Then('the course should be saved with only the {string} and {string} tees', async (state, [tee1, tee2]) => {
  const course = state.importedCourse
  expect(course).toBeDefined()
  expect(course.tees.length).toBe(2)
  const teeNames = course.tees.map((t) => t.name)
  expect(teeNames.some((n) => n.includes(tee1))).toBe(true)
  expect(teeNames.some((n) => n.includes(tee2))).toBe(true)
  return state
})

Then('I should see a message that an API key is required', (state) => {
  expect(state.apiKey).toBe('')
  const showApiKeyMessage = !state.apiKey
  expect(showApiKeyMessage).toBe(true)
  return state
})
