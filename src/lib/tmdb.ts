const TMDB_API_KEY = process.env.TMDB_API_KEY
const TMDB_BASE_URL = "https://api.themoviedb.org/3"

export interface TMDBFilm {
  id: number
  title: string
  overview: string
  poster_path: string
  release_date: string
  vote_average: number
  runtime: number
}

export async function searchFilms(query: string): Promise<TMDBFilm[]> {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB_API_KEY is not set")
  }

  const response = await fetch(
    `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
      query
    )}&language=en-GB`
  )

  if (!response.ok) {
    throw new Error("Failed to search films")
  }

  const data = await response.json()
  return data.results
}

export async function getFilmDetails(id: number): Promise<TMDBFilm> {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB_API_KEY is not set")
  }

  const response = await fetch(
    `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&language=en-GB`
  )

  if (!response.ok) {
    throw new Error("Failed to get film details")
  }

  return response.json()
} 