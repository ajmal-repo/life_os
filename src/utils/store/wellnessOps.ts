import { supabase } from '@/lib/supabase'
import { enqueue } from './syncQueue'
import type { Habit, HabitLog } from '@/types'
import { format } from 'date-fns'

// Habits
export async function createHabit(h: Omit<Habit, 'id' | 'created_at'>): Promise<Habit> {
  const item: Habit = { ...h, id: crypto.randomUUID(), created_at: new Date().toISOString() }
  const { data, error } = await supabase.from('habits').insert(item).select().single()
  if (error) { enqueue('habits', 'INSERT', item as unknown as Record<string, unknown>); return item }
  return data as Habit
}

export async function updateHabit(id: string, patch: Partial<Habit>): Promise<void> {
  const { error } = await supabase.from('habits').update(patch).eq('id', id)
  if (error) enqueue('habits', 'UPDATE', { id, ...patch } as Record<string, unknown>)
}

export async function deleteHabit(id: string): Promise<void> {
  const { error } = await supabase.from('habits').delete().eq('id', id)
  if (error) enqueue('habits', 'DELETE', { id })
}

// Habit Logs
export async function logHabit(habitId: string, date: Date, status: boolean): Promise<HabitLog> {
  const dateStr = format(date, 'yyyy-MM-dd')

  // Cannot log future dates
  if (date > new Date()) throw new Error('Cannot log future dates')

  const log: HabitLog = { id: crypto.randomUUID(), habit_id: habitId, date: dateStr, status }

  const { data, error } = await supabase
    .from('habit_logs')
    .upsert({ ...log }, { onConflict: 'habit_id,date' })
    .select()
    .single()

  if (error) { enqueue('habit_logs', 'INSERT', log as unknown as Record<string, unknown>); return log }
  return data as HabitLog
}

// Streak calculation
export function calcStreak(logs: HabitLog[], habitId: string): number {
  const habitLogs = logs
    .filter((l) => l.habit_id === habitId && l.status)
    .map((l) => l.date)
    .sort()
    .reverse()

  if (habitLogs.length === 0) return 0

  let streak = 0
  const today = format(new Date(), 'yyyy-MM-dd')
  let check = today

  for (const date of habitLogs) {
    if (date === check) {
      streak++
      const d = new Date(check)
      d.setDate(d.getDate() - 1)
      check = format(d, 'yyyy-MM-dd')
    } else {
      break
    }
  }
  return streak
}
