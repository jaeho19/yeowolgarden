/**
 * 어드민 API 가드 — Route Handler 시작 부분에서 호출.
 * 중복 방어선: middleware가 1차, 여기가 2차 (middleware 우회 시).
 *
 * 사용:
 *   const session = await requireAdmin()
 *   if (session instanceof NextResponse) return session
 */
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function requireAdmin() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
      { status: 401 }
    )
  }
  return session
}
