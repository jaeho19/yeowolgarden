/**
 * POST /api/applications
 *
 * 분양 신청 접수.
 * - zod 검증 + honeypot + rate-limit (IP당 5/시간)
 * - 모집 마감 시 403
 * - 트랜잭션 내 applicationNumber 발급 + uq_season_email로 중복 차단
 *
 * 참고: docs/02-design/features/yeowol-farm-website.design.md §4.2
 */
import { NextResponse } from 'next/server'
import { ApplicationInputSchema } from '@/lib/schemas/application'
import { createApplication } from '@/lib/applications'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import {
  getCurrentSeasonYear,
  isRecruitmentOpen,
} from '@/lib/settings'
import { DomainError } from '@/lib/errors'

// Route Handler는 항상 동적
export const dynamic = 'force-dynamic'

const BANK_INFO =
  process.env.BANK_INFO_DISPLAY ??
  '농축협 351-1352-647143 농업회사법인 (유)호정'
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yeowolfarm.netlify.app'

export async function POST(req: Request) {
  // 1) Rate-limit (IP당 5/시간)
  const ip = getClientIp(req)
  const allowed = await rateLimit(`apply:${ip}`, {
    limit: 5,
    windowSec: 60 * 60,
  })
  if (!allowed) {
    return NextResponse.json(
      {
        error: {
          code: 'APPLY_RATE_LIMITED',
          message: '신청 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.',
        },
      },
      { status: 429 }
    )
  }

  // 2) Body parse
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      {
        error: { code: 'VALIDATION_FAILED', message: '잘못된 요청 형식' },
      },
      { status: 400 }
    )
  }

  const parsed = ApplicationInputSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_FAILED',
          message: parsed.error.issues[0]?.message ?? '입력값을 확인해주세요',
          issues: parsed.error.issues.map((i) => ({
            path: i.path.join('.'),
            message: i.message,
          })),
        },
      },
      { status: 400 }
    )
  }

  // 3) Honeypot — 봇이 채웠으면 조용히 성공 응답 흉내내고 무시
  if (parsed.data.website && parsed.data.website.length > 0) {
    // 진짜 처리는 하지 않되, 봇에게는 정상 응답 가장 (delay로 시간 비슷하게)
    await new Promise((r) => setTimeout(r, 300))
    return NextResponse.json(
      {
        error: { code: 'HONEYPOT_TRIGGERED', message: '요청이 거부되었습니다' },
      },
      { status: 400 }
    )
  }

  // 4) 모집 ON/OFF
  const open = await isRecruitmentOpen()
  if (!open) {
    return NextResponse.json(
      {
        error: {
          code: 'RECRUITMENT_CLOSED',
          message: '현재 분양 신청을 받지 않고 있습니다.',
        },
      },
      { status: 403 }
    )
  }

  // 5) 신청 생성
  const seasonYear = await getCurrentSeasonYear()
  try {
    const { id, applicationNumber, totalPriceKrw } = await createApplication(
      parsed.data,
      seasonYear
    )

    return NextResponse.json(
      {
        id,
        applicationNumber,
        status: 'PENDING' as const,
        desiredCount: parsed.data.desiredCount,
        totalAreaPyeong: parsed.data.desiredCount * 5,
        totalPriceKrw,
        statusUrl: `${SITE_URL}/apply/status`,
        bankInfo: BANK_INFO,
      },
      { status: 201 }
    )
  } catch (e) {
    if (e instanceof DomainError) {
      return NextResponse.json(
        { error: { code: e.code, message: e.message } },
        { status: e.status }
      )
    }
    console.error('[POST /api/applications] unexpected error', e)
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        },
      },
      { status: 500 }
    )
  }
}
