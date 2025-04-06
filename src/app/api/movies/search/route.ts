import { NextResponse } from "next/server"
import { searchMovies } from "@/lib/tmdb"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      )
    }

    const movies = await searchMovies(query)
    return NextResponse.json(movies)
  } catch (error) {
    console.error("Error searching movies:", error)
    return NextResponse.json(
      { error: "Failed to search movies" },
      { status: 500 }
    )
  }
} 