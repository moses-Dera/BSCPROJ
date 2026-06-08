import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const res  = NextResponse.next()
  const host = req.headers.get('host') ?? ''

  // Dev: ?tenant=unn  |  Prod: unn.uniclear.ng
  const tenantParam = req.nextUrl.searchParams.get('tenant')
  const subdomain   = host.split('.')[0]

  const slug =
    tenantParam ??
    (host.includes('.') && subdomain !== 'www' && subdomain !== 'localhost' ? subdomain : null)

  if (slug) res.headers.set('x-tenant-slug', slug)

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
