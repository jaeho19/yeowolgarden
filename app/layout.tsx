import type { Metadata, Viewport } from 'next'
import { Gowun_Batang } from 'next/font/google'
import './globals.css'

// 표제용 한국어 본명조 — next/font가 자동 self-host + preload + font-display swap.
// 한국어 subset이 next/font/google에 등록되어 있어 한글 글리프 포함된다.
const gowunBatang = Gowun_Batang({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-gowun-batang',
  display: 'swap',
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yeowolfarm.netlify.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: '여월농장 — 부천 주말 텃밭 분양',
    template: '%s | 여월농장',
  },
  description:
    '서울에서 30분, 교통이 편리한 부천 여월 체험농원. 주말 텃밭 분양 안내.',
  keywords: [
    '여월농장',
    '여월 체험농원',
    '부천 주말농장',
    '주말 텃밭 분양',
    '오정구 여월동',
    '서울 근교 텃밭',
    '주말농원',
  ],
  authors: [{ name: '여월농장' }],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: SITE_URL,
    siteName: '여월농장',
    title: '여월농장 — 부천 주말 텃밭 분양',
    description:
      '서울에서 30분, 교통이 편리한 부천 여월 체험농원. 주말 텃밭 분양 안내.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  // leaf-700 (oklch(0.36 0.07 130)) 근사값 — 톤다운된 단단한 잎
  themeColor: '#3e4f29',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className={`h-full antialiased ${gowunBatang.variable}`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
