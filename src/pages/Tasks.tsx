import { useState, lazy, Suspense } from 'react'
import { Plus, CheckSquare } from 'lucide-react'
import { isToday, isPast } from 'date-fns'
import AppShell from '@/components/Layout/AppShell'
import { Tabs } from '@/components/Common/Tabs'
import TaskCard from '@/components/Tasks/TaskCard'
import Modal from '@/components/Common/Modal'
import Button from '@/components/Common/Button'
import EmptyState from '@/components/Common/EmptyState'
import { useStore } from '@/utils/store'
import type { Task, TaskArea } from '@/types'

const TaskForm = lazy(() => import('@/components/Tasks/TaskForm'))

const AREAS: TaskArea[] = ['Inbox', 'Professional', 'Financial', 'Wellness', 'Relationship', 'Personal', 'Vision']

const tabs = [
  { id: 'today', label: 'Today' },
  { id: 'inbox', label: 'Inbox' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'projects', label: 'Projects' },
]

export default function Tasks() {
  const { state } = useStore()
  const [tab, setTab] = useState('today')
  const [modalOpen, setModalOpen] = useState(false)
  const [editTask, setEditTask] = useState<Task | undefined>()

  const userId = state.profile?.id ?? ''
  const pending = state.tasks.filter((t) => t.status === 'todo')

  const todayTasks = pending
    .filter((t) => t.due_date && (isToday(new Date(t.due_date)) || isPast(new Date(t.due_date))))
    .sort((a, b) => {
      const aOverdue = a.due_date && isPast(new Date(a.due_date)) && !isToday(new Date(a.due_date))
      const bOverdue = b.due_date && isPast(new Date(b.due_date)) && !isToday(new Date(b.due_date))
      if (aOverdue && !bOverdue) return -1
      if (!aOverdue && bOverdue) return 1
      return (a.due_date ?? '').localeCompare(b.due_date ?? '')
    })

  const inboxTasks = pending.filter((t) => !t.project_id)
  const upcomingTasks = pending
    .filter((t) => t.due_date && !isPast(new Date(t.due_date)))
    .sort((a, b) => (a.due_date ?? '').localeCompare(b.due_date ?? ''))

  function openAdd() { setEditTask(undefined); setModalOpen(true) }
  function openEdit(task: Task) { setEditTask(task); setModalOpen(true) }

  return (
    <AppShell title="Tasks">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">{pending.length} pending</p>
        <Button onClick={openAdd} icon={<Plus size={16} />} size="sm">Add Task</Button>
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} className="mb-4" />

      {tab === 'today' && (
        <TaskList tasks={todayTasks} onEdit={openEdit} emptyMsg="Nothing due today — great!" />
      )}

      {tab === 'inbox' && (
        <TaskList tasks={inboxTasks} onEdit={openEdit} emptyMsg="Inbox zero!" />
      )}

      {tab === 'upcoming' && (
        <TaskList tasks={upcomingTasks} onEdit={openEdit} emptyMsg="No upcoming tasks" />
      )}

      {tab === 'projects' && (
        <div className="space-y-6">
          {AREAS.map((area) => {
            const projects = state.projects.filter((p) => p.area === area)
            const areaTasks = pending.filter((t) => t.area === area && !t.project_id)
            if (projects.length === 0 && areaTasks.length === 0) return null
            return (
              <div key={area}>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{area}</h3>
                {areaTasks.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {areaTasks.map((t) => <TaskCard key={t.id} task={t} onEdit={openEdit} />)}
                  </div>
                )}
                {projects.map((project) => {
                  const projectTasks = pending.filter((t) => t.project_id === project.id)
                  return (
                    <div key={project.id} className="ml-2 mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: project.color }} />
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{project.title}</span>
                        <span className="text-xs text-slate-400">({projectTasks.length})</span>
                      </div>
                      {projectTasks.length > 0
                        ? <div className="space-y-2">{projectTasks.map((t) => <TaskCard key={t.id} task={t} onEdit={openEdit} />)}</div>
                        : <p className="text-xs text-slate-400 pl-4">No tasks</p>
                      }
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTask ? 'Edit Task' : 'New Task'}
      >
        <Suspense fallback={<div className="h-40 flex items-center justify-center text-slate-400">Loading…</div>}>
          <TaskForm
            task={editTask}
            userId={userId}
            onDone={() => setModalOpen(false)}
          />
        </Suspense>
      </Modal>
    </AppShell>
  )
}

function TaskList({ tasks, onEdit, emptyMsg }: { tasks: Task[]; onEdit: (t: Task) => void; emptyMsg: string }) {
  if (tasks.length === 0) {
    return <EmptyState icon={<CheckSquare size={40} />} title={emptyMsg} />
  }
  return (
    <div className="space-y-2">
      {tasks.map((t) => <TaskCard key={t.id} task={t} onEdit={onEdit} />)}
    </div>
  )
}
