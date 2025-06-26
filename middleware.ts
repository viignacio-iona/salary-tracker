import { NextRequest, NextResponse } from 'next/server'

const AUTH_COOKIE = 'salary_auth'
const PUBLIC_PATHS = ['/login', '/api/login']

export function middleware(request: NextRequest) {
  console.log('MIDDLEWARE RUNNING:', request.nextUrl.pathname)
  const { pathname } = request.nextUrl
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }
  const authCookie = request.cookies.get(AUTH_COOKIE)
  if (authCookie?.value === 'authenticated') {
    return NextResponse.next()
  }
  const loginUrl = new URL('/login', request.url)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|public|api/login|login).*)'],
} 