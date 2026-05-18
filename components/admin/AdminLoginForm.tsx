'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function AdminLoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const callbackUrl = params.get('callbackUrl') || '/admin'

  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await signIn('credentials', {
        id,
        password,
        redirect: false,
        callbackUrl,
      })
      if (!res || res.error) {
        setError('ID 또는 비밀번호가 올바르지 않습니다.')
        return
      }
      router.replace(res.url || callbackUrl)
      router.refresh()
    } catch {
      setError('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="admin-id" className="mb-1.5 block text-sm font-medium">
          관리자 ID
        </Label>
        <Input
          id="admin-id"
          type="text"
          autoComplete="username"
          enterKeyHint="next"
          required
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
      </div>

      <div>
        <Label
          htmlFor="admin-pw"
          className="mb-1.5 block text-sm font-medium"
        >
          비밀번호
        </Label>
        <Input
          id="admin-pw"
          type="password"
          autoComplete="current-password"
          enterKeyHint="go"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" size="lg" disabled={loading} className="w-full">
        {loading ? '로그인 중...' : '로그인'}
      </Button>
    </form>
  )
}
