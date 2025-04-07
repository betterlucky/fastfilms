import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from 'next/server'

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/campaigns",
  "/api/auth",
  "/_next",
  "/favicon.ico",
  "/api/health"
]

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    
    // Protect admin routes
    if (req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname.startsWith("/campaigns/new")) {
      if (!token || token.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    return NextResponse.next()
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