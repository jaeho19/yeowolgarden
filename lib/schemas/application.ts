/**
 * Zod 스키마 — 신청·조회 입력 검증
 * 클라이언트(react-hook-form)와 서버(API Route) 양쪽에서 동일 스키마 사용.
 *
 * 참고: docs/02-design/features/yeowol-farm-website.design.md §3.1
 */
import { z } from 'zod'

/* ─── 상수 (가격 정책) ─── */
export const PRICE_PER_UNIT_KRW = 100_000
export const PYEONG_PER_UNIT = 5
export const MAX_UNITS_PER_APPLICATION = 20 // UI 상한 (시스템적으로는 무제한)

/* ─── Enum (Drizzle schema와 일치) ─── */
export const APPLICATION_STATUS = [
  'PENDING',
  'PAID',
  'CONFIRMED',
  'REJECTED',
  'CANCELLED',
] as const

export const PLOT_STATUS = ['AVAILABLE', 'RESERVED', 'OCCUPIED'] as const

export const ApplicationStatusEnum = z.enum(APPLICATION_STATUS)
export const PlotStatusEnum = z.enum(PLOT_STATUS)

export type ApplicationStatus = z.infer<typeof ApplicationStatusEnum>
export type PlotStatus = z.infer<typeof PlotStatusEnum>

/* ─── 신청 입력 (POST /api/applications) ─── */
export const ApplicationInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, '이름은 2자 이상 입력해주세요')
    .max(50, '이름은 50자 이내로 입력해주세요'),
  phone: z
    .string()
    .trim()
    .regex(/^01[016789]-?\d{3,4}-?\d{4}$/, '휴대폰 번호 형식을 확인해주세요'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('이메일 형식을 확인해주세요'),
  desiredCount: z
    .number()
    .int()
    .min(1, '최소 1구획 이상 선택해주세요')
    .max(
      MAX_UNITS_PER_APPLICATION,
      `최대 ${MAX_UNITS_PER_APPLICATION}구획까지 신청 가능합니다`
    ),
  experience: z.string().max(500).optional().or(z.literal('')),
  memo: z.string().max(500).optional().or(z.literal('')),
  privacyAgreed: z.literal(true, {
    message: '개인정보 처리에 동의해주세요',
  }),
  // honeypot — bot이 채우면 무효 처리
  website: z.string().max(0).optional().or(z.literal('')),
})

export type ApplicationInput = z.infer<typeof ApplicationInputSchema>

/* ─── 본인 조회 입력 (GET /api/applications/lookup) ─── */
export const LookupInputSchema = z.object({
  applicationNumber: z
    .number()
    .int()
    .positive('신청번호를 확인해주세요'),
  email: z.string().trim().toLowerCase().email('이메일 형식을 확인해주세요'),
})

export type LookupInput = z.infer<typeof LookupInputSchema>

/* ─── 가격 계산 헬퍼 ─── */
export function calculateTotalPrice(desiredCount: number): number {
  return desiredCount * PRICE_PER_UNIT_KRW
}

export function calculateTotalPyeong(desiredCount: number): number {
  return desiredCount * PYEONG_PER_UNIT
}
