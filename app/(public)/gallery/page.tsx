import type { Metadata } from 'next'
import { GalleryGrid, type GalleryItem } from '@/components/public/GalleryGrid'

export const metadata: Metadata = {
  title: '갤러리 — 여월농장의 사계절',
  description:
    '봄 파종부터 가을 수확까지, 여월농장의 다채로운 풍경을 사진으로 만나보세요.',
}

const PHOTOS: readonly GalleryItem[] = [
  {
    src: '/gallery/KakaoTalk_20260516_150830179.jpg',
    alt: '여월농장 전경',
    caption: '여월농장 전경',
  },
  {
    src: '/gallery/KakaoTalk_20260516_150830179_01.jpg',
    alt: '구획 배치 모습',
    caption: '5평 균일 구획',
  },
  {
    src: '/gallery/KakaoTalk_20260516_150830179_02.jpg',
    alt: '봄 파종 시기',
    caption: '봄, 파종의 계절',
  },
  {
    src: '/gallery/KakaoTalk_20260516_150830179_03.jpg',
    alt: '여름 작물 성장',
    caption: '여름, 무성하게 자란 작물',
  },
  {
    src: '/gallery/KakaoTalk_20260516_150830179_04.jpg',
    alt: '가을 수확',
    caption: '가을, 수확의 기쁨',
  },
  {
    src: '/gallery/KakaoTalk_20260516_150830179_05.jpg',
    alt: '농원 풍경',
    caption: '여월농장의 일상',
  },
  {
    src: '/gallery/KakaoTalk_20260516_150830179_06.jpg',
    alt: '시설 안내',
    caption: '공동 수도와 쉼터',
  },
  {
    src: '/gallery/KakaoTalk_20260516_150830179_07.jpg',
    alt: '농원 입구',
    caption: '농원 입구와 주차장',
  },
  {
    src: '/gallery/KakaoTalk_20260516_150830179_08.jpg',
    alt: '주말 텃밭 풍경',
    caption: '주말 텃밭의 활기',
  },
] as const

export default function GalleryPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-50 via-background to-background py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="mb-3 text-sm font-medium tracking-wider uppercase text-brand-700">
            갤러리
          </p>
          <h1 className="text-3xl font-bold sm:text-4xl">여월농장의 사계절</h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            농원의 풍경을 사진으로 만나보세요.
          </p>
        </div>
      </section>

      {/* 그리드 */}
      <section className="py-10" aria-label="갤러리 그리드">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <GalleryGrid items={PHOTOS} />
          <p className="mt-6 text-center text-xs text-muted-foreground">
            ⓘ 사진을 클릭하면 크게 볼 수 있습니다. (← → 화살표 키로 이동)
          </p>
        </div>
      </section>
    </>
  )
}
