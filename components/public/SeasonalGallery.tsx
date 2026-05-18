import Link from 'next/link'

/**
 * 홈에 표시되는 사계절 갤러리 — 시안 B 「비대칭 매거진 펼침면」
 *
 * 데스크톱: 12-grid 좌측 7칸(큰 사진 4:5) + 우측 5칸(작은 4장 2x2)
 * 모바일: 단일 컬럼 세로 스택 (큰 사진 → 작은 4장 2x2)
 *
 * .impeccable.md 「흙냄새 미니멀」 준수:
 *  - 그라데이션 placeholder 0
 *  - 카드 wrap·border-left 컬러 스트라이프 0
 *  - 표제는 font-heading 본명조
 *  - 운영자 9장 중 5장 사용, 나머지는 /gallery 전체 보기로
 */
const BIG_IMAGE = '/gallery/KakaoTalk_20260516_150830179_01.jpg'
const SMALL_IMAGES = [
  '/gallery/KakaoTalk_20260516_150830179_02.jpg',
  '/gallery/KakaoTalk_20260516_150830179_03.jpg',
  '/gallery/KakaoTalk_20260516_150830179_04.jpg',
  '/gallery/KakaoTalk_20260516_150830179_05.jpg',
] as const

export function SeasonalGallery() {
  return (
    <section className="py-12 sm:py-20" aria-labelledby="gallery-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2
            id="gallery-heading"
            className="font-heading text-h2 font-bold leading-tight tracking-tight text-foreground"
          >
            여월농장의 사계절
          </h2>
          <Link
            href="/gallery"
            className="shrink-0 text-sm font-medium text-brand-700 hover:underline"
          >
            전체 보기 →
          </Link>
        </div>

        {/* 비대칭 매거진 펼침면 — 데스크톱 7:5 비율 */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-stretch sm:gap-4">
          {/* 큰 사진 (좌측 7칸, 4:5 세로형) */}
          <figure className="relative aspect-[4/5] overflow-hidden rounded-md border border-border bg-muted sm:col-span-7">
            <img
              src={BIG_IMAGE}
              alt="여월농장의 사계절 풍경"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          </figure>

          {/* 작은 4장 (우측 5칸, 2x2) — 컨테이너 높이가 큰 사진 높이에 맞춰 stretch */}
          <div className="grid grid-cols-2 grid-rows-2 gap-3 sm:col-span-5 sm:gap-4">
            {SMALL_IMAGES.map((src, i) => (
              <figure
                key={src}
                className="relative aspect-square overflow-hidden rounded-md border border-border bg-muted sm:aspect-auto"
              >
                <img
                  src={src}
                  alt={`여월농장 풍경 ${i + 2}`}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
