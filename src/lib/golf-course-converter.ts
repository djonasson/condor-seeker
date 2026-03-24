import { v4 as uuidv4 } from 'uuid'
import type { Course, Hole, Tee } from '@/storage/types'
import type { ApiCourseDetail, ApiTeeBox } from '@/lib/golf-course-api'

export type ApiTeeOption = {
  key: string
  teeName: string
  gender: string
  courseRating: number
  slopeRating: number
  totalYards: number
  totalMeters: number
  numberOfHoles: number
  parTotal: number
}

export function getAvailableTees(apiCourse: ApiCourseDetail): ApiTeeOption[] {
  const options: ApiTeeOption[] = []
  const apiTees = apiCourse.tees ?? {}

  if (apiTees.male) {
    apiTees.male.forEach((tee, i) => {
      options.push({
        key: `male-${i}`,
        teeName: tee.tee_name,
        gender: 'male',
        courseRating: tee.course_rating,
        slopeRating: tee.slope_rating,
        totalYards: tee.total_yards,
        totalMeters: tee.total_meters,
        numberOfHoles: tee.number_of_holes,
        parTotal: tee.par_total,
      })
    })
  }
  if (apiTees.female) {
    apiTees.female.forEach((tee, i) => {
      options.push({
        key: `female-${i}`,
        teeName: tee.tee_name,
        gender: 'female',
        courseRating: tee.course_rating,
        slopeRating: tee.slope_rating,
        totalYards: tee.total_yards,
        totalMeters: tee.total_meters,
        numberOfHoles: tee.number_of_holes,
        parTotal: tee.par_total,
      })
    })
  }

  return options
}

export function convertApiCourse(
  apiCourse: ApiCourseDetail,
  selectedTeeKeys?: Set<string>,
): Course {
  const courseName = apiCourse.course_name || apiCourse.club_name
  const clubName = apiCourse.club_name

  const allApiTees: Array<{ teeBox: ApiTeeBox; gender: string; key: string }> = []

  const apiTees = apiCourse.tees ?? {}
  if (apiTees.male) {
    apiTees.male.forEach((tee, i) => {
      allApiTees.push({ teeBox: tee, gender: 'male', key: `male-${i}` })
    })
  }
  if (apiTees.female) {
    apiTees.female.forEach((tee, i) => {
      allApiTees.push({ teeBox: tee, gender: 'female', key: `female-${i}` })
    })
  }

  // Filter to selected tees if specified
  const filteredTees = selectedTeeKeys
    ? allApiTees.filter(({ key }) => selectedTeeKeys.has(key))
    : allApiTees

  // Build our Tee[] with generated UUIDs
  const tees: Tee[] = filteredTees.map(({ teeBox, gender }) => ({
    id: uuidv4(),
    name: `${teeBox.tee_name} (${gender})`,
    courseRating: teeBox.course_rating,
    slopeRating: teeBox.slope_rating,
    totalDistance: teeBox.total_meters,
  }))

  // Determine hole count from the tee box with the most holes
  const maxHoles = filteredTees.reduce(
    (max, { teeBox }) => Math.max(max, teeBox.number_of_holes),
    0,
  )

  // Build Hole[] by collecting data from all tee boxes
  const holes: Hole[] = []
  for (let holeNum = 1; holeNum <= maxHoles; holeNum++) {
    const parByTee: Record<string, number> = {}
    const distanceByTee: Record<string, number> = {}
    let handicap = 0

    for (let teeIdx = 0; teeIdx < filteredTees.length; teeIdx++) {
      const { teeBox } = filteredTees[teeIdx]
      const teeId = tees[teeIdx].id
      const holeData = teeBox.holes[holeNum - 1]
      if (!holeData) continue

      parByTee[teeId] = holeData.par
      distanceByTee[teeId] = holeData.yardage * 0.9144

      if (handicap === 0 && holeData.handicap) {
        handicap = holeData.handicap
      }
    }

    holes.push({
      number: holeNum,
      parByTee,
      handicap,
      distanceByTee,
    })
  }

  return {
    id: uuidv4(),
    name: courseName,
    clubName,
    holes,
    tees,
  }
}
