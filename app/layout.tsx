import type { Metadata, Viewport } from 'next'
import './globals.css'

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
    <html lang="ko" className="h-full antialiased">
      <head>
        {/* 본문: Pretendard Variable */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css"
        />
        {/* 표제: Gowun Batang 본명조 (h1/h2/display — font-heading 클래스로 적용) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
