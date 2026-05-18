/**
 * NextAuth v5 route handler.
 * 모든 NextAuth 기본 경로 (signin, signout, callback, session 등)를 처리.
 */
import { handlers } from '@/lib/auth'

export const { GET, POST } = handlers
