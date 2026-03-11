import { format } from 'date-fns'
import { Flame, CheckCircle2 } from 'lucide-react'
import { useStore } from '@/utils/store'
import { logHabit } from '@/utils/store/wellnessOps'
import { calcStreak } from '@/utils/store/wellnessOps'
import Card from '@/components/Common/Card'
import EmptyState from '@/components/Common/EmptyState'

export default function NextUpHabits() {
  const { state, dispatch } = useStore()
  const now = format(new Date(), 'HH:mm')
  const today = format(new Date(), 'yyyy-MM-dd')

  const upcoming = state.habits
    .filter((h) => h.active && h.time_of_day >= now)
    .sort((a, b) => a.time_of_day.localeCompare(b.time_of_day))
    .slice(0, 3)

  const isDone = (habitId: string) =>
    state.habitLogs.some((l) => l.habit_id === habitId && l.date === today && l.status)

  async function complete(habitId: string) {
    const log = await logHabit(habitId, new Date(), true)
    dispatch({ type: 'UPSERT_HABIT_LOG', payload: log })
  }

  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
          <Flame size={14} className="text-orange-500" />
        </div>
        <span className="font-semibold text-sm text-slate-800 dark:text-white">Next Up</span>
      </div>

      {upcoming.length === 0 ? (
        <EmptyState title="All habits done!" description="Great job today." />
      ) : (
        <div className="space-y-2">
          {upcoming.map((habit) => {
            const done = isDone(habit.id)
            const streak = calcStreak(state.habitLogs, habit.id)
            return (
              <div key={habit.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl">
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${done ? 'line-through text-slate-400' : 'text-slate-800 dark:text-white'}`}>
                    {habit.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-slate-400">{habit.time_of_day}</span>
                    {streak > 0 && (
                      <span className="flex items-center gap-0.5 text-xs text-orange-500 font-semibold">
                        <Flame size={10} /> {streak}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => !done && complete(habit.id)}
                  disabled={done}
                  className="flex-shrink-0 text-slate-300 hover:text-primary-500 disabled:cursor-default transition-colors"
                >
                  <CheckCircle2 size={22} className={done ? 'text-primary-500' : ''} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
