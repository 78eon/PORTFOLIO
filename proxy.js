import { NextResponse } from 'next/server'

async function verifyToken(cookieValue) {
  if (!cookieValue) return false
  const dot = cookieValue.lastIndexOf('.')
  if (dot === -1) return false
  const id = cookieValue.slice(0, dot)
  const sig = cookieValue.slice(dot + 1)
  if (id.length !== 64 || sig.length !== 64) return false

  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(process.env.ADMIN_PASSWORD),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const expected = await crypto.subtle.sign('HMAC', key, enc.encode(id))
  const expectedHex = [...new Uint8Array(expected)].map(b => b.toString(16).padStart(2, '0')).join('')
  return sig === expectedHex
}

export async function proxy(request) {
  const { pathname } = request.nextUrl
  const adminPath = (process.env.ADMIN_PATH || 'admin').trim()

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return new NextResponse(null, { status: 404 })
  }

  const isSecretAdmin = pathname === `/${adminPath}` || pathname.startsWith(`/${adminPath}/`)
  const isApiAdmin = pathname.startsWith('/api/admin/')

  if (isSecretAdmin || isApiAdmin) {
    const cookie = request.cookies.get('admin_session')
    if (!cookie || !(await verifyToken(cookie.value))) {
      const url = new URL('/login', request.url)
      url.searchParams.set('from', pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|\\.well-known).*)'],
}
