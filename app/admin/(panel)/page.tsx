/**
 * /admin — 대시보드.
 *
 * 운영자가 한눈에 확인하는 요약 카드:
 *  - 잔여 구획 + 인접 묶음 가능 수
 *  - 시즌 신청 합계 + status별 카운트
 *  - 시즌 매출 합계 (CONFIRMED + PAID)
 *  - 빠른 액션 링크
 */
import Link from 'next/link'
import { and, eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { applications } from '@/db/schema'
import { getAvailabilitySnapshot } from '@/lib/availability'
import { getCurrentSeasonYear } from '@/lib/settings'
import { formatKrw } from '@/lib/pricing'
import { APPLICATION_STATUS } from '@/lib/schemas/application'

export const dynamic = 'force-dynamic'

async function getDashboardData() {
  const seasonYear = await getCurrentSeasonYear()
  const [availability, totalRow, revenueRow, statusRows] = await Promise.all([
    getAvailabilitySnapshot(),
    db
      .select({ cnt: sql<number>`count(*)` })
      .from(applications)
      .where(eq(applications.seasonYear, seasonYear))
      .get(),
    db
      .select({
        sum: sql<number>`coalesce(sum(${applications.totalPriceKrw}), 0)`,
      })
      .from(applications)
      .where(
        and(
          eq(applications.seasonYear, seasonYear),
          sql`${applications.status} in ('PAID','CONFIRMED')`
        )
      )
      .get(),
    Promise.all(
      APPLICATION_STATUS.map(async (status) => {
        const row = await db
          .select({ cnt: sql<number>`count(*)` })
          .from(applications)
          .where(
            and(
              eq(applications.seasonYear, seasonYear),
              eq(applications.status, status)
            )
          )
          .get()
        return { status, count: Number(row?.cnt ?? 0) }
      })
    ),
  ])

  return {
    seasonYear,
    availability,
    totalApplications: Number(totalRow?.cnt ?? 0),
    confirmedRevenue: Number(revenueRow?.sum ?? 0),
    byStatus: statusRows,
  }
}

export default async function AdminDashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          {data.seasonYear} 시즌
        </p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">대시보드</h1>
      </header>

      {/* 핵심 지표 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="모집 상태"
          value={data.availability.recruitmentOpen ? '🟢 모집 중' : '🔴 마감'}
          hint={
            <Link
              href="/admin/settings"
              className="text-brand-700 hover:underline"
            >
              변경 →
            </Link>
          }
        />
        <StatCard
          label="잔여 구획"
          value={`${data.availability.available} / ${data.availability.total}`}
          hint={`인접 1구좌 ${data.availability.capacity[1] ?? 0}건 · 2구좌 ${data.availability.capacity[2] ?? 0}건`}
        />
        <StatCard
          label="시즌 신청 합계"
          value={`${data.totalApplications}건`}
          hint={
            <Link
              href="/admin/applications"
              className="text-brand-700 hover:underline"
            >
              목록 보기 →
            </Link>
          }
        />
        <StatCard
          label="확정 매출 (PAID+CONFIRMED)"
          value={formatKrw(data.confirmedRevenue)}
          hint="입금 확인 + 배정 완료 합계"
        />
      </div>

      {/* 상태별 카운트 */}
      <section className="mt-10">
        <h2 className="mb-4 text-lg font-bold">상태별 신청 수</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {data.byStatus.map((s) => (
            <Link
              key={s.status}
              href={`/admin/applications?status=${s.status}`}
              className="rounded-lg border border-border bg-card p-4 text-center shadow-sm transition hover:bg-accent"
            >
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                {statusLabel(s.status)}
              </div>
              <div className="mt-1 text-2xl font-bold">{s.count}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* 빠른 액션 */}
      <section className="mt-10">
        <h2 className="mb-4 text-lg font-bold">빠른 액션</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction
            href="/admin/applications?status=PENDING"
            icon="⏳"
            label="입금 대기 확인"
          />
          <QuickAction
            href="/admin/applications?status=PAID"
            icon="🔄"
            label="수동 배정 대기"
          />
          <QuickAction href="/admin/plots" icon="🗺️" label="구획 현황 보기" />
          <QuickAction
            href="/admin/announcements"
            icon="📢"
            label="공지 작성"
          />
        </div>
      </section>
    </div>
  )
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string
  value: React.ReactNode
  hint?: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
      {hint && <div className="mt-2 text-xs text-muted-foreground">{hint}</div>}
    </div>
  )
}

function QuickAction({
  href,
  icon,
  label,
}: {
  href: string
  icon: string
  label: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition hover:border-brand-200 hover:bg-accent"
    >
      <span className="text-2xl" aria-hidden>
        {icon}
      </span>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  )
}

function statusLabel(s: string): string {
  switch (s) {
    case 'PENDING':
      return '입금 대기'
    case 'PAID':
      return '배정 대기'
    case 'CONFIRMED':
      return '배정 완료'
    case 'REJECTED':
      return '거절'
    case 'CANCELLED':
      return '취소'
    default:
      return s
  }
}
