// ─── Auth ────────────────────────────────────────────────────────────────────
export interface UserProfile {
  id: string
  full_name: string
  avatar_url: string | null
  settings: UserSettings
  created_at: string
}

export interface UserSettings {
  theme: 'light' | 'dark'
  start_week: 'monday' | 'saturday'
}

// ─── Tasks ───────────────────────────────────────────────────────────────────
export type TaskArea = 'Inbox' | 'Professional' | 'Financial' | 'Wellness' | 'Relationship' | 'Personal' | 'Vision'
export type TaskPriority = 'P1' | 'P2' | 'P3' | 'P4'
export type TaskStatus = 'todo' | 'completed'
export type TaskRecurrence = 'none' | 'daily' | 'weekly' | 'monthly'

export interface Task {
  id: string
  user_id: string
  title: string
  area: TaskArea
  project_id: string | null
  connection_id: string | null
  priority: TaskPriority
  due_date: string | null
  is_today_focus: boolean
  status: TaskStatus
  recurrence: TaskRecurrence
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  user_id: string
  title: string
  area: TaskArea
  color: string
  created_at: string
}

// ─── Finance ─────────────────────────────────────────────────────────────────
export type TransactionType = 'income' | 'expense'
export type FinanceBucket = 'consumption' | 'commitment' | 'safety' | 'growth'
export type ESBIType = 'employee' | 'self_employed' | 'business' | 'investor'

export interface FinanceTransaction {
  id: string
  user_id: string
  type: TransactionType
  bucket: FinanceBucket
  esbi_type: ESBIType | null
  category: string
  amount: number
  date: string
  is_need: boolean
  notes: string | null
  created_at: string
}

export interface Loan {
  id: string
  user_id: string
  name: string
  lender: string
  amount: number
  outstanding: number
  emi: number
  interest_rate: number
  rate_type: 'fixed' | 'floating'
  interest_type: 'reducing' | 'flat'
  structure: 'term' | 'revolving'
  purpose: 'productive' | 'consumption'
  collateral: 'secured' | 'unsecured'
  end_date: string | null
  created_at: string
}

export interface InsurancePolicy {
  id: string
  user_id: string
  type: 'health' | 'life' | 'motor' | 'other'
  provider: string
  policy_number: string
  coverage_amount: number
  premium: number
  renewal_date: string
  support_contact: string | null
  created_at: string
}

export interface FinanceGoal {
  id: string
  user_id: string
  title: string
  goal_type: 'emergency' | 'retirement' | 'lifestyle'
  target_amount: number
  current_amount: number
  target_date: string | null
  created_at: string
}

// ─── CRM ─────────────────────────────────────────────────────────────────────
export type LeadStatus = 'new' | 'qualified' | 'appointment' | 'negotiation' | 'won' | 'lost'
export type DealStatus = 'processing' | 'verification' | 'activation' | 'completed' | 'unsuccessful'
export type UAEEmirate = 'Abu Dhabi' | 'Dubai' | 'Sharjah' | 'Ajman' | 'Umm Al Quwain' | 'Ras Al Khaimah' | 'Fujairah'
export type LeadSource = 'LinkedIn' | 'Cold Calling' | 'Referrals' | 'Follow up' | 'Other'
export type CRMProduct = 'Credit Card' | 'Personal Loan' | 'Auto Loan' | 'Account Opening' | 'Other'
export type UAEBank =
  | 'ADCB' | 'ENBD' | 'DIB' | 'FAB' | 'Mashreq Bank'
  | 'CBD' | 'RAKBANK' | 'ADIB' | 'Emirates Islamic Bank'
  | 'Sharjah Islamic Bank' | 'HSBC UAE' | 'Standard Chartered UAE' | 'Citi Bank UAE'

export interface CRMLead {
  id: string
  user_id: string
  name: string
  mobile: string
  email: string | null
  status: LeadStatus
  source: LeadSource
  emirate: UAEEmirate | null
  product: CRMProduct | null
  bank: UAEBank | null
  card_type: string | null
  application_number: string | null
  bpm_id: string | null
  submission_date: string | null
  completion_date: string | null
  date_of_birth: string | null
  nationality: string | null
  visa_status: string | null
  emirates_id: string | null
  passport_number: string | null
  aecb_score: number | null
  salary_bank: string | null
  company_landline: string | null
  monthly_basic_salary: number | null
  expected_value: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CRMDeal {
  id: string
  user_id: string
  lead_id: string
  name: string
  status: DealStatus
  value: number | null
  expected_closing_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type ConnectionType = 'Client' | 'Colleague' | 'Partner' | 'Relation' | 'Other'

export interface CRMConnection {
  id: string
  user_id: string
  full_name: string
  type: ConnectionType
  mobile: string | null
  email: string | null
  company: string | null
  designation: string | null
  date_of_birth: string | null
  nationality: string | null
  visa_status: string | null
  emirates_id: string | null
  passport_number: string | null
  emirate: UAEEmirate | null
  notes: string | null
  photo_url: string | null
  created_at: string
}

// ─── Wellness ─────────────────────────────────────────────────────────────────
export type HabitRoutine = 'morning' | 'work' | 'evening'

export interface Habit {
  id: string
  user_id: string
  title: string
  time_of_day: string
  routine: HabitRoutine
  active: boolean
  created_at: string
}

export interface HabitLog {
  id: string
  habit_id: string
  date: string
  status: boolean
}

// ─── Vision ──────────────────────────────────────────────────────────────────
export type GoalTimeline = '1year' | '3year' | '5year'

export interface VisionGoal {
  id: string
  user_id: string
  title: string
  description: string | null
  timeline: GoalTimeline
  progress: number
  created_at: string
}

export interface Relationship {
  id: string
  user_id: string
  full_name: string
  relation: 'Father' | 'Mother' | 'Spouse' | 'Sibling' | 'Child' | 'Extended Family' | 'Close Friend'
  phone: string | null
  photo_url: string | null
  notes: string | null
  important_dates: ImportantDate[]
  created_at: string
}

export interface ImportantDate {
  id: string
  label: 'Birthday' | 'Anniversary' | 'Other'
  date: string
  custom_label: string | null
}

// ─── Reviews ─────────────────────────────────────────────────────────────────
export interface WeeklyReview {
  id: string
  user_id: string
  week_start_date: string
  wins: string
  challenges: string
  lessons: string
  rating: 1 | 2 | 3 | 4 | 5
  created_at: string
}

// ─── Documents ───────────────────────────────────────────────────────────────
export type DocCategory = 'Personal' | 'Work' | 'Finance' | 'ID & Passports' | 'Education' | 'Other'

export interface Document {
  id: string
  user_id: string
  file_name: string
  file_path: string
  category: DocCategory
  size_bytes: number
  mime_type: string
  created_at: string
}

// ─── Offline Sync ────────────────────────────────────────────────────────────
export type SyncOperation = 'INSERT' | 'UPDATE' | 'DELETE'

export interface SyncQueueItem {
  id: string
  table: string
  operation: SyncOperation
  payload: Record<string, unknown>
  timestamp: number
  retries: number
}

// ─── UI Helpers ──────────────────────────────────────────────────────────────
export interface SelectOption<T = string> {
  value: T
  label: string
}
