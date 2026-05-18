'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AnnouncementInputSchema,
  type AnnouncementInput,
} from '@/lib/schemas/announcement'

export interface AnnouncementEditTarget {
  id?: string
  title: string
  content: string
  isPinned: boolean
  isVisible: boolean
}

interface Props {
  target: AnnouncementEditTarget | null
  onClose: () => void
}

export function AnnouncementEditor({ target, onClose }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const isCreate = !target?.id

  const form = useForm<AnnouncementInput>({
    resolver: zodResolver(AnnouncementInputSchema),
    defaultValues: {
      title: target?.title ?? '',
      content: target?.content ?? '',
      isPinned: target?.isPinned ?? false,
      isVisible: target?.isVisible ?? true,
    },
    values: target
      ? {
          title: target.title,
          content: target.content,
          isPinned: target.isPinned,
          isVisible: target.isVisible,
        }
      : undefined,
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form

  const isPinned = !!watch('isPinned')
  const isVisible = !!watch('isVisible')

  const onSubmit = async (data: AnnouncementInput) => {
    setSubmitError(null)
    try {
      const res = await fetch(
        isCreate
          ? '/api/admin/announcements'
          : `/api/admin/announcements/${target!.id}`,
        {
          method: isCreate ? 'POST' : 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(data),
        }
      )
      const json = await res.json()
      if (!res.ok) {
        setSubmitError(json?.error?.message ?? '저장 실패')
        return
      }
      startTransition(() => router.refresh())
      onClose()
    } catch {
      setSubmitError('네트워크 오류')
    }
  }

  return (
    <Dialog
      open={!!target}
      onOpenChange={(o) => {
        if (!o) onClose()
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogTitle>{isCreate ? '새 공지 작성' : '공지 수정'}</DialogTitle>
        <DialogDescription>
          제목과 내용을 입력하세요. 마크다운 문법을 사용할 수 있습니다.
        </DialogDescription>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="mt-4 space-y-4"
        >
          <div>
            <Label htmlFor="ann-title" className="text-sm font-medium">
              제목 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="ann-title"
              className="mt-1.5"
              placeholder="2027 시즌 분양 시작 안내"
              {...register('title')}
            />
            {errors.title && (
              <p className="mt-1.5 text-xs text-destructive">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="ann-content" className="text-sm font-medium">
              내용 <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="ann-content"
              className="mt-1.5 font-mono text-sm"
              rows={10}
              placeholder="안녕하세요, 여월농장입니다.&#10;&#10;**중요**: 2027 시즌 분양은 1월 1일부터..."
              {...register('content')}
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              마크다운 지원 — **굵게** _기울임_ [링크](url) - 목록
            </p>
            {errors.content && (
              <p className="mt-1.5 text-xs text-destructive">
                {errors.content.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={isPinned}
                onCheckedChange={(c) =>
                  setValue('isPinned', !!c, { shouldDirty: true })
                }
              />
              📌 핀고정 (상단 노출)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={isVisible}
                onCheckedChange={(c) =>
                  setValue('isVisible', !!c, { shouldDirty: true })
                }
              />
              👁️ 공개 (off하면 임시 비공개)
            </label>
          </div>

          {submitError && (
            <Alert variant="destructive">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '저장 중...' : '저장'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
