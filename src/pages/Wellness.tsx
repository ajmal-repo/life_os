import { useState } from 'react'
import { Plus, Flame, CheckCircle2, Circle, Archive, ToggleLeft, ToggleRight } from 'lucide-react'
import { format, subDays } from 'date-fns'
import AppShell from '@/components/Layout/AppShell'
import { Tabs } from '@/components/Common/Tabs'
import Card from '@/components/Common/Card'
import Button from '@/components/Common/Button'
import Badge from '@/components/Common/Badge'
import Modal from '@/components/Common/Modal'
import EmptyState from '@/components/Common/EmptyState'
import { Input, Select } from '@/components/Common/Input'
import { useStore } from '@/utils/store'
import { createHabit, updateHabit, logHabit, calcStreak } from '@/utils/store/wellnessOps'
import { cn } from '@/utils/helpers'
import type { HabitRoutine } from '@/types'

const DEFAULT_HABITS = [
  { title: 'Start day at 6 am', time_of_day: '06:00', routine: 'morning' as HabitRoutine },
  { title: 'Drink 1 full glass of water', time_of_day: '06:05', routine: 'morning' as HabitRoutine },
  { title: 'Read my positive affirmation', time_of_day: '06:10', routine: 'morning' as HabitRoutine },
  { title: 'Review Daily Goals', time_of_day: '06:15', routine: 'morning' as HabitRoutine },
  { title: 'Morning Exercise', time_of_day: '06:30', routine: 'morning' as HabitRoutine },
  { title: 'Deep breathing exercise', time_of_day: '07:00', routine: 'morning' as HabitRoutine },
  { title: 'Meditate for 3 minutes', time_of_day: '07:10', routine: 'morning' as HabitRoutine },
  { title: 'Listen to an Educational Video', time_of_day: '07:25', routine: 'morning' as HabitRoutine },
  { title: 'Leave for the office', time_of_day: '07:59', routine: 'morning' as HabitRoutine },
  { title: 'Follow up with leads', time_of_day: '09:00', routine: 'work' as HabitRoutine },
  { title: 'New LinkedIn Connections', time_of_day: '09:30', routine: 'work' as HabitRoutine },
  { title: 'Meet 30 new customers', time_of_day: '10:00', routine: 'work' as HabitRoutine },
  { title: 'Set out things for tomorrow', time_of_day: '21:00', routine: 'evening' as HabitRoutine },
  { title: 'Evening Review', time_of_day: '22:30', routine: 'evening' as HabitRoutine },
  { title: 'Plan Tomorrow', time_of_day: '22:40', routine: 'evening' as HabitRoutine },
  { title: 'Define the MIT for tomorrow', time_of_day: '22:50', routine: 'evening' as HabitRoutine },
]

const tabs = [
  { id: 'habits', label: 'Habits' },
  { id: 'history', label: 'History' },
]

const routineColor: Record<HabitRoutine, string> = {
  morning: 'yellow',
  work: 'blue',
  evening: 'purple',
}

export default function Wellness() {
  const [tab, setTab] = useState('habits')

  return (
    <AppShell title="Wellness">
      <Tabs tabs={tabs} active={tab} onChange={setTab} className="mb-4" />
      {tab === 'habits' && <HabitsTab />}
      {tab === 'history' && <HistoryTab />}
    </AppShell>
  )
}

function HabitsTab() {
  const { state, dispatch } = useStore()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [seedLoading, setSeedLoading] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const [form, setForm] = useState({ title: '', time_of_day: '07:00', routine: 'morning' as HabitRoutine })
  const today = format(new Date(), 'yyyy-MM-dd')

  const activeHabits = state.habits.filter((h) => h.active)
  const archivedHabits = state.habits.filter((h) => !h.active)
  const display = showArchived ? archivedHabits : activeHabits

  const grouped = {
    morning: display.filter((h) => h.routine === 'morning').sort((a, b) => a.time_of_day.localeCompare(b.time_of_day)),
    work: display.filter((h) => h.routine === 'work').sort((a, b) => a.time_of_day.localeCompare(b.time_of_day)),
    evening: display.filter((h) => h.routine === 'evening').sort((a, b) => a.time_of_day.localeCompare(b.time_of_day)),
  }

  const isDone = (habitId: string) =>
    state.habitLogs.some((l) => l.habit_id === habitId && l.date === today && l.status)

  async function toggle(habitId: string, done: boolean) {
    const log = await logHabit(habitId, new Date(), !done)
    dispatch({ type: 'UPSERT_HABIT_LOG', payload: log })
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const habit = await createHabit({ user_id: state.profile!.id, ...form, active: true })
    dispatch({ type: 'UPSERT_HABIT', payload: habit })
    setLoading(false)
    setOpen(false)
  }

  async function seedDefaults() {
    setSeedLoading(true)
    for (const h of DEFAULT_HABITS) {
      const exists = state.habits.some((ex) => ex.title === h.title)
      if (!exists) {
        const habit = await createHabit({ user_id: state.profile!.id, ...h, active: true })
        dispatch({ type: 'UPSERT_HABIT', payload: habit })
      }
    }
    setSeedLoading(false)
  }

  async function toggleArchive(id: string, active: boolean) {
    await updateHabit(id, { active: !active })
    dispatch({ type: 'UPSERT_HABIT', payload: { ...state.habits.find((h) => h.id === id)!, active: !active } })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => setShowArchived(false)} className={cn('text-sm font-medium', !showArchived ? 'text-primary-600' : 'text-slate-400')}>Active</button>
          <span className="text-slate-300">|</span>
          <button onClick={() => setShowArchived(true)} className={cn('text-sm font-medium', showArchived ? 'text-primary-600' : 'text-slate-400')}>Archived</button>
        </div>
        <div className="flex gap-2">
          {state.habits.length === 0 && (
            <Button onClick={seedDefaults} loading={seedLoading} variant="secondary" size="sm">Seed Defaults</Button>
          )}
          <Button onClick={() => setOpen(true)} icon={<Plus size={16} />} size="sm">Add Habit</Button>
        </div>
      </div>

      {(['morning', 'work', 'evening'] as HabitRoutine[]).map((routine) => {
        const habits = grouped[routine]
        if (habits.length === 0) return null
        const doneCount = habits.filter((h) => isDone(h.id)).length
        return (
          <div key={routine}>
            <div className="flex items-center gap-2 mb-2">
              <Badge color={routineColor[routine] as 'yellow' | 'blue' | 'purple'} className="capitalize">{routine}</Badge>
              <span className="text-xs text-slate-400">{doneCount}/{habits.length}</span>
            </div>
            <div className="space-y-2">
              {habits.map((habit) => {
                const done = isDone(habit.id)
                const streak = calcStreak(state.habitLogs, habit.id)
                return (
                  <Card key={habit.id} className="flex items-center gap-3 py-3">
                    <button onClick={() => toggle(habit.id, done)} className={cn('flex-shrink-0 transition-colors', done ? 'text-primary-500' : 'text-slate-300 hover:text-primary-400')}>
                      {done ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm font-medium', done && 'line-through text-slate-400')}>{habit.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-400">{habit.time_of_day}</span>
                        {streak > 0 && (
                          <span className="flex items-center gap-0.5 text-xs text-orange-500 font-bold">
                            <Flame size={10} /> {streak}d
                          </span>
                        )}
                      </div>
                    </div>
                    <button onClick={() => toggleArchive(habit.id, habit.active)} className="text-slate-300 hover:text-slate-500 transition-colors flex-shrink-0">
                      {habit.active ? <ToggleRight size={18} className="text-primary-500" /> : <ToggleLeft size={18} />}
                    </button>
                  </Card>
                )
              })}
            </div>
          </div>
        )
      })}

      {display.length === 0 && (
        <EmptyState icon={<Flame size={40} />} title={showArchived ? 'No archived habits' : 'No habits yet'} action={!showArchived ? <Button onClick={seedDefaults} loading={seedLoading}>Seed Default Habits</Button> : undefined} />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New Habit">
        <form onSubmit={handleAdd} className="space-y-4">
          <Input label="Habit Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="Single action, no conjunctions" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Time" type="time" value={form.time_of_day} onChange={(e) => setForm({ ...form, time_of_day: e.target.value })} />
            <Select label="Routine" value={form.routine} onChange={(e) => setForm({ ...form, routine: e.target.value as HabitRoutine })} options={[{ value: 'morning', label: 'Morning' }, { value: 'work', label: 'Work' }, { value: 'evening', label: 'Evening' }]} />
          </div>
          <Button type="submit" loading={loading} className="w-full justify-center">Add Habit</Button>
        </form>
      </Modal>
    </div>
  )
}

function HistoryTab() {
  const { state } = useStore()
  const days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i))
  const activeHabits = state.habits.filter((h) => h.active)

  return (
    <div className="space-y-3">
      {activeHabits.length === 0
        ? <EmptyState icon={<Archive size={40} />} title="No habits to show" />
        : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left text-xs text-slate-400 font-medium pb-3 pr-3 min-w-[140px]">Habit</th>
                  {days.map((d) => (
                    <th key={d.toISOString()} className="text-center text-xs text-slate-400 font-medium pb-3 w-10">
                      <div>{format(d, 'EEE')}</div>
                      <div className="text-slate-300">{format(d, 'd')}</div>
                    </th>
                  ))}
                  <th className="text-center text-xs text-slate-400 font-medium pb-3 w-12">Streak</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {activeHabits.map((habit) => {
                  const streak = calcStreak(state.habitLogs, habit.id)
                  return (
                    <tr key={habit.id} className="border-t border-slate-100 dark:border-slate-700">
                      <td className="py-3 pr-3">
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-200 line-clamp-1">{habit.title}</p>
                        <p className="text-[10px] text-slate-400">{habit.time_of_day}</p>
                      </td>
                      {days.map((d) => {
                        const dateStr = format(d, 'yyyy-MM-dd')
                        const log = state.habitLogs.find((l) => l.habit_id === habit.id && l.date === dateStr)
                        return (
                          <td key={dateStr} className="text-center py-3">
                            {log?.status
                              ? <CheckCircle2 size={16} className="text-primary-500 mx-auto" />
                              : <div className="w-4 h-4 rounded-full border-2 border-slate-200 dark:border-slate-600 mx-auto" />
                            }
                          </td>
                        )
                      })}
                      <td className="text-center py-3">
                        {streak > 0
                          ? <span className="flex items-center justify-center gap-0.5 text-xs text-orange-500 font-bold"><Flame size={12} />{streak}</span>
                          : <span className="text-xs text-slate-300">—</span>
                        }
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      }
    </div>
  )
}
