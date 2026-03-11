import type { SyncQueueItem, SyncOperation } from '@/types'
import { supabase } from '@/lib/supabase'

const QUEUE_KEY = 'life-os-offline-queue'
const MAX_RETRIES = 3

export function getQueue(): SyncQueueItem[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveQueue(queue: SyncQueueItem[]): void {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
}

export function enqueue(table: string, operation: SyncOperation, payload: Record<string, unknown>): void {
  const queue = getQueue()
  queue.push({
    id: crypto.randomUUID(),
    table,
    operation,
    payload,
    timestamp: Date.now(),
    retries: 0,
  })
  saveQueue(queue)
}

export function dequeue(id: string): void {
  const queue = getQueue().filter((item) => item.id !== id)
  saveQueue(queue)
}

export async function flushQueue(): Promise<void> {
  const queue = getQueue()
  if (queue.length === 0) return

  for (const item of queue) {
    try {
      let error = null

      if (item.operation === 'INSERT') {
        ;({ error } = await supabase.from(item.table).insert(item.payload))
      } else if (item.operation === 'UPDATE') {
        const { id, ...rest } = item.payload as { id: string; [k: string]: unknown }
        ;({ error } = await supabase.from(item.table).update(rest).eq('id', id))
      } else if (item.operation === 'DELETE') {
        ;({ error } = await supabase.from(item.table).delete().eq('id', item.payload['id']))
      }

      if (error) throw error
      dequeue(item.id)
    } catch {
      const queue = getQueue()
      const idx = queue.findIndex((q) => q.id === item.id)
      if (idx !== -1) {
        queue[idx].retries += 1
        if (queue[idx].retries >= MAX_RETRIES) {
          queue.splice(idx, 1)
        }
        saveQueue(queue)
      }
    }
  }
}

// Flush on connection restore
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    flushQueue()
  })
}
