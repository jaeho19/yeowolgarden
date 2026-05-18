import type { Metadata } from 'next'
import Image from 'next/image'
import { LinkButton } from '@/components/public/LinkButton'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = {
  title: '농원 소개 — 조경학 박사가 직접 운영하는 학습형 텃밭',
  description:
    '여월농장은 조경학 박사가 직접 운영하는 학습형 주말 텃밭입니다. 부천 여월동에서 자연·작물·이웃을 만나세요.',
}

const PHILOSOPHY = [
  {
    icon: '🎓',
    title: '학습형 농원',
    desc: '단순 임대가 아닌, 작물 재배·토양 관리를 배울 수 있는 농원. 운영자(조경학 박사)의 작물 자문이 항상 가능합니다.',
  },
  {
    icon: '🌱',
    title: '친환경 농법',
    desc: '저농약·퇴비 중심. 가족이 직접 길러 먹는 안전한 작물.',
  },
  {
    icon: '🤝',
    title: '이웃과 함께',
    desc: '인접 구획 배정으로 자연스럽게 이웃이 생기고, 주말마다 농원이 작은 공동체가 됩니다.',
  },
] as const

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-50 via-background to-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="mb-3 text-sm font-medium tracking-wider uppercase text-brand-700">
            농원 소개
          </p>
          <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">
            자연을 가르치는 텃밭
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-base text-muted-foreground sm:text-lg leading-relaxed">
            여월농장은 조경학 박사가 직접 운영하는 학습형 주말 텃밭입니다.
            <br className="hidden sm:inline" />
            서울에서 차로 30분, 부천 여월동에서 시작하세요.
          </p>
        </div>
      </section>

      {/* 운영자 소개 */}
      <section className="py-16 sm:py-20" aria-labelledby="owner-heading">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-center">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-gradient-to-br from-brand-100 to-brand-300 shadow-md">
              <Image
                src="/gallery/KakaoTalk_20260516_150830179.jpg"
                alt="여월농장 풍경"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>

            <div>
              <h2 id="owner-heading" className="text-2xl font-bold sm:text-3xl">
                운영자 소개
              </h2>
              <p className="mt-3 text-sm font-medium text-brand-700">
                농업회사법인 (유)호정
              </p>

              <div className="mt-6 space-y-4 text-base leading-relaxed text-foreground/90">
                <p>
                  안녕하세요, 여월농장 운영자입니다.
                </p>
                <p>
                  저는 <strong>조경학 박사</strong>로, 30년 가까이 식물과 토양을
                  공부해왔습니다. 농원을 단순히 임대하는 곳이 아니라,
                  도시인이 자연과 작물을 가까이서 배울 수 있는 공간으로 만들고
                  싶었습니다.
                </p>
                <p>
                  여월농장은 2027 시즌 기준 <strong>300구획</strong> 규모이며,
                  모든 구획을 균일하게 <strong>5평</strong>으로 설계했습니다.
                  여러 구좌를 신청하시면 인접한 구획으로 자동 배정되어,
                  가족·동호회 단위로 편안하게 이용하실 수 있습니다.
                </p>
                <p>
                  작물 선택, 파종 시기, 병해충 관리 등 무엇이든 편하게
                  문의해주세요. 주말마다 농원에 머물며 직접 안내해 드립니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 농원 철학 */}
      <section className="bg-muted/30 py-16 sm:py-20" aria-labelledby="philosophy-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 id="philosophy-heading" className="text-2xl font-bold sm:text-3xl">
              여월농장이 추구하는 가치
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {PHILOSOPHY.map((p) => (
              <Card key={p.title} className="border-brand-100/60">
                <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
                  <span className="text-4xl" role="img" aria-hidden>
                    {p.icon}
                  </span>
                  <h3 className="text-lg font-semibold">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {p.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 위치 요약 */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold sm:text-2xl">📍 위치 요약</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-muted-foreground">주소</dt>
                <dd>경기도 부천시 오정구 여월동 112</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-muted-foreground">거리</dt>
                <dd>서울 강서·양천에서 차로 약 30분</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-muted-foreground">규모</dt>
                <dd>300구획 (모두 5평 균일)</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-muted-foreground">시즌</dt>
                <dd>매년 3월 ~ 11월 (9개월)</dd>
              </div>
            </dl>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <LinkButton href="/access" size="lg">
                오시는 길 →
              </LinkButton>
              <LinkButton href="/gallery" variant="outline" size="lg">
                갤러리 보기
              </LinkButton>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
