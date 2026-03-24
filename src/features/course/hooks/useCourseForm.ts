import { useState, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Course, Hole, Tee } from '@/storage/types'

interface TeeFormData {
  id: string
  name: string
  courseRating: number
  slopeRating: number
}

interface HoleFormData {
  number: number
  parByTee: Record<string, number>
  handicap: number
  distanceByTee: Record<string, number>
}

interface StepOneData {
  name: string
  clubName: string
  holesCount: 9 | 18
  tees: TeeFormData[]
}

interface StepOneErrors {
  name?: string
  tees?: string
  teeNames?: Record<string, string>
}

interface StepTwoErrors {
  holes?: string
}

export function useCourseForm(existingCourse?: Course) {
  const [currentStep, setCurrentStep] = useState(0)

  const buildInitialStepOne = useCallback((): StepOneData => {
    if (existingCourse) {
      return {
        name: existingCourse.name,
        clubName: existingCourse.clubName ?? '',
        holesCount: existingCourse.holes.length as 9 | 18,
        tees: existingCourse.tees.map((t) => ({
          id: t.id,
          name: t.name,
          courseRating: t.courseRating,
          slopeRating: t.slopeRating,
        })),
      }
    }
    return {
      name: '',
      clubName: '',
      holesCount: 18,
      tees: [{ id: uuidv4(), name: 'White', courseRating: 72, slopeRating: 113 }],
    }
  }, [existingCourse])

  const buildInitialHoles = useCallback(
    (stepOne: StepOneData): HoleFormData[] => {
      if (existingCourse && existingCourse.holes.length === stepOne.holesCount) {
        return existingCourse.holes.map((h) => ({
          number: h.number,
          parByTee: { ...h.parByTee },
          handicap: h.handicap,
          distanceByTee: { ...h.distanceByTee },
        }))
      }
      return Array.from({ length: stepOne.holesCount }, (_, i) => {
        const holeNum = i + 1
        const parByTee: Record<string, number> = {}
        const distanceByTee: Record<string, number> = {}
        for (const tee of stepOne.tees) {
          parByTee[tee.id] = 4
          distanceByTee[tee.id] = 0
        }
        return {
          number: holeNum,
          parByTee,
          handicap: holeNum,
          distanceByTee,
        }
      })
    },
    [existingCourse],
  )

  const [stepOne, setStepOne] = useState<StepOneData>(buildInitialStepOne)
  const [holes, setHoles] = useState<HoleFormData[]>(() => buildInitialHoles(buildInitialStepOne()))
  const [stepOneErrors, setStepOneErrors] = useState<StepOneErrors>({})
  const [stepTwoErrors, setStepTwoErrors] = useState<StepTwoErrors>({})

  const updateStepOne = useCallback((updates: Partial<StepOneData>) => {
    setStepOne((prev) => ({ ...prev, ...updates }))
  }, [])

  const addTee = useCallback((name: string) => {
    const newTee: TeeFormData = {
      id: uuidv4(),
      name,
      courseRating: 72,
      slopeRating: 113,
    }
    setStepOne((prev) => ({ ...prev, tees: [...prev.tees, newTee] }))
    setHoles((prev) =>
      prev.map((hole) => ({
        ...hole,
        parByTee: { ...hole.parByTee, [newTee.id]: 4 },
        distanceByTee: { ...hole.distanceByTee, [newTee.id]: 0 },
      })),
    )
  }, [])

  const removeTee = useCallback((teeId: string) => {
    setStepOne((prev) => ({
      ...prev,
      tees: prev.tees.filter((t) => t.id !== teeId),
    }))
    setHoles((prev) =>
      prev.map((hole) => {
        const newParByTee = { ...hole.parByTee }
        const newDistanceByTee = { ...hole.distanceByTee }
        delete newParByTee[teeId]
        delete newDistanceByTee[teeId]
        return { ...hole, parByTee: newParByTee, distanceByTee: newDistanceByTee }
      }),
    )
  }, [])

  const updateTee = useCallback((teeId: string, updates: Partial<TeeFormData>) => {
    setStepOne((prev) => ({
      ...prev,
      tees: prev.tees.map((t) => (t.id === teeId ? { ...t, ...updates } : t)),
    }))
  }, [])

  const updateHole = useCallback(
    (holeNumber: number, field: string, value: number, teeId?: string) => {
      setHoles((prev) =>
        prev.map((hole) => {
          if (hole.number !== holeNumber) return hole
          if (field === 'handicap') {
            return { ...hole, handicap: value }
          }
          if (field === 'par' && teeId) {
            return { ...hole, parByTee: { ...hole.parByTee, [teeId]: value } }
          }
          if (field === 'distance' && teeId) {
            return { ...hole, distanceByTee: { ...hole.distanceByTee, [teeId]: value } }
          }
          return hole
        }),
      )
    },
    [],
  )

  const validateStepOne = useCallback((): boolean => {
    const errors: StepOneErrors = {}
    if (!stepOne.name.trim()) {
      errors.name = 'required'
    }
    if (stepOne.tees.length === 0) {
      errors.tees = 'required'
    }
    const teeNameErrors: Record<string, string> = {}
    for (const tee of stepOne.tees) {
      if (!tee.name.trim()) {
        teeNameErrors[tee.id] = 'required'
      }
    }
    if (Object.keys(teeNameErrors).length > 0) {
      errors.teeNames = teeNameErrors
    }
    setStepOneErrors(errors)
    return Object.keys(errors).length === 0
  }, [stepOne])

  const validateStepTwo = useCallback((): boolean => {
    setStepTwoErrors({})
    return true
  }, [])

  const nextStep = useCallback(() => {
    if (currentStep === 0 && validateStepOne()) {
      // Rebuild holes when moving to step 2
      setHoles((prev) => {
        if (prev.length === stepOne.holesCount) {
          // Ensure all tees are represented
          return prev.map((hole) => {
            const parByTee = { ...hole.parByTee }
            const distanceByTee = { ...hole.distanceByTee }
            for (const tee of stepOne.tees) {
              if (parByTee[tee.id] === undefined) parByTee[tee.id] = 4
              if (distanceByTee[tee.id] === undefined) distanceByTee[tee.id] = 0
            }
            return { ...hole, parByTee, distanceByTee }
          })
        }
        return buildInitialHoles(stepOne)
      })
      setCurrentStep(1)
    }
  }, [currentStep, validateStepOne, stepOne, buildInitialHoles])

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1)
    }
  }, [currentStep])

  const buildCourse = useCallback(
    (id?: string): Course => {
      const courseId = id ?? existingCourse?.id ?? uuidv4()
      const tees: Tee[] = stepOne.tees.map((t) => {
        let totalDistance = 0
        for (const hole of holes) {
          totalDistance += hole.distanceByTee[t.id] ?? 0
        }
        return {
          id: t.id,
          name: t.name,
          courseRating: t.courseRating,
          slopeRating: t.slopeRating,
          totalDistance,
        }
      })

      const courseHoles: Hole[] = holes.map((h) => ({
        number: h.number,
        parByTee: h.parByTee,
        handicap: h.handicap,
        distanceByTee: h.distanceByTee,
      }))

      const course: Course = {
        id: courseId,
        name: stepOne.name,
        holes: courseHoles,
        tees,
      }
      if (stepOne.clubName.trim()) {
        course.clubName = stepOne.clubName.trim()
      }
      return course
    },
    [existingCourse, stepOne, holes],
  )

  return {
    currentStep,
    stepOne,
    holes,
    stepOneErrors,
    stepTwoErrors,
    updateStepOne,
    addTee,
    removeTee,
    updateTee,
    updateHole,
    nextStep,
    prevStep,
    validateStepOne,
    validateStepTwo,
    buildCourse,
  }
}
