'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  LookupInputSchema,
  type LookupInput,
} from '@/lib/schemas/application'
import type { LookupResult } from '@/lib/applications'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ApplicationStatusCard } from '@/components/public/ApplicationStatusCard'

export function LookupForm() {
  const router = useRouter()
  const params = useSearchParams()
  const prefillNumber = params.get('number') ?? ''

  const [result, setResult] = useState<LookupResult | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LookupInput>({
    resolver: zodResolver(LookupInputSchema),
    defaultValues: {
      applicationNumber: prefillNumber ? Number(prefillNumber) : 0,
      email: '',
    },
  })

  const onSubmit = async (data: LookupInput) => {
    setSubmitError(null)
    setResult(null)
    try {
      const qs = new URLSearchParams({
        number: String(data.applicationNumber),
        email: data.email,
      })
      const res = await fetch(`/api/applications/lookup?${qs}`, {
        cache: 'no-store',
      })
      const json = await res.json()

      if (!res.ok) {
        setSubmitError(
          json?.error?.message ??
            '조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        )
        return
      }

      setResult(json as LookupResult)
      // URL에 신청번호 반영 (이메일은 노출하지 않음)
      startTransition(() => {
        router.replace(`/apply/status?number=${data.applicationNumber}`, {
          scroll: false,
        })
      })
    } catch {
      setSubmitError('네트워크 오류가 발생했습니다.')
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <Label
            htmlFor="lookup-number"
            className="mb-1.5 block text-sm font-medium"
          >
            신청번호 <span className="ml-1 text-destructive">*</span>
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-muted-foreground">
              #
            </span>
            <Input
              id="lookup-number"
              type="number"
              inputMode="numeric"
              placeholder="1234"
              min={1}
              className="flex-1"
              {...register('applicationNumber', { valueAsNumber: true })}
            />
          </div>
          {errors.applicationNumber && (
            <p className="mt-1.5 text-xs text-destructive">
              {errors.applicationNumber.message}
            </p>
          )}
        </div>

        <div>
          <Label
            htmlFor="lookup-email"
            className="mb-1.5 block text-sm font-medium"
          >
            이메일 <span className="ml-1 text-destructive">*</span>
          </Label>
          <Input
            id="lookup-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="신청 시 입력한 이메일"
            {...register('email')}
          />
          {errors.email && (
            <p className="mt-1.5 text-xs text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        {submitError && (
          <Alert variant="destructive">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting || isPending}
          className="w-full"
        >
          {isSubmitting ? '조회 중...' : '조회하기'}
        </Button>

        <p className="text-center text-xs text-muted-foreground leading-relaxed">
          ⓘ 신청번호는 신청 완료 화면에 표시되었습니다.
          <br />
          분실 시 운영자에게 문의해주세요.
        </p>
      </form>

      {result && (
        <div className="pt-2">
          <ApplicationStatusCard result={result} />
        </div>
      )}
    </div>
  )
}
