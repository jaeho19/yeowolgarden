/**
 * POST /api/admin/applications/[id]/cancel
 * Body: { adminNote?: string }
 */
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { cancelApplication } from '@/lib/allocation'
import { requireAdmin } from '@/lib/admin-guard'
import { DomainError } from '@/lib/errors'

export const dynamic = 'force-dynamic'

const BodySchema = z.object({
  adminNote: z.string().max(1000).optional(),
})

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin()
  if (guard instanceof NextResponse) return guard

  const { id } = await ctx.params

  let body: unknown = {}
  try {
    body = await req.json()
  } catch {
    // body 비어 있어도 OK
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
    await cancelApplication(id, parsed.data.adminNote)
    return NextResponse.json({ success: true })
  } catch (e) {
    if (e instanceof DomainError) {
      return NextResponse.json(
        { error: { code: e.code, message: e.message } },
        { status: e.status }
      )
    }
    console.error('[cancel] unexpected', e)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: '취소 처리 실패' } },
      { status: 500 }
    )
  }
}
