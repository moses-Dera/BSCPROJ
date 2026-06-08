import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const API_URL = process.env.API_URL || 'http://localhost:5000'

export async function POST() {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get('refresh_token')?.value

  if (!refreshToken) {
    return NextResponse.json({ success: false, message: 'No refresh token' }, { status: 401 })
  }

  const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  const json = await res.json()
  if (!json.success) return NextResponse.json(json, { status: res.status })

  const isProd = process.env.NODE_ENV === 'production'

  cookieStore.set('access_token', json.data.accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 15,           // 15 minutes
  })

  // Set rotated refresh token — resets the 7-day window on every activity
  cookieStore.set('refresh_token', json.data.refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days sliding
  })

  return NextResponse.json({ success: true })
}
