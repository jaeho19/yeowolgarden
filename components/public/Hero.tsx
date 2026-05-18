import { LinkButton } from '@/components/public/LinkButton'

/**
 * 홈 히어로 섹션 — 풀스크린 배경 + H1/H2 + CTA 2개
 *
 * 배경 이미지는 추후 AI 보정본으로 교체 (현재 그라데이션 placeholder)
 */
export function Hero() {
  return (
    <section
      className="relative isolate overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* 배경 — 추후 보정 사진으로 교체 */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-700 via-brand-500 to-brand-300" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.35)_100%)]" />

      <div className="mx-auto flex min-h-[80vh] max-w-7xl flex-col items-center justify-center px-4 py-24 text-center text-white sm:px-6 lg:px-8">
        <p className="mb-3 text-sm font-medium tracking-wider uppercase opacity-90">
          여월 체험농원
        </p>
        <h1
          id="hero-heading"
          className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl md:text-6xl"
        >
          서울에서 30분,
          <br />
          교통이 편리한 여월 체험농원
        </h1>
        <p className="mt-6 max-w-xl text-lg text-white/90 sm:text-xl">
          가족이 함께하는 부천 여월동의 주말 텃밭
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <LinkButton
            href="/apply"
            size="lg"
            className="bg-white text-brand-700 hover:bg-white/90"
          >
            분양 신청하기 →
          </LinkButton>
          <LinkButton
            href="/access"
            variant="outline"
            size="lg"
            className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            오시는 길
          </LinkButton>
        </div>
      </div>
    </section>
  )
}
