'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ApplicationInputSchema,
  type ApplicationInput,
  MAX_UNITS_PER_APPLICATION,
} from '@/lib/schemas/application'
import { totalPriceKrw, totalAreaPyeong, formatKrw } from '@/lib/pricing'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

interface ApiSuccess {
  applicationNumber: number
  totalPriceKrw: number
}

interface ApiError {
  error: { code: string; message: string }
}

export function ApplyForm() {
  const router = useRouter()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationInput>({
    resolver: zodResolver(ApplicationInputSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      desiredCount: 1,
      experience: '',
      memo: '',
      privacyAgreed: false as unknown as true,
      website: '',
    },
  })

  const desiredCount = Number(watch('desiredCount') ?? 1)
  const privacyAgreed = watch('privacyAgreed')

  const onSubmit = async (data: ApplicationInput) => {
    setSubmitError(null)
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json: ApiSuccess | ApiError = await res.json()

      if (!res.ok) {
        const err = json as ApiError
        setSubmitError(err.error?.message ?? '신청 처리 중 오류가 발생했습니다.')
        return
      }

      const ok = json as ApiSuccess
      router.push(`/apply/success?number=${ok.applicationNumber}`)
    } catch {
      setSubmitError('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-6"
      aria-label="분양 신청 폼"
    >
      {/* Honeypot — 시각적으로 숨김 + tab-index out */}
      <div
        aria-hidden
        className="absolute left-[-9999px] h-0 w-0 overflow-hidden"
      >
        <label>
          이 칸은 비워두세요
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...register('website')}
          />
        </label>
      </div>

      {/* 이름 */}
      <FormField
        label="이름"
        required
        error={errors.name?.message}
        htmlFor="apply-name"
      >
        <Input
          id="apply-name"
          autoComplete="name"
          placeholder="홍길동"
          {...register('name')}
        />
      </FormField>

      {/* 휴대폰 */}
      <FormField
        label="휴대폰 번호"
        required
        error={errors.phone?.message}
        htmlFor="apply-phone"
        help="010-1234-5678"
      >
        <Input
          id="apply-phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="010-1234-5678"
          {...register('phone')}
        />
      </FormField>

      {/* 이메일 */}
      <FormField
        label="이메일"
        required
        error={errors.email?.message}
        htmlFor="apply-email"
        help="본인 조회 시 사용되니 정확히 입력해주세요"
      >
        <Input
          id="apply-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...register('email')}
        />
      </FormField>

      {/* 신청 구좌 수 */}
      <FormField
        label="신청 구좌 수"
        required
        error={errors.desiredCount?.message}
        htmlFor="apply-count"
        help={`구획당 5평 · 100,000원 / 1~${MAX_UNITS_PER_APPLICATION}구좌까지 신청 가능 (5구좌 이상은 "기타"를 누른 뒤 직접 입력)`}
      >
        <div className="flex items-center gap-3">
          <Input
            id="apply-count"
            type="number"
            inputMode="numeric"
            min={1}
            max={MAX_UNITS_PER_APPLICATION}
            className="w-28"
            {...register('desiredCount', { valueAsNumber: true })}
          />
          <span className="text-sm text-muted-foreground">구좌</span>
        </div>
        <UnitsQuickButtons
          value={desiredCount}
          onChange={(n) =>
            setValue('desiredCount', n, { shouldValidate: true })
          }
        />
        {desiredCount >= 5 && (
          <p className="mt-2 text-xs text-muted-foreground">
            ⓘ 5구좌 이상은 인접 묶음 상황에 따라 운영자와 협의 후 배정될 수
            있습니다.
          </p>
        )}
      </FormField>

      {/* 가격 미리보기 */}
      <div className="rounded-xl border border-brand-200 bg-brand-50/40 p-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <p className="text-xs text-muted-foreground">신청 면적</p>
            <p className="mt-0.5 text-lg font-semibold">
              {totalAreaPyeong(desiredCount || 0)}평
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({desiredCount || 0}구획)
              </span>
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs text-muted-foreground">예상 결제 금액</p>
            <p className="mt-0.5 text-2xl font-bold text-brand-700">
              {formatKrw(totalPriceKrw(desiredCount || 0))}
            </p>
          </div>
        </div>
      </div>

      {/* 텃밭 경험 */}
      <FormField
        label="텃밭 경험 (선택)"
        error={errors.experience?.message}
        htmlFor="apply-experience"
      >
        <Textarea
          id="apply-experience"
          placeholder="예: 텃밭 3년차 / 처음입니다 / 가족과 함께"
          rows={2}
          {...register('experience')}
        />
      </FormField>

      {/* 메모 */}
      <FormField
        label="요청 메모 (선택)"
        error={errors.memo?.message}
        htmlFor="apply-memo"
        help="입금자명이 본인과 다르거나, 희망 사항이 있으면 적어주세요"
      >
        <Textarea
          id="apply-memo"
          placeholder="예: 입금자명 '홍길순' / 입구 근처 희망"
          rows={3}
          {...register('memo')}
        />
      </FormField>

      {/* 개인정보 동의 */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            id="apply-privacy"
            checked={!!privacyAgreed}
            onCheckedChange={(checked) =>
              setValue(
                'privacyAgreed',
                checked as unknown as true,
                { shouldValidate: true }
              )
            }
          />
          <div className="flex-1">
            <Label
              htmlFor="apply-privacy"
              className="cursor-pointer text-sm leading-relaxed"
            >
              <span className="font-medium">개인정보 처리에 동의합니다</span>{' '}
              <span className="text-muted-foreground">(필수)</span>
            </Label>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              수집 항목: 이름·휴대폰·이메일·메모 · 보유 기간: 시즌 종료 후 6개월 ·{' '}
              <Link
                href="/privacy"
                className="text-brand-700 underline"
                target="_blank"
              >
                전문 보기
              </Link>
            </p>
            {errors.privacyAgreed && (
              <p className="mt-2 text-xs text-destructive">
                {errors.privacyAgreed.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 제출 에러 */}
      {submitError && (
        <Alert variant="destructive">
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      {/* 제출 버튼 */}
      <div className="flex flex-col gap-3 sm:flex-row-reverse">
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting
            ? '신청 처리 중...'
            : `${formatKrw(totalPriceKrw(desiredCount || 0))} 신청하기 →`}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          취소
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        제출 후 다음 화면에서 신청번호와 계좌가 안내됩니다.
      </p>
    </form>
  )
}

/* ─── 작은 컴포넌트 (이 파일 내부 전용) ─── */

function FormField({
  label,
  required,
  error,
  help,
  htmlFor,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  help?: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div>
      <Label
        htmlFor={htmlFor}
        className={cn('mb-1.5 block text-sm font-medium')}
      >
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {children}
      {help && !error && (
        <p className="mt-1.5 text-xs text-muted-foreground">{help}</p>
      )}
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  )
}

function UnitsQuickButtons({
  value,
  onChange,
}: {
  value: number
  onChange: (n: number) => void
}) {
  const presets = [1, 2, 3, 4]
  const isOther = Number.isFinite(value) && value >= 5

  const handleOtherClick = () => {
    // 현재 value가 5 미만이면 5로 시작 — 사용자가 곧 input에서 자유롭게 수정
    if (!isOther) onChange(5)
    // 숫자 input에 포커스 + 선택 (덮어쓰기 쉽도록)
    const el = document.getElementById('apply-count') as HTMLInputElement | null
    if (el) {
      el.focus()
      el.select()
    }
  }

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {presets.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={cn(
            'rounded-md border px-3 py-1 text-xs transition',
            value === n
              ? 'border-brand-500 bg-brand-500 text-white'
              : 'border-border bg-card text-muted-foreground hover:bg-accent'
          )}
        >
          {n}구좌 ({n * 5}평)
        </button>
      ))}
      <button
        type="button"
        onClick={handleOtherClick}
        className={cn(
          'rounded-md border px-3 py-1 text-xs transition',
          isOther
            ? 'border-brand-500 bg-brand-500 text-white'
            : 'border-dashed border-border bg-card text-muted-foreground hover:bg-accent'
        )}
        aria-label="5구좌 이상 직접 입력"
      >
        {isOther ? `기타 (${value}구좌)` : '기타 (5구좌+)'}
      </button>
    </div>
  )
}
