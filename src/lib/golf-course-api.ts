const BASE_URL = 'https://api.golfcourseapi.com/v1'

export type ApiLocation = {
  city?: string
  state?: string
  country?: string
}

export type ApiHole = {
  par: number
  yardage: number
  handicap: number
}

export type ApiTeeBox = {
  tee_name: string
  course_rating: number
  slope_rating: number
  total_yards: number
  total_meters: number
  number_of_holes: number
  par_total: number
  holes: ApiHole[]
}

export type ApiCourseSearchResult = {
  id: number
  club_name: string
  course_name: string
  location?: ApiLocation
}

export type ApiCourseDetail = {
  id: number
  club_name: string
  course_name: string
  location?: ApiLocation
  tees?: {
    female?: ApiTeeBox[]
    male?: ApiTeeBox[]
  }
}

async function apiFetch<T>(apiKey: string, path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Authorization: `Key ${apiKey}`,
    },
  })

  if (response.status === 401) {
    throw new Error('Invalid API key. Please check your GolfCourseAPI key in Settings.')
  }

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }

  return (await response.json()) as T
}

export async function searchCourses(
  apiKey: string,
  query: string,
): Promise<ApiCourseSearchResult[]> {
  const result = await apiFetch<{ courses: ApiCourseSearchResult[] }>(
    apiKey,
    `/search?search_query=${encodeURIComponent(query)}`,
  )
  return result.courses
}

export async function getCourseById(apiKey: string, id: number): Promise<ApiCourseDetail> {
  const result = await apiFetch<{ course: ApiCourseDetail }>(apiKey, `/courses/${id}`)
  return result.course
}
