import type { Metadata } from 'next'
import Link from 'next/link'
import { ApplyForm } from '@/components/public/ApplyForm'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { LinkButton } from '@/components/public/LinkButton'
import {
  getCurrentSeasonYear,
  isRecruitmentOpen,
} from '@/lib/settings'

export const metadata: Metadata = {
  title: '분양 신청',
  description:
    '여월농장 주말 텃밭 분양 신청. 5평 100,000원 · 인접 구획 자동 배정.',
}

// 모집 ON/OFF가 실시간 DB 상태 — dynamic으로 build-time prerender 차단.
export const dynamic = 'force-dynamic'

export default async function ApplyPage() {
  const [seasonYear, open] = await Promise.all([
    getCurrentSeasonYear(),
    isRecruitmentOpen(),
  ])

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-50 via-background to-background py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="mb-3 text-sm font-medium tracking-wider uppercase text-brand-700">
            {seasonYear} 시즌 분양 신청
          </p>
          <h1 className="text-3xl font-bold sm:text-4xl">분양 신청</h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            모든 구획 균일 5평 · 100,000원 · 인접 자동 배정
          </p>
        </div>
      </section>

      {/* 폼 또는 마감 안내 */}
      <section className="py-10">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          {open ? (
            <>
              <Alert className="mb-6">
                <AlertTitle>안내</AlertTitle>
                <AlertDescription>
                  신청 완료 후 화면에 표시되는 신청번호와 이메일로{' '}
                  <Link
                    href="/apply/status"
                    className="text-brand-700 underline"
                  >
                    본인 조회
                  </Link>
                  가 가능합니다. 신청번호는 반드시 기록해두세요.
                </AlertDescription>
              </Alert>
              <ApplyForm />
            </>
          ) : (
            <ClosedNotice seasonYear={seasonYear} />
          )}
        </div>
      </section>
    </>
  )
}

function ClosedNotice({ seasonYear }: { seasonYear: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm sm:p-12">
      <span className="text-5xl" role="img" aria-hidden>
        🌾
      </span>
      <h2 className="mt-5 text-xl font-bold sm:text-2xl">
        현재 분양 신청을 받지 않고 있습니다
      </h2>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
        {seasonYear} 시즌 분양 일정은 공지사항을 통해 안내드립니다.
        <br />
        다음 시즌을 기대해주세요.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <LinkButton href="/notice">📢 공지사항 보기</LinkButton>
        <LinkButton href="/plots" variant="outline">
          분양 안내 다시 보기
        </LinkButton>
      </div>
    </div>
  )
}
