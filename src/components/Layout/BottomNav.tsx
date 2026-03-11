import { NavLink } from 'react-router-dom'
import { Home, CheckSquare, DollarSign, Briefcase, Menu } from 'lucide-react'
import { cn } from '@/utils/helpers'

const navItems = [
  { to: '/', icon: Home, label: 'Home', end: true },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/finance', icon: DollarSign, label: 'Finance' },
  { to: '/professional', icon: Briefcase, label: 'CRM' },
  { to: '/menu', icon: Menu, label: 'Menu' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 z-50 bottom-nav md:hidden">
      <div className="flex items-center justify-around h-14">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn('flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors',
                isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-[10px] font-semibold">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
