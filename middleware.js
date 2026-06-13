import { NextResponse } from 'next/server'

export function middleware(request) {
  const cookie = request.cookies.get('admin_session')
  if (!cookie || cookie.value !== process.env.ADMIN_PASSWORD) {
    const url = new URL('/login', request.url)
    url.searchParams.set('from', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
