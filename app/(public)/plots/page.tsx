import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { LinkButton } from '@/components/public/LinkButton'

export const metadata: Metadata = {
  title: '분양 안내 — 5평 100,000원 / 시즌 1회 결제',
  description:
    '여월농장 주말 텃밭 분양. 모든 구획 균일 5평, 구획당 100,000원. 인접 묶음 자동 배정.',
}

/* ─── 가격 (구좌 단위) ─── */
const UNIT_PRICE = 100_000
const PRICING = [
  { units: 1, area: 5, recommend: '1~2인 가정' },
  { units: 2, area: 10, recommend: '3~4인 가족' },
  { units: 3, area: 15, recommend: '대가족·동호회' },
] as const

/* ─── 시설 ─── */
const FACILITIES = [
  { title: '수도 시설', desc: '구획 근처에 지하수 수도와 호스 무료 비치.' },
  { title: '농기구 대여', desc: '호미·삽·물뿌리개 등 기본 도구 무료 대여.' },
  { title: '주차장', desc: '농원 입구 무료 주차 20여대.' },
  { title: '간이 화장실', desc: '시즌 중 상시 운영.' },
  { title: '쉼터', desc: '그늘막 + 벤치 — 한낮 휴식·식사 가능.' },
  { title: '퇴비·재배 조언', desc: '운영자의 작물 자문을 받으실 수 있습니다.' },
] as const

/* ─── 시즌 일정 ─── */
const SCHEDULE = [
  {
    period: '1월 — 2월',
    title: '분양 신청 접수',
    desc: '온라인 신청 → 입금 → 인접 묶음 자동 배정',
  },
  {
    period: '3월 초',
    title: '시즌 개장',
    desc: '봄 파종 시작. 운영자 오리엔테이션.',
  },
  {
    period: '3월 — 11월',
    title: '재배·수확 시즌 (9개월)',
    desc: '주말마다 자유롭게 방문. 작물 관리·수확.',
  },
  {
    period: '11월 말',
    title: '시즌 마감',
    desc: '구획 정리·반납. 다음 시즌까지 휴장.',
  },
] as const

export default function PlotsPage() {
  return (
    <>
      {/* Hero — 풀폭 사진 + 명조 표제 + 정보 띠 */}
      <section className="relative bg-background" aria-labelledby="plots-hero-heading">
        <div className="relative h-[50vh] min-h-[380px] w-full overflow-hidden bg-muted sm:h-[58vh] sm:min-h-[460px]">
          <Image
            src="/gallery/KakaoTalk_20260516_150830179_06.jpg"
            alt="여월농장의 구획 풍경"
            fill
            sizes="100vw"
            priority
            quality={85}
            className="editorial-photo object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/65 via-black/25 to-transparent"
          />
          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 sm:pb-14 lg:px-8 lg:pb-16">
              <p className="text-sm font-medium text-white/90">분양 안내</p>
              <h1
                id="plots-hero-heading"
                className="mt-3 max-w-3xl font-heading text-display font-bold leading-[1.08] tracking-tight text-white"
              >
                5평 균일,
                <br />
                인접 자동 배정
              </h1>
            </div>
          </div>
        </div>

        <div className="border-b border-border bg-background">
          <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-10 lg:px-8">
            <dl className="grid grid-cols-3 gap-x-8 gap-y-1.5 text-sm sm:gap-x-12">
              <dt className="text-muted-foreground">구획</dt>
              <dt className="text-muted-foreground">가격</dt>
              <dt className="text-muted-foreground">결제</dt>
              <dd className="font-medium text-foreground">전 300 · 균일 5평</dd>
              <dd className="font-medium text-foreground">100,000원 / 구획</dd>
              <dd className="font-medium text-foreground">시즌 1회 일시불</dd>
            </dl>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
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

      {/* 가격 — 큰 단가 한 줄 + 구좌별 비교 dl (카드 해체) */}
      <section className="py-16 sm:py-20" aria-labelledby="pricing-heading">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2
            id="pricing-heading"
            className="font-heading text-h2 font-bold leading-tight tracking-tight text-foreground"
          >
            구좌별 가격
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            구획당 100,000원 · 시즌 1회 일시 결제 · 추가 비용 없음
          </p>

          {/* 큰 단가 표시 */}
          <div className="mt-12 border-t border-border pt-10">
            <p className="text-sm font-medium text-brand-700">기본 단가</p>
            <p className="mt-3 font-heading text-h1 font-bold leading-tight tracking-tight tabular-nums text-foreground">
              5평 · 100,000원
            </p>
            <p className="mt-4 max-w-[58ch] text-sm leading-relaxed text-muted-foreground">
              구획 1개당 가격. 시즌 1회 일시 결제로 추가 비용은 없습니다. 여러
              구좌를 신청하시면 인접한 구획으로 자동 배정되어 가족·동호회 단위로
              함께 이용하실 수 있습니다.
            </p>
          </div>

          {/* 구좌별 비교 */}
          <dl className="mt-10">
            {PRICING.map((p) => (
              <div
                key={p.units}
                className="flex flex-col gap-1 border-t border-border py-5 sm:flex-row sm:items-baseline sm:gap-6"
              >
                <dt className="font-heading text-base font-bold tabular-nums text-foreground sm:w-24 sm:shrink-0">
                  {p.units}구좌
                </dt>
                <dd className="text-sm text-muted-foreground sm:flex-1">
                  <span className="tabular-nums">{p.area}평</span>
                  <span className="mx-2 text-border" aria-hidden>·</span>
                  {p.recommend}
                </dd>
                <dd className="font-heading text-lg font-bold tabular-nums text-brand-700 sm:text-base">
                  {(UNIT_PRICE * p.units).toLocaleString('ko-KR')}원
                </dd>
              </div>
            ))}
            <div className="border-b border-border" aria-hidden />
          </dl>

          <p className="mt-6 text-xs text-muted-foreground">
            4구좌(20평) 이상 신청은 잔여 묶음에 따라 운영자와 협의 후
            배정됩니다.
          </p>
        </div>
      </section>

      {/* 시설 안내 — paper-warm 배경 + 2-col dl (카드 해체) */}
      <section
        className="border-y border-border bg-secondary py-16 sm:py-20"
        aria-labelledby="facility-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            id="facility-heading"
            className="font-heading text-h2 font-bold leading-tight tracking-tight text-foreground"
          >
            시설 안내
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            농원 내 모든 기본 시설은 무료로 이용하실 수 있습니다.
          </p>

          <dl className="mt-10 grid grid-cols-1 gap-x-12 md:grid-cols-2">
            {FACILITIES.map((f, i) => (
              <div
                key={f.title}
                className="grid grid-cols-[3rem_1fr] items-baseline gap-x-3 border-t border-border py-5"
              >
                <dt className="font-heading text-base font-bold tabular-nums text-brand-700">
                  {String(i + 1).padStart(2, '0')}
                </dt>
                <dd>
                  <p className="font-semibold text-foreground">{f.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {f.desc}
                  </p>
                </dd>
              </div>
            ))}
            <div className="border-b border-border md:col-span-2" aria-hidden />
          </dl>
        </div>
      </section>

      {/* 시즌 일정 — 4단계 ol (타임라인 카드 해체) */}
      <section className="py-16 sm:py-20" aria-labelledby="schedule-heading">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2
            id="schedule-heading"
            className="font-heading text-h2 font-bold leading-tight tracking-tight text-foreground"
          >
            시즌 일정
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            매년 3월 — 11월 (9개월) 동안 운영됩니다.
          </p>

          <ol className="mt-10">
            {SCHEDULE.map((s, i) => (
              <li
                key={s.title}
                className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 border-t border-border py-6 sm:grid-cols-[3rem_9rem_1fr] sm:items-baseline sm:gap-x-8"
              >
                <span className="font-heading text-base font-bold tabular-nums text-brand-700">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-sm font-medium text-brand-700 sm:text-foreground">
                  {s.period}
                </span>
                <div className="col-span-2 sm:col-span-1">
                  <h3 className="font-semibold text-foreground">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {s.desc}
                  </p>
                </div>
              </li>
            ))}
            <li className="border-b border-border" aria-hidden />
          </ol>
        </div>
      </section>

      {/* 결제 안내 — paper-warm 안내문 (카드 해체) */}
      <section
        className="border-y border-border bg-secondary py-16 sm:py-20"
        aria-labelledby="payment-heading"
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2
            id="payment-heading"
            className="font-heading text-h2 font-bold leading-tight tracking-tight text-foreground"
          >
            결제 안내
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            온라인 신청 후 안내된 계좌로 1회 일시 이체합니다.
          </p>

          <dl className="mt-8 text-sm">
            <div className="flex flex-col gap-1 border-t border-border py-4 sm:flex-row sm:gap-6">
              <dt className="text-muted-foreground sm:w-24 sm:shrink-0">방식</dt>
              <dd className="font-medium text-foreground">
                온라인 신청 후 계좌이체 (1회 일시불)
              </dd>
            </div>
            <div className="flex flex-col gap-1 border-t border-border py-4 sm:flex-row sm:gap-6">
              <dt className="text-muted-foreground sm:w-24 sm:shrink-0">계좌</dt>
              <dd className="font-medium tabular-nums text-foreground">
                {process.env.BANK_INFO_DISPLAY ??
                  '농축협 351-1352-647143 농업회사법인 (유)호정'}
              </dd>
            </div>
            <div className="flex flex-col gap-1 border-t border-border py-4 sm:flex-row sm:gap-6">
              <dt className="text-muted-foreground sm:w-24 sm:shrink-0">
                입금자명
              </dt>
              <dd className="font-medium text-foreground">
                신청자 본인 이름 (다를 경우 신청 시 메모란 기재)
              </dd>
            </div>
            <div className="flex flex-col gap-1 border-t border-border py-4 sm:flex-row sm:gap-6">
              <dt className="text-muted-foreground sm:w-24 sm:shrink-0">확인</dt>
              <dd className="font-medium text-foreground">
                입금 후 1~3일 내 운영자 확인 → 자동 배정 → 본인 조회 페이지에서
                결과 확인
              </dd>
            </div>
            <div className="flex flex-col gap-1 border-y border-border py-4 sm:flex-row sm:gap-6">
              <dt className="text-muted-foreground sm:w-24 sm:shrink-0">환불</dt>
              <dd className="font-medium text-foreground">
                시즌 개장 (3월 초) 이전: 전액 환불 · 이후:{' '}
                <Link href="/terms" className="text-brand-700 underline">
                  이용약관
                </Link>{' '}
                참조
              </dd>
            </div>
          </dl>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/apply" size="lg">
              분양 신청하기 →
            </LinkButton>
            <LinkButton href="/faq" variant="outline" size="lg">
              자주 묻는 질문
            </LinkButton>
          </div>
        </div>
      </section>
    </>
  )
}
