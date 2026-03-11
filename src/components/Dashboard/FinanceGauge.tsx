import { useMemo } from 'react'
import { TrendingUp } from 'lucide-react'
import { useStore } from '@/utils/store'
import { formatCurrency } from '@/utils/helpers'
import Card from '@/components/Common/Card'

export default function FinanceGauge() {
  const { state } = useStore()
  const now = new Date()
  const month = now.getMonth()
  const year = now.getFullYear()

  const { income, safety, growth, safeToSpend } = useMemo(() => {
    const thisMonth = state.transactions.filter((t) => {
      const d = new Date(t.date)
      return d.getMonth() === month && d.getFullYear() === year
    })
    const income = thisMonth.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const safety = thisMonth.filter((t) => t.bucket === 'safety').reduce((s, t) => s + t.amount, 0)
    const growth = thisMonth.filter((t) => t.bucket === 'growth').reduce((s, t) => s + t.amount, 0)
    return { income, safety, growth, safeToSpend: income - safety - growth }
  }, [state.transactions, month, year])

  const pct = income > 0 ? Math.min(Math.max((safeToSpend / income) * 100, 0), 100) : 0
  const positive = safeToSpend >= 0

  // SVG radial gauge

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
          <TrendingUp size={14} className="text-green-600" />
        </div>
        <span className="font-semibold text-sm text-slate-800 dark:text-white">Financial Health</span>
      </div>

      <div className="flex items-center gap-6">
        {/* Gauge */}
        <div className="relative flex-shrink-0">
          <svg width="120" height="80" viewBox="0 0 120 80">
            <path
              d="M 10 70 A 50 50 0 0 1 110 70"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <path
              d="M 10 70 A 50 50 0 0 1 110 70"
              fill="none"
              stroke={positive ? '#336633' : '#ef4444'}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${(pct / 100) * 157} 157`}
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
            <span className={`text-lg font-bold ${positive ? 'text-primary-600' : 'text-red-500'}`}>
              {Math.round(pct)}%
            </span>
          </div>
        </div>

        {/* Numbers */}
        <div className="space-y-1.5 text-sm flex-1">
          <div className="flex justify-between">
            <span className="text-slate-500">Income</span>
            <span className="font-semibold">{formatCurrency(income)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Safety</span>
            <span className="text-blue-500 font-medium">-{formatCurrency(safety)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Growth</span>
            <span className="text-purple-500 font-medium">-{formatCurrency(growth)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-100 dark:border-slate-700 pt-1.5 mt-1">
            <span className="font-semibold text-slate-700 dark:text-white">Safe to Spend</span>
            <span className={`font-bold ${positive ? 'text-primary-600' : 'text-red-500'}`}>
              {formatCurrency(safeToSpend)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
