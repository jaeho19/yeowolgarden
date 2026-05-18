/**
 * POST /api/admin/applications/[id]/reject
 * Body: { reason: string, adminNote?: string }
 */
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { rejectApplication } from '@/lib/allocation'
import { requireAdmin } from '@/lib/admin-guard'
import { DomainError } from '@/lib/errors'

export const dynamic = 'force-dynamic'

const BodySchema = z.object({
  reason: z
    .string()
    .trim()
    .min(2, '거절 사유를 입력해주세요')
    .max(500, '500자 이내로 입력해주세요'),
  adminNote: z.string().max(1000).optional(),
})

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin()
  if (guard instanceof NextResponse) return guard

  const { id } = await ctx.params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: { code: 'VALIDATION_FAILED', message: '잘못된 요청 형식' } },
      { status: 400 }
    )
  }
  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_FAILED',
          message: parsed.error.issues[0]?.message,
        },
      },
      { status: 400 }
    )
  }

  try {
    await rejectApplication(id, parsed.data.reason, parsed.data.adminNote)
    return NextResponse.json({ success: true })
  } catch (e) {
    if (e instanceof DomainError) {
      return NextResponse.json(
        { error: { code: e.code, message: e.message } },
        { status: e.status }
      )
    }
    console.error('[reject] unexpected', e)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: '거절 처리 실패' } },
      { status: 500 }
    )
  }
}
