/**
 * GET /api/applications/lookup?number=1234&email=user@example.com
 *
 * 본인 조회 API.
 *
 * 보안 (design.md §7.3, §6.2):
 *  - rate-limit IP당 5/분
 *  - 404 응답을 일관 (number 불일치 / email 불일치 / 둘 다 — 모두 동일)
 *  - 응답 시간 균일화 (성공/실패 모두 ~100ms baseline)
 *  - 응답 필드 화이트리스트 (phone, memo, experience, adminNote 제외)
 *  - 캐시 없음 (status 빠르게 바뀜)
 */
import { NextResponse } from 'next/server'
import { LookupInputSchema } from '@/lib/schemas/application'
import { findByLookup } from '@/lib/applications'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { getCurrentSeasonYear } from '@/lib/settings'

export const dynamic = 'force-dynamic'

const RESPONSE_FLOOR_MS = 100

async function withFloor<T>(promise: Promise<T>): Promise<T> {
  const start = Date.now()
  const result = await promise
  const elapsed = Date.now() - start
  if (elapsed < RESPONSE_FLOOR_MS) {
    await new Promise((r) => setTimeout(r, RESPONSE_FLOOR_MS - elapsed))
  }
  return result
}

export async function GET(req: Request) {
  // 1) Rate-limit
  const ip = getClientIp(req)
  const allowed = await rateLimit(`lookup:${ip}`, {
    limit: 5,
    windowSec: 60,
  })
  if (!allowed) {
    return NextResponse.json(
      {
        error: {
          code: 'LOOKUP_RATE_LIMITED',
          message: '조회 시도가 너무 많습니다. 1분 후 다시 시도해주세요.',
        },
      },
      { status: 429 }
    )
  }

  // 2) Query parse + zod
  const { searchParams } = new URL(req.url)
  const numberRaw = searchParams.get('number')
  const emailRaw = searchParams.get('email')

  const parsed = LookupInputSchema.safeParse({
    applicationNumber: Number(numberRaw),
    email: emailRaw ?? '',
  })
  if (!parsed.success) {
    // 검증 실패도 응답 시간 균일화
    return await withFloor(
      Promise.resolve(
        NextResponse.json(
          {
            error: {
              code: 'VALIDATION_FAILED',
              message: '신청번호와 이메일을 확인해주세요',
            },
          },
          { status: 400 }
        )
      )
    )
  }

  // 3) DB 조회
  const result = await withFloor(
    (async () => {
      const seasonYear = await getCurrentSeasonYear()
      return await findByLookup(
        parsed.data.applicationNumber,
        parsed.data.email,
        seasonYear
      )
    })()
  )

  if (!result) {
    return NextResponse.json(
      {
        error: {
          code: 'LOOKUP_NOT_FOUND',
          message:
            '일치하는 신청을 찾을 수 없습니다. 신청번호와 이메일을 확인해주세요.',
        },
      },
      { status: 404 }
    )
  }

  return NextResponse.json(result)
}
