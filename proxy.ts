/**
 * 어드민 라우트 보호 (Edge middleware).
 *
 * 보호 대상: /admin/* (단, /admin/login 제외), /api/admin/* (단, /api/admin/auth/* 제외)
 * 비로그인 → /admin/login?callbackUrl=...로 리다이렉트
 *
 * NextAuth v5의 `authorized` 콜백을 활용해 단일 진입점에서 처리.
 */
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname, search } = req.nextUrl

  const isAdminPath =
    pathname.startsWith('/admin') || pathname.startsWith('/api/admin')
  const isAuthExempt =
    pathname === '/admin/login' || pathname.startsWith('/api/admin/auth')

  if (!isAdminPath || isAuthExempt) return NextResponse.next()

  if (!req.auth) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      )
    }
    const url = req.nextUrl.clone()
    url.pathname = '/admin/login'
    url.search = `?callbackUrl=${encodeURIComponent(pathname + search)}`
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
