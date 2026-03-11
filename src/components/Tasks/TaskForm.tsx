import { useState } from 'react'
import type { Task, TaskArea, TaskPriority, TaskRecurrence } from '@/types'
import { Input, Select, Textarea } from '@/components/Common/Input'
import Button from '@/components/Common/Button'
import { useStore } from '@/utils/store'
import { createTask, updateTask } from '@/utils/store/taskOps'

const AREAS: TaskArea[] = ['Inbox', 'Professional', 'Financial', 'Wellness', 'Relationship', 'Personal', 'Vision']
const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: 'P1', label: 'P1 — Critical' },
  { value: 'P2', label: 'P2 — High' },
  { value: 'P3', label: 'P3 — Medium' },
  { value: 'P4', label: 'P4 — Low' },
]
const RECURRENCES: { value: TaskRecurrence; label: string }[] = [
  { value: 'none', label: 'No recurrence' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

interface TaskFormProps {
  task?: Task
  userId: string
  onDone: () => void
}

export default function TaskForm({ task, userId, onDone }: TaskFormProps) {
  const { state, dispatch } = useStore()
  const [title, setTitle] = useState(task?.title ?? '')
  const [area, setArea] = useState<TaskArea>(task?.area ?? 'Inbox')
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'P3')
  const [projectId, setProjectId] = useState(task?.project_id ?? '')
  const [connectionId, setConnectionId] = useState(task?.connection_id ?? '')
  const [dueDate, setDueDate] = useState(task?.due_date ? task.due_date.slice(0, 16) : '')
  const [recurrence, setRecurrence] = useState<TaskRecurrence>(task?.recurrence ?? 'none')
  const [notes, setNotes] = useState(task?.notes ?? '')
  const [loading, setLoading] = useState(false)

  const projects = state.projects.filter((p) => p.area === area)
  const connections = state.connections

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    try {
      const payload = {
        user_id: userId,
        title: title.trim(),
        area,
        project_id: projectId || null,
        connection_id: connectionId || null,
        priority,
        due_date: dueDate || null,
        is_today_focus: task?.is_today_focus ?? false,
        status: task?.status ?? 'todo' as const,
        recurrence,
        notes: notes || null,
      }
      if (task) {
        await updateTask(task.id, payload)
        dispatch({ type: 'UPSERT_TASK', payload: { ...task, ...payload } })
      } else {
        const newTask = await createTask(payload)
        dispatch({ type: 'UPSERT_TASK', payload: newTask })
      }
      onDone()
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Task Title"
        placeholder="What needs to be done?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        autoFocus
      />

      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Area"
          value={area}
          onChange={(e) => setArea(e.target.value as TaskArea)}
          options={AREAS.map((a) => ({ value: a, label: a }))}
        />
        <Select
          label="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as TaskPriority)}
          options={PRIORITIES}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Due Date"
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <Select
          label="Recurrence"
          value={recurrence}
          onChange={(e) => setRecurrence(e.target.value as TaskRecurrence)}
          options={RECURRENCES}
        />
      </div>

      {projects.length > 0 && (
        <Select
          label="Project (optional)"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          options={projects.map((p) => ({ value: p.id, label: p.title }))}
          placeholder="No project"
        />
      )}

      {connections.length > 0 && (
        <Select
          label="Link to Connection (optional)"
          value={connectionId}
          onChange={(e) => setConnectionId(e.target.value)}
          options={connections.map((c) => ({ value: c.id, label: c.full_name }))}
          placeholder="No connection"
        />
      )}

      <Textarea
        label="Notes"
        placeholder="Additional context…"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
      />

      <div className="flex gap-3 pt-1">
        <Button type="submit" loading={loading} className="flex-1 justify-center">
          {task ? 'Save Changes' : 'Add Task'}
        </Button>
      </div>
    </form>
  )
}
