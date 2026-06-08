import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.API_URL || 'http://localhost:5000'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const res = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const json = await res.json()
  if (!json.success) return NextResponse.json(json, { status: res.status })

  const cookieStore = await cookies()
  const isProd = process.env.NODE_ENV === 'production'

  cookieStore.set('access_token', json.data.accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 15,           // 15 minutes
  })

  cookieStore.set('refresh_token', json.data.refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  // Only return user — never expose tokens to client JS
  return NextResponse.json({ success: true, data: json.data.user })
}
