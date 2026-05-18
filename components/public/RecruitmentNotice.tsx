import { LinkButton } from '@/components/public/LinkButton'

/**
 * 홈 분양 일정 안내 — Hero 정보 띠(시즌·규모·가격)를 보완하는 일정 전용 섹션.
 *
 * .impeccable.md 「흙냄새 미니멀」 준수:
 *  - 카드 wrap 0 (paper-warm 배경 섹션만, 위·아래 1px 보더)
 *  - 좌측 정렬 비대칭 (12-grid 7:5)
 *  - 표제 font-heading 본명조
 *  - 「마감/예정」 컬러 배지 제거 → dl 표로 단단하게
 */
export function RecruitmentNotice() {
  return (
    <section
      className="border-y border-border bg-secondary py-14 sm:py-20"
      aria-labelledby="recruitment-notice-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end lg:gap-12">
          {/* 좌측 — 헤딩 + 본문 */}
          <div className="lg:col-span-7">
            <p className="text-sm font-medium text-brand-700">분양 일정</p>
            <h2
              id="recruitment-notice-heading"
              className="mt-3 font-heading text-h1 font-bold leading-[1.18] tracking-tight text-foreground"
            >
              2027년 2월,
              <br />
              분양 모집을 시작합니다.
            </h2>
            <p className="mt-6 max-w-[48ch] text-base leading-relaxed text-muted-foreground">
              2026년도 분양은 마감되었습니다. 다음 시즌은 2027년 2월에 신청을
              받으며, 매년 같은 시기에 동일한 방식으로 진행합니다.
            </p>
          </div>

          {/* 우측 — 일정표 + CTA */}
          <div className="lg:col-span-5">
            <dl className="text-sm">
              <div className="flex items-baseline gap-4 border-t border-border py-3">
                <dt className="w-24 shrink-0 text-muted-foreground">2026</dt>
                <dd className="font-medium text-foreground">마감</dd>
              </div>
              <div className="flex items-baseline gap-4 border-t border-border py-3">
                <dt className="w-24 shrink-0 text-muted-foreground">2027</dt>
                <dd className="font-medium text-foreground">
                  2027년 2월 모집 시작
                </dd>
              </div>
              <div className="flex items-baseline gap-4 border-y border-border py-3">
                <dt className="w-24 shrink-0 text-muted-foreground">시즌</dt>
                <dd className="font-medium text-foreground">
                  3월 — 11월 (9개월)
                </dd>
              </div>
            </dl>

            <div className="mt-8">
              <LinkButton href="/plots" variant="outline" size="lg">
                분양 안내 자세히 →
              </LinkButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
