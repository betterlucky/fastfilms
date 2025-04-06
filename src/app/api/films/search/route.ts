import { NextResponse, type NextRequest } from "next/server"
import { searchFilms } from "@/lib/tmdb"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const query = searchParams.get("query")

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      )
    }

    const films = await searchFilms(query)
    return NextResponse.json(films)
  } catch (error) {
    console.error("Error searching films:", error)
    return NextResponse.json(
      { error: "Failed to search films" },
      { status: 500 }
    )
  }
} 