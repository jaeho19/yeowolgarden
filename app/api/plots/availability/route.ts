/**
 * GET /api/plots/availability
 *
 * 현재 시즌의 가용 plot 수 + desiredCount(1~5)별 인접 묶음 가능 수.
 * 클라이언트가 ApplyForm의 desiredCount 변경 시 갱신용으로도 사용.
 *
 * ISR 60초.
 *
 * 참고: docs/02-design/features/yeowol-farm-website.design.md §4.1
 */
import { NextResponse } from 'next/server'
import { getAvailabilitySnapshot } from '@/lib/availability'

// DB read API — build-time prerender 차단.
export const dynamic = 'force-dynamic'

export async function GET() {
  const snapshot = await getAvailabilitySnapshot()
  return NextResponse.json(snapshot)
}
