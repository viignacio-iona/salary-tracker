import { NextRequest, NextResponse } from 'next/server'

const PASSWORD = process.env.SALARY_TRACKER_PASSWORD
const COOKIE_NAME = 'salary_auth'

export async function POST(request: NextRequest) {
  const { password } = await request.json()
  if (password === PASSWORD) {
    const response = NextResponse.json({ success: true })
    response.cookies.set(COOKIE_NAME, 'authenticated', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })
    return response
  }
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
} 