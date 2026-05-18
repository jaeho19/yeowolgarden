import type { Metadata } from 'next'
import Image from 'next/image'
import { LinkButton } from '@/components/public/LinkButton'

export const metadata: Metadata = {
  title: '농원 소개 — 교통이 편리한 여월 체험농원',
  description:
    '서울에서 30분, 부천 여월동의 체험농원. 자연·작물·이웃을 가까이서 만나는 주말 텃밭.',
}

const PHILOSOPHY = [
  {
    title: '교통이 편리한 위치',
    desc: '서울 강서·양천에서 차로 약 30분. 부천역에서 버스로도 가까워 가족 단위 주말 방문이 부담 없습니다.',
  },
  {
    title: '친환경 농법',
    desc: '저농약·퇴비 중심. 가족이 직접 길러 먹는 안전한 작물.',
  },
  {
    title: '이웃과 함께',
    desc: '인접 구획 배정으로 자연스럽게 이웃이 생기고, 주말마다 농원이 작은 공동체가 됩니다.',
  },
] as const

export default function AboutPage() {
  return (
    <>
      {/* Hero — sub-page 종이톤 패턴 */}
      <section
        className="border-b border-border bg-secondary py-14 sm:py-20"
        aria-labelledby="about-hero-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-medium text-brand-700">농원 소개</p>
          <h1
            id="about-hero-heading"
            className="mt-3 max-w-3xl font-heading text-h1 font-bold leading-[1.15] tracking-tight text-foreground"
          >
            서울에서 30분,
            <br />
            여월 체험농원
          </h1>
          <p className="mt-6 max-w-[58ch] text-base leading-relaxed text-muted-foreground sm:text-lg">
            교통이 편리한 부천 여월동에서 자연·작물·이웃을 가까이서 만나보세요.
            가족 단위 주말 텃밭으로 잘 어울립니다.
          </p>
        </div>
      </section>

      {/* 운영자 소개 */}
      <section className="py-16 sm:py-20" aria-labelledby="owner-heading">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-start md:gap-12">
            <figure className="relative aspect-[4/5] overflow-hidden rounded-md border border-border bg-muted">
              <Image
                src="/gallery/illust-family-tending.png"
                alt="가족이 텃밭에서 작물을 가꾸는 모습"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="editorial-photo object-cover"
                priority
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent px-4 pb-3 pt-10 text-xs text-white/85">
                체험은 이런 모습입니다 · 예시 일러스트
              </figcaption>
            </figure>

            <div>
              <h2
                id="owner-heading"
                className="font-heading text-h2 font-bold leading-tight tracking-tight text-foreground"
              >
                여월농장 소개
              </h2>
              <p className="mt-3 text-sm font-medium text-brand-700">
                농업회사법인 (유)호정
              </p>

              <div className="mt-6 space-y-4 text-base leading-relaxed text-foreground/90">
                <p>안녕하세요, 여월농장입니다.</p>
                <p>
                  여월농장은 서울 강서·양천에서 차로 약 30분이면 닿는,
                  <strong> 교통이 편리한 부천 여월동</strong>의 체험농원입니다.
                  도시인이 자연과 작물을 가까이에서 즐길 수 있는 공간을
                  지향합니다.
                </p>
                <p>
                  300구획 규모이며, 모든 구획을 균일하게 <strong>5평</strong>으로
                  설계했습니다. 여러 구좌를 신청하시면 인접한 구획으로 자동
                  배정되어, 가족·동호회 단위로 편안하게 이용하실 수 있습니다.
                </p>
                <p>
                  작물 선택, 파종 시기, 병해충 관리 등 궁금한 점은 언제든 편하게
                  문의해주세요. 주말에 농원에서 직접 안내해 드립니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 농원 철학 */}
      <section
        className="border-y border-border bg-secondary py-16 sm:py-20"
        aria-labelledby="philosophy-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            id="philosophy-heading"
            className="font-heading text-h2 font-bold leading-tight tracking-tight text-foreground"
          >
            여월농장이 추구하는 가치
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-3">
            {PHILOSOPHY.map((p, i) => (
              <div key={p.title} className="border-t border-border pt-5">
                <span className="font-heading text-base tabular-nums text-brand-700">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-2 text-lg font-semibold text-foreground">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 위치 요약 */}
      <section className="py-16" aria-labelledby="location-summary-heading">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2
            id="location-summary-heading"
            className="font-heading text-h2 font-bold leading-tight tracking-tight text-foreground"
          >
            위치 요약
          </h2>
          <dl className="mt-6 text-sm">
            <div className="flex items-baseline gap-4 border-t border-border py-3">
              <dt className="w-20 shrink-0 text-muted-foreground">주소</dt>
              <dd className="font-medium text-foreground">
                경기도 부천시 오정구 여월동 112
              </dd>
            </div>
            <div className="flex items-baseline gap-4 border-t border-border py-3">
              <dt className="w-20 shrink-0 text-muted-foreground">거리</dt>
              <dd className="font-medium text-foreground">
                서울 강서·양천에서 차로 약 30분
              </dd>
            </div>
            <div className="flex items-baseline gap-4 border-t border-border py-3">
              <dt className="w-20 shrink-0 text-muted-foreground">규모</dt>
              <dd className="font-medium text-foreground">
                300구획 (모두 5평 균일)
              </dd>
            </div>
            <div className="flex items-baseline gap-4 border-y border-border py-3">
              <dt className="w-20 shrink-0 text-muted-foreground">시즌</dt>
              <dd className="font-medium text-foreground">
                매년 3월 — 11월 (9개월)
              </dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/access" size="lg">
              오시는 길 →
            </LinkButton>
            <LinkButton href="/gallery" variant="outline" size="lg">
              갤러리 보기
            </LinkButton>
          </div>
        </div>
      </section>
    </>
  )
}
