/**
 * 도메인 에러.
 * API Route에서 catch → 적절한 HTTP 코드로 변환.
 */
export type ErrorCode =
  | 'VALIDATION_FAILED'
  | 'DUPLICATE_APPLICATION'
  | 'RECRUITMENT_CLOSED'
  | 'NOT_FOUND'
  | 'LOOKUP_NOT_FOUND'
  | 'LOOKUP_RATE_LIMITED'
  | 'APPLY_RATE_LIMITED'
  | 'HONEYPOT_TRIGGERED'
  | 'ALREADY_CONFIRMED'
  | 'ALREADY_HAS_PLOTS'
  | 'NO_CONTIGUOUS_GROUP'
  | 'INTERNAL_ERROR'

export class DomainError extends Error {
  constructor(
    public code: ErrorCode,
    message?: string,
    public status: number = 400
  ) {
    super(message ?? code)
    this.name = 'DomainError'
  }
}

export class ConflictError extends DomainError {
  constructor(code: ErrorCode, message?: string) {
    super(code, message, 409)
    this.name = 'ConflictError'
  }
}

export class NotFoundError extends DomainError {
  constructor(code: ErrorCode = 'NOT_FOUND', message?: string) {
    super(code, message, 404)
    this.name = 'NotFoundError'
  }
}
