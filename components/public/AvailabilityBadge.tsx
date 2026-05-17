import { eq, and, asc, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { plots, settings } from '@/db/schema'
import { LinkButton } from '@/components/public/LinkButton'

/**
 * 잔여 구획 수 + 인접 묶음 가능 통계.
 *
 * Server Component — DB 직접 read.
 * 페이지 레벨에서 `revalidate = 60` 으로 캐시.
 */
async function getAvailability() {
  // 현재 시즌
  const seasonRow = await db
    .select()
    .from(settings)
    .where(eq(settings.key, 'CURRENT_SEASON_YEAR'))
    .get()
  const seasonYear = Number(seasonRow?.value ?? new Date().getFullYear() + 1)

  // 모집 ON/OFF
  const recRow = await db
    .select()
    .from(settings)
    .where(eq(settings.key, 'RECRUITMENT_OPEN'))
    .get()
  const recruitmentOpen = recRow?.value === 'true'

  // 가용 plot 정렬
  const available = await db
    .select({ plotNumber: plots.plotNumber })
    .from(plots)
    .where(
      and(eq(plots.seasonYear, seasonYear), eq(plots.status, 'AVAILABLE'))
    )
    .orderBy(asc(plots.plotNumber))
    .all()

  const totalRow = await db
    .select({ cnt: sql<number>`count(*)` })
    .from(plots)
    .where(eq(plots.seasonYear, seasonYear))
    .get()
  const total = Number(totalRow?.cnt ?? 0)

  // 연속 묶음 capacity 계산 (그리디)
  // [1,2,3,5,6,7] → runs: [3, 3] → capacity { 1:6, 2:4, 3:2, 4:0 }
  const runs: number[] = []
  let run = 0
  let prev: number | null = null
  for (const p of available) {
    if (prev !== null && p.plotNumber === prev + 1) {
      run += 1
    } else {
      if (run > 0) runs.push(run)
      run = 1
    }
    prev = p.plotNumber
  }
  if (run > 0) runs.push(run)

  const capacity: Record<number, number> = {}
  for (let n = 1; n <= 5; n++) {
    capacity[n] = runs.reduce((sum, r) => sum + Math.max(0, r - n + 1), 0)
  }

  return {
    seasonYear,
    recruitmentOpen,
    total,
    available: available.length,
    capacity,
  }
}

export async function AvailabilityBadge() {
  const a = await getAvailability()

  return (
    <section
      className="py-12 sm:py-16"
      aria-labelledby="availability-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2
                id="availability-heading"
                className="text-xl font-bold sm:text-2xl"
              >
                {a.seasonYear} 시즌 잔여 현황{' '}
                {a.recruitmentOpen ? (
                  <span className="ml-2 inline-flex items-center rounded-full bg-brand-500 px-2 py-0.5 text-xs font-medium text-white">
                    모집 중
                  </span>
                ) : (
                  <span className="ml-2 inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    모집 마감
                  </span>
                )}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                총 {a.total}구획 중 {a.available}구획 가용 (
                {Math.round((a.available / Math.max(a.total, 1)) * 100)}%)
              </p>
            </div>
            <LinkButton href="/apply" size="lg">
              분양 신청 →
            </LinkButton>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className="rounded-lg border border-brand-100/60 bg-brand-50/40 px-3 py-3 text-center"
              >
                <div className="text-xs text-muted-foreground">
                  {n * 5}평 ({n}구획)
                </div>
                <div className="mt-1 text-2xl font-bold text-brand-700">
                  {a.capacity[n] ?? 0}
                </div>
                <div className="text-xs text-muted-foreground">건 가능</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
