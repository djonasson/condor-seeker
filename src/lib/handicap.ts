export function calculateCourseHandicap(
  handicapIndex: number,
  slopeRating: number,
  courseRating: number,
  par: number,
): number {
  return Math.round(handicapIndex * (slopeRating / 113) + (courseRating - par))
}

export function allocateStrokes(courseHandicap: number, holeHandicaps: number[]): number[] {
  if (courseHandicap <= 0) {
    return holeHandicaps.map(() => 0)
  }

  if (courseHandicap <= 18) {
    return holeHandicaps.map((hh) => (hh <= courseHandicap ? 1 : 0))
  }

  // courseHandicap > 18: everyone gets at least 1 stroke,
  // holes with handicap <= (courseHandicap - 18) get 2
  const extraStrokes = courseHandicap - 18
  return holeHandicaps.map((hh) => (hh <= extraStrokes ? 2 : 1))
}
