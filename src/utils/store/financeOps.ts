import { supabase } from '@/lib/supabase'
import { enqueue } from './syncQueue'
import type { FinanceTransaction, Loan, InsurancePolicy, FinanceGoal } from '@/types'

// Transactions
export async function createTransaction(t: Omit<FinanceTransaction, 'id' | 'created_at'>): Promise<FinanceTransaction> {
  const item = { ...t, id: crypto.randomUUID(), created_at: new Date().toISOString() }
  const { data, error } = await supabase.from('finance_transactions').insert(item).select().single()
  if (error) { enqueue('finance_transactions', 'INSERT', item as unknown as Record<string, unknown>); return item }
  return data as FinanceTransaction
}

export async function updateTransaction(id: string, patch: Partial<FinanceTransaction>): Promise<void> {
  const { error } = await supabase.from('finance_transactions').update(patch).eq('id', id)
  if (error) enqueue('finance_transactions', 'UPDATE', { id, ...patch } as Record<string, unknown>)
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase.from('finance_transactions').delete().eq('id', id)
  if (error) enqueue('finance_transactions', 'DELETE', { id })
}

// Loans
export async function createLoan(l: Omit<Loan, 'id' | 'created_at'>): Promise<Loan> {
  const item = { ...l, id: crypto.randomUUID(), created_at: new Date().toISOString() }
  const { data, error } = await supabase.from('loans').insert(item).select().single()
  if (error) { enqueue('loans', 'INSERT', item as unknown as Record<string, unknown>); return item }
  return data as Loan
}

export async function updateLoan(id: string, patch: Partial<Loan>): Promise<void> {
  const { error } = await supabase.from('loans').update(patch).eq('id', id)
  if (error) enqueue('loans', 'UPDATE', { id, ...patch } as Record<string, unknown>)
}

export async function deleteLoan(id: string): Promise<void> {
  const { error } = await supabase.from('loans').delete().eq('id', id)
  if (error) enqueue('loans', 'DELETE', { id })
}

// Insurance Policies
export async function createPolicy(p: Omit<InsurancePolicy, 'id' | 'created_at'>): Promise<InsurancePolicy> {
  const item = { ...p, id: crypto.randomUUID(), created_at: new Date().toISOString() }
  const { data, error } = await supabase.from('insurance_policies').insert(item).select().single()
  if (error) { enqueue('insurance_policies', 'INSERT', item as unknown as Record<string, unknown>); return item }
  return data as InsurancePolicy
}

export async function deletePolicy(id: string): Promise<void> {
  const { error } = await supabase.from('insurance_policies').delete().eq('id', id)
  if (error) enqueue('insurance_policies', 'DELETE', { id })
}

// Finance Goals
export async function createGoal(g: Omit<FinanceGoal, 'id' | 'created_at'>): Promise<FinanceGoal> {
  const item = { ...g, id: crypto.randomUUID(), created_at: new Date().toISOString() }
  const { data, error } = await supabase.from('finance_goals').insert(item).select().single()
  if (error) { enqueue('finance_goals', 'INSERT', item as unknown as Record<string, unknown>); return item }
  return data as FinanceGoal
}

export async function updateGoal(id: string, patch: Partial<FinanceGoal>): Promise<void> {
  const { error } = await supabase.from('finance_goals').update(patch).eq('id', id)
  if (error) enqueue('finance_goals', 'UPDATE', { id, ...patch } as Record<string, unknown>)
}

export async function deleteGoal(id: string): Promise<void> {
  const { error } = await supabase.from('finance_goals').delete().eq('id', id)
  if (error) enqueue('finance_goals', 'DELETE', { id })
}

// ─── Finance Formulas ─────────────────────────────────────────────────────────
export function calcSafeToSpend(income: number, safety: number, growth: number): number {
  return income - safety - growth
}

export function calcTargetIncome(livingCosts: number, goals: number, taxRate: number): number {
  return (livingCosts + goals) / (1 - taxRate / 100)
}

export function calcInsuranceGap(annualIncome: number, liabilities: number): number {
  return annualIncome * 10 + liabilities
}

export function calcEmergencyFundTarget(monthlyExpenses: number): number {
  return monthlyExpenses * 6
}
