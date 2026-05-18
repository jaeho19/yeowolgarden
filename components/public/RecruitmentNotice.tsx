import { LinkButton } from '@/components/public/LinkButton'

/**
 * 홈에 표시되는 분양 일정 안내 카드.
 * 현재 시즌(2026) 마감 + 다음 시즌(2027) 모집 시작 시기 + 가격·규모 안내.
 *
 * AvailabilityBadge(잔여 통계 표시용)와 분리 — 어드민/plots 페이지 등은 그대로 유지.
 */
export function RecruitmentNotice() {
  return (
    <section
      className="py-12 sm:py-16"
      aria-labelledby="recruitment-notice-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <h2
                id="recruitment-notice-heading"
                className="text-xl font-bold sm:text-2xl"
              >
                분양 일정 안내
              </h2>

              <ul className="mt-4 space-y-2 text-sm sm:text-base">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground shrink-0">
                    마감
                  </span>
                  <span>2026년도 분양은 마감되었습니다.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 inline-flex items-center rounded-full bg-brand-500 px-2 py-0.5 text-xs font-medium text-white shrink-0">
                    예정
                  </span>
                  <span>
                    2027년도 분양은{' '}
                    <strong>2027년 1월</strong>에 모집 신청을 받습니다.
                  </span>
                </li>
              </ul>

              <p className="mt-5 text-sm text-muted-foreground">
                총 <strong className="text-foreground">300구획</strong> ·{' '}
                <strong className="text-foreground">5평당 100,000원</strong>
              </p>
            </div>

            <LinkButton href="/plots" variant="outline" size="lg">
              분양 안내 자세히 →
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  )
}
