import type { ReactNode } from 'react'
import { cn } from '@/utils/helpers'

interface BadgeProps {
  children: ReactNode
  color?: 'green' | 'red' | 'blue' | 'orange' | 'gray' | 'yellow' | 'purple'
  className?: string
}

const colors = {
  green:  'bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-400',
  red:    'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400',
  blue:   'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400',
  orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  gray:   'bg-slate-100  text-slate-600  dark:bg-slate-700     dark:text-slate-300',
  yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
}

export default function Badge({ children, color = 'gray', className }: BadgeProps) {
  return (
    <span className={cn('badge', colors[color], className)}>{children}</span>
  )
}
