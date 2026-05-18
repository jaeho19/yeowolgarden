/**
 * /admin/settings — 사이트 설정.
 * - 모집 ON/OFF 토글
 * - (확장 여지: 시즌 변경, 가격 변경 등)
 */
import {
  getCurrentSeasonYear,
  isRecruitmentOpen,
} from '@/lib/settings'
import { RecruitmentToggle } from '@/components/admin/RecruitmentToggle'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const [seasonYear, open] = await Promise.all([
    getCurrentSeasonYear(),
    isRecruitmentOpen(),
  ])

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          {seasonYear} 시즌
        </p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">설정</h1>
      </header>

      <section className="space-y-6">
        <RecruitmentToggle initialOpen={open} />

        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-5 text-sm text-muted-foreground">
          <h3 className="font-medium text-foreground">시즌·가격 변경</h3>
          <p className="mt-1.5 leading-relaxed">
            현재는 환경 변수 / DB seed 스크립트로 관리합니다. <br />
            <code className="rounded bg-card px-1.5 py-0.5">
              pnpm tsx scripts/seed-plots.ts
            </code>{' '}
            를 시즌 변경 시 다시 실행하세요.
          </p>
        </div>
      </section>
    </div>
  )
}
