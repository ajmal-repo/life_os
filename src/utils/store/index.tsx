import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import type {
  UserProfile, Task, Project, FinanceTransaction, Loan, InsurancePolicy, FinanceGoal,
  CRMLead, CRMDeal, CRMConnection, Habit, HabitLog, VisionGoal, Relationship,
  WeeklyReview, Document,
} from '@/types'
import { supabase } from '@/lib/supabase'
import { flushQueue } from './syncQueue'

// ─── State Shape ──────────────────────────────────────────────────────────────
export interface AppState {
  profile: UserProfile | null
  tasks: Task[]
  projects: Project[]
  transactions: FinanceTransaction[]
  loans: Loan[]
  policies: InsurancePolicy[]
  goals: FinanceGoal[]
  leads: CRMLead[]
  deals: CRMDeal[]
  connections: CRMConnection[]
  habits: Habit[]
  habitLogs: HabitLog[]
  visionGoals: VisionGoal[]
  relationships: Relationship[]
  reviews: WeeklyReview[]
  documents: Document[]
  loading: boolean
  online: boolean
}

const initial: AppState = {
  profile: null,
  tasks: [],
  projects: [],
  transactions: [],
  loans: [],
  policies: [],
  goals: [],
  leads: [],
  deals: [],
  connections: [],
  habits: [],
  habitLogs: [],
  visionGoals: [],
  relationships: [],
  reviews: [],
  documents: [],
  loading: false,
  online: navigator.onLine,
}

// ─── Actions ──────────────────────────────────────────────────────────────────
type Action =
  | { type: 'SET_PROFILE'; payload: UserProfile | null }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'UPSERT_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'UPSERT_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'SET_TRANSACTIONS'; payload: FinanceTransaction[] }
  | { type: 'UPSERT_TRANSACTION'; payload: FinanceTransaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'SET_LOANS'; payload: Loan[] }
  | { type: 'UPSERT_LOAN'; payload: Loan }
  | { type: 'DELETE_LOAN'; payload: string }
  | { type: 'SET_POLICIES'; payload: InsurancePolicy[] }
  | { type: 'UPSERT_POLICY'; payload: InsurancePolicy }
  | { type: 'DELETE_POLICY'; payload: string }
  | { type: 'SET_GOALS'; payload: FinanceGoal[] }
  | { type: 'UPSERT_GOAL'; payload: FinanceGoal }
  | { type: 'DELETE_GOAL'; payload: string }
  | { type: 'SET_LEADS'; payload: CRMLead[] }
  | { type: 'UPSERT_LEAD'; payload: CRMLead }
  | { type: 'DELETE_LEAD'; payload: string }
  | { type: 'SET_DEALS'; payload: CRMDeal[] }
  | { type: 'UPSERT_DEAL'; payload: CRMDeal }
  | { type: 'DELETE_DEAL'; payload: string }
  | { type: 'SET_CONNECTIONS'; payload: CRMConnection[] }
  | { type: 'UPSERT_CONNECTION'; payload: CRMConnection }
  | { type: 'DELETE_CONNECTION'; payload: string }
  | { type: 'SET_HABITS'; payload: Habit[] }
  | { type: 'UPSERT_HABIT'; payload: Habit }
  | { type: 'DELETE_HABIT'; payload: string }
  | { type: 'SET_HABIT_LOGS'; payload: HabitLog[] }
  | { type: 'UPSERT_HABIT_LOG'; payload: HabitLog }
  | { type: 'SET_VISION_GOALS'; payload: VisionGoal[] }
  | { type: 'UPSERT_VISION_GOAL'; payload: VisionGoal }
  | { type: 'DELETE_VISION_GOAL'; payload: string }
  | { type: 'SET_RELATIONSHIPS'; payload: Relationship[] }
  | { type: 'UPSERT_RELATIONSHIP'; payload: Relationship }
  | { type: 'DELETE_RELATIONSHIP'; payload: string }
  | { type: 'SET_REVIEWS'; payload: WeeklyReview[] }
  | { type: 'UPSERT_REVIEW'; payload: WeeklyReview }
  | { type: 'SET_DOCUMENTS'; payload: Document[] }
  | { type: 'UPSERT_DOCUMENT'; payload: Document }
  | { type: 'DELETE_DOCUMENT'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ONLINE'; payload: boolean }

function upsertById<T extends { id: string }>(arr: T[], item: T): T[] {
  const idx = arr.findIndex((x) => x.id === item.id)
  if (idx === -1) return [item, ...arr]
  return arr.map((x) => (x.id === item.id ? item : x))
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_PROFILE': return { ...state, profile: action.payload }
    case 'SET_TASKS': return { ...state, tasks: action.payload }
    case 'UPSERT_TASK': return { ...state, tasks: upsertById(state.tasks, action.payload) }
    case 'DELETE_TASK': return { ...state, tasks: state.tasks.filter((x) => x.id !== action.payload) }
    case 'SET_PROJECTS': return { ...state, projects: action.payload }
    case 'UPSERT_PROJECT': return { ...state, projects: upsertById(state.projects, action.payload) }
    case 'DELETE_PROJECT': return { ...state, projects: state.projects.filter((x) => x.id !== action.payload) }
    case 'SET_TRANSACTIONS': return { ...state, transactions: action.payload }
    case 'UPSERT_TRANSACTION': return { ...state, transactions: upsertById(state.transactions, action.payload) }
    case 'DELETE_TRANSACTION': return { ...state, transactions: state.transactions.filter((x) => x.id !== action.payload) }
    case 'SET_LOANS': return { ...state, loans: action.payload }
    case 'UPSERT_LOAN': return { ...state, loans: upsertById(state.loans, action.payload) }
    case 'DELETE_LOAN': return { ...state, loans: state.loans.filter((x) => x.id !== action.payload) }
    case 'SET_POLICIES': return { ...state, policies: action.payload }
    case 'UPSERT_POLICY': return { ...state, policies: upsertById(state.policies, action.payload) }
    case 'DELETE_POLICY': return { ...state, policies: state.policies.filter((x) => x.id !== action.payload) }
    case 'SET_GOALS': return { ...state, goals: action.payload }
    case 'UPSERT_GOAL': return { ...state, goals: upsertById(state.goals, action.payload) }
    case 'DELETE_GOAL': return { ...state, goals: state.goals.filter((x) => x.id !== action.payload) }
    case 'SET_LEADS': return { ...state, leads: action.payload }
    case 'UPSERT_LEAD': return { ...state, leads: upsertById(state.leads, action.payload) }
    case 'DELETE_LEAD': return { ...state, leads: state.leads.filter((x) => x.id !== action.payload) }
    case 'SET_DEALS': return { ...state, deals: action.payload }
    case 'UPSERT_DEAL': return { ...state, deals: upsertById(state.deals, action.payload) }
    case 'DELETE_DEAL': return { ...state, deals: state.deals.filter((x) => x.id !== action.payload) }
    case 'SET_CONNECTIONS': return { ...state, connections: action.payload }
    case 'UPSERT_CONNECTION': return { ...state, connections: upsertById(state.connections, action.payload) }
    case 'DELETE_CONNECTION': return { ...state, connections: state.connections.filter((x) => x.id !== action.payload) }
    case 'SET_HABITS': return { ...state, habits: action.payload }
    case 'UPSERT_HABIT': return { ...state, habits: upsertById(state.habits, action.payload) }
    case 'DELETE_HABIT': return { ...state, habits: state.habits.filter((x) => x.id !== action.payload) }
    case 'SET_HABIT_LOGS': return { ...state, habitLogs: action.payload }
    case 'UPSERT_HABIT_LOG': return { ...state, habitLogs: upsertById(state.habitLogs, action.payload) }
    case 'SET_VISION_GOALS': return { ...state, visionGoals: action.payload }
    case 'UPSERT_VISION_GOAL': return { ...state, visionGoals: upsertById(state.visionGoals, action.payload) }
    case 'DELETE_VISION_GOAL': return { ...state, visionGoals: state.visionGoals.filter((x) => x.id !== action.payload) }
    case 'SET_RELATIONSHIPS': return { ...state, relationships: action.payload }
    case 'UPSERT_RELATIONSHIP': return { ...state, relationships: upsertById(state.relationships, action.payload) }
    case 'DELETE_RELATIONSHIP': return { ...state, relationships: state.relationships.filter((x) => x.id !== action.payload) }
    case 'SET_REVIEWS': return { ...state, reviews: action.payload }
    case 'UPSERT_REVIEW': return { ...state, reviews: upsertById(state.reviews, action.payload) }
    case 'SET_DOCUMENTS': return { ...state, documents: action.payload }
    case 'UPSERT_DOCUMENT': return { ...state, documents: upsertById(state.documents, action.payload) }
    case 'DELETE_DOCUMENT': return { ...state, documents: state.documents.filter((x) => x.id !== action.payload) }
    case 'SET_LOADING': return { ...state, loading: action.payload }
    case 'SET_ONLINE': return { ...state, online: action.payload }
    default: return state
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface StoreContextValue {
  state: AppState
  dispatch: React.Dispatch<Action>
}

const StoreContext = createContext<StoreContextValue | null>(null)

export function StoreProvider({ children, userId }: { children: ReactNode; userId: string }) {
  const [state, dispatch] = useReducer(reducer, initial)

  useEffect(() => {
    const handleOnline = () => { dispatch({ type: 'SET_ONLINE', payload: true }); flushQueue() }
    const handleOffline = () => dispatch({ type: 'SET_ONLINE', payload: false })
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline) }
  }, [])

  useEffect(() => {
    if (!userId) return
    loadAll(userId, dispatch)
  }, [userId])

  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

async function loadAll(userId: string, dispatch: React.Dispatch<Action>) {
  dispatch({ type: 'SET_LOADING', payload: true })
  try {
    const [
      { data: tasks }, { data: projects }, { data: transactions },
      { data: loans }, { data: policies }, { data: goals },
      { data: leads }, { data: deals }, { data: connections },
      { data: habits }, { data: habitLogs }, { data: visionGoals },
      { data: relationships }, { data: reviews }, { data: documents },
    ] = await Promise.all([
      supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('projects').select('*').eq('user_id', userId),
      supabase.from('finance_transactions').select('*').eq('user_id', userId).order('date', { ascending: false }),
      supabase.from('loans').select('*').eq('user_id', userId),
      supabase.from('insurance_policies').select('*').eq('user_id', userId),
      supabase.from('finance_goals').select('*').eq('user_id', userId),
      supabase.from('crm_leads').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('crm_deals').select('*').eq('user_id', userId),
      supabase.from('crm_connections').select('*').eq('user_id', userId),
      supabase.from('habits').select('*').eq('user_id', userId),
      supabase.from('habit_logs').select('*').in('habit_id',
        (await supabase.from('habits').select('id').eq('user_id', userId)).data?.map(h => h.id) ?? []
      ),
      supabase.from('vision_goals').select('*').eq('user_id', userId),
      supabase.from('relationships').select('*').eq('user_id', userId),
      supabase.from('weekly_reviews').select('*').eq('user_id', userId).order('week_start_date', { ascending: false }),
      supabase.from('documents').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    ])

    if (tasks) dispatch({ type: 'SET_TASKS', payload: tasks as Task[] })
    if (projects) dispatch({ type: 'SET_PROJECTS', payload: projects as Project[] })
    if (transactions) dispatch({ type: 'SET_TRANSACTIONS', payload: transactions as FinanceTransaction[] })
    if (loans) dispatch({ type: 'SET_LOANS', payload: loans as Loan[] })
    if (policies) dispatch({ type: 'SET_POLICIES', payload: policies as InsurancePolicy[] })
    if (goals) dispatch({ type: 'SET_GOALS', payload: goals as FinanceGoal[] })
    if (leads) dispatch({ type: 'SET_LEADS', payload: leads as CRMLead[] })
    if (deals) dispatch({ type: 'SET_DEALS', payload: deals as CRMDeal[] })
    if (connections) dispatch({ type: 'SET_CONNECTIONS', payload: connections as CRMConnection[] })
    if (habits) dispatch({ type: 'SET_HABITS', payload: habits as Habit[] })
    if (habitLogs) dispatch({ type: 'SET_HABIT_LOGS', payload: habitLogs as HabitLog[] })
    if (visionGoals) dispatch({ type: 'SET_VISION_GOALS', payload: visionGoals as VisionGoal[] })
    if (relationships) dispatch({ type: 'SET_RELATIONSHIPS', payload: relationships as Relationship[] })
    if (reviews) dispatch({ type: 'SET_REVIEWS', payload: reviews as WeeklyReview[] })
    if (documents) dispatch({ type: 'SET_DOCUMENTS', payload: documents as Document[] })
  } finally {
    dispatch({ type: 'SET_LOADING', payload: false })
  }
}
