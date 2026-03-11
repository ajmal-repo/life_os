import { supabase } from '@/lib/supabase'
import { enqueue } from './syncQueue'
import type { CRMLead, CRMDeal, CRMConnection } from '@/types'

// Leads
export async function createLead(l: Omit<CRMLead, 'id' | 'created_at' | 'updated_at'>): Promise<CRMLead> {
  const item: CRMLead = { ...l, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  const { data, error } = await supabase.from('crm_leads').insert(item).select().single()
  if (error) { enqueue('crm_leads', 'INSERT', item as unknown as Record<string, unknown>); return item }
  return data as CRMLead
}

export async function updateLead(id: string, patch: Partial<CRMLead>): Promise<void> {
  const updated = { ...patch, updated_at: new Date().toISOString() }
  const { error } = await supabase.from('crm_leads').update(updated).eq('id', id)
  if (error) enqueue('crm_leads', 'UPDATE', { id, ...updated } as Record<string, unknown>)
}

export async function deleteLead(id: string): Promise<void> {
  const { error } = await supabase.from('crm_leads').delete().eq('id', id)
  if (error) enqueue('crm_leads', 'DELETE', { id })
}

export async function convertLeadToDeal(lead: CRMLead): Promise<CRMDeal> {
  const deal: CRMDeal = {
    id: crypto.randomUUID(),
    user_id: lead.user_id,
    lead_id: lead.id,
    name: lead.name,
    status: 'processing',
    value: lead.expected_value,
    expected_closing_date: null,
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  const { data, error } = await supabase.from('crm_deals').insert(deal).select().single()
  if (error) { enqueue('crm_deals', 'INSERT', deal as unknown as Record<string, unknown>); return deal }
  await updateLead(lead.id, { status: 'won' })
  return data as CRMDeal
}

// Deals
export async function updateDeal(id: string, patch: Partial<CRMDeal>): Promise<void> {
  const updated = { ...patch, updated_at: new Date().toISOString() }
  const { error } = await supabase.from('crm_deals').update(updated).eq('id', id)
  if (error) enqueue('crm_deals', 'UPDATE', { id, ...updated } as Record<string, unknown>)
}

export async function deleteDeal(id: string): Promise<void> {
  const { error } = await supabase.from('crm_deals').delete().eq('id', id)
  if (error) enqueue('crm_deals', 'DELETE', { id })
}

// Connections
export async function createConnection(c: Omit<CRMConnection, 'id' | 'created_at'>): Promise<CRMConnection> {
  const item: CRMConnection = { ...c, id: crypto.randomUUID(), created_at: new Date().toISOString() }
  const { data, error } = await supabase.from('crm_connections').insert(item).select().single()
  if (error) { enqueue('crm_connections', 'INSERT', item as unknown as Record<string, unknown>); return item }
  return data as CRMConnection
}

export async function updateConnection(id: string, patch: Partial<CRMConnection>): Promise<void> {
  const { error } = await supabase.from('crm_connections').update(patch).eq('id', id)
  if (error) enqueue('crm_connections', 'UPDATE', { id, ...patch } as Record<string, unknown>)
}

export async function deleteConnection(id: string): Promise<void> {
  const { error } = await supabase.from('crm_connections').delete().eq('id', id)
  if (error) enqueue('crm_connections', 'DELETE', { id })
}
