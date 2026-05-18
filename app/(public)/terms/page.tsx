import type { Metadata } from 'next'
import { LinkButton } from '@/components/public/LinkButton'

export const metadata: Metadata = {
  title: '이용약관',
  description: '여월농장 텃밭 분양 이용약관 — 분양 대상·결제·환불·시설 이용 규정을 확인하세요.',
}

export default function TermsPage() {
  return (
    <>
      {/* Hero — sub-page 종이톤 패턴 */}
      <section
        className="border-b border-border bg-secondary py-12 sm:py-16"
        aria-labelledby="terms-hero-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-medium text-brand-700">약관</p>
          <h1
            id="terms-hero-heading"
            className="mt-3 font-heading text-h1 font-bold leading-[1.15] tracking-tight text-foreground"
          >
            이용약관
          </h1>
          <p className="mt-5 max-w-[58ch] text-base text-muted-foreground sm:text-lg">
            여월농장 텃밭 분양 서비스의 이용 조건을 안내합니다.
          </p>
        </div>
      </section>

      {/* 본문 */}
      <section className="py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-sm leading-relaxed text-foreground/90">

          {/* 제1조 */}
          <h2 className="font-heading text-h2 font-bold leading-tight tracking-tight text-foreground">
            제1조 분양 대상 및 기간
          </h2>
          <dl className="mt-4">
            <div className="flex items-baseline gap-4 border-t border-border py-3">
              <dt className="w-24 shrink-0 text-muted-foreground">대상</dt>
              <dd className="font-medium text-foreground">여월농장 주말 텃밭 구획 (1구획 = 5평 균일)</dd>
            </div>
            <div className="flex items-baseline gap-4 border-t border-border py-3">
              <dt className="w-24 shrink-0 text-muted-foreground">시즌</dt>
              <dd className="font-medium text-foreground">매년 3월 초 — 11월 말 (약 9개월)</dd>
            </div>
            <div className="flex items-baseline gap-4 border-t border-border py-3">
              <dt className="w-24 shrink-0 text-muted-foreground">신청</dt>
              <dd className="font-medium text-foreground">온라인 신청 후 운영자 배정 확정 순</dd>
            </div>
          </dl>

          {/* 제2조 */}
          <h2 className="mt-10 font-heading text-h2 font-bold leading-tight tracking-tight text-foreground">
            제2조 결제 방식
          </h2>
          <dl className="mt-4">
            <div className="flex items-baseline gap-4 border-t border-border py-3">
              <dt className="w-24 shrink-0 text-muted-foreground">방법</dt>
              <dd className="font-medium text-foreground">계좌이체 1회 일시불</dd>
            </div>
            <div className="flex items-baseline gap-4 border-t border-border py-3">
              <dt className="w-24 shrink-0 text-muted-foreground">카드</dt>
              <dd className="font-medium text-foreground">카드 결제 미지원</dd>
            </div>
            <div className="flex items-baseline gap-4 border-t border-border py-3">
              <dt className="w-24 shrink-0 text-muted-foreground">완납 기한</dt>
              <dd className="font-medium text-foreground">신청 완료 후 7일 이내 (미완납 시 배정 취소)</dd>
            </div>
          </dl>

          {/* 제3조 환불 */}
          <h2 className="mt-10 font-heading text-h2 font-bold leading-tight tracking-tight text-foreground">
            제3조 환불 정책
          </h2>
          <dl className="mt-4">
            <div className="flex items-baseline gap-4 border-t border-border py-3">
              <dt className="w-24 shrink-0 text-muted-foreground">개장 전</dt>
              <dd className="font-medium text-foreground">시즌 개장(3월 초) 이전 취소 시 전액 환불</dd>
            </div>
            <div className="flex items-baseline gap-4 border-t border-border py-3">
              <dt className="w-24 shrink-0 text-muted-foreground">개장 후</dt>
              <dd className="font-medium text-foreground">개장 이후 취소는 운영자와 개별 협의</dd>
            </div>
          </dl>

          {/* 제4조 시설 이용 */}
          <h2 className="mt-10 font-heading text-h2 font-bold leading-tight tracking-tight text-foreground">
            제4조 시설 이용 규정
          </h2>
          <ol className="mt-4 space-y-2 border-t border-border pt-3 list-decimal list-inside marker:text-muted-foreground">
            <li>반려동물 동반 시 리드줄 착용 필수</li>
            <li>농원 내 흡연 금지</li>
            <li>화기 사용 시 사전 운영자 승인 필요 (화재 주의)</li>
            <li>타인의 구획 무단 출입 및 작물 채취 금지</li>
            <li>폐기물은 지정 장소에 분리배출</li>
          </ol>

          {/* 제5조 책임 한계 */}
          <h2 className="mt-10 font-heading text-h2 font-bold leading-tight tracking-tight text-foreground">
            제5조 책임 한계
          </h2>
          <p className="mt-4 border-t border-border pt-3">
            작황 부진·기상 재해·병해충·도난 등 불가항력적 사유로 인한 피해는 농원이 보상하지 않습니다.
            이용자 본인의 과실로 발생한 손해도 이용자가 부담합니다.
          </p>

          {/* 부칙 */}
          <p className="mt-10 border-t border-border pt-5 text-xs text-muted-foreground">
            부칙: 본 약관은 2026-12-31부터 시행합니다.
          </p>
        </div>
      </section>

      {/* 하단 CTA */}
      <section className="border-t border-border bg-secondary py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/apply">분양 신청하기 →</LinkButton>
            <LinkButton href="/privacy" variant="outline">
              개인정보 처리방침
            </LinkButton>
          </div>
        </div>
      </section>
    </>
  )
}
