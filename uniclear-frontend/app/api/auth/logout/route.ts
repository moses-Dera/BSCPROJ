import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const API_URL = process.env.API_URL || 'http://localhost:5000'

export async function POST() {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get('refresh_token')?.value

  if (refreshToken) {
    await fetch(`${API_URL}/api/v1/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {}) // fire-and-forget — always clear cookies
  }

  cookieStore.delete('access_token')
  cookieStore.delete('refresh_token')

  return NextResponse.json({ success: true })
}
