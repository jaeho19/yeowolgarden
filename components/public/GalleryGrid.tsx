'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

export interface GalleryItem {
  src: string
  alt: string
  caption?: string
}

interface GalleryGridProps {
  items: readonly GalleryItem[]
}

/**
 * 갤러리 그리드 + lightbox 다이얼로그.
 * - 그리드 썸네일 클릭 → 풀스크린 다이얼로그
 * - 좌우 화살표 키 / 버튼으로 이전·다음 이미지
 * - ESC 또는 바깥 클릭으로 닫기 (shadcn Dialog 기본)
 */
export function GalleryGrid({ items }: GalleryGridProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const isOpen = activeIndex !== null

  const close = useCallback(() => setActiveIndex(null), [])

  const prev = useCallback(() => {
    setActiveIndex((i) =>
      i === null ? null : (i - 1 + items.length) % items.length
    )
  }, [items.length])

  const next = useCallback(() => {
    setActiveIndex((i) => (i === null ? null : (i + 1) % items.length))
  }, [items.length])

  // 키보드 조작
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, prev, next])

  const active = activeIndex !== null ? items[activeIndex] : null

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {items.map((item, i) => (
          <li key={item.src}>
            <button
              type="button"
              onClick={() => setActiveIndex(i)}
              className="group relative block aspect-square w-full overflow-hidden rounded-xl bg-muted shadow-sm transition hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              aria-label={`${item.alt} 크게 보기`}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition group-hover:scale-105"
                loading={i < 4 ? 'eager' : 'lazy'}
              />
              {item.caption && (
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3 text-left text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
                  {item.caption}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) close()
        }}
      >
        <DialogContent
          showCloseButton
          className="w-[min(96vw,1100px)] max-w-none border-none bg-black/95 p-0 text-white sm:rounded-xl"
        >
          <DialogTitle className="sr-only">
            {active?.alt ?? '갤러리 이미지'}
          </DialogTitle>

          {active && (
            <div className="relative">
              <div className="relative h-[70vh] w-full">
                <Image
                  src={active.src}
                  alt={active.alt}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority
                />
              </div>

              {active.caption && (
                <p className="px-6 pb-5 pt-3 text-center text-sm text-white/90">
                  {active.caption}
                </p>
              )}

              {/* 좌우 이동 버튼 */}
              <button
                type="button"
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="이전 이미지"
              >
                ←
              </button>
              <button
                type="button"
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="다음 이미지"
              >
                →
              </button>

              <p className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white/90">
                {(activeIndex ?? 0) + 1} / {items.length}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
