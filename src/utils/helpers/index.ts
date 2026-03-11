import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, isToday, isPast, differenceInDays } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, fmt = 'dd MMM yyyy'): string {
  return format(new Date(date), fmt)
}

export function formatTime(date: string | Date): string {
  return format(new Date(date), 'HH:mm')
}

export function formatCurrency(amount: number, currency = 'AED'): string {
  return new Intl.NumberFormat('en-AE', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}

export function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false
  return isPast(new Date(dueDate)) && !isToday(new Date(dueDate))
}

export function daysUntil(date: string): number {
  return differenceInDays(new Date(date), new Date())
}

export function getGreeting(name: string): string {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return `Good morning, ${name}`
  if (h >= 12 && h < 17) return `Good afternoon, ${name}`
  if (h >= 17 && h < 24) return `Good evening, ${name}`
  return `Up late, ${name}`
}

export function truncate(str: string, max = 40): string {
  return str.length > max ? str.slice(0, max) + '…' : str
}

export function avatarInitials(name: string): string {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
}

export const PRIORITY_COLORS: Record<string, string> = {
  P1: 'text-red-500 bg-red-50 border-red-200',
  P2: 'text-green-600 bg-green-50 border-green-200',
  P3: 'text-blue-500 bg-blue-50 border-blue-200',
  P4: 'text-orange-500 bg-orange-50 border-orange-200',
}

export const PRIORITY_DOT: Record<string, string> = {
  P1: 'bg-red-500',
  P2: 'bg-green-500',
  P3: 'bg-blue-500',
  P4: 'bg-orange-500',
}
