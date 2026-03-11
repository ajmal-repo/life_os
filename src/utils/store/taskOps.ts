import { supabase } from '@/lib/supabase'
import { enqueue } from './syncQueue'
import type { Task, Project } from '@/types'

// Tasks
export async function createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
  const newTask: Task = { ...task, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  const { data, error } = await supabase.from('tasks').insert(newTask).select().single()
  if (error) { enqueue('tasks', 'INSERT', newTask as unknown as Record<string, unknown>); return newTask }
  return data as Task
}

export async function updateTask(id: string, patch: Partial<Task>): Promise<void> {
  const updated = { ...patch, updated_at: new Date().toISOString() }
  const { error } = await supabase.from('tasks').update(updated).eq('id', id)
  if (error) enqueue('tasks', 'UPDATE', { id, ...updated } as Record<string, unknown>)
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) enqueue('tasks', 'DELETE', { id })
}

export async function completeTask(task: Task): Promise<void> {
  await updateTask(task.id, { status: 'completed' })
  if (task.recurrence !== 'none') {
    const nextDue = getNextDue(task)
    await createTask({ ...task, status: 'todo', due_date: nextDue, is_today_focus: false })
  }
}

function getNextDue(task: Task): string {
  const base = task.due_date ? new Date(task.due_date) : new Date()
  if (task.recurrence === 'daily') base.setDate(base.getDate() + 1)
  else if (task.recurrence === 'weekly') base.setDate(base.getDate() + 7)
  else if (task.recurrence === 'monthly') base.setMonth(base.getMonth() + 1)
  return base.toISOString()
}

// Projects
export async function createProject(project: Omit<Project, 'id' | 'created_at'>): Promise<Project> {
  const newProj: Project = { ...project, id: crypto.randomUUID(), created_at: new Date().toISOString() }
  const { data, error } = await supabase.from('projects').insert(newProj).select().single()
  if (error) { enqueue('projects', 'INSERT', newProj as unknown as Record<string, unknown>); return newProj }
  return data as Project
}

export async function updateProject(id: string, patch: Partial<Project>): Promise<void> {
  const { error } = await supabase.from('projects').update(patch).eq('id', id)
  if (error) enqueue('projects', 'UPDATE', { id, ...patch } as Record<string, unknown>)
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) enqueue('projects', 'DELETE', { id })
}
