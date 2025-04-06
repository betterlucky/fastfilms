import { NextResponse } from "next/server"
import { searchMovies } from "@/lib/tmdb"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      )
    }

    const films = await searchMovies(query)
    return NextResponse.json(films)
  } catch (error) {
    console.error("Error searching films:", error)
    return NextResponse.json(
      { error: "Failed to search films" },
      { status: 500 }
    )
  }
} 