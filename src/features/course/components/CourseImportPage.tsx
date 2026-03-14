import { Stack, Title, Button, Text, Group, Card, FileInput, Badge, Alert } from '@mantine/core'
import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { v4 as uuidv4 } from 'uuid'
import type { Course, Hole, Tee } from '@/storage/types'
import { useCourses } from '../hooks/useCourses'

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
  return (
    typeof o.number === 'number' &&
    typeof o.parByTee === 'object' &&
    o.parByTee !== null &&
    typeof o.handicap === 'number' &&
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

export default function CourseImportPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { saveCourse } = useCourses()

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<Course | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = useCallback((f: File | null) => {
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
        // Assign new ID to avoid conflicts
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
  }, [])

  const handleImport = useCallback(async () => {
    if (!preview) return
    await saveCourse(preview)
    navigate('/course')
  }, [preview, saveCourse, navigate])

  return (
    <Stack gap="md">
      <Title order={2}>{t('course:importCourse')}</Title>

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

      {preview && (
        <Card withBorder padding="md">
          <Stack gap="sm">
            <Text fw={600}>{preview.name}</Text>
            <Text size="sm" c="dimmed">
              {preview.holes.length} {t('course:hole')}s
            </Text>
            <Group gap={4}>
              {preview.tees.map((tee) => (
                <Badge key={tee.id} size="sm" variant="light">
                  {tee.name}
                </Badge>
              ))}
            </Group>
          </Stack>
        </Card>
      )}

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
