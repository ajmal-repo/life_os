import AppShell from '@/components/Layout/AppShell'
import GreetingCard from '@/components/Dashboard/GreetingCard'
import AffirmationsCard from '@/components/Dashboard/AffirmationsCard'
import TodayFocusCard from '@/components/Dashboard/TodayFocusCard'
import NextUpHabits from '@/components/Dashboard/NextUpHabits'
import FinanceGauge from '@/components/Dashboard/FinanceGauge'

export default function Dashboard() {
  return (
    <AppShell title="Dashboard">
      <div className="space-y-4">
        <GreetingCard />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TodayFocusCard />
          <NextUpHabits />
        </div>
        <AffirmationsCard />
        <FinanceGauge />
      </div>
    </AppShell>
  )
}
