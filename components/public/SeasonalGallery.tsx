import Link from 'next/link'

/**
 * 홈에 표시되는 갤러리 가로 스와이프 미리보기.
 * 실제 사진은 추후 AI 보정본으로 교체 — 현재는 그라데이션 placeholder 5개.
 */
const PLACEHOLDERS = [
  { id: 1, label: '봄 파종', from: 'from-brand-100', to: 'to-brand-300' },
  { id: 2, label: '여름 성장', from: 'from-brand-300', to: 'to-brand-500' },
  { id: 3, label: '가을 수확', from: 'from-amber-200', to: 'to-amber-500' },
  { id: 4, label: '농원 풍경', from: 'from-emerald-200', to: 'to-emerald-500' },
  { id: 5, label: '시설 안내', from: 'from-stone-200', to: 'to-stone-400' },
] as const

export function SeasonalGallery() {
  return (
    <section
      className="py-12 sm:py-16"
      aria-labelledby="gallery-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <h2
            id="gallery-heading"
            className="text-2xl font-bold sm:text-3xl"
          >
            여월농장의 사계절
          </h2>
          <Link
            href="/gallery"
            className="text-sm font-medium text-brand-700 hover:underline"
          >
            전체 보기 →
          </Link>
        </div>

        {/* 가로 스크롤 갤러리 (mobile-friendly) */}
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
          {PLACEHOLDERS.map((p) => (
            <div
              key={p.id}
              className={`relative h-56 w-72 shrink-0 snap-start overflow-hidden rounded-xl bg-gradient-to-br ${p.from} ${p.to} sm:h-64 sm:w-80`}
            >
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <span className="text-sm font-medium text-white">
                  {p.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          ⓘ 실제 사진은 AI 보정 작업 완료 후 교체됩니다.
        </p>
      </div>
    </section>
  )
}
