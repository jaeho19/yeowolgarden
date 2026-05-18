import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { CopyButton } from '@/components/public/CopyButton'
import { LinkButton } from '@/components/public/LinkButton'

export const metadata: Metadata = {
  title: '신청 완료',
  description: '여월농장 분양 신청이 접수되었습니다. 안내된 계좌로 입금해주세요.',
  robots: { index: false, follow: false },
}

const BANK_INFO =
  process.env.BANK_INFO_DISPLAY ??
  '농축협 351-1352-647143 농업회사법인 (유)호정'
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yeowolfarm.netlify.app'
const OPERATOR_PHONE = process.env.OPERATOR_PHONE ?? ''

interface SearchParams {
  number?: string
}

export default async function ApplySuccessPage(props: {
  searchParams: Promise<SearchParams>
}) {
  const { number } = await props.searchParams

  const applicationNumber = number ? Number(number) : NaN
  if (!Number.isInteger(applicationNumber) || applicationNumber <= 0) {
    notFound()
  }

  const statusUrl = `${SITE_URL}/apply/status`

  return (
    <section className="bg-muted/20 py-12 sm:py-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="text-center">
          <CheckCircle2
            className="mx-auto size-16 text-brand-500"
            aria-hidden
            strokeWidth={1.5}
          />
          <h1 className="mt-4 text-2xl font-bold sm:text-3xl">
            신청이 접수되었습니다
          </h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            안내된 계좌로 입금해주시면 운영자가 확인 후 인접한 구획을 자동
            배정합니다.
          </p>
        </div>

        {/* 신청번호 */}
        <div className="mt-8 rounded-2xl border-2 border-brand-300 bg-card p-6 text-center shadow-sm sm:p-8">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            신청번호
          </p>
          <p className="mt-2 text-5xl font-bold text-brand-700">
            #{applicationNumber}
          </p>
          <div className="mt-5 flex justify-center">
            <CopyButton
              text={String(applicationNumber)}
              label="신청번호 복사"
              copiedLabel="복사됨"
              size="default"
            />
          </div>
          <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
            ⚠️ 이 번호는 본인 조회 시 필요합니다. 반드시 기록해두세요.
          </p>
        </div>

        {/* 입금 안내 */}
        <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <span aria-hidden>📞</span> 입금 안내
          </h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex gap-3">
              <dt className="w-20 shrink-0 text-muted-foreground">계좌</dt>
              <dd className="flex flex-1 flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
                <span className="font-mono break-all">{BANK_INFO}</span>
                <CopyButton text={BANK_INFO} label="복사" />
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-20 shrink-0 text-muted-foreground">입금자명</dt>
              <dd>본인 이름으로 입금해주세요.</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-20 shrink-0 text-muted-foreground">금액</dt>
              <dd>
                신청 시 표시된 금액 그대로 입금 (신청 시 신청 금액 안내됨)
              </dd>
            </div>
          </dl>

          <div className="mt-5 rounded-lg bg-brand-50/60 p-4 text-sm leading-relaxed text-brand-900">
            ⓘ 입금 후 1~3일 내 운영자가 확인 → 인접한 구획이 자동 배정됩니다.
            배정 결과는 아래 <strong>신청 조회</strong>에서 확인하세요.
          </div>
        </div>

        {/* 본인 조회 안내 */}
        <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <span aria-hidden>📌</span> 신청 상태 확인
          </h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            신청번호 <strong>#{applicationNumber}</strong>와 신청 시 입력한
            이메일로 언제든 본인 조회가 가능합니다.
          </p>

          <div className="mt-4 flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-3 text-xs sm:flex-row sm:items-center sm:justify-between">
            <code className="break-all font-mono text-xs">{statusUrl}</code>
            <CopyButton text={statusUrl} label="URL 복사" />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <LinkButton
              href={`/apply/status?number=${applicationNumber}`}
              className="flex-1"
            >
              신청 조회로 이동 →
            </LinkButton>
            <LinkButton href="/notice" variant="outline" className="flex-1">
              📢 공지사항 보기
            </LinkButton>
          </div>
        </div>

        {/* 문의 */}
        {OPERATOR_PHONE && (
          <p className="mt-8 text-center text-xs text-muted-foreground">
            문의: 운영자{' '}
            <Link
              href={`tel:${OPERATOR_PHONE.replace(/-/g, '')}`}
              className="text-brand-700 underline"
            >
              {OPERATOR_PHONE}
            </Link>
          </p>
        )}
      </div>
    </section>
  )
}
