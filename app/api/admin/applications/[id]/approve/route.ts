/**
 * POST /api/admin/applications/[id]/approve
 * 자동 배정 — autoAllocate.
 */
import { NextResponse } from 'next/server'
import { autoAllocate } from '@/lib/allocation'
import { requireAdmin } from '@/lib/admin-guard'
import { DomainError } from '@/lib/errors'

export const dynamic = 'force-dynamic'

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin()
  if (guard instanceof NextResponse) return guard

  const { id } = await ctx.params

  try {
    const result = await autoAllocate(id)
    return NextResponse.json(result)
  } catch (e) {
    if (e instanceof DomainError) {
      return NextResponse.json(
        { error: { code: e.code, message: e.message } },
        { status: e.status }
      )
    }
    console.error('[approve] unexpected', e)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: '배정 처리 실패' } },
      { status: 500 }
    )
  }
}
