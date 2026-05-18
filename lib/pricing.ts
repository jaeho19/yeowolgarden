/**
 * 가격·면적 계산 헬퍼.
 *
 * Zod 스키마 상수와 분리해서 두는 이유:
 *  - 서버·클라이언트 양쪽에서 import (트리쉐이킹 친화)
 *  - 추후 시즌별 가격 변동(settings 테이블) 도입 시 단일 진입점 변경
 */
export { PRICE_PER_UNIT_KRW, PYEONG_PER_UNIT, MAX_UNITS_PER_APPLICATION } from '@/lib/schemas/application'

import { PRICE_PER_UNIT_KRW, PYEONG_PER_UNIT } from '@/lib/schemas/application'

export function totalPriceKrw(desiredCount: number): number {
  return desiredCount * PRICE_PER_UNIT_KRW
}

export function totalAreaPyeong(desiredCount: number): number {
  return desiredCount * PYEONG_PER_UNIT
}

export function formatKrw(amount: number): string {
  return `${amount.toLocaleString('ko-KR')}원`
}

/**
 * 표시용: "10평 (2구획)"
 */
export function formatAreaLabel(desiredCount: number): string {
  return `${totalAreaPyeong(desiredCount)}평 (${desiredCount}구획)`
}
