import { Given, When, Then } from 'vitest-cucumber-plugin'
import { expect } from 'vitest'
import { useAppStore } from '../../src/stores/app-store.ts'
import { DexieStorageBackend } from '../../src/storage/dexie/dexie-backend.ts'
import { CondorSeekerDB } from '../../src/storage/dexie/db.ts'
import { DEFAULT_SETTINGS } from '../../src/storage/backend.ts'

function getStorage() {
  const db = new CondorSeekerDB()
  return new DexieStorageBackend(db)
}

// --- Background ---

Given('I am on the settings page', () => {
  const storage = getStorage()
  useAppStore.getState().hydrate(DEFAULT_SETTINGS)
  return { storage }
})

// --- Given steps ---

Given('the current theme is {string}', (state, [theme]) => {
  useAppStore.getState().setTheme(theme)
  return state
})

Given('the current distance unit is {string}', (state, [unit]) => {
  useAppStore.getState().setDistanceUnit(unit)
  return state
})

Given('the current temperature unit is {string}', (state, [unit]) => {
  useAppStore.getState().setTemperatureUnit(unit)
  return state
})

Given('the current language is {string}', (state, [lang]) => {
  useAppStore.getState().setLanguage(lang)
  return state
})

Given('no API key is configured', async (state) => {
  await state.storage.saveSettings({ ...DEFAULT_SETTINGS, golfCourseApiKey: '' })
  return state
})

Given('the GolfCourseAPI key is set to {string}', async (state, [key]) => {
  await state.storage.saveSettings({ ...DEFAULT_SETTINGS, golfCourseApiKey: key })
  return state
})

// --- When steps ---

When('I select {string} as the theme', async (state, [theme]) => {
  useAppStore.getState().setTheme(theme)
  const current = await state.storage.getSettings()
  await state.storage.saveSettings({ ...current, theme })
  return state
})

When('I select {string} as the distance unit', async (state, [unit]) => {
  useAppStore.getState().setDistanceUnit(unit)
  const current = await state.storage.getSettings()
  await state.storage.saveSettings({ ...current, distanceUnit: unit })
  return state
})

When('I select {string} as the temperature unit', async (state, [unit]) => {
  useAppStore.getState().setTemperatureUnit(unit)
  const current = await state.storage.getSettings()
  await state.storage.saveSettings({ ...current, temperatureUnit: unit })
  return state
})

When('I reload the settings page', async (state) => {
  const settings = await state.storage.getSettings()
  useAppStore.getState().hydrate(settings)
  return state
})

When('I select {string} as the language', async (state, [lang]) => {
  useAppStore.getState().setLanguage(lang)
  const current = await state.storage.getSettings()
  await state.storage.saveSettings({ ...current, language: lang })
  return state
})

When('I enter {string} as the GolfCourseAPI key', (state, [key]) => {
  return { ...state, pendingApiKey: key }
})

When('I save the API key', async (state) => {
  const current = await state.storage.getSettings()
  await state.storage.saveSettings({ ...current, golfCourseApiKey: state.pendingApiKey })
  return state
})

// --- Then steps ---

Then('the theme should be set to {string}', (state, [expected]) => {
  expect(useAppStore.getState().theme).toBe(expected)
  return state
})

Then('the distance unit should be set to {string}', (state, [expected]) => {
  expect(useAppStore.getState().distanceUnit).toBe(expected)
  return state
})

Then('the temperature unit should be set to {string}', (state, [expected]) => {
  expect(useAppStore.getState().temperatureUnit).toBe(expected)
  return state
})

Then('the language should be set to {string}', (state, [expected]) => {
  expect(useAppStore.getState().language).toBe(expected)
  return state
})

Then('the GolfCourseAPI key should be stored as {string}', async (state, [expected]) => {
  const settings = await state.storage.getSettings()
  expect(settings.golfCourseApiKey).toBe(expected)
  return state
})
