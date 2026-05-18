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
  themeColor: '#5d8a3a',
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
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
