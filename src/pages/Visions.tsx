import { useState } from 'react'
import { Plus, Heart, Trash2, Calendar } from 'lucide-react'
import { differenceInDays, format } from 'date-fns'
import AppShell from '@/components/Layout/AppShell'
import { Tabs } from '@/components/Common/Tabs'
import Card from '@/components/Common/Card'
import Button from '@/components/Common/Button'
import Badge from '@/components/Common/Badge'
import Modal from '@/components/Common/Modal'
import EmptyState from '@/components/Common/EmptyState'
import { Input, Select, Textarea } from '@/components/Common/Input'
import { useStore } from '@/utils/store'
import { supabase } from '@/lib/supabase'
import { cn } from '@/utils/helpers'
import type { GoalTimeline, VisionGoal, Relationship } from '@/types'

const VALUES = ['Integrity', 'Excellence', 'Growth', 'Family', 'Service', 'Discipline', 'Innovation', 'Compassion', 'Health', 'Freedom', 'Creativity', 'Leadership']

const tabs = [
  { id: 'mission', label: 'Mission' },
  { id: 'goals', label: 'Goals' },
  { id: 'relations', label: 'Relationships' },
]

export default function Visions() {
  const [tab, setTab] = useState('mission')

  return (
    <AppShell title="Visions">
      <Tabs tabs={tabs} active={tab} onChange={setTab} className="mb-4" />
      {tab === 'mission' && <MissionTab />}
      {tab === 'goals' && <GoalsTab />}
      {tab === 'relations' && <RelationsTab />}
    </AppShell>
  )
}

// ─── Mission Tab ──────────────────────────────────────────────────────────────
function MissionTab() {
  const { state } = useStore()
  const settings = state.profile?.settings
  const [selectedValues, setSelectedValues] = useState<string[]>([])
  const [mission, setMission] = useState('')
  const [saving, setSaving] = useState(false)

  function toggleValue(v: string) {
    setSelectedValues((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : prev.length < 12 ? [...prev, v] : prev
    )
  }

  async function saveMission() {
    if (!state.profile) return
    setSaving(true)
    await supabase.from('profiles').update({ settings: { ...settings, mission, values: selectedValues } }).eq('id', state.profile.id)
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      <Card>
        <p className="label">Personal Mission Statement</p>
        <textarea
          className="input min-h-[120px] resize-y"
          placeholder="Write your personal mission statement…"
          value={mission}
          onChange={(e) => setMission(e.target.value)}
        />
      </Card>

      <Card>
        <p className="label mb-3">Core Values (select up to 12)</p>
        <div className="flex flex-wrap gap-2">
          {VALUES.map((v) => (
            <button
              key={v}
              onClick={() => toggleValue(v)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-colors border',
                selectedValues.includes(v)
                  ? 'bg-primary-500 text-white border-primary-500'
                  : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-primary-300'
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </Card>

      <Button onClick={saveMission} loading={saving} className="w-full justify-center">
        Save Mission & Values
      </Button>
    </div>
  )
}

// ─── Goals Tab ────────────────────────────────────────────────────────────────
function GoalsTab() {
  const { state, dispatch } = useStore()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', timeline: '1year' as GoalTimeline, progress: '0' })

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const item = { id: crypto.randomUUID(), user_id: state.profile!.id, ...form, progress: parseInt(form.progress) || 0, description: form.description || null, created_at: new Date().toISOString() } as VisionGoal
    const { data } = await supabase.from('vision_goals').insert(item).select().single()
    dispatch({ type: 'UPSERT_VISION_GOAL', payload: (data ?? item) as VisionGoal })
    setLoading(false)
    setOpen(false)
  }

  const byTimeline = (t: GoalTimeline) => state.visionGoals.filter((g) => g.timeline === t)

  const timelineLabel: Record<GoalTimeline, string> = { '1year': '1-Year Goals', '3year': '3-Year Goals', '5year': '5-Year Goals' }
  const timelineColor: Record<GoalTimeline, string> = { '1year': 'green', '3year': 'blue', '5year': 'purple' }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)} icon={<Plus size={16} />} size="sm">Add Goal</Button>
      </div>

      {(['1year', '3year', '5year'] as GoalTimeline[]).map((tl) => {
        const goals = byTimeline(tl)
        return (
          <div key={tl}>
            <div className="flex items-center gap-2 mb-3">
              <Badge color={timelineColor[tl] as 'green' | 'blue' | 'purple'}>{timelineLabel[tl]}</Badge>
            </div>
            {goals.length === 0
              ? <p className="text-sm text-slate-400 pl-2">No goals set</p>
              : goals.map((g) => (
                <Card key={g.id} className="mb-2">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-semibold text-slate-800 dark:text-white text-sm">{g.title}</p>
                    <button onClick={() => { supabase.from('vision_goals').delete().eq('id', g.id); dispatch({ type: 'DELETE_VISION_GOAL', payload: g.id }) }} className="text-slate-300 hover:text-red-500">
                      <Trash2 size={13} />
                    </button>
                  </div>
                  {g.description && <p className="text-xs text-slate-400 mb-2">{g.description}</p>}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full" style={{ width: `${g.progress}%` }} />
                    </div>
                    <span className="text-xs text-slate-400">{g.progress}%</span>
                  </div>
                </Card>
              ))
            }
          </div>
        )
      })}

      <Modal open={open} onClose={() => setOpen(false)} title="New Goal">
        <form onSubmit={handleAdd} className="space-y-4">
          <Input label="Goal Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Textarea label="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Timeline" value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value as GoalTimeline })}
              options={[{ value: '1year', label: '1 Year' }, { value: '3year', label: '3 Years' }, { value: '5year', label: '5 Years' }]} />
            <Input label="Progress %" type="number" min="0" max="100" value={form.progress} onChange={(e) => setForm({ ...form, progress: e.target.value })} />
          </div>
          <Button type="submit" loading={loading} className="w-full justify-center">Save Goal</Button>
        </form>
      </Modal>
    </div>
  )
}

// ─── Relationships Tab ────────────────────────────────────────────────────────
function RelationsTab() {
  const { state, dispatch } = useStore()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ full_name: '', relation: 'Close Friend' as Relationship['relation'], phone: '', notes: '', birthday: '' })

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const dates = form.birthday ? [{ id: crypto.randomUUID(), label: 'Birthday' as const, date: form.birthday, custom_label: null }] : []
    const item = {
      id: crypto.randomUUID(), user_id: state.profile!.id,
      full_name: form.full_name, relation: form.relation,
      phone: form.phone || null, photo_url: null, notes: form.notes || null,
      important_dates: dates, created_at: new Date().toISOString(),
    } as Relationship
    const { data } = await supabase.from('relationships').insert(item).select().single()
    dispatch({ type: 'UPSERT_RELATIONSHIP', payload: (data ?? item) as Relationship })
    setLoading(false)
    setOpen(false)
  }

  function getCountdown(dateStr: string): { days: number; label: string } {
    const now = new Date()
    const date = new Date(dateStr)
    date.setFullYear(now.getFullYear())
    if (date < now) date.setFullYear(now.getFullYear() + 1)
    return { days: differenceInDays(date, now), label: format(date, 'd MMM') }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)} icon={<Plus size={16} />} size="sm">Add Person</Button>
      </div>

      {state.relationships.length === 0
        ? <EmptyState icon={<Heart size={40} />} title="No relationships added" />
        : state.relationships.map((r) => (
          <Card key={r.id}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center flex-shrink-0">
                <span className="text-pink-600 font-bold text-sm">{r.full_name.slice(0, 2).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 dark:text-white text-sm">{r.full_name}</p>
                <Badge color="gray" className="text-[10px] mt-0.5">{r.relation}</Badge>
                {r.notes && <p className="text-xs text-slate-400 mt-1">{r.notes}</p>}
                {r.important_dates?.map((d) => {
                  const { days, label } = getCountdown(d.date)
                  return (
                    <div key={d.id} className={cn('flex items-center gap-1.5 mt-2 text-xs font-medium', days <= 7 ? 'text-red-500' : days <= 30 ? 'text-yellow-500' : 'text-green-600')}>
                      <Calendar size={12} />
                      <span>{d.label}: {label} ({days === 0 ? 'Today!' : `${days}d`})</span>
                    </div>
                  )
                })}
              </div>
              <button onClick={() => { supabase.from('relationships').delete().eq('id', r.id); dispatch({ type: 'DELETE_RELATIONSHIP', payload: r.id }) }} className="text-slate-300 hover:text-red-500">
                <Trash2 size={14} />
              </button>
            </div>
          </Card>
        ))
      }

      <Modal open={open} onClose={() => setOpen(false)} title="Add Person">
        <form onSubmit={handleAdd} className="space-y-4">
          <Input label="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          <Select label="Relation" value={form.relation} onChange={(e) => setForm({ ...form, relation: e.target.value as Relationship['relation'] })}
            options={['Father', 'Mother', 'Spouse', 'Sibling', 'Child', 'Extended Family', 'Close Friend'].map((r) => ({ value: r, label: r }))} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Birthday (optional)" type="date" value={form.birthday} onChange={(e) => setForm({ ...form, birthday: e.target.value })} />
          <Textarea label="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
          <Button type="submit" loading={loading} className="w-full justify-center">Save</Button>
        </form>
      </Modal>
    </div>
  )
}
