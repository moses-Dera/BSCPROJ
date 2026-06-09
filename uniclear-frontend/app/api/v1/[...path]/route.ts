import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.API_URL || 'http://localhost:5000'

async function refreshAccessToken(): Promise<string | null> {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get('refresh_token')?.value
  if (!refreshToken) return null

  const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
    cache: 'no-store',
  })

  const json = await res.json()
  if (!json.success) return null

  const isProd = process.env.NODE_ENV === 'production'
  cookieStore.set('access_token', json.data.accessToken, {
    httpOnly: true, secure: isProd, sameSite: 'lax', path: '/', maxAge: 60 * 15,
  })
  cookieStore.set('refresh_token', json.data.refreshToken, {
    httpOnly: true, secure: isProd, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7,
  })

  return json.data.accessToken
}

async function doFetch(url: string, req: NextRequest, token: string | undefined): Promise<Response> {
  const isMultipart = req.headers.get('content-type')?.includes('multipart/form-data')

  const headers: HeadersInit = isMultipart
    ? { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    : {
        'Content-Type': req.headers.get('content-type') ?? 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      }

  return fetch(url, {
    method: req.method,
    headers,
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : (isMultipart ? req.body : await req.text()),
    // @ts-expect-error — duplex required for streaming body in Node 18+
    duplex: 'half',
  })
}

async function proxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const cookieStore = await cookies()
  let token = cookieStore.get('access_token')?.value

  const { path } = await params
  const url = `${API_URL}/api/v1/${path.join('/')}${req.nextUrl.search}`

  let res: Response
  try {
    res = await doFetch(url, req, token)
  } catch {
    return NextResponse.json({ success: false, message: 'Cannot reach server. Please try again later.' }, { status: 503 })
  }

  // Token missing or expired — try refresh once
  if (res.status === 401) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      try {
        res = await doFetch(url, req, newToken)
      } catch {
        return NextResponse.json({ success: false, message: 'Cannot reach server. Please try again later.' }, { status: 503 })
      }
    }
  }

  const contentType = res.headers.get('content-type') ?? ''
  const body = contentType.includes('application/json') ? await res.json() : await res.text()
  return NextResponse.json(body, { status: res.status })
}

export const GET    = proxy
export const POST   = proxy
export const PATCH  = proxy
export const PUT    = proxy
export const DELETE = proxy
