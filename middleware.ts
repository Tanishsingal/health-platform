import { withRoleBasedAuth } from './lib/middleware'

export async function middleware(request: Request) {
  return await withRoleBasedAuth(request as any)
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
