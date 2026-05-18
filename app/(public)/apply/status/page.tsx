import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LookupForm } from '@/components/public/LookupForm'

export const metadata: Metadata = {
  title: '신청 상태 조회',
  description: '신청번호와 이메일로 본인 신청의 현재 상태와 배정 결과를 확인합니다.',
  robots: { index: false, follow: false },
}

export default function ApplyStatusPage() {
  return (
    <>
      {/* Hero — sub-page 종이톤 패턴 */}
      <section
        className="border-b border-border bg-secondary py-12 sm:py-16"
        aria-labelledby="status-hero-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-medium text-brand-700">본인 조회</p>
          <h1
            id="status-hero-heading"
            className="mt-3 font-heading text-h1 font-bold leading-[1.15] tracking-tight text-foreground"
          >
            신청 상태 조회
          </h1>
          <p className="mt-5 text-base text-muted-foreground sm:text-lg">
            신청번호와 신청 시 입력한 이메일로 확인하세요.
          </p>
        </div>
      </section>

      <section className="py-10">
        <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<LookupFormFallback />}>
            <LookupForm />
          </Suspense>
        </div>
      </section>
    </>
  )
}

function LookupFormFallback() {
  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
      <div className="h-9 w-full animate-pulse rounded bg-muted" />
      <div className="h-4 w-20 animate-pulse rounded bg-muted" />
      <div className="h-9 w-full animate-pulse rounded bg-muted" />
      <div className="h-10 w-full animate-pulse rounded bg-muted" />
    </div>
  )
}
