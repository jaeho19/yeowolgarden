'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import {
  AnnouncementEditor,
  type AnnouncementEditTarget,
} from '@/components/admin/AnnouncementEditor'

export interface AdminAnnouncement {
  id: string
  title: string
  content: string
  isPinned: boolean
  isVisible: boolean
  createdAt: string // serialized
  updatedAt: string
}

interface Props {
  items: AdminAnnouncement[]
}

export function AnnouncementsTable({ items }: Props) {
  const router = useRouter()
  const [target, setTarget] = useState<AnnouncementEditTarget | null>(null)
  const [, startTransition] = useTransition()
  const [busy, setBusy] = useState<string | null>(null)

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" 공지를 삭제하시겠어요?`)) return
    setBusy(id)
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        alert(j?.error?.message ?? '삭제 실패')
        return
      }
      startTransition(() => router.refresh())
    } finally {
      setBusy(null)
    }
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button
          onClick={() =>
            setTarget({
              title: '',
              content: '',
              isPinned: false,
              isVisible: true,
            })
          }
        >
          + 새 공지 작성
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">
            아직 등록된 공지가 없습니다.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((a) => (
            <li
              key={a.id}
              className={
                a.isPinned
                  ? 'rounded-xl border-2 border-brand-200 bg-brand-50/30 p-4 shadow-sm sm:p-5'
                  : 'rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5'
              }
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {a.isPinned && (
                      <span className="inline-flex items-center rounded-full bg-brand-500 px-2 py-0.5 text-xs font-medium text-white">
                        📌 핀
                      </span>
                    )}
                    {!a.isVisible && (
                      <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        비공개
                      </span>
                    )}
                    <h3 className="text-base font-semibold sm:text-lg">
                      {a.title}
                    </h3>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    작성 {format(new Date(a.createdAt), 'yyyy-MM-dd HH:mm', { locale: ko })}
                    {a.updatedAt !== a.createdAt && (
                      <>
                        {' · '}수정{' '}
                        {format(new Date(a.updatedAt), 'yyyy-MM-dd HH:mm', {
                          locale: ko,
                        })}
                      </>
                    )}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-foreground/80">
                    {a.content}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setTarget({
                        id: a.id,
                        title: a.title,
                        content: a.content,
                        isPinned: a.isPinned,
                        isVisible: a.isVisible,
                      })
                    }
                  >
                    수정
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(a.id, a.title)}
                    disabled={busy === a.id}
                    className="text-destructive hover:bg-destructive/5"
                  >
                    {busy === a.id ? '...' : '삭제'}
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AnnouncementEditor target={target} onClose={() => setTarget(null)} />
    </>
  )
}
