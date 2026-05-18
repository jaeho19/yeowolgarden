/**
 * /admin/applications/[id] — 신청 상세 + 액션.
 */
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { desc, eq } from 'drizzle-orm'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { db } from '@/lib/db'
import { applications, auditLogs } from '@/db/schema'
import { formatKrw } from '@/lib/pricing'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { ApplicationActions } from '@/components/admin/ApplicationActions'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ApplicationDetailPage({ params }: PageProps) {
  const { id } = await params

  const app = await db
    .select()
    .from(applications)
    .where(eq(applications.id, id))
    .get()
  if (!app) notFound()

  const logs = await db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.targetId, id))
    .orderBy(desc(auditLogs.createdAt))
    .all()

  const plotNumbers: number[] = app.plotNumbers
    ? (JSON.parse(app.plotNumbers) as number[])
    : []

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <Link
          href="/admin/applications"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          ← 신청 목록
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold sm:text-3xl">
            #{app.applicationNumber} {app.name}
          </h1>
          <StatusBadge status={app.status} />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          시즌 {app.seasonYear} · 신청 ID {app.id}
        </p>
      </header>

      {/* 액션 */}
      <section className="mb-8 rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
          액션
        </h2>
        <ApplicationActions
          applicationId={app.id}
          status={app.status}
          desiredCount={app.desiredCount}
        />
      </section>

      {/* 기본 정보 */}
      <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <DetailCard title="신청자 정보">
          <Row label="이름" value={app.name} />
          <Row label="휴대폰" value={app.phone} mono />
          <Row label="이메일" value={app.email} mono />
        </DetailCard>

        <DetailCard title="신청 내용">
          <Row
            label="구좌"
            value={`${app.desiredCount}구좌 (${app.desiredCount * 5}평)`}
          />
          <Row label="결제 금액" value={formatKrw(app.totalPriceKrw)} />
          <Row
            label="개인정보 동의"
            value={app.privacyAgreed ? '✅ 동의' : '❌ 미동의'}
          />
        </DetailCard>

        <DetailCard title="추가 정보">
          <Row label="텃밭 경험" value={app.experience || '—'} />
          <Row label="요청 메모" value={app.memo || '—'} multiline />
        </DetailCard>

        <DetailCard title="배정 / 처리">
          <Row
            label="배정 구획"
            value={
              plotNumbers.length > 0
                ? plotNumbers.map((n) => `#${n}`).join(', ')
                : '—'
            }
            mono
          />
          <Row
            label="신청일"
            value={format(app.createdAt, 'yyyy-MM-dd HH:mm', { locale: ko })}
          />
          {app.approvedAt && (
            <Row
              label="승인일"
              value={format(app.approvedAt, 'yyyy-MM-dd HH:mm', {
                locale: ko,
              })}
            />
          )}
          {app.rejectedAt && (
            <Row
              label="거절일"
              value={format(app.rejectedAt, 'yyyy-MM-dd HH:mm', {
                locale: ko,
              })}
            />
          )}
          {app.cancelledAt && (
            <Row
              label="취소일"
              value={format(app.cancelledAt, 'yyyy-MM-dd HH:mm', {
                locale: ko,
              })}
            />
          )}
        </DetailCard>
      </section>

      {/* 거절/내부 메모 */}
      {(app.rejectionReason || app.adminNote) && (
        <section className="mb-8 rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            메모
          </h2>
          {app.rejectionReason && (
            <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
              <p className="text-xs uppercase tracking-wider text-destructive">
                거절 사유 (신청자에게 표시)
              </p>
              <p className="mt-1 leading-relaxed">{app.rejectionReason}</p>
            </div>
          )}
          {app.adminNote && (
            <div className="rounded-lg bg-muted/40 p-3 text-sm">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                내부 메모
              </p>
              <p className="mt-1 leading-relaxed whitespace-pre-line">
                {app.adminNote}
              </p>
            </div>
          )}
        </section>
      )}

      {/* 감사 로그 */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
          감사 로그 ({logs.length})
        </h2>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">로그 없음</p>
        ) : (
          <ol className="space-y-2 text-sm">
            {logs.map((log) => (
              <li
                key={log.id}
                className="flex flex-col gap-1 rounded-lg border border-border bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <span className="font-mono text-xs font-semibold">
                    {log.action}
                  </span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    by {log.actor}
                  </span>
                  {log.payload && log.payload !== '{}' && (
                    <code className="ml-2 break-all text-xs text-muted-foreground">
                      {log.payload}
                    </code>
                  )}
                </div>
                <time className="text-xs text-muted-foreground whitespace-nowrap">
                  {format(log.createdAt, 'yyyy-MM-dd HH:mm:ss', { locale: ko })}
                </time>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  )
}

function DetailCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <dl className="space-y-2 text-sm">{children}</dl>
    </div>
  )
}

function Row({
  label,
  value,
  mono,
  multiline,
}: {
  label: string
  value: string
  mono?: boolean
  multiline?: boolean
}) {
  return (
    <div className="flex gap-3">
      <dt className="w-24 shrink-0 text-muted-foreground">{label}</dt>
      <dd
        className={
          (mono ? 'font-mono ' : '') +
          (multiline ? 'whitespace-pre-line ' : '') +
          'flex-1 break-all'
        }
      >
        {value}
      </dd>
    </div>
  )
}
