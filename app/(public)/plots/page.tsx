import type { Metadata } from 'next'
import Link from 'next/link'
import { AvailabilityBadge } from '@/components/public/AvailabilityBadge'
import { LinkButton } from '@/components/public/LinkButton'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: '분양 안내 — 5평 100,000원 / 시즌 1회 결제',
  description:
    '여월농장 2027 시즌 주말 텃밭 분양. 모든 구획 균일 5평, 구획당 100,000원. 인접 묶음 자동 배정.',
}

// 잔여 통계가 DB에 의존 — dynamic으로 build-time prerender 차단.
export const dynamic = 'force-dynamic'

/* ─── 가격표 데이터 (구좌 단위) ─── */
const PRICING = [
  { units: 1, label: '1구좌 (5평)', recommend: '1~2인 가정' },
  { units: 2, label: '2구좌 (10평)', recommend: '3~4인 가족' },
  { units: 3, label: '3구좌 (15평)', recommend: '대가족·동호회' },
] as const

const UNIT_PRICE = 100_000

/* ─── 시설 ─── */
const FACILITIES = [
  { icon: '🚰', title: '수도 시설', desc: '구획 근처 공동 수도. 호스 무료 비치.' },
  { icon: '🛠️', title: '농기구 대여', desc: '호미·삽·물뿌리개 등 기본 도구 무료 대여.' },
  { icon: '🚗', title: '주차장', desc: '농원 입구 무료 주차 20여대.' },
  { icon: '🚻', title: '간이 화장실', desc: '시즌 중 상시 운영.' },
  { icon: '🪑', title: '쉼터', desc: '그늘막 + 벤치 — 한낮 휴식·식사 가능.' },
  { icon: '🌱', title: '퇴비·재배 조언', desc: '운영자의 작물 자문을 받으실 수 있습니다.' },
] as const

/* ─── 시즌 일정 ─── */
const SCHEDULE = [
  {
    period: '1월 ~ 2월',
    title: '분양 신청 접수',
    desc: '온라인 신청 → 입금 → 인접 묶음 자동 배정',
    color: 'bg-amber-100 text-amber-900',
  },
  {
    period: '3월 초',
    title: '시즌 개장',
    desc: '봄 파종 시작. 운영자 오리엔테이션.',
    color: 'bg-brand-100 text-brand-900',
  },
  {
    period: '3월 ~ 11월',
    title: '재배·수확 시즌 (9개월)',
    desc: '주말마다 자유롭게 방문. 작물 관리·수확.',
    color: 'bg-emerald-100 text-emerald-900',
  },
  {
    period: '11월 말',
    title: '시즌 마감',
    desc: '구획 정리·반납. 다음 시즌까지 휴장.',
    color: 'bg-stone-200 text-stone-900',
  },
] as const

export default function PlotsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-50 via-background to-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="mb-3 text-sm font-medium tracking-wider uppercase text-brand-700">
            분양 안내
          </p>
          <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">
            5평 100,000원,
            <br className="sm:hidden" /> 시즌 1회 결제
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-base text-muted-foreground sm:text-lg leading-relaxed">
            여월농장의 모든 구획은 균일하게 5평입니다.
            <br />
            여러 구좌를 신청하면 <strong>인접한 구획으로 자동 배정</strong>됩니다.
          </p>
        </div>
      </section>

      {/* 잔여 현황 */}
      <AvailabilityBadge />

      {/* 가격표 */}
      <section className="py-16 sm:py-20" aria-labelledby="pricing-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 id="pricing-heading" className="text-2xl font-bold sm:text-3xl">
              구좌별 가격
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              구획당 100,000원 · 시즌 1회 일시 결제 · 추가 비용 없음
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {PRICING.map((p, i) => (
              <Card
                key={p.units}
                className={
                  i === 1
                    ? 'border-brand-300 shadow-md ring-1 ring-brand-200'
                    : 'border-brand-100/60'
                }
              >
                <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
                  {i === 1 && (
                    <span className="rounded-full bg-brand-500 px-2.5 py-0.5 text-xs font-medium text-white">
                      인기
                    </span>
                  )}
                  <h3 className="text-lg font-semibold">{p.label}</h3>
                  <div className="text-3xl font-bold text-brand-700">
                    {(UNIT_PRICE * p.units).toLocaleString('ko-KR')}
                    <span className="ml-1 text-base font-normal text-muted-foreground">
                      원
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{p.recommend}</p>
                  <p className="text-xs text-muted-foreground">
                    인접 {p.units}구획 자동 배정
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            ⓘ 4구좌(20평) 이상 신청은 잔여 묶음에 따라 운영자와 협의 후 배정됩니다.
          </p>
        </div>
      </section>

      <Separator />

      {/* 시설 안내 */}
      <section className="bg-muted/30 py-16 sm:py-20" aria-labelledby="facility-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 id="facility-heading" className="text-2xl font-bold sm:text-3xl">
              시설 안내
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              농원 내 모든 기본 시설은 무료로 이용하실 수 있습니다.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {FACILITIES.map((f) => (
              <div
                key={f.title}
                className="flex gap-4 rounded-xl border border-border bg-card p-5 shadow-sm"
              >
                <span className="text-3xl shrink-0" role="img" aria-hidden>
                  {f.icon}
                </span>
                <div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 시즌 일정 */}
      <section className="py-16 sm:py-20" aria-labelledby="schedule-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 id="schedule-heading" className="text-2xl font-bold sm:text-3xl">
              시즌 일정
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              매년 3월 ~ 11월 (9개월) 동안 운영됩니다.
            </p>
          </div>

          <ol className="relative mx-auto max-w-3xl space-y-6 border-l-2 border-brand-200 pl-6">
            {SCHEDULE.map((s) => (
              <li key={s.title} className="relative">
                <span
                  className="absolute -left-[33px] flex h-6 w-6 items-center justify-center rounded-full border-2 border-brand-200 bg-background"
                  aria-hidden
                >
                  <span className="h-2 w-2 rounded-full bg-brand-500" />
                </span>
                <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}
                  >
                    {s.period}
                  </span>
                  <h3 className="mt-2 font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 결제 안내 + CTA */}
      <section className="bg-brand-50/60 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-brand-200 bg-card p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold sm:text-2xl">결제 안내</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-muted-foreground">방식</dt>
                <dd>온라인 신청 후 계좌이체 (1회 일시불)</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-muted-foreground">계좌</dt>
                <dd className="font-mono">
                  {process.env.BANK_INFO_DISPLAY ??
                    '농축협 351-1352-647143 농업회사법인 (유)호정'}
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-muted-foreground">입금자명</dt>
                <dd>신청자 본인 이름 (다를 경우 신청 시 메모란 기재)</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-muted-foreground">확인</dt>
                <dd>
                  입금 후 1~3일 내 운영자 확인 → 자동 배정 → 본인 조회 페이지에서 결과 확인
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-muted-foreground">환불</dt>
                <dd>
                  시즌 개장 (3월 초) 이전: 전액 환불 · 이후:{' '}
                  <Link href="/terms" className="text-brand-700 underline">
                    이용약관
                  </Link>{' '}
                  참조
                </dd>
              </div>
            </dl>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <LinkButton href="/apply" size="lg">
                분양 신청하기 →
              </LinkButton>
              <LinkButton href="/faq" variant="outline" size="lg">
                자주 묻는 질문
              </LinkButton>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
