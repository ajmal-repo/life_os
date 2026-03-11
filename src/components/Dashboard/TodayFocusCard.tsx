import { Target, CheckCircle2, Circle } from 'lucide-react'
import { useStore } from '@/utils/store'
import { updateTask } from '@/utils/store/taskOps'
import { PRIORITY_DOT, cn } from '@/utils/helpers'
import Card from '@/components/Common/Card'
import EmptyState from '@/components/Common/EmptyState'

export default function TodayFocusCard() {
  const { state, dispatch } = useStore()
  const focusTasks = state.tasks.filter((t) => t.is_today_focus && t.status === 'todo').slice(0, 3)

  async function toggle(id: string) {
    await updateTask(id, { status: 'completed', is_today_focus: false })
    dispatch({ type: 'DELETE_TASK', payload: id })
  }

  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
          <Target size={14} className="text-primary-600 dark:text-primary-400" />
        </div>
        <span className="font-semibold text-sm text-slate-800 dark:text-white">Today's Focus</span>
        <span className="ml-auto text-xs text-slate-400">{focusTasks.length}/3</span>
      </div>

      {focusTasks.length === 0 ? (
        <EmptyState title="No focus tasks" description="Mark up to 3 tasks as today's focus" />
      ) : (
        <div className="space-y-2">
          {focusTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl"
            >
              <button onClick={() => toggle(task.id)} className="flex-shrink-0 text-slate-400 hover:text-primary-500 transition-colors">
                {task.status === 'completed'
                  ? <CheckCircle2 size={20} className="text-primary-500" />
                  : <Circle size={20} />
                }
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{task.title}</p>
                <p className="text-xs text-slate-400">{task.area}</p>
              </div>
              <div className={cn('w-2 h-2 rounded-full flex-shrink-0', PRIORITY_DOT[task.priority])} />
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
