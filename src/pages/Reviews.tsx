import { useState } from 'react'
import { Star, ChevronDown, ChevronUp } from 'lucide-react'
import AppShell from '@/components/Layout/AppShell'
import Card from '@/components/Common/Card'
import Button from '@/components/Common/Button'
import { Input, Textarea } from '@/components/Common/Input'
import EmptyState from '@/components/Common/EmptyState'
import { useStore } from '@/utils/store'
import { supabase } from '@/lib/supabase'
import { formatDate, cn } from '@/utils/helpers'
import type { WeeklyReview } from '@/types'


export default function Reviews() {
  const { state, dispatch } = useStore()
  const [form, setForm] = useState({ week_start_date: '', wins: '', challenges: '', lessons: '', rating: 3 as 1 | 2 | 3 | 4 | 5 })
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const review: WeeklyReview = {
      id: crypto.randomUUID(),
      user_id: state.profile!.id,
      ...form,
      created_at: new Date().toISOString(),
    }
    const { data } = await supabase.from('weekly_reviews').insert(review).select().single()
    dispatch({ type: 'UPSERT_REVIEW', payload: (data ?? review) as WeeklyReview })
    setForm({ week_start_date: '', wins: '', challenges: '', lessons: '', rating: 3 })
    setLoading(false)
  }

  return (
    <AppShell title="Weekly Reviews">
      {/* Form */}
      <Card className="mb-6">
        <h2 className="font-bold text-base text-slate-800 dark:text-white mb-4">New Weekly Review</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Week Start Date" type="date" value={form.week_start_date} onChange={(e) => setForm({ ...form, week_start_date: e.target.value })} required />
          <Textarea label="Wins" placeholder="What went well this week?" value={form.wins} onChange={(e) => setForm({ ...form, wins: e.target.value })} />
          <Textarea label="Challenges" placeholder="What was difficult?" value={form.challenges} onChange={(e) => setForm({ ...form, challenges: e.target.value })} />
          <Textarea label="Lessons" placeholder="What did you learn?" value={form.lessons} onChange={(e) => setForm({ ...form, lessons: e.target.value })} />

          <div>
            <label className="label">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm({ ...form, rating: r as 1 | 2 | 3 | 4 | 5 })}
                  className={cn('transition-colors', form.rating >= r ? 'text-yellow-400' : 'text-slate-200 dark:text-slate-600')}
                >
                  <Star size={24} fill={form.rating >= r ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full justify-center">Save Review</Button>
        </form>
      </Card>

      {/* History */}
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Review History</h3>
      {state.reviews.length === 0
        ? <EmptyState icon={<Star size={40} />} title="No reviews yet" description="Complete your first weekly review above" />
        : (
          <div className="space-y-3">
            {state.reviews.map((review) => (
              <Card key={review.id}>
                <button
                  className="w-full flex items-center justify-between"
                  onClick={() => setExpanded(expanded === review.id ? null : review.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((r) => (
                        <Star key={r} size={14} className={cn(review.rating >= r ? 'text-yellow-400' : 'text-slate-200')} fill={review.rating >= r ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-slate-800 dark:text-white">
                      Week of {formatDate(review.week_start_date)}
                    </span>
                  </div>
                  {expanded === review.id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </button>

                {expanded === review.id && (
                  <div className="mt-4 space-y-3 border-t border-slate-100 dark:border-slate-700 pt-3">
                    {[{ label: 'Wins', value: review.wins, color: 'text-green-600' }, { label: 'Challenges', value: review.challenges, color: 'text-red-500' }, { label: 'Lessons', value: review.lessons, color: 'text-blue-500' }].map(({ label, value, color }) => (
                      value ? (
                        <div key={label}>
                          <p className={cn('text-xs font-bold uppercase tracking-wide mb-1', color)}>{label}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-300">{value}</p>
                        </div>
                      ) : null
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )
      }
    </AppShell>
  )
}
