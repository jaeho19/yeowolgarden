/**
 * /admin/applications — 신청 목록.
 * 필터: status, q (이름·이메일·전화·신청번호)
 */
import Link from 'next/link'
import { and, desc, eq, like, or, type SQL } from 'drizzle-orm'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { db } from '@/lib/db'
import { applications } from '@/db/schema'
import { getCurrentSeasonYear } from '@/lib/settings'
import { formatKrw } from '@/lib/pricing'
import {
  APPLICATION_STATUS,
  type ApplicationStatus,
} from '@/lib/schemas/application'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ status?: string; q?: string }>
}

async function getList({
  statusParam,
  q,
}: {
  statusParam: string | undefined
  q: string
}) {
  const seasonYear = await getCurrentSeasonYear()
  const filters: SQL[] = [eq(applications.seasonYear, seasonYear)]

  if (
    statusParam &&
    (APPLICATION_STATUS as readonly string[]).includes(statusParam)
  ) {
    filters.push(eq(applications.status, statusParam as ApplicationStatus))
  }
  if (q.length > 0) {
    const like1 = `%${q}%`
    const numQ = Number(q)
    const orParts = [
      like(applications.name, like1),
      like(applications.email, like1),
      like(applications.phone, like1),
    ]
    if (Number.isInteger(numQ) && numQ > 0) {
      orParts.push(eq(applications.applicationNumber, numQ))
    }
    const orExpr = or(...orParts)
    if (orExpr) filters.push(orExpr)
  }

  const rows = await db
    .select()
    .from(applications)
    .where(and(...filters))
    .orderBy(desc(applications.createdAt))
    .all()

  return { seasonYear, rows }
}

export default async function ApplicationsListPage({ searchParams }: PageProps) {
  const { status, q } = await searchParams
  const search = (q ?? '').trim()
  const data = await getList({ statusParam: status, q: search })

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            {data.seasonYear} 시즌
          </p>
          <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight">
            신청 관리
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            전체 {data.rows.length}건
          </p>
        </div>
      </header>

      {/* 필터 */}
      <form
        method="get"
        className="mb-4 flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center"
      >
        <div className="flex flex-wrap gap-1.5">
          <FilterChip label="전체" href="/admin/applications" active={!status} />
          {APPLICATION_STATUS.map((s) => (
            <FilterChip
              key={s}
              label={statusLabel(s)}
              href={`/admin/applications?status=${s}`}
              active={status === s}
            />
          ))}
        </div>
        <div className="flex flex-1 gap-2 sm:ml-auto sm:max-w-xs">
          <Input
            type="search"
            name="q"
            defaultValue={search}
            placeholder="이름·이메일·전화·번호"
            className="flex-1"
          />
          {status && (
            <input type="hidden" name="status" defaultValue={status} />
          )}
          <Button type="submit" size="sm">
            검색
          </Button>
        </div>
      </form>

      {/* 테이블 (desktop) */}
      <div className="hidden overflow-x-auto rounded-lg border border-border bg-card md:block">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs font-medium text-muted-foreground">
            <tr>
              <th className="px-3 py-2.5 text-left">#</th>
              <th className="px-3 py-2.5 text-left">이름</th>
              <th className="px-3 py-2.5 text-left">연락처</th>
              <th className="px-3 py-2.5 text-left">구좌</th>
              <th className="px-3 py-2.5 text-left">금액</th>
              <th className="px-3 py-2.5 text-left">상태</th>
              <th className="px-3 py-2.5 text-left">배정</th>
              <th className="px-3 py-2.5 text-left">신청일</th>
              <th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.rows.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-3 py-12 text-center text-sm text-muted-foreground"
                >
                  조건에 맞는 신청이 없습니다.
                </td>
              </tr>
            ) : (
              data.rows.map((a) => {
                const plotNums: number[] = a.plotNumbers
                  ? (JSON.parse(a.plotNumbers) as number[])
                  : []
                return (
                  <tr
                    key={a.id}
                    className="transition hover:bg-muted/20"
                  >
                    <td className="px-3 py-2.5 font-mono font-medium">
                      #{a.applicationNumber}
                    </td>
                    <td className="px-3 py-2.5">{a.name}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      <div>{a.phone}</div>
                      <div className="text-xs">{a.email}</div>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {a.desiredCount}구좌
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({a.desiredCount * 5}평)
                      </span>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {formatKrw(a.totalPriceKrw)}
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-3 py-2.5">
                      {plotNums.length > 0 ? (
                        <span className="font-mono text-xs">
                          {plotNums.map((n) => `#${n}`).join(', ')}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-xs text-muted-foreground">
                      {format(a.createdAt, 'MM-dd HH:mm', { locale: ko })}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <Link
                        href={`/admin/applications/${a.id}`}
                        className="text-xs font-medium text-brand-700 hover:underline"
                      >
                        상세 →
                      </Link>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 카드 (mobile) */}
      <div className="space-y-3 md:hidden">
        {data.rows.length === 0 ? (
          <p className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            조건에 맞는 신청이 없습니다.
          </p>
        ) : (
          data.rows.map((a) => {
            const plotNums: number[] = a.plotNumbers
              ? (JSON.parse(a.plotNumbers) as number[])
              : []
            return (
              <Link
                key={a.id}
                href={`/admin/applications/${a.id}`}
                className="block rounded-lg border border-border bg-card p-4 shadow-sm transition touch-manipulation hover:bg-accent"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-sm font-bold">
                      #{a.applicationNumber} · {a.name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {a.phone} · {a.desiredCount}구좌 ({a.desiredCount * 5}평)
                    </p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
                {plotNums.length > 0 && (
                  <p className="mt-2 font-mono text-xs text-muted-foreground">
                    배정 구획 {plotNums.map((n) => `#${n}`).join(', ')}
                  </p>
                )}
                <p className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {format(a.createdAt, 'MM-dd HH:mm', { locale: ko })}
                  </span>
                  <span className="font-medium">{formatKrw(a.totalPriceKrw)}</span>
                </p>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}

function FilterChip({
  label,
  href,
  active,
}: {
  label: string
  href: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? 'rounded-md bg-brand-500 px-3 py-1 text-xs font-medium text-white'
          : 'rounded-md border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-accent'
      }
    >
      {label}
    </Link>
  )
}

function statusLabel(s: ApplicationStatus): string {
  return {
    PENDING: '입금대기',
    PAID: '배정대기',
    CONFIRMED: '완료',
    REJECTED: '거절',
    CANCELLED: '취소',
  }[s]
}
