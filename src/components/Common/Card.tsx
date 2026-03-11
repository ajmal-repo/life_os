import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/helpers'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddings = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-6' }

export default function Card({ children, className, padding = 'md', ...props }: CardProps) {
  return (
    <div className={cn('card', paddings[padding], className)} {...props}>
      {children}
    </div>
  )
}
