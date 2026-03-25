import { Given, When, Then, DataTable } from 'vitest-cucumber-plugin'
import { expect } from 'vitest'
import { v4 as uuidv4 } from 'uuid'
import { DexieStorageBackend } from '../../src/storage/dexie/dexie-backend.ts'
import { CondorSeekerDB } from '../../src/storage/dexie/db.ts'

const PAGE_SIZE = 10

async function getCleanStorage() {
  const db = new CondorSeekerDB()
  const storage = new DexieStorageBackend(db)
  const existing = await storage.getCourses()
  for (const c of existing) {
    await storage.deleteCourse(c.id)
  }
  return storage
}

function buildCourse(name, starred = false) {
  return {
    id: uuidv4(),
    name,
    starred,
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      parByTee: { default: 4 },
      handicapByTee: { default: i + 1 },
      distanceByTee: { default: 300 },
    })),
    tees: [{ id: 'default', name: 'White', courseRating: 72, slopeRating: 113, totalDistance: 5400 }],
  }
}

function sortCoursesStarredFirst(courses) {
  return [...courses].sort((a, b) => {
    if (a.starred && !b.starred) return -1
    if (!a.starred && b.starred) return 1
    return a.name.localeCompare(b.name)
  })
}

function searchCourses(courses, query) {
  const lower = query.toLowerCase()
  return courses.filter((c) => c.name.toLowerCase().includes(lower))
}

function paginateCourses(courses, page) {
  const start = (page - 1) * PAGE_SIZE
  return courses.slice(start, start + PAGE_SIZE)
}

// --- Given steps ---

Given('a course {string} exists', async (state, [name]) => {
  const storage = await getCleanStorage()
  const course = buildCourse(name)
  await storage.saveCourse(course)
  return { ...state, storage, allCourses: [course] }
})

Given('the following courses exist:', async (state, params, dataTable) => {
  const storage = await getCleanStorage()
  const rows = DataTable(dataTable)
  const courses = []
  for (const row of rows) {
    const course = buildCourse(row.name, row.starred === 'true')
    await storage.saveCourse(course)
    courses.push(course)
  }
  return { ...state, storage, allCourses: courses }
})

Given('{int} courses exist', async (state, [count]) => {
  const storage = await getCleanStorage()
  const courses = []
  for (let i = 1; i <= Number(count); i++) {
    const course = buildCourse(`Course ${String(i).padStart(2, '0')}`)
    await storage.saveCourse(course)
    courses.push(course)
  }
  return { ...state, storage, allCourses: courses }
})

Given('{int} courses exist with {string} in the name', async (state, [count, keyword]) => {
  const storage = await getCleanStorage()
  const courses = []
  for (let i = 1; i <= Number(count); i++) {
    const course = buildCourse(`${keyword} Club ${String(i).padStart(2, '0')}`)
    await storage.saveCourse(course)
    courses.push(course)
  }
  return { ...state, storage, allCourses: courses }
})

Given('{string} is starred', async (state, [name]) => {
  const courses = await state.storage.getCourses()
  const course = courses.find((c) => c.name === name)
  if (course) {
    course.starred = true
    await state.storage.saveCourse(course)
  }
  return state
})

// --- When steps ---

When('I star the course {string}', async (state, [name]) => {
  const courses = await state.storage.getCourses()
  const course = courses.find((c) => c.name === name)
  if (course) {
    course.starred = true
    await state.storage.saveCourse(course)
  }
  return state
})

When('I unstar the course {string}', async (state, [name]) => {
  const courses = await state.storage.getCourses()
  const course = courses.find((c) => c.name === name)
  if (course) {
    course.starred = false
    await state.storage.saveCourse(course)
  }
  return state
})

When('I view the course selector in round setup', async (state) => {
  const courses = await state.storage.getCourses()
  const sorted = sortCoursesStarredFirst(courses)
  const page = 1
  const paginated = paginateCourses(sorted, page)
  return { ...state, displayedCourses: paginated, sortedCourses: sorted, currentPage: page }
})

When('I search for {string}', async (state, [query]) => {
  const courses = await state.storage.getCourses()
  const filtered = searchCourses(courses, query)
  const sorted = sortCoursesStarredFirst(filtered)
  const paginated = paginateCourses(sorted, 1)
  return { ...state, displayedCourses: paginated, sortedCourses: sorted, searchQuery: query, currentPage: 1 }
})

When('I clear the search', async (state) => {
  const courses = await state.storage.getCourses()
  const sorted = sortCoursesStarredFirst(courses)
  const paginated = paginateCourses(sorted, 1)
  return { ...state, displayedCourses: paginated, sortedCourses: sorted, searchQuery: '', currentPage: 1 }
})

When('I go to page {int}', (state, [page]) => {
  const paginated = paginateCourses(state.sortedCourses, Number(page))
  return { ...state, displayedCourses: paginated, currentPage: Number(page) }
})

// --- Then steps ---

Then('{string} should be marked as starred', async (state, [name]) => {
  const courses = await state.storage.getCourses()
  const course = courses.find((c) => c.name === name)
  expect(course).toBeDefined()
  expect(course.starred).toBe(true)
  return state
})

Then('{string} should not be marked as starred', async (state, [name]) => {
  const courses = await state.storage.getCourses()
  const course = courses.find((c) => c.name === name)
  expect(course).toBeDefined()
  expect(course.starred).toBe(false)
  return state
})

Then('the courses should be ordered with starred first:', (state, params, dataTable) => {
  const expected = DataTable(dataTable).map((r) => r.name)
  const actual = state.displayedCourses.map((c) => c.name)
  expect(actual).toEqual(expected)
  return state
})

Then('the search results should contain {string} and {string}', (state, [name1, name2]) => {
  const names = state.displayedCourses.map((c) => c.name)
  expect(names).toContain(name1)
  expect(names).toContain(name2)
  return state
})

Then('the search results should not contain {string} or {string}', (state, [name1, name2]) => {
  const names = state.displayedCourses.map((c) => c.name)
  expect(names).not.toContain(name1)
  expect(names).not.toContain(name2)
  return state
})

Then('the search results should contain {string}', (state, [name]) => {
  const names = state.displayedCourses.map((c) => c.name)
  expect(names).toContain(name)
  return state
})

Then('the first course in the list should be {string}', (state, [name]) => {
  expect(state.displayedCourses[0].name).toBe(name)
  return state
})

Then('I should see {int} courses on the first page', (state, [count]) => {
  expect(state.displayedCourses.length).toBe(Number(count))
  return state
})

Then('I should see {int} courses on the second page', (state, [count]) => {
  expect(state.displayedCourses.length).toBe(Number(count))
  return state
})

Then('I should see {int} courses on the last page', (state, [count]) => {
  expect(state.displayedCourses.length).toBe(Number(count))
  return state
})

Then('I should see pagination controls', (state) => {
  const totalPages = Math.ceil(state.sortedCourses.length / PAGE_SIZE)
  expect(totalPages).toBeGreaterThan(1)
  return state
})
