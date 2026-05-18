/**
 * POST /api/admin/applications/[id]/assign
 * Body: { plotNumbers: number[] }
 * 운영자 수동 배정.
 */
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { assignManual } from '@/lib/allocation'
import { requireAdmin } from '@/lib/admin-guard'
import { DomainError } from '@/lib/errors'

export const dynamic = 'force-dynamic'

const BodySchema = z.object({
  plotNumbers: z
    .array(z.number().int().positive())
    .min(1, '최소 1개 구획을 선택해주세요'),
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
    const result = await assignManual(id, parsed.data.plotNumbers)
    return NextResponse.json(result)
  } catch (e) {
    if (e instanceof DomainError) {
      return NextResponse.json(
        { error: { code: e.code, message: e.message } },
        { status: e.status }
      )
    }
    console.error('[assign] unexpected', e)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: '배정 처리 실패' } },
      { status: 500 }
    )
  }
}
