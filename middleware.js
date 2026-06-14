import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl
  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || 'admin'

  // Block direct /admin/* access — return 404 so it looks like the route doesn't exist
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return new NextResponse(null, { status: 404 })
  }

  // Protect the secret admin path and API admin routes
  const isSecretAdmin = pathname === `/${adminPath}` || pathname.startsWith(`/${adminPath}/`)
  const isApiAdmin = pathname.startsWith('/api/admin/')

  if (isSecretAdmin || isApiAdmin) {
    const cookie = request.cookies.get('admin_session')
    if (!cookie || cookie.value !== process.env.ADMIN_PASSWORD) {
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
