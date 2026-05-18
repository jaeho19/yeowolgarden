import type { Metadata } from 'next'
import { desc, eq } from 'drizzle-orm'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import ReactMarkdown from 'react-markdown'
import { db } from '@/lib/db'
import { announcements } from '@/db/schema'
import { LinkButton } from '@/components/public/LinkButton'

export const metadata: Metadata = {
  title: '공지사항',
  description:
    '여월농장 공지사항 — 분양 일정·시설 안내·시즌 운영 정보를 확인하세요.',
}

// 60초마다 갱신 (ISR)
export const revalidate = 60

async function getAnnouncements() {
  return await db
    .select()
    .from(announcements)
    .where(eq(announcements.isVisible, true))
    .orderBy(desc(announcements.isPinned), desc(announcements.createdAt))
    .all()
}

export default async function NoticePage() {
  const list = await getAnnouncements()

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-50 via-background to-background py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="mb-3 text-sm font-medium tracking-wider uppercase text-brand-700">
            공지사항
          </p>
          <h1 className="text-3xl font-bold sm:text-4xl">공지사항</h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            여월농장의 분양·운영 관련 공지를 확인하세요.
          </p>
        </div>
      </section>

      {/* 목록 */}
      <section className="py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {list.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="space-y-4">
              {list.map((a) => (
                <li
                  key={a.id}
                  className={
                    a.isPinned
                      ? 'rounded-xl border-2 border-brand-200 bg-brand-50/40 p-5 shadow-sm sm:p-6'
                      : 'rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6'
                  }
                >
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    {a.isPinned ? (
                      <span className="inline-flex items-center rounded-full bg-brand-500 px-2 py-0.5 text-xs font-medium text-white">
                        📌 중요
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        일반
                      </span>
                    )}
                    <time
                      dateTime={a.createdAt.toISOString()}
                      className="text-xs text-muted-foreground"
                    >
                      {format(a.createdAt, 'yyyy-MM-dd (E)', { locale: ko })}
                    </time>
                  </div>

                  <h2 className="text-lg font-semibold sm:text-xl">
                    {a.title}
                  </h2>

                  <div className="prose prose-sm mt-3 max-w-none text-sm leading-relaxed text-foreground/90">
                    <ReactMarkdown
                      components={{
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-700 underline underline-offset-2 hover:text-brand-900"
                          >
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {a.content}
                    </ReactMarkdown>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* 하단 CTA */}
      <section className="bg-muted/30 py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-muted-foreground">
            신청 상태가 궁금하신가요?
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <LinkButton href="/apply/status" variant="outline">
              📋 본인 신청 조회
            </LinkButton>
            <LinkButton href="/apply">분양 신청하기 →</LinkButton>
          </div>
        </div>
      </section>
    </>
  )
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
      <span className="text-4xl" role="img" aria-hidden>
        📭
      </span>
      <p className="mt-4 text-sm text-muted-foreground">
        아직 등록된 공지사항이 없습니다.
      </p>
    </div>
  )
}
