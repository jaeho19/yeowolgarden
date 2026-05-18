/**
 * NextAuth v5 — Credentials + bcrypt 단일 관리자 계정.
 *
 * - ID: process.env.ADMIN_ID (default "adminyeowol")
 * - PW: bcrypt 해시(process.env.ADMIN_PASSWORD_HASH) 와 일치 검증
 * - 세션: JWT (서버 ENV NEXTAUTH_SECRET / AUTH_SECRET)
 * - 보호 라우트: /admin/*, /api/admin/* — middleware.ts에서 처리
 *
 * 참고: docs/02-design/features/yeowol-farm-website.design.md §7.4
 */
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

const ADMIN_ID = process.env.ADMIN_ID ?? 'adminyeowol'
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH ?? ''

export const { handlers, auth, signIn, signOut } = NextAuth({
  basePath: '/api/admin/auth',
  trustHost: true,
  session: {
    strategy: 'jwt',
    maxAge: 12 * 60 * 60, // 12시간
  },
  pages: {
    signIn: '/admin/login',
  },
  providers: [
    Credentials({
      name: 'admin',
      credentials: {
        id: { label: 'ID', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const id = String(credentials?.id ?? '').trim()
        const password = String(credentials?.password ?? '')

        if (!id || !password) return null
        if (id !== ADMIN_ID) {
          // ID 불일치도 bcrypt 호출하여 응답 시간 노출 방지
          await bcrypt.compare(
            password,
            '$2b$12$0000000000000000000000.0000000000000000000000000000'
          )
          return null
        }
        if (!ADMIN_PASSWORD_HASH) {
          console.warn('[auth] ADMIN_PASSWORD_HASH is not set')
          return null
        }
        const ok = await bcrypt.compare(password, ADMIN_PASSWORD_HASH)
        if (!ok) return null

        return {
          id: 'admin',
          name: '운영자',
          email: `${id}@yeowolfarm.local`,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = 'admin'
      }
      return token
    },
    async session({ session, token }) {
      if (token?.role) {
        ;(session.user as { role?: string }).role = String(token.role)
      }
      return session
    },
    async authorized({ auth: session, request }) {
      const path = request.nextUrl.pathname
      const isAdminPath =
        path.startsWith('/admin') || path.startsWith('/api/admin')
      const isLoginPath =
        path === '/admin/login' || path.startsWith('/api/admin/auth')
      if (!isAdminPath || isLoginPath) return true
      return !!session?.user
    },
  },
})
