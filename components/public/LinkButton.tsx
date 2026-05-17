import Link from 'next/link'
import type { ComponentProps } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type LinkProps = ComponentProps<typeof Link>
type Variant =
  | 'default'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'destructive'
  | 'link'
type Size = 'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg'

interface LinkButtonProps extends LinkProps {
  variant?: Variant
  size?: Size
}

/**
 * shadcn base-nova Button이 asChild를 지원하지 않으므로,
 * Link에 buttonVariants 클래스를 직접 적용하는 헬퍼.
 *
 * 사용:
 *   <LinkButton href="/apply" size="lg">신청하기</LinkButton>
 */
export function LinkButton({
  variant = 'default',
  size = 'default',
  className,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </Link>
  )
}
