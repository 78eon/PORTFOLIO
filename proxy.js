import { NextResponse } from 'next/server'

async function sessionToken() {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(process.env.ADMIN_PASSWORD),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode('admin-session-v1'))
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('')
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
    const expected = await sessionToken()
    if (!cookie || cookie.value !== expected) {
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
