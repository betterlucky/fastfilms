import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/api/auth",
  "/_next",
  "/favicon.ico",
  "/api/health"
]

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!token || token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdminRoute = req.nextUrl.pathname.startsWith("/campaigns/new")

    if (isAdminRoute && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/campaigns", req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Check if the current path is a public route
        const isPublicRoute = publicRoutes.some(route => 
          req.nextUrl.pathname.startsWith(route)
        )
        
        // Allow access to public routes
        if (isPublicRoute) {
          return true
        }
        
        // Require authentication for all other routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
} 