import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.API_URL || 'http://localhost:5000'

async function proxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const cookieStore = await cookies()
  const token       = cookieStore.get('access_token')?.value
  const tenantSlug  = req.headers.get('x-tenant-slug')

  const { path } = await params
  const pathStr   = path.join('/')
  const search      = req.nextUrl.search
  const url         = `${API_URL}/api/v1/${pathStr}${search}`

  // Forward original headers, inject auth + tenant
  const headers: HeadersInit = {
    'Content-Type': req.headers.get('content-type') ?? 'application/json',
    ...(token      ? { Authorization: `Bearer ${token}` } : {}),
    ...(tenantSlug ? { 'x-tenant-slug': tenantSlug }      : {}),
  }

  const isMultipart = req.headers.get('content-type')?.includes('multipart/form-data')

  const res = await fetch(url, {
    method:  req.method,
    headers: isMultipart ? { ...(token ? { Authorization: `Bearer ${token}` } : {}) } : headers,
    body:    ['GET', 'HEAD'].includes(req.method) ? undefined : (isMultipart ? req.body : await req.text()),
    // @ts-expect-error — duplex required for streaming body in Node 18+
    duplex: 'half',
  })

  const contentType = res.headers.get('content-type') ?? ''
  const body = contentType.includes('application/json') ? await res.json() : await res.text()

  return NextResponse.json(body, { status: res.status })
}

export const GET     = proxy
export const POST    = proxy
export const PATCH   = proxy
export const PUT     = proxy
export const DELETE  = proxy
