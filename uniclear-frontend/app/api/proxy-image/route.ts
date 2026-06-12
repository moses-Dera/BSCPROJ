import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  if (!url) return new NextResponse('Missing URL', { status: 400 })

  try {
    const res = await fetch(url)
    if (!res.ok) return new NextResponse(`Upstream failed: ${res.status}`, { status: res.status })
    const buffer = await res.arrayBuffer()
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': res.headers.get('Content-Type') || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (err: any) {
    return new NextResponse(err.message, { status: 500 })
  }
}
