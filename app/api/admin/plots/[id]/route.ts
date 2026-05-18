/**
 * PATCH /api/admin/plots/[id]
 * Body: { notes?: string, status?: 'AVAILABLE'|'RESERVED' }
 *
 * 상태 OCCUPIED → AVAILABLE/RESERVED 전환은 신청 해제와 연관되므로
 * 여기선 허용하지 않음 (안전). OCCUPIED 해제는 신청 거절/취소를 통해.
 */
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'
import { db } from '@/lib/db'
import { auditLogs, plots } from '@/db/schema'
import { requireAdmin } from '@/lib/admin-guard'

export const dynamic = 'force-dynamic'

const BodySchema = z.object({
  notes: z.string().max(500).optional(),
  status: z.enum(['AVAILABLE', 'RESERVED']).optional(),
})

export async function PATCH(
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

  const plot = await db.select().from(plots).where(eq(plots.id, id)).get()
  if (!plot) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: '구획을 찾을 수 없습니다.' } },
      { status: 404 }
    )
  }

  // OCCUPIED 상태에서 status 변경 시도 차단
  if (parsed.data.status && plot.status === 'OCCUPIED') {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_FAILED',
          message:
            '점유된 구획의 상태는 신청 해제(거절/취소)를 통해서만 변경할 수 있습니다.',
        },
      },
      { status: 400 }
    )
  }

  const now = new Date()
  await db.transaction(async (tx) => {
    await tx
      .update(plots)
      .set({
        notes:
          parsed.data.notes !== undefined ? parsed.data.notes : plot.notes,
        status: parsed.data.status ?? plot.status,
        updatedAt: now,
      })
      .where(eq(plots.id, id))

    await tx.insert(auditLogs).values({
      id: createId(),
      action: 'UPDATE_PLOT',
      targetType: 'Plot',
      targetId: id,
      payload: JSON.stringify(parsed.data),
      actor: 'admin',
    })
  })

  return NextResponse.json({ success: true })
}
