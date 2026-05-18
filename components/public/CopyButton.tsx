'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CopyButtonProps {
  text: string
  label?: string
  copiedLabel?: string
  size?: 'sm' | 'default'
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  className?: string
}

export function CopyButton({
  text,
  label = '복사',
  copiedLabel = '복사됨',
  size = 'sm',
  variant = 'outline',
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // 클립보드 API 실패 시 fallback — textarea 선택
      const ta = document.createElement('textarea')
      ta.value = text
      ta.setAttribute('readonly', '')
      ta.style.position = 'absolute'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.select()
      try {
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
      } catch {
        // 무시 — 사용자가 수동 복사
      } finally {
        document.body.removeChild(ta)
      }
    }
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      size={size}
      variant={variant}
      aria-label={copied ? copiedLabel : label}
      className={cn('gap-1.5', className)}
    >
      {copied ? (
        <>
          <Check className="size-4" /> {copiedLabel}
        </>
      ) : (
        <>
          <Copy className="size-4" /> {label}
        </>
      )}
    </Button>
  )
}
