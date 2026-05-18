import { LinkButton } from '@/components/public/LinkButton'

/**
 * 홈 히어로 — 풀폭 사진 + 사진 위 좌하단 명조 활자 + 사진 아래 안내 띠
 *
 * 「잡지 표지 + 신문 1면」 구조로 블로그·article header 인상 제거.
 *  - 사진이 화면 70%를 차지 → 사이트가 사진 위에 선 듯한 인상
 *  - 활자가 사진 위에 직접 = 잡지 표지
 *  - 사진 아래 dl 정보 띠 + CTA = 안내판/마스트헤드
 *
 * .impeccable.md 「흙냄새 미니멀」 준수:
 *  - 그라데이션 배경 0 (사진 위 dim은 활자 가독성용 최소)
 *  - text-center 0, uppercase 0, 이모지 0, 카드 0
 *  - 표제 Gowun Batang (font-heading) + text-display
 */
const HERO_IMAGE = '/gallery/KakaoTalk_20260516_150830179.jpg'

export function Hero() {
  return (
    <section
      className="relative bg-background"
      aria-labelledby="hero-heading"
    >
      {/* 풀폭 사진 */}
      <div className="relative h-[60vh] min-h-[440px] w-full overflow-hidden bg-muted sm:h-[68vh] sm:min-h-[520px]">
        <img
          src={HERO_IMAGE}
          alt="여월농장의 텃밭 풍경"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
          fetchPriority="high"
        />

        {/* 활자 가독성용 최소 dim — 하단 60%만 검정 → 투명 */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/65 via-black/25 to-transparent"
        />

        {/* 사진 위 좌하단 활자 (잡지 표지 정렬) */}
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 sm:pb-14 lg:px-8 lg:pb-16">
            <p className="text-sm font-medium text-white/90">
              여월 체험농원
            </p>
            <h1
              id="hero-heading"
              className="mt-3 max-w-3xl font-heading text-display font-bold leading-[1.08] tracking-tight text-white"
            >
              서울에서 30분,
              <br />
              부천 여월동의 주말 텃밭
            </h1>
          </div>
        </div>
      </div>

      {/* 사진 아래 안내 띠 — 핵심 정보 dl + CTA */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-10 lg:px-8">
          <dl className="grid grid-cols-3 gap-x-8 gap-y-1.5 text-sm sm:gap-x-12">
            <dt className="text-muted-foreground">시즌</dt>
            <dt className="text-muted-foreground">규모</dt>
            <dt className="text-muted-foreground">가격</dt>
            <dd className="font-medium text-foreground">3월 — 11월</dd>
            <dd className="font-medium text-foreground">전 300구획 · 5평</dd>
            <dd className="font-medium text-foreground">100,000원 / 구획</dd>
          </dl>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <LinkButton href="/apply" size="lg">
              분양 신청하기 →
            </LinkButton>
            <LinkButton href="/access" variant="outline" size="lg">
              오시는 길
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  )
}
