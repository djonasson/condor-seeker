import {
  Stack,
  Title,
  Button,
  Text,
  Group,
  Card,
  FileInput,
  Badge,
  Alert,
  Tabs,
  TextInput,
  Loader,
  Checkbox,
  Table,
} from '@mantine/core'
import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { v4 as uuidv4 } from 'uuid'
import type { Course, Hole, Tee } from '@/storage/types'
import { useCourses } from '../hooks/useCourses'
import { useStorage } from '@/hooks/useStorage'
import { useAppStore } from '@/stores/app-store'
import { searchCourses, getCourseById } from '@/lib/golf-course-api'
import type { ApiCourseSearchResult, ApiCourseDetail } from '@/lib/golf-course-api'
import { convertApiCourse, getAvailableTees } from '@/lib/golf-course-converter'
import type { ApiTeeOption } from '@/lib/golf-course-converter'

function isValidTee(obj: unknown): obj is Tee {
  if (typeof obj !== 'object' || obj === null) return false
  const o = obj as Record<string, unknown>
  return (
    typeof o.id === 'string' &&
    typeof o.name === 'string' &&
    typeof o.courseRating === 'number' &&
    typeof o.slopeRating === 'number' &&
    typeof o.totalDistance === 'number'
  )
}

function isValidHole(obj: unknown): obj is Hole {
  if (typeof obj !== 'object' || obj === null) return false
  const o = obj as Record<string, unknown>
  const hasHandicap =
    typeof o.handicap === 'number' ||
    (typeof o.handicapByTee === 'object' && o.handicapByTee !== null)
  return (
    typeof o.number === 'number' &&
    typeof o.parByTee === 'object' &&
    o.parByTee !== null &&
    hasHandicap &&
    typeof o.distanceByTee === 'object' &&
    o.distanceByTee !== null
  )
}

function isValidCourse(obj: unknown): obj is Course {
  if (typeof obj !== 'object' || obj === null) return false
  const o = obj as Record<string, unknown>
  return (
    typeof o.name === 'string' &&
    Array.isArray(o.holes) &&
    o.holes.every(isValidHole) &&
    Array.isArray(o.tees) &&
    o.tees.every(isValidTee)
  )
}

function CoursePreviewCard({ course }: { course: Course }) {
  const { t } = useTranslation()

  return (
    <Card withBorder padding="md">
      <Stack gap="sm">
        <Text fw={600}>{course.name}</Text>
        <Text size="sm" c="dimmed">
          {course.holes.length} {t('course:hole')}s
        </Text>
        <Group gap={4}>
          {course.tees.map((tee) => (
            <Badge key={tee.id} size="sm" variant="light">
              {tee.name}
            </Badge>
          ))}
        </Group>
      </Stack>
    </Card>
  )
}

function FileImportTab({
  preview,
  setPreview,
  error,
  setError,
}: {
  preview: Course | null
  setPreview: (c: Course | null) => void
  error: string | null
  setError: (e: string | null) => void
}) {
  const { t } = useTranslation()
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = useCallback(
    (f: File | null) => {
      setFile(f)
      setPreview(null)
      setError(null)

      if (!f) return

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const json: unknown = JSON.parse(e.target?.result as string)
          if (!isValidCourse(json)) {
            setError('Invalid course JSON format')
            return
          }
          const course: Course = {
            ...json,
            id: uuidv4(),
          }
          setPreview(course)
        } catch {
          setError('Invalid JSON file')
        }
      }
      reader.readAsText(f)
    },
    [setPreview, setError],
  )

  return (
    <Stack gap="md">
      <FileInput
        label={t('course:importCourse')}
        placeholder="course.json"
        accept=".json,application/json"
        value={file}
        onChange={handleFileChange}
      />

      {error && (
        <Alert color="red" title={t('error')}>
          {error}
        </Alert>
      )}

      {preview && <CoursePreviewCard course={preview} />}
    </Stack>
  )
}

function TeeSelectionStep({
  teeOptions,
  selectedKeys,
  onToggle,
  onConfirm,
  distanceUnit,
}: {
  teeOptions: ApiTeeOption[]
  selectedKeys: Set<string>
  onToggle: (key: string) => void
  onConfirm: () => void
  distanceUnit: 'meters' | 'yards'
}) {
  const { t } = useTranslation()

  return (
    <Card withBorder padding="md">
      <Stack gap="sm">
        <Text fw={600}>{t('course:selectTees')}</Text>
        <Text size="sm" c="dimmed">
          {t('course:selectTeesDescription')}
        </Text>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th />
              <Table.Th>{t('course:teeName')}</Table.Th>
              <Table.Th>{t('course:courseRating')}</Table.Th>
              <Table.Th>{t('course:slopeRating')}</Table.Th>
              <Table.Th>{t('course:totalDistance')}</Table.Th>
              <Table.Th>{t('course:hole')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {teeOptions.map((tee) => (
              <Table.Tr key={tee.key}>
                <Table.Td>
                  <Checkbox
                    checked={selectedKeys.has(tee.key)}
                    onChange={() => onToggle(tee.key)}
                  />
                </Table.Td>
                <Table.Td>
                  <Text size="sm">
                    {tee.teeName}{' '}
                    <Text span size="xs" c="dimmed">
                      ({tee.gender})
                    </Text>
                  </Text>
                </Table.Td>
                <Table.Td>{tee.courseRating}</Table.Td>
                <Table.Td>{tee.slopeRating}</Table.Td>
                <Table.Td>{distanceUnit === 'yards' ? tee.totalYards : tee.totalMeters}</Table.Td>
                <Table.Td>{tee.numberOfHoles}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
        <Group justify="flex-end">
          <Button size="sm" disabled={selectedKeys.size === 0} onClick={onConfirm}>
            {t('course:confirmTees')}
          </Button>
        </Group>
      </Stack>
    </Card>
  )
}

function ApiImportTab({
  preview,
  setPreview,
  error,
  setError,
}: {
  preview: Course | null
  setPreview: (c: Course | null) => void
  error: string | null
  setError: (e: string | null) => void
}) {
  const { t } = useTranslation()
  const storage = useStorage()
  const distanceUnit = useAppStore((s) => s.distanceUnit)

  const [apiKey, setApiKey] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [loadingCourse, setLoadingCourse] = useState(false)
  const [results, setResults] = useState<ApiCourseSearchResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  // Tee selection state
  const [apiCourseDetail, setApiCourseDetail] = useState<ApiCourseDetail | null>(null)
  const [teeOptions, setTeeOptions] = useState<ApiTeeOption[]>([])
  const [selectedTeeKeys, setSelectedTeeKeys] = useState<Set<string>>(new Set())

  useEffect(() => {
    void storage.getSettings().then((s) => setApiKey(s.golfCourseApiKey))
  }, [storage])

  const handleSearch = useCallback(async () => {
    if (!apiKey || !query.trim()) return
    setSearching(true)
    setError(null)
    setPreview(null)
    setApiCourseDetail(null)
    setTeeOptions([])
    setHasSearched(true)
    try {
      const courses = await searchCourses(apiKey, query.trim())
      setResults(courses)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('course:importApiError'))
      setResults([])
    } finally {
      setSearching(false)
    }
  }, [apiKey, query, setError, setPreview, t])

  const handleSelectCourse = useCallback(
    async (courseId: number) => {
      if (!apiKey) return
      setLoadingCourse(true)
      setError(null)
      setPreview(null)
      try {
        const detail = await getCourseById(apiKey, courseId)
        setApiCourseDetail(detail)
        const options = getAvailableTees(detail)
        setTeeOptions(options)
        // Select all tees by default
        setSelectedTeeKeys(new Set(options.map((o) => o.key)))
        setResults([])
      } catch (err) {
        setError(err instanceof Error ? err.message : t('course:importApiError'))
      } finally {
        setLoadingCourse(false)
      }
    },
    [apiKey, setPreview, setError, t],
  )

  const handleToggleTee = useCallback((key: string) => {
    setSelectedTeeKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }, [])

  const handleConfirmTees = useCallback(() => {
    if (!apiCourseDetail || selectedTeeKeys.size === 0) return
    const course = convertApiCourse(apiCourseDetail, selectedTeeKeys)
    setPreview(course)
    setTeeOptions([])
  }, [apiCourseDetail, selectedTeeKeys, setPreview])

  if (apiKey === null) {
    return null // Loading
  }

  if (!apiKey) {
    return <Alert color="yellow">{t('course:apiKeyRequired')}</Alert>
  }

  return (
    <Stack gap="md">
      <Group gap="sm" align="flex-end">
        <TextInput
          label={t('course:searchCourses')}
          placeholder={t('course:searchPlaceholder')}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void handleSearch()
          }}
          style={{ flex: 1 }}
        />
        <Button onClick={() => void handleSearch()} loading={searching}>
          {t('course:searchCourses')}
        </Button>
      </Group>

      {error && <Alert color="red">{error}</Alert>}

      {searching && (
        <Group justify="center" py="md">
          <Loader size="sm" />
          <Text size="sm">{t('course:searching')}</Text>
        </Group>
      )}

      {loadingCourse && (
        <Group justify="center" py="md">
          <Loader size="sm" />
          <Text size="sm">{t('course:loadingCourse')}</Text>
        </Group>
      )}

      {!searching &&
        !loadingCourse &&
        hasSearched &&
        results.length === 0 &&
        teeOptions.length === 0 &&
        !preview && (
          <Text c="dimmed" ta="center">
            {t('course:noResults')}
          </Text>
        )}

      {!searching &&
        !loadingCourse &&
        !preview &&
        teeOptions.length === 0 &&
        results.length > 0 && (
          <Stack gap="xs">
            {results.map((course) => (
              <Card
                key={course.id}
                withBorder
                padding="sm"
                style={{ cursor: 'pointer' }}
                onClick={() => void handleSelectCourse(course.id)}
              >
                <Group justify="space-between">
                  <div>
                    <Text fw={500}>{course.club_name}</Text>
                    {course.course_name && course.course_name !== course.club_name && (
                      <Text size="sm" c="dimmed">
                        {course.course_name}
                      </Text>
                    )}
                    {course.location && (
                      <Text size="xs" c="dimmed">
                        {[course.location.city, course.location.state].filter(Boolean).join(', ')}
                      </Text>
                    )}
                  </div>
                  <Button variant="light" size="xs">
                    {t('course:selectCourse')}
                  </Button>
                </Group>
              </Card>
            ))}
          </Stack>
        )}

      {!preview && teeOptions.length > 0 && (
        <TeeSelectionStep
          teeOptions={teeOptions}
          selectedKeys={selectedTeeKeys}
          onToggle={handleToggleTee}
          onConfirm={handleConfirmTees}
          distanceUnit={distanceUnit}
        />
      )}

      {preview && <CoursePreviewCard course={preview} />}
    </Stack>
  )
}

export default function CourseImportPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { saveCourse } = useCourses()

  const [preview, setPreview] = useState<Course | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleImport = useCallback(async () => {
    if (!preview) return
    await saveCourse(preview)
    navigate('/course')
  }, [preview, saveCourse, navigate])

  return (
    <Stack gap="md">
      <Title order={2}>{t('course:importCourse')}</Title>

      <Tabs defaultValue="file">
        <Tabs.List>
          <Tabs.Tab value="file">{t('course:importFromFile')}</Tabs.Tab>
          <Tabs.Tab value="api">{t('course:importFromApi')}</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="file" pt="md">
          <FileImportTab
            preview={preview}
            setPreview={setPreview}
            error={error}
            setError={setError}
          />
        </Tabs.Panel>

        <Tabs.Panel value="api" pt="md">
          <ApiImportTab
            preview={preview}
            setPreview={setPreview}
            error={error}
            setError={setError}
          />
        </Tabs.Panel>
      </Tabs>

      <Group justify="flex-end">
        <Button variant="default" onClick={() => navigate('/course')}>
          {t('cancel')}
        </Button>
        <Button color="green" disabled={!preview} onClick={() => void handleImport()}>
          {t('course:importCourse')}
        </Button>
      </Group>
    </Stack>
  )
}
