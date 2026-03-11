import { useState, useRef } from 'react'
import { CheckCircle2, Circle, Trash2, Star, ChevronRight } from 'lucide-react'
import type { Task } from '@/types'
import { PRIORITY_DOT, formatDate, isOverdue, cn } from '@/utils/helpers'
import { completeTask, deleteTask, updateTask } from '@/utils/store/taskOps'
import { useStore } from '@/utils/store'
import Badge from '@/components/Common/Badge'

interface TaskCardProps {
  task: Task
  onEdit?: (task: Task) => void
}

export default function TaskCard({ task, onEdit }: TaskCardProps) {
  const { dispatch, state } = useStore()
  const [swiping, setSwiping] = useState(false)
  const [swipeX, setSwipeX] = useState(0)
  const startX = useRef(0)

  const project = state.projects.find((p) => p.id === task.project_id)
  const overdue = isOverdue(task.due_date)

  async function handleComplete() {
    await completeTask(task)
    dispatch({ type: 'DELETE_TASK', payload: task.id })
  }

  async function handleDelete() {
    await deleteTask(task.id)
    dispatch({ type: 'DELETE_TASK', payload: task.id })
  }

  async function toggleFocus() {
    const focusCount = state.tasks.filter((t) => t.is_today_focus && t.status === 'todo').length
    if (!task.is_today_focus && focusCount >= 3) {
      alert('You can only have 3 Today\'s Focus tasks.')
      return
    }
    await updateTask(task.id, { is_today_focus: !task.is_today_focus })
    dispatch({ type: 'UPSERT_TASK', payload: { ...task, is_today_focus: !task.is_today_focus } })
  }

  // Touch swipe handlers
  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    setSwiping(true)
  }
  const onTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - startX.current
    setSwipeX(Math.max(-80, Math.min(80, dx)))
  }
  const onTouchEnd = () => {
    setSwiping(false)
    if (swipeX > 50) handleComplete()
    else if (swipeX < -50) handleDelete()
    setSwipeX(0)
  }

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Swipe action bg */}
      <div className="absolute inset-y-0 left-0 right-0 flex">
        <div className="flex-1 bg-primary-500 flex items-center pl-4">
          <CheckCircle2 size={20} className="text-white" />
        </div>
        <div className="w-20 bg-red-500 flex items-center justify-center">
          <Trash2 size={20} className="text-white" />
        </div>
      </div>

      {/* Card */}
      <div
        style={{ transform: `translateX(${swipeX}px)`, transition: swiping ? 'none' : 'transform 0.2s' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className={cn(
          'relative bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-3.5 flex items-start gap-3',
          task.status === 'completed' && 'opacity-60'
        )}
      >
        {/* Complete button */}
        <button
          onClick={handleComplete}
          className="flex-shrink-0 mt-0.5 text-slate-300 hover:text-primary-500 transition-colors"
        >
          {task.status === 'completed'
            ? <CheckCircle2 size={20} className="text-primary-500" />
            : <Circle size={20} />
          }
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0" onClick={() => onEdit?.(task)}>
          <div className="flex items-start gap-2">
            <div className={cn('w-2 h-2 rounded-full flex-shrink-0 mt-1.5', PRIORITY_DOT[task.priority])} />
            <p className={cn('text-sm font-medium text-slate-800 dark:text-white', task.status === 'completed' && 'line-through')}>
              {task.title}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-xs text-slate-400">{task.area}</span>
            {project && (
              <Badge color="blue" className="text-[10px]">{project.title}</Badge>
            )}
            {task.due_date && (
              <span className={cn('text-xs font-medium', overdue ? 'text-red-500' : 'text-slate-400')}>
                {overdue ? 'Overdue · ' : ''}{formatDate(task.due_date, 'd MMM')}
              </span>
            )}
            {task.recurrence !== 'none' && (
              <Badge color="gray" className="text-[10px]">{task.recurrence}</Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={toggleFocus} className={cn('p-1 rounded-lg transition-colors', task.is_today_focus ? 'text-yellow-400' : 'text-slate-300 hover:text-yellow-400')}>
            <Star size={14} fill={task.is_today_focus ? 'currentColor' : 'none'} />
          </button>
          <button onClick={() => onEdit?.(task)} className="p-1 text-slate-300 hover:text-slate-500">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
