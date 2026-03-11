import { useState, useMemo } from 'react'
import { Plus, TrendingUp, PieChart, CreditCard, Shield, Target, Trash2 } from 'lucide-react'
import AppShell from '@/components/Layout/AppShell'
import { Tabs } from '@/components/Common/Tabs'
import Card from '@/components/Common/Card'
import Button from '@/components/Common/Button'
import Badge from '@/components/Common/Badge'
import Modal from '@/components/Common/Modal'
import { Input, Select } from '@/components/Common/Input'
import { useStore } from '@/utils/store'
import { createTransaction, deleteTransaction, createLoan, createPolicy, deletePolicy, createGoal, calcSafeToSpend, calcTargetIncome, calcInsuranceGap, calcEmergencyFundTarget } from '@/utils/store/financeOps'
import { formatCurrency, formatDate } from '@/utils/helpers'
import type { FinanceBucket, ESBIType, TransactionType } from '@/types'
import EmptyState from '@/components/Common/EmptyState'

const tabs = [
  { id: 'overview', label: 'Overview', icon: <PieChart size={13} /> },
  { id: 'transactions', label: 'Transactions', icon: <TrendingUp size={13} /> },
  { id: 'loans', label: 'Loans', icon: <CreditCard size={13} /> },
  { id: 'insurance', label: 'Insurance', icon: <Shield size={13} /> },
  { id: 'planning', label: 'Planning', icon: <Target size={13} /> },
]

export default function Finance() {
  const [tab, setTab] = useState('overview')

  return (
    <AppShell title="Finance">
      <Tabs tabs={tabs} active={tab} onChange={setTab} className="mb-4" />
      {tab === 'overview' && <OverviewTab />}
      {tab === 'transactions' && <TransactionsTab />}
      {tab === 'loans' && <LoansTab />}
      {tab === 'insurance' && <InsuranceTab />}
      {tab === 'planning' && <PlanningTab />}
    </AppShell>
  )
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab() {
  const { state } = useStore()
  const now = new Date()

  const stats = useMemo(() => {
    const txns = state.transactions.filter((t) => {
      const d = new Date(t.date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    const income = txns.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const consumption = txns.filter((t) => t.bucket === 'consumption').reduce((s, t) => s + t.amount, 0)
    const commitment = txns.filter((t) => t.bucket === 'commitment').reduce((s, t) => s + t.amount, 0)
    const safety = txns.filter((t) => t.bucket === 'safety').reduce((s, t) => s + t.amount, 0)
    const growth = txns.filter((t) => t.bucket === 'growth').reduce((s, t) => s + t.amount, 0)
    const safeToSpend = calcSafeToSpend(income, safety, growth)
    return { income, consumption, commitment, safety, growth, safeToSpend }
  }, [state.transactions, now])

  const buckets = [
    { label: 'Consumption', value: stats.consumption, color: 'bg-red-400', pct: stats.income > 0 ? (stats.consumption / stats.income) * 100 : 0 },
    { label: 'Commitment', value: stats.commitment, color: 'bg-orange-400', pct: stats.income > 0 ? (stats.commitment / stats.income) * 100 : 0 },
    { label: 'Safety', value: stats.safety, color: 'bg-blue-400', pct: stats.income > 0 ? (stats.safety / stats.income) * 100 : 0 },
    { label: 'Growth', value: stats.growth, color: 'bg-purple-400', pct: stats.income > 0 ? (stats.growth / stats.income) * 100 : 0 },
  ]

  const esbiTypes: { key: ESBIType; label: string; icon: string }[] = [
    { key: 'employee', label: 'Employee', icon: '👔' },
    { key: 'self_employed', label: 'Self-Employed', icon: '🛠' },
    { key: 'business', label: 'Business', icon: '🏢' },
    { key: 'investor', label: 'Investor', icon: '📈' },
  ]

  return (
    <div className="space-y-4">
      {/* Income card */}
      <Card padding="lg">
        <p className="text-sm text-slate-500 mb-1">This Month's Income</p>
        <p className="text-3xl font-bold text-primary-600">{formatCurrency(stats.income)}</p>
        <p className={`text-sm mt-1 font-semibold ${stats.safeToSpend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          Safe to Spend: {formatCurrency(stats.safeToSpend)}
        </p>
      </Card>

      {/* ESBI breakdown */}
      <Card>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">ESBI Income Sources</p>
        <div className="grid grid-cols-2 gap-3">
          {esbiTypes.map(({ key, label, icon }) => {
            const total = state.transactions
              .filter((t) => t.esbi_type === key && t.type === 'income')
              .reduce((s, t) => s + t.amount, 0)
            return (
              <div key={key} className="bg-slate-50 dark:bg-slate-700/40 rounded-xl p-3">
                <p className="text-lg">{icon}</p>
                <p className="text-xs text-slate-500 mt-1">{label}</p>
                <p className="text-base font-bold text-slate-800 dark:text-white">{formatCurrency(total)}</p>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Bucket bars */}
      <Card>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Spending Breakdown</p>
        <div className="space-y-3">
          {buckets.map((b) => (
            <div key={b.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600 dark:text-slate-300">{b.label}</span>
                <span className="font-semibold">{formatCurrency(b.value)} <span className="text-slate-400 font-normal">({b.pct.toFixed(0)}%)</span></span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full ${b.color} rounded-full transition-all duration-500`} style={{ width: `${Math.min(b.pct, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── Transactions Tab ─────────────────────────────────────────────────────────
function TransactionsTab() {
  const { state, dispatch } = useStore()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ type: 'expense' as TransactionType, bucket: 'consumption' as FinanceBucket, esbi_type: '' as ESBIType | '', category: '', amount: '', date: new Date().toISOString().slice(0, 10), is_need: false, notes: '' })
  const [loading, setLoading] = useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.amount || !form.category) return
    setLoading(true)
    const txn = await createTransaction({
      user_id: state.profile!.id,
      type: form.type,
      bucket: form.bucket,
      esbi_type: form.esbi_type || null,
      category: form.category,
      amount: parseFloat(form.amount),
      date: form.date,
      is_need: form.is_need,
      notes: form.notes || null,
    })
    dispatch({ type: 'UPSERT_TRANSACTION', payload: txn })
    setLoading(false)
    setOpen(false)
  }

  async function handleDelete(id: string) {
    await deleteTransaction(id)
    dispatch({ type: 'DELETE_TRANSACTION', payload: id })
  }

  const bucketColor: Record<FinanceBucket, string> = { consumption: 'red', commitment: 'orange', safety: 'blue', growth: 'purple' }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)} icon={<Plus size={16} />} size="sm">Add</Button>
      </div>

      {state.transactions.length === 0
        ? <EmptyState icon={<TrendingUp size={40} />} title="No transactions yet" />
        : (
          <div className="space-y-2">
            {state.transactions.map((t) => (
              <Card key={t.id} className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800 dark:text-white">{t.category}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-400">{formatDate(t.date)}</span>
                    <Badge color={bucketColor[t.bucket] as 'red' | 'orange' | 'blue' | 'purple'} className="text-[10px]">{t.bucket}</Badge>
                    {t.is_need && <Badge color="green" className="text-[10px]">Need</Badge>}
                  </div>
                </div>
                <p className={`font-bold text-sm ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </p>
                <button onClick={() => handleDelete(t.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                  <Trash2 size={14} />
                </button>
              </Card>
            ))}
          </div>
        )
      }

      <Modal open={open} onClose={() => setOpen(false)} title="Add Transaction">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as TransactionType })}
              options={[{ value: 'income', label: 'Income' }, { value: 'expense', label: 'Expense' }]} />
            <Select label="Bucket" value={form.bucket} onChange={(e) => setForm({ ...form, bucket: e.target.value as FinanceBucket })}
              options={[{ value: 'consumption', label: 'Consumption' }, { value: 'commitment', label: 'Commitment' }, { value: 'safety', label: 'Safety' }, { value: 'growth', label: 'Growth' }]} />
          </div>
          {form.type === 'income' && (
            <Select label="ESBI Type" value={form.esbi_type} onChange={(e) => setForm({ ...form, esbi_type: e.target.value as ESBIType })}
              options={[{ value: 'employee', label: 'Employee' }, { value: 'self_employed', label: 'Self-Employed' }, { value: 'business', label: 'Business' }, { value: 'investor', label: 'Investor' }]}
              placeholder="Select type" />
          )}
          <div className="grid grid-cols-2 gap-3">
            <Input label="Category" placeholder="Salary, Groceries…" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
            <Input label="Amount (AED)" type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
          </div>
          <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
            <input type="checkbox" checked={form.is_need} onChange={(e) => setForm({ ...form, is_need: e.target.checked })} className="rounded" />
            This is a Need (vs Want)
          </label>
          <Button type="submit" loading={loading} className="w-full justify-center">Save</Button>
        </form>
      </Modal>
    </div>
  )
}

// ─── Loans Tab ────────────────────────────────────────────────────────────────
function LoansTab() {
  const { state, dispatch } = useStore()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<{
    name: string; lender: string; amount: string; outstanding: string; emi: string; interest_rate: string
    rate_type: 'fixed' | 'floating'; interest_type: 'reducing' | 'flat'; structure: 'term' | 'revolving'
    purpose: 'productive' | 'consumption'; collateral: 'secured' | 'unsecured'
  }>({ name: '', lender: '', amount: '', outstanding: '', emi: '', interest_rate: '', rate_type: 'fixed', interest_type: 'reducing', structure: 'term', purpose: 'productive', collateral: 'secured' })
  const [loading, setLoading] = useState(false)

  const goodDebt = state.loans.filter((l) => l.purpose === 'productive').reduce((s, l) => s + l.outstanding, 0)
  const badDebt = state.loans.filter((l) => l.purpose === 'consumption').reduce((s, l) => s + l.outstanding, 0)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const loan = await createLoan({ user_id: state.profile!.id, ...form, amount: parseFloat(form.amount), outstanding: parseFloat(form.outstanding), emi: parseFloat(form.emi), interest_rate: parseFloat(form.interest_rate), end_date: null })
    dispatch({ type: 'UPSERT_LOAN', payload: loan })
    setLoading(false)
    setOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200">
          <p className="text-xs text-green-600 font-semibold">Good Debt</p>
          <p className="text-xl font-bold text-green-700">{formatCurrency(goodDebt)}</p>
        </Card>
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200">
          <p className="text-xs text-red-500 font-semibold">Bad Debt</p>
          <p className="text-xl font-bold text-red-600">{formatCurrency(badDebt)}</p>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)} icon={<Plus size={16} />} size="sm">Add Loan</Button>
      </div>

      {state.loans.length === 0
        ? <EmptyState icon={<CreditCard size={40} />} title="No loans added" />
        : state.loans.map((loan) => (
          <Card key={loan.id}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-slate-800 dark:text-white">{loan.name}</p>
                <p className="text-xs text-slate-400">{loan.lender}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-800 dark:text-white">{formatCurrency(loan.outstanding)}</p>
                <p className="text-xs text-slate-400">EMI: {formatCurrency(loan.emi)}/mo</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px]">
              <Badge color={loan.purpose === 'productive' ? 'green' : 'red'}>{loan.purpose}</Badge>
              <Badge color="gray">{loan.collateral}</Badge>
              <Badge color="blue">{loan.interest_type}</Badge>
              <Badge color="orange">{loan.rate_type} {loan.interest_rate}%</Badge>
            </div>
          </Card>
        ))
      }

      <Modal open={open} onClose={() => setOpen(false)} title="Add Loan">
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Loan Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input label="Lender" value={form.lender} onChange={(e) => setForm({ ...form, lender: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Original Amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            <Input label="Outstanding" type="number" value={form.outstanding} onChange={(e) => setForm({ ...form, outstanding: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Monthly EMI" type="number" value={form.emi} onChange={(e) => setForm({ ...form, emi: e.target.value })} required />
            <Input label="Interest Rate %" type="number" step="0.1" value={form.interest_rate} onChange={(e) => setForm({ ...form, interest_rate: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Purpose" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value as 'productive' | 'consumption' })} options={[{ value: 'productive', label: 'Productive' }, { value: 'consumption', label: 'Consumption' }]} />
            <Select label="Collateral" value={form.collateral} onChange={(e) => setForm({ ...form, collateral: e.target.value as 'secured' | 'unsecured' })} options={[{ value: 'secured', label: 'Secured' }, { value: 'unsecured', label: 'Unsecured' }]} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Interest Type" value={form.interest_type} onChange={(e) => setForm({ ...form, interest_type: e.target.value as 'reducing' | 'flat' })} options={[{ value: 'reducing', label: 'Reducing' }, { value: 'flat', label: 'Flat' }]} />
            <Select label="Rate Type" value={form.rate_type} onChange={(e) => setForm({ ...form, rate_type: e.target.value as 'fixed' | 'floating' })} options={[{ value: 'fixed', label: 'Fixed' }, { value: 'floating', label: 'Floating' }]} />
          </div>
          <Button type="submit" loading={loading} className="w-full justify-center">Add Loan</Button>
        </form>
      </Modal>
    </div>
  )
}

// ─── Insurance Tab ────────────────────────────────────────────────────────────
function InsuranceTab() {
  const { state, dispatch } = useStore()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ type: 'health' as const, provider: '', policy_number: '', coverage_amount: '', premium: '', renewal_date: '', support_contact: '' })
  const [annualIncome, setAnnualIncome] = useState('')
  const [liabilities, setLiabilities] = useState('')
  const [loading, setLoading] = useState(false)

  const gap = annualIncome ? calcInsuranceGap(parseFloat(annualIncome), parseFloat(liabilities) || 0) : null

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const policy = await createPolicy({ user_id: state.profile!.id, ...form, coverage_amount: parseFloat(form.coverage_amount), premium: parseFloat(form.premium), support_contact: form.support_contact || null })
    dispatch({ type: 'UPSERT_POLICY', payload: policy })
    setLoading(false)
    setOpen(false)
  }

  return (
    <div className="space-y-4">
      {/* Gap Calculator */}
      <Card>
        <p className="text-sm font-semibold text-slate-700 dark:text-white mb-3">Insurance Gap Calculator</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <Input label="Annual Income (AED)" type="number" value={annualIncome} onChange={(e) => setAnnualIncome(e.target.value)} placeholder="0" />
          <Input label="Total Liabilities (AED)" type="number" value={liabilities} onChange={(e) => setLiabilities(e.target.value)} placeholder="0" />
        </div>
        {gap !== null && (
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl px-4 py-3">
            <p className="text-xs text-primary-600 font-semibold">Required Coverage</p>
            <p className="text-2xl font-bold text-primary-600">{formatCurrency(gap)}</p>
            <p className="text-xs text-slate-400 mt-1">= (Annual Income × 10) + Liabilities</p>
          </div>
        )}
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)} icon={<Plus size={16} />} size="sm">Add Policy</Button>
      </div>

      {state.policies.map((p) => (
        <Card key={p.id}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Badge color={p.type === 'health' ? 'green' : p.type === 'life' ? 'blue' : 'orange'}>{p.type}</Badge>
                <p className="font-semibold text-sm text-slate-800 dark:text-white">{p.provider}</p>
              </div>
              <p className="text-xs text-slate-400 mt-1">Policy #: {p.policy_number}</p>
              <p className="text-xs text-slate-400">Renewal: {formatDate(p.renewal_date)}</p>
              {p.support_contact && <p className="text-xs text-slate-400">Support: {p.support_contact}</p>}
            </div>
            <div className="text-right">
              <p className="font-bold text-sm">{formatCurrency(p.coverage_amount)}</p>
              <p className="text-xs text-slate-400">{formatCurrency(p.premium)}/yr</p>
              <button onClick={() => { deletePolicy(p.id); dispatch({ type: 'DELETE_POLICY', payload: p.id }) }} className="mt-2 text-slate-300 hover:text-red-500">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        </Card>
      ))}

      <Modal open={open} onClose={() => setOpen(false)} title="Add Policy">
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })} options={[{ value: 'health', label: 'Health' }, { value: 'life', label: 'Life' }, { value: 'motor', label: 'Motor' }, { value: 'other', label: 'Other' }]} />
            <Input label="Provider" value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Policy Number" value={form.policy_number} onChange={(e) => setForm({ ...form, policy_number: e.target.value })} required />
            <Input label="Renewal Date" type="date" value={form.renewal_date} onChange={(e) => setForm({ ...form, renewal_date: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Coverage (AED)" type="number" value={form.coverage_amount} onChange={(e) => setForm({ ...form, coverage_amount: e.target.value })} required />
            <Input label="Annual Premium" type="number" value={form.premium} onChange={(e) => setForm({ ...form, premium: e.target.value })} required />
          </div>
          <Input label="Support Contact" value={form.support_contact} onChange={(e) => setForm({ ...form, support_contact: e.target.value })} />
          <Button type="submit" loading={loading} className="w-full justify-center">Save</Button>
        </form>
      </Modal>
    </div>
  )
}

// ─── Planning Tab ─────────────────────────────────────────────────────────────
function PlanningTab() {
  const { state, dispatch } = useStore()
  const [livingCosts, setLivingCosts] = useState('')
  const [goals, setGoals] = useState('')
  const [taxRate, setTaxRate] = useState('')
  const [monthlyExpenses, setMonthlyExpenses] = useState('')
  const [loading, setLoading] = useState(false)
  const [goalForm, setGoalForm] = useState({ title: '', goal_type: 'emergency' as const, target_amount: '', current_amount: '', target_date: '' })

  const calcTarget = livingCosts && goals && taxRate
    ? calcTargetIncome(parseFloat(livingCosts), parseFloat(goals), parseFloat(taxRate))
    : null

  const emergencyTarget = monthlyExpenses ? calcEmergencyFundTarget(parseFloat(monthlyExpenses)) : null

  async function handleAddGoal(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const goal = await createGoal({ user_id: state.profile!.id, ...goalForm, target_amount: parseFloat(goalForm.target_amount), current_amount: parseFloat(goalForm.current_amount) || 0, target_date: goalForm.target_date || null })
    dispatch({ type: 'UPSERT_GOAL', payload: goal })
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      {/* Target Income Calculator */}
      <Card>
        <p className="text-sm font-semibold text-slate-700 dark:text-white mb-3">Target Income Calculator</p>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <Input label="Living Costs" type="number" value={livingCosts} onChange={(e) => setLivingCosts(e.target.value)} placeholder="0" />
          <Input label="Goals" type="number" value={goals} onChange={(e) => setGoals(e.target.value)} placeholder="0" />
          <Input label="Tax Rate %" type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} placeholder="0" />
        </div>
        {calcTarget !== null && (
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl px-4 py-3">
            <p className="text-xs text-primary-600 font-semibold">Required Monthly Income</p>
            <p className="text-2xl font-bold text-primary-600">{formatCurrency(calcTarget)}</p>
          </div>
        )}
      </Card>

      {/* Emergency Fund */}
      <Card>
        <p className="text-sm font-semibold text-slate-700 dark:text-white mb-3">Emergency Fund (6x monthly expenses)</p>
        <Input label="Monthly Expenses" type="number" value={monthlyExpenses} onChange={(e) => setMonthlyExpenses(e.target.value)} placeholder="0" className="mb-3" />
        {emergencyTarget !== null && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl px-4 py-3">
            <p className="text-xs text-blue-600 font-semibold">Target Emergency Fund</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(emergencyTarget)}</p>
          </div>
        )}
      </Card>

      {/* Goals */}
      <Card>
        <p className="text-sm font-semibold text-slate-700 dark:text-white mb-3">Financial Goals</p>
        <form onSubmit={handleAddGoal} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Goal Title" value={goalForm.title} onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })} required />
            <Select label="Type" value={goalForm.goal_type} onChange={(e) => setGoalForm({ ...goalForm, goal_type: e.target.value as typeof goalForm.goal_type })} options={[{ value: 'emergency', label: 'Emergency' }, { value: 'retirement', label: 'Retirement' }, { value: 'lifestyle', label: 'Lifestyle' }]} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Target (AED)" type="number" value={goalForm.target_amount} onChange={(e) => setGoalForm({ ...goalForm, target_amount: e.target.value })} required />
            <Input label="Current (AED)" type="number" value={goalForm.current_amount} onChange={(e) => setGoalForm({ ...goalForm, current_amount: e.target.value })} />
          </div>
          <Button type="submit" loading={loading} size="sm">Add Goal</Button>
        </form>

        <div className="mt-4 space-y-3">
          {state.goals.map((g) => {
            const pct = g.target_amount > 0 ? Math.min((g.current_amount / g.target_amount) * 100, 100) : 0
            return (
              <div key={g.id} className="bg-slate-50 dark:bg-slate-700/40 rounded-xl p-3">
                <div className="flex justify-between mb-1">
                  <p className="text-sm font-semibold">{g.title}</p>
                  <p className="text-xs text-slate-500">{pct.toFixed(0)}%</p>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden mb-1">
                  <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-slate-400">{formatCurrency(g.current_amount)} / {formatCurrency(g.target_amount)}</p>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
