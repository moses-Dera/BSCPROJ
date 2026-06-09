import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const host = req.headers.get('host') ?? ''

  // Prod: unn.uniclear.ng subdomain takes priority
  const subdomain = host.split('.')[0]
  const fromSubdomain = host.includes('.') && subdomain !== 'www' && subdomain !== 'localhost'
    ? subdomain : null

  // Dev fallback: ?tenant=unn in URL (only on first visit / login page)
  const fromParam = req.nextUrl.searchParams.get('tenant')

  const slug = fromSubdomain ?? fromParam

  if (slug) {
    res.cookies.set('tenant_slug', slug, { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 })
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
