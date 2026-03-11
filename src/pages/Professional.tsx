import { useState } from 'react'
import { Plus, Phone, Mail, MessageCircle, Trash2, ArrowRight, Briefcase } from 'lucide-react'
import AppShell from '@/components/Layout/AppShell'
import { Tabs } from '@/components/Common/Tabs'
import Card from '@/components/Common/Card'
import Button from '@/components/Common/Button'
import Badge from '@/components/Common/Badge'
import Modal from '@/components/Common/Modal'
import EmptyState from '@/components/Common/EmptyState'
import { Input, Select } from '@/components/Common/Input'
import { useStore } from '@/utils/store'
import { createLead, updateLead, deleteLead, convertLeadToDeal, updateDeal, createConnection, deleteConnection } from '@/utils/store/crmOps'
import { formatCurrency } from '@/utils/helpers'
import type { CRMLead, CRMDeal, LeadStatus, DealStatus, LeadSource, CRMProduct, UAEBank, UAEEmirate, ConnectionType } from '@/types'

const UAE_EMIRATES: UAEEmirate[] = ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah']
const UAE_BANKS: UAEBank[] = ['ADCB', 'ENBD', 'DIB', 'FAB', 'Mashreq Bank', 'CBD', 'RAKBANK', 'ADIB', 'Emirates Islamic Bank', 'Sharjah Islamic Bank', 'HSBC UAE', 'Standard Chartered UAE', 'Citi Bank UAE']
const PRODUCTS: CRMProduct[] = ['Credit Card', 'Personal Loan', 'Auto Loan', 'Account Opening', 'Other']
const LEAD_SOURCES: LeadSource[] = ['LinkedIn', 'Cold Calling', 'Referrals', 'Follow up', 'Other']
const CARD_TYPES = ['Etihad Guest', 'Etihad Guest Saqer', 'Etihad Guest Platinum', 'Etihad Guest Premium', 'Skywards Black', 'Skywards Infinite', 'Skywards Signature', 'Switch Cashback', 'Cashback Plus', 'Cashback', 'RTA', 'Amazon World', 'Amazon Platinum']
const LEAD_STAGES: LeadStatus[] = ['new', 'qualified', 'appointment', 'negotiation', 'won', 'lost']
const DEAL_STAGES: DealStatus[] = ['processing', 'verification', 'activation', 'completed', 'unsuccessful']

const stageColor: Record<string, string> = {
  new: 'gray', qualified: 'blue', appointment: 'yellow', negotiation: 'orange', won: 'green', lost: 'red',
  processing: 'blue', verification: 'yellow', activation: 'orange', completed: 'green', unsuccessful: 'red',
}

const tabs = [
  { id: 'leads', label: 'Leads' },
  { id: 'deals', label: 'Deals' },
  { id: 'network', label: 'Network' },
]

export default function Professional() {
  const [tab, setTab] = useState('leads')

  return (
    <AppShell title="Professional">
      <Tabs tabs={tabs} active={tab} onChange={setTab} className="mb-4" />
      {tab === 'leads' && <LeadsTab />}
      {tab === 'deals' && <DealsTab />}
      {tab === 'network' && <NetworkTab />}
    </AppShell>
  )
}

// ─── Leads Kanban ─────────────────────────────────────────────────────────────
function LeadsTab() {
  const { state, dispatch } = useStore()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<{
    name: string; mobile: string; email: string; status: LeadStatus; source: LeadSource;
    emirate: UAEEmirate | ''; product: CRMProduct | ''; bank: UAEBank | ''; card_type: string;
    application_number: string; bpm_id: string; monthly_basic_salary: string; aecb_score: string;
    nationality: string; visa_status: string; expected_value: string; notes: string;
  }>({
    name: '', mobile: '', email: '', status: 'new', source: 'LinkedIn',
    emirate: '', product: '', bank: '', card_type: '', application_number: '', bpm_id: '',
    monthly_basic_salary: '', aecb_score: '', nationality: '', visa_status: '', expected_value: '', notes: '',
  })

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const lead = await createLead({
      user_id: state.profile!.id,
      ...form,
      emirate: form.emirate || null,
      product: form.product || null,
      bank: form.bank || null,
      card_type: form.card_type || null,
      application_number: form.application_number || null,
      bpm_id: form.bpm_id || null,
      submission_date: null, completion_date: null, date_of_birth: null,
      emirates_id: null, passport_number: null, salary_bank: null, company_landline: null,
      monthly_basic_salary: form.monthly_basic_salary ? parseFloat(form.monthly_basic_salary) : null,
      aecb_score: form.aecb_score ? parseInt(form.aecb_score) : null,
      nationality: form.nationality || null,
      visa_status: form.visa_status || null,
      expected_value: form.expected_value ? parseFloat(form.expected_value) : null,
      notes: form.notes || null,
    })
    dispatch({ type: 'UPSERT_LEAD', payload: lead })
    setLoading(false)
    setOpen(false)
  }

  async function handleConvert(lead: CRMLead) {
    const deal = await convertLeadToDeal(lead)
    dispatch({ type: 'UPSERT_LEAD', payload: { ...lead, status: 'won' } })
    dispatch({ type: 'UPSERT_DEAL', payload: deal })
  }

  async function moveStage(lead: CRMLead, newStatus: LeadStatus) {
    await updateLead(lead.id, { status: newStatus })
    dispatch({ type: 'UPSERT_LEAD', payload: { ...lead, status: newStatus } })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)} icon={<Plus size={16} />} size="sm">New Lead</Button>
      </div>

      {/* Kanban */}
      <div className="overflow-x-auto -mx-4 px-4">
        <div className="flex gap-3 pb-4" style={{ minWidth: 'max-content' }}>
          {LEAD_STAGES.map((stage) => {
            const leads = state.leads.filter((l) => l.status === stage)
            return (
              <div key={stage} className="kanban-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold capitalize text-slate-600 dark:text-slate-300">{stage}</span>
                  <Badge color={stageColor[stage] as 'gray'}>{leads.length}</Badge>
                </div>
                <div className="space-y-2">
                  {leads.map((lead) => (
                    <div key={lead.id} className="bg-white dark:bg-slate-700 rounded-xl p-3 shadow-sm">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">{lead.name}</p>
                      <p className="text-xs text-slate-400">{lead.mobile}</p>
                      {lead.product && <Badge color="blue" className="text-[10px] mt-1">{lead.product}</Badge>}
                      {lead.expected_value && <p className="text-xs text-primary-600 font-semibold mt-1">{formatCurrency(lead.expected_value)}</p>}
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {LEAD_STAGES.filter((s) => s !== stage && s !== 'won' && s !== 'lost').map((s) => (
                          <button key={s} onClick={() => moveStage(lead, s)} className="text-[10px] text-slate-400 hover:text-primary-600 transition-colors">{s} →</button>
                        ))}
                        {stage !== 'won' && stage !== 'lost' && (
                          <button onClick={() => handleConvert(lead)} className="flex items-center gap-0.5 text-[10px] text-green-600 font-semibold">
                            <ArrowRight size={10} /> Convert
                          </button>
                        )}
                        <button onClick={() => { deleteLead(lead.id); dispatch({ type: 'DELETE_LEAD', payload: lead.id }) }} className="text-[10px] text-red-400 ml-auto">
                          <Trash2 size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="New Lead" size="lg">
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input label="Mobile" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value as LeadSource })} options={LEAD_SOURCES.map((s) => ({ value: s, label: s }))} />
            <Select label="Emirate" value={form.emirate} onChange={(e) => setForm({ ...form, emirate: e.target.value as UAEEmirate })} options={UAE_EMIRATES.map((e) => ({ value: e, label: e }))} placeholder="Select emirate" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Product" value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value as CRMProduct })} options={PRODUCTS.map((p) => ({ value: p, label: p }))} placeholder="Select product" />
            <Select label="Bank" value={form.bank} onChange={(e) => setForm({ ...form, bank: e.target.value as UAEBank })} options={UAE_BANKS.map((b) => ({ value: b, label: b }))} placeholder="Select bank" />
          </div>
          {form.product === 'Credit Card' && (
            <Select label="Card Type" value={form.card_type} onChange={(e) => setForm({ ...form, card_type: e.target.value })} options={CARD_TYPES.map((c) => ({ value: c, label: c }))} placeholder="Select card type" />
          )}
          <div className="grid grid-cols-2 gap-3">
            <Input label="Monthly Salary (AED)" type="number" value={form.monthly_basic_salary} onChange={(e) => setForm({ ...form, monthly_basic_salary: e.target.value })} />
            <Input label="AECB Score" type="number" value={form.aecb_score} onChange={(e) => setForm({ ...form, aecb_score: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Nationality" value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} />
            <Input label="Visa Status" value={form.visa_status} onChange={(e) => setForm({ ...form, visa_status: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Application #" value={form.application_number} onChange={(e) => setForm({ ...form, application_number: e.target.value })} />
            <Input label="BPM ID" value={form.bpm_id} onChange={(e) => setForm({ ...form, bpm_id: e.target.value })} />
          </div>
          <Input label="Expected Value (AED)" type="number" value={form.expected_value} onChange={(e) => setForm({ ...form, expected_value: e.target.value })} />
          <Button type="submit" loading={loading} className="w-full justify-center">Add Lead</Button>
        </form>
      </Modal>
    </div>
  )
}

// ─── Deals Kanban ─────────────────────────────────────────────────────────────
function DealsTab() {
  const { state, dispatch } = useStore()

  async function moveStage(deal: CRMDeal, status: DealStatus) {
    await updateDeal(deal.id, { status })
    dispatch({ type: 'UPSERT_DEAL', payload: { ...deal, status } })
  }

  return (
    <div>
      {state.deals.length === 0
        ? <EmptyState icon={<Briefcase size={40} />} title="No deals yet" description="Convert a lead to create a deal" />
        : (
          <div className="overflow-x-auto -mx-4 px-4">
            <div className="flex gap-3 pb-4" style={{ minWidth: 'max-content' }}>
              {DEAL_STAGES.map((stage) => {
                const deals = state.deals.filter((d) => d.status === stage)
                const total = deals.reduce((s, d) => s + (d.value ?? 0), 0)
                return (
                  <div key={stage} className="kanban-col">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold capitalize text-slate-600 dark:text-slate-300">{stage.replace('_', ' ')}</span>
                      <Badge color={stageColor[stage] as 'gray'}>{deals.length}</Badge>
                    </div>
                    {total > 0 && <p className="text-xs text-primary-600 font-semibold mb-3">{formatCurrency(total)}</p>}
                    <div className="space-y-2">
                      {deals.map((deal) => (
                        <div key={deal.id} className="bg-white dark:bg-slate-700 rounded-xl p-3 shadow-sm">
                          <p className="text-sm font-semibold text-slate-800 dark:text-white">{deal.name}</p>
                          {deal.value && <p className="text-xs text-primary-600 font-bold">{formatCurrency(deal.value)}</p>}
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {DEAL_STAGES.filter((s) => s !== stage).map((s) => (
                              <button key={s} onClick={() => moveStage(deal, s)} className="text-[10px] text-slate-400 hover:text-primary-600">{s.replace('_', ' ')} →</button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      }
    </div>
  )
}

// ─── Network / Connections ────────────────────────────────────────────────────
function NetworkTab() {
  const { state, dispatch } = useStore()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ full_name: '', type: 'Client' as ConnectionType, mobile: '', email: '', company: '', designation: '', nationality: '', visa_status: '', emirate: '' as UAEEmirate | '' })

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const conn = await createConnection({
      user_id: state.profile!.id,
      ...form,
      emirate: form.emirate || null,
      mobile: form.mobile || null,
      email: form.email || null,
      company: form.company || null,
      designation: form.designation || null,
      nationality: form.nationality || null,
      visa_status: form.visa_status || null,
      date_of_birth: null, emirates_id: null, passport_number: null, notes: null, photo_url: null,
    })
    dispatch({ type: 'UPSERT_CONNECTION', payload: conn })
    setLoading(false)
    setOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)} icon={<Plus size={16} />} size="sm">Add Connection</Button>
      </div>

      {state.connections.length === 0
        ? <EmptyState icon={<Phone size={40} />} title="No connections yet" />
        : state.connections.map((c) => (
          <Card key={c.id} className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
              <span className="text-primary-600 font-bold text-sm">{c.full_name.slice(0, 2).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 dark:text-white text-sm">{c.full_name}</p>
              <p className="text-xs text-slate-400">{c.designation}{c.company ? ` · ${c.company}` : ''}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {c.mobile && (
                <>
                  <a href={`https://wa.me/${c.mobile.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-green-500 hover:text-green-600">
                    <MessageCircle size={16} />
                  </a>
                  <a href={`tel:${c.mobile}`} className="text-blue-500 hover:text-blue-600">
                    <Phone size={16} />
                  </a>
                </>
              )}
              {c.email && (
                <a href={`mailto:${c.email}`} className="text-slate-400 hover:text-slate-600">
                  <Mail size={16} />
                </a>
              )}
              <button onClick={() => { deleteConnection(c.id); dispatch({ type: 'DELETE_CONNECTION', payload: c.id }) }} className="text-slate-300 hover:text-red-500 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          </Card>
        ))
      }

      <Modal open={open} onClose={() => setOpen(false)} title="Add Connection">
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
            <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ConnectionType })} options={['Client', 'Colleague', 'Partner', 'Relation', 'Other'].map((t) => ({ value: t, label: t }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Mobile" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            <Input label="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Nationality" value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} />
            <Select label="Emirate" value={form.emirate} onChange={(e) => setForm({ ...form, emirate: e.target.value as UAEEmirate })} options={UAE_EMIRATES.map((e) => ({ value: e, label: e }))} placeholder="Select emirate" />
          </div>
          <Button type="submit" loading={loading} className="w-full justify-center">Save</Button>
        </form>
      </Modal>
    </div>
  )
}
