import {
  Stack,
  Title,
  Button,
  TextInput,
  NumberInput,
  Group,
  Stepper,
  Card,
  ActionIcon,
  Select,
  Text,
} from '@mantine/core'
import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useStorage } from '@/hooks/useStorage'
import { useAppStore } from '@/stores/app-store'
import type { Course } from '@/storage/types'
import { DEFAULT_TEE_PRESETS } from '../types'
import { useCourseForm } from '../hooks/useCourseForm'
import { useCourses } from '../hooks/useCourses'
import { HoleDataTable } from './HoleDataTable'

export default function CourseFormPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const storage = useStorage()

  const [existingCourse, setExistingCourse] = useState<Course | undefined>(undefined)
  const [loadingCourse, setLoadingCourse] = useState(!!id)

  useEffect(() => {
    if (id) {
      void storage.getCourse(id).then((course) => {
        setExistingCourse(course)
        setLoadingCourse(false)
      })
    }
  }, [id, storage])

  if (loadingCourse) {
    return <Text>{t('loading')}</Text>
  }

  return <CourseFormInner existingCourse={existingCourse} />
}

function CourseFormInner({ existingCourse }: { existingCourse?: Course }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { saveCourse } = useCourses()
  const distanceUnit = useAppStore((s) => s.distanceUnit)
  const [newTeeName, setNewTeeName] = useState('')

  const {
    currentStep,
    stepOne,
    holes,
    stepOneErrors,
    updateStepOne,
    addTee,
    removeTee,
    updateTee,
    updateHole,
    nextStep,
    prevStep,
    validateStepTwo,
    buildCourse,
  } = useCourseForm(existingCourse)

  const handleSave = useCallback(async () => {
    if (!validateStepTwo()) return
    const course = buildCourse()
    await saveCourse(course)
    navigate('/course')
  }, [validateStepTwo, buildCourse, saveCourse, navigate])

  const handleAddTee = useCallback(() => {
    if (newTeeName.trim()) {
      addTee(newTeeName.trim())
      setNewTeeName('')
    }
  }, [newTeeName, addTee])

  const isEditing = !!existingCourse
  const pageTitle = isEditing ? t('course:editCourse') : t('course:addCourse')

  const teePresetOptions = DEFAULT_TEE_PRESETS.filter(
    (preset) => !stepOne.tees.some((tee) => tee.name === preset.name),
  ).map((preset) => preset.name)

  return (
    <Stack gap="md">
      <Title order={2}>{pageTitle}</Title>

      <Stepper active={currentStep} size="sm">
        <Stepper.Step label={t('course:courseInfo')} />
        <Stepper.Step label={t('course:holeDetails')} />
      </Stepper>

      {currentStep === 0 && (
        <Stack gap="md">
          <TextInput
            label={t('course:clubName', 'Club Name')}
            value={stepOne.clubName}
            onChange={(e) => updateStepOne({ clubName: e.currentTarget.value })}
            placeholder={t('course:clubNamePlaceholder', 'e.g. Royal Golf Club')}
          />

          <TextInput
            label={t('course:name')}
            value={stepOne.name}
            onChange={(e) => updateStepOne({ name: e.currentTarget.value })}
            error={stepOneErrors.name ? t('course:name') + ' is required' : undefined}
            required
          />

          <Select
            label={t('course:holesCount')}
            data={[
              { value: '9', label: '9' },
              { value: '18', label: '18' },
            ]}
            value={String(stepOne.holesCount)}
            onChange={(val) => updateStepOne({ holesCount: val === '9' ? 9 : 18 })}
            allowDeselect={false}
          />

          <Card withBorder padding="md">
            <Stack gap="sm">
              <Text fw={600}>{t('course:tees')}</Text>

              {stepOneErrors.tees && (
                <Text c="red" size="sm">
                  {t('course:tees')} required
                </Text>
              )}

              {stepOne.tees.map((tee) => (
                <Card key={tee.id} withBorder padding="xs">
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <TextInput
                        size="sm"
                        label={t('course:teeName')}
                        value={tee.name}
                        onChange={(e) => updateTee(tee.id, { name: e.currentTarget.value })}
                        error={stepOneErrors.teeNames?.[tee.id] ? 'Required' : undefined}
                        style={{ flex: 1 }}
                      />
                      {stepOne.tees.length > 1 && (
                        <ActionIcon
                          color="red"
                          variant="light"
                          mt="xl"
                          onClick={() => removeTee(tee.id)}
                          aria-label={t('delete')}
                        >
                          ✕
                        </ActionIcon>
                      )}
                    </Group>
                    <Group grow>
                      <NumberInput
                        size="sm"
                        label={t('course:courseRating')}
                        value={tee.courseRating}
                        onChange={(val) =>
                          updateTee(tee.id, { courseRating: typeof val === 'number' ? val : 72 })
                        }
                        decimalScale={1}
                        min={50}
                        max={90}
                      />
                      <NumberInput
                        size="sm"
                        label={t('course:slopeRating')}
                        value={tee.slopeRating}
                        onChange={(val) =>
                          updateTee(tee.id, { slopeRating: typeof val === 'number' ? val : 113 })
                        }
                        min={55}
                        max={155}
                      />
                    </Group>
                  </Stack>
                </Card>
              ))}

              <Group>
                {teePresetOptions.length > 0 ? (
                  <Select
                    size="sm"
                    placeholder={t('course:teeName')}
                    data={teePresetOptions}
                    value={newTeeName || null}
                    onChange={(val) => setNewTeeName(val ?? '')}
                    style={{ flex: 1 }}
                  />
                ) : (
                  <TextInput
                    size="sm"
                    placeholder={t('course:teeName')}
                    value={newTeeName}
                    onChange={(e) => setNewTeeName(e.currentTarget.value)}
                    style={{ flex: 1 }}
                  />
                )}
                <Button
                  size="sm"
                  variant="light"
                  onClick={handleAddTee}
                  disabled={!newTeeName.trim()}
                >
                  {t('course:addTee')}
                </Button>
              </Group>
            </Stack>
          </Card>

          <Group justify="flex-end">
            <Button variant="default" onClick={() => navigate('/course')}>
              {t('cancel')}
            </Button>
            <Button color="green" onClick={nextStep}>
              {t('next')}
            </Button>
          </Group>
        </Stack>
      )}

      {currentStep === 1 && (
        <Stack gap="md">
          <HoleDataTable
            holes={holes}
            tees={stepOne.tees}
            onUpdateHole={updateHole}
            distanceUnit={distanceUnit}
          />

          <Group justify="flex-end">
            <Button variant="default" onClick={prevStep}>
              {t('back')}
            </Button>
            <Button color="green" onClick={() => void handleSave()}>
              {t('save')}
            </Button>
          </Group>
        </Stack>
      )}
    </Stack>
  )
}
