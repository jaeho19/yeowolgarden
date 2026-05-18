import Link from 'next/link'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { LookupResult } from '@/lib/applications'
import { formatKrw } from '@/lib/pricing'
import { LinkButton } from '@/components/public/LinkButton'

const BANK_INFO =
  process.env.BANK_INFO_DISPLAY ??
  '농축협 351-1352-647143 농업회사법인 (유)호정'

interface Props {
  result: LookupResult
}

/**
 * 본인 조회 결과 카드.
 * Status별로 다른 안내 메시지·CTA를 보여준다.
 */
export function ApplicationStatusCard({ result }: Props) {
  return (
    <div className="rounded-2xl border-2 border-brand-200 bg-card p-6 shadow-sm sm:p-8">
      <header className="border-b border-border pb-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          신청 정보
        </p>
        <h2 className="mt-1 text-2xl font-bold">신청 #{result.applicationNumber}</h2>
      </header>

      {/* 기본 정보 */}
      <dl className="mt-5 space-y-2.5 text-sm">
        <Row label="이름" value={result.name} />
        <Row
          label="신청 면적"
          value={`${result.totalAreaPyeong}평 (${result.desiredCount}구획)`}
        />
        <Row label="결제 금액" value={formatKrw(result.totalPriceKrw)} />
        <Row
          label="신청일"
          value={format(new Date(result.createdAt), 'yyyy-MM-dd (E)', {
            locale: ko,
          })}
        />
        <Row label="시즌" value={`${result.seasonYear}년 3월 ~ 11월`} />
      </dl>

      <div className="mt-6 border-t border-border pt-5">
        <StatusSection result={result} />
      </div>

      {/* CTA */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <LinkButton href="/notice" variant="outline" className="flex-1">
          📢 공지사항 보기
        </LinkButton>
        <LinkButton href="/access" variant="outline" className="flex-1">
          🗺️ 오시는 길
        </LinkButton>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-24 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}

function StatusSection({ result }: { result: LookupResult }) {
  switch (result.status) {
    case 'PENDING':
      return (
        <div>
          <StatusBadge color="amber" icon="⏳">
            입금 대기
          </StatusBadge>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            입금 후 1~3일 내에 운영자가 확인합니다. 확인 즉시 인접한 구획이
            자동 배정됩니다.
          </p>
          <div className="mt-4 rounded-lg bg-brand-50/60 p-4 text-sm">
            <p className="text-xs text-muted-foreground">계좌</p>
            <p className="mt-1 break-all font-mono text-sm">{BANK_INFO}</p>
            <p className="mt-3 text-xs text-muted-foreground">금액</p>
            <p className="mt-1 text-base font-semibold">
              {formatKrw(result.totalPriceKrw)}
            </p>
          </div>
        </div>
      )

    case 'PAID':
      return (
        <div>
          <StatusBadge color="blue" icon="🔄">
            운영자 배정 대기
          </StatusBadge>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            입금이 확인되었으나, 인접한 구획 묶음을 찾는 중입니다. 곧 운영자가
            직접 연락드리거나 배정이 완료됩니다.
          </p>
        </div>
      )

    case 'CONFIRMED':
      return (
        <div>
          <StatusBadge color="green" icon="✅">
            배정 완료
          </StatusBadge>
          {result.approvedAt && (
            <p className="mt-2 text-xs text-muted-foreground">
              배정일:{' '}
              {format(new Date(result.approvedAt), 'yyyy-MM-dd', {
                locale: ko,
              })}
            </p>
          )}
          <div className="mt-4 rounded-lg border border-brand-300 bg-brand-50/40 p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              배정 구획
            </p>
            <p className="mt-2 text-xl font-bold text-brand-700">
              {result.assignedPlots
                .map((p) => `#${p.plotNumber}`)
                .join(', ')}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              인접 {result.assignedPlots.length}개 · 총 {result.totalAreaPyeong}평
            </p>
          </div>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            ⓘ 정확한 개장일과 입장 안내는{' '}
            <Link href="/notice" className="text-brand-700 underline">
              공지사항
            </Link>
            에서 확인하세요.
          </p>
        </div>
      )

    case 'REJECTED':
      return (
        <div>
          <StatusBadge color="red" icon="❌">
            거절됨
          </StatusBadge>
          {result.rejectedAt && (
            <p className="mt-2 text-xs text-muted-foreground">
              처리일:{' '}
              {format(new Date(result.rejectedAt), 'yyyy-MM-dd', {
                locale: ko,
              })}
            </p>
          )}
          {result.rejectionReason && (
            <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
              <p className="text-xs uppercase tracking-wider text-destructive">
                사유
              </p>
              <p className="mt-1 leading-relaxed">{result.rejectionReason}</p>
            </div>
          )}
        </div>
      )

    case 'CANCELLED':
      return (
        <div>
          <StatusBadge color="stone" icon="🚫">
            취소됨
          </StatusBadge>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            해당 신청은 취소되었습니다. 재신청을 원하시면 분양 신청 페이지에서
            진행해주세요.
          </p>
        </div>
      )

    default:
      return null
  }
}

type Color = 'amber' | 'blue' | 'green' | 'red' | 'stone'

const COLOR_MAP: Record<Color, string> = {
  amber: 'bg-amber-100 text-amber-900',
  blue: 'bg-blue-100 text-blue-900',
  green: 'bg-brand-500 text-white',
  red: 'bg-destructive/15 text-destructive',
  stone: 'bg-muted text-muted-foreground',
}

function StatusBadge({
  color,
  icon,
  children,
}: {
  color: Color
  icon: string
  children: React.ReactNode
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${COLOR_MAP[color]}`}
    >
      <span aria-hidden>{icon}</span>
      {children}
    </span>
  )
}
