import { NextResponse, type NextRequest } from "next/server"
import { jwtVerify } from 'jose'

// JWT secret for edge runtime
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
)

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({
    request,
  })

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // Check if the route requires authentication
  const protectedPaths = ['/dashboard', '/patient', '/doctor', '/nurse', '/admin', '/pharmacy', '/laboratory', '/analytics']
  const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))
  
  if (isProtectedPath) {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      // Redirect to login if no token
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
    
    // Verify the token using jose (edge-compatible)
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      
      // Add user info to headers for use in API routes
      response.headers.set('x-user-id', payload.userId as string)
      response.headers.set('x-user-role', payload.role as string)
      response.headers.set('x-user-email', payload.email as string)
    } catch (error) {
      // Redirect to login if token is invalid
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('redirect', request.nextUrl.pathname)
      
      // Clear the invalid token
      const response = NextResponse.redirect(url)
      response.cookies.delete('auth-token')
      return response
    }
  }

  return response
}

// Role-based access control helper
export function hasRequiredRole(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole)
}

// Route-specific role requirements
export const ROUTE_ROLES = {
  '/admin': ['super_admin', 'admin'],
  '/doctor': ['super_admin', 'admin', 'doctor'],
  '/patient': ['super_admin', 'admin', 'doctor', 'nurse', 'patient'],
  '/pharmacy': ['super_admin', 'admin', 'pharmacist'],
  '/laboratory': ['super_admin', 'admin', 'lab_technician'],
  '/analytics': ['super_admin', 'admin'],
  '/dashboard': ['super_admin', 'admin', 'doctor', 'nurse', 'patient', 'pharmacist', 'lab_technician']
}

// Enhanced middleware with role-based access control
export async function withRoleBasedAuth(request: NextRequest) {
  const response = NextResponse.next({
    request,
  })

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // Check if the route requires authentication
  const pathname = request.nextUrl.pathname
  const routeKey = Object.keys(ROUTE_ROLES).find(route => pathname.startsWith(route))
  
  if (routeKey) {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
    
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      
      // Check role permissions
      const requiredRoles = ROUTE_ROLES[routeKey as keyof typeof ROUTE_ROLES]
      if (!hasRequiredRole(payload.role as string, requiredRoles)) {
        // Redirect to unauthorized page or dashboard
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        url.searchParams.set('error', 'unauthorized')
        return NextResponse.redirect(url)
      }
      
      // Add user info to headers
      response.headers.set('x-user-id', payload.userId as string)
      response.headers.set('x-user-role', payload.role as string)
      response.headers.set('x-user-email', payload.email as string)
    } catch (error) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('redirect', pathname)
      
      const response = NextResponse.redirect(url)
      response.cookies.delete('auth-token')
      return response
    }
  }

  return response
}
