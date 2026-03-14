import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { Center, Loader } from '@mantine/core'
import { Layout } from './layout'

const HomePage = lazy(() => import('./HomePage'))
const SettingsPage = lazy(() => import('@/features/settings/components/SettingsPage'))
const PlayerListPage = lazy(() => import('@/features/player/components/PlayerListPage'))
const PlayerFormPage = lazy(() => import('@/features/player/components/PlayerFormPage'))
const CourseListPage = lazy(() => import('@/features/course/components/CourseListPage'))
const CourseFormPage = lazy(() => import('@/features/course/components/CourseFormPage'))
const CourseImportPage = lazy(() => import('@/features/course/components/CourseImportPage'))
const RoundSetupPage = lazy(() => import('@/features/round/components/RoundSetupPage'))
const ScorecardPage = lazy(() => import('@/features/round/components/ScorecardPage'))
const ScorecardTablePage = lazy(() => import('@/features/round/components/ScorecardTablePage'))
const RoundSummaryPage = lazy(() => import('@/features/round/components/RoundSummaryPage'))
const HistoryListPage = lazy(() => import('@/features/history/components/HistoryListPage'))
const RoundDetailPage = lazy(() => import('@/features/history/components/RoundDetailPage'))
const StatsPage = lazy(() => import('@/features/stats/components/StatsPage'))
const ImportExportPage = lazy(() => import('@/features/import-export/components/ImportExportPage'))

function Loading() {
  return (
    <Center h="50vh">
      <Loader color="green" />
    </Center>
  )
}

export function AppRouter() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="player" element={<PlayerListPage />} />
          <Route path="player/new" element={<PlayerFormPage />} />
          <Route path="player/:id/edit" element={<PlayerFormPage />} />
          <Route path="course" element={<CourseListPage />} />
          <Route path="course/new" element={<CourseFormPage />} />
          <Route path="course/:id/edit" element={<CourseFormPage />} />
          <Route path="course/import" element={<CourseImportPage />} />
          <Route path="round/new" element={<RoundSetupPage />} />
          <Route path="round/play" element={<ScorecardPage />} />
          <Route path="round/play/table" element={<ScorecardTablePage />} />
          <Route path="round/summary/:id" element={<RoundSummaryPage />} />
          <Route path="history" element={<HistoryListPage />} />
          <Route path="history/:id" element={<RoundDetailPage />} />
          <Route path="stats" element={<StatsPage />} />
          <Route path="import-export" element={<ImportExportPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
