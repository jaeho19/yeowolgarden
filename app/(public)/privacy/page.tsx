import type { Metadata } from 'next'
import { LinkButton } from '@/components/public/LinkButton'

export const metadata: Metadata = {
  title: '개인정보 처리방침',
  description: '여월농장이 수집·보관·파기하는 개인정보 항목과 이용 목적을 안내합니다.',
  robots: { index: false, follow: false },
}

export default function PrivacyPage() {
  return (
    <>
      {/* Hero — sub-page 종이톤 패턴 */}
      <section
        className="border-b border-border bg-secondary py-12 sm:py-16"
        aria-labelledby="privacy-hero-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-medium text-brand-700">개인정보</p>
          <h1
            id="privacy-hero-heading"
            className="mt-3 font-heading text-h1 font-bold leading-[1.15] tracking-tight text-foreground"
          >
            개인정보 처리방침
          </h1>
          <p className="mt-5 max-w-[58ch] text-base text-muted-foreground sm:text-lg">
            여월농장(농업회사법인 (유)호정)은 이용자의 개인정보를 소중히 다룹니다.
          </p>
        </div>
      </section>

      {/* 본문 */}
      <section className="py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-sm leading-relaxed text-foreground/90">

          {/* 수집 항목 */}
          <h2 className="font-heading text-h2 font-bold leading-tight tracking-tight text-foreground">
            1. 수집하는 개인정보 항목
          </h2>
          <dl className="mt-4">
            <div className="flex items-baseline gap-4 border-t border-border py-3">
              <dt className="w-28 shrink-0 text-muted-foreground">필수</dt>
              <dd className="font-medium text-foreground">이름, 이메일, 전화번호, 신청 시 IP 주소</dd>
            </div>
            <div className="flex items-baseline gap-4 border-t border-border py-3">
              <dt className="w-28 shrink-0 text-muted-foreground">선택</dt>
              <dd className="font-medium text-foreground">텃밭 경험(여부), 운영자 메모란 자유 입력</dd>
            </div>
            <div className="flex items-baseline gap-y-1 gap-4 border-t border-border py-3">
              <dt className="w-28 shrink-0 text-muted-foreground">수집 목적</dt>
              <dd className="font-medium text-foreground">텃밭 구획 배정, 입금 확인, 운영 안내</dd>
            </div>
          </dl>

          {/* 보관·파기 */}
          <h2 className="mt-10 font-heading text-h2 font-bold leading-tight tracking-tight text-foreground">
            2. 보관 기간 및 파기
          </h2>
          <dl className="mt-4">
            <div className="flex items-baseline gap-4 border-t border-border py-3">
              <dt className="w-28 shrink-0 text-muted-foreground">보관 기간</dt>
              <dd className="font-medium text-foreground">해당 시즌 종료 후 1년</dd>
            </div>
            <div className="flex items-baseline gap-4 border-t border-border py-3">
              <dt className="w-28 shrink-0 text-muted-foreground">파기 방식</dt>
              <dd className="font-medium text-foreground">운영자 수동 삭제 또는 관리 스크립트 트리거</dd>
            </div>
          </dl>

          {/* 제3자 제공 */}
          <h2 className="mt-10 font-heading text-h2 font-bold leading-tight tracking-tight text-foreground">
            3. 제3자 제공
          </h2>
          <p className="mt-4 border-t border-border pt-3">
            수집된 개인정보는 제3자에게 제공하지 않습니다.
          </p>

          {/* 처리 위탁 */}
          <h2 className="mt-10 font-heading text-h2 font-bold leading-tight tracking-tight text-foreground">
            4. 처리 위탁
          </h2>
          <dl className="mt-4">
            <div className="flex items-baseline gap-4 border-t border-border py-3">
              <dt className="w-28 shrink-0 text-muted-foreground">Turso</dt>
              <dd className="font-medium text-foreground">데이터베이스 호스팅 (미국)</dd>
            </div>
            <div className="flex items-baseline gap-4 border-t border-border py-3">
              <dt className="w-28 shrink-0 text-muted-foreground">Netlify</dt>
              <dd className="font-medium text-foreground">웹 호스팅</dd>
            </div>
          </dl>
          <p className="mt-3 text-muted-foreground">
            위탁 업체는 개인정보 보호 관련 법령을 준수하며, 처리 목적 외 이용을 금지합니다.
          </p>

          {/* 이용자 권리 */}
          <h2 className="mt-10 font-heading text-h2 font-bold leading-tight tracking-tight text-foreground">
            5. 이용자 권리
          </h2>
          <p className="mt-4 border-t border-border pt-3">
            본인의 개인정보 조회·수정·삭제를 원하시는 경우 운영자에게 직접 연락하시면 신속히 처리합니다.
            본인 조회 페이지에서도 신청 내용을 확인할 수 있습니다.
          </p>

          {/* 부칙 */}
          <p className="mt-10 border-t border-border pt-5 text-xs text-muted-foreground">
            시행일: 2026-12-31
          </p>
        </div>
      </section>

      {/* 하단 CTA */}
      <section className="border-t border-border bg-secondary py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/apply/status" variant="outline">
              본인 신청 조회
            </LinkButton>
            <LinkButton href="/terms" variant="outline">
              이용약관 보기
            </LinkButton>
          </div>
        </div>
      </section>
    </>
  )
}
