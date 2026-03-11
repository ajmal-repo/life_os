import { NavLink } from 'react-router-dom'
import {
  Home, CheckSquare, DollarSign, Briefcase, Heart, Eye, Star,
  FolderOpen, Settings, ChevronLeft, ChevronRight, Zap
} from 'lucide-react'
import { cn } from '@/utils/helpers'
import { useState } from 'react'

const navItems = [
  { section: 'Main' },
  { to: '/', icon: Home, label: 'Dashboard', end: true },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/finance', icon: DollarSign, label: 'Finance' },
  { to: '/professional', icon: Briefcase, label: 'Professional' },
  { section: 'Life' },
  { to: '/wellness', icon: Heart, label: 'Wellness' },
  { to: '/visions', icon: Eye, label: 'Visions' },
  { section: 'Tools' },
  { to: '/reviews', icon: Star, label: 'Reviews' },
  { to: '/documents', icon: FolderOpen, label: 'Documents' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={cn(
      'hidden md:flex flex-col h-screen sticky top-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 transition-all duration-200',
      collapsed ? 'w-16' : 'w-56'
    )}>
      {/* Logo */}
      <div className={cn('flex items-center gap-2.5 px-4 h-16 border-b border-slate-200 dark:border-slate-700', collapsed && 'justify-center px-0')}>
        <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Zap size={16} className="text-white" strokeWidth={2.5} />
        </div>
        {!collapsed && <span className="font-bold text-primary-600 dark:text-primary-400 text-base">Life OS</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto no-scrollbar">
        {navItems.map((item, i) => {
          if ('section' in item) {
            return collapsed ? null : (
              <p key={i} className="px-4 pt-4 pb-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                {item.section}
              </p>
            )
          }
          const { to, icon: Icon, label, end } = item as { to: string; icon: typeof Home; label: string; end?: boolean }
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn('flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl transition-colors mb-0.5',
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800',
                  collapsed && 'justify-center px-0'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} className="flex-shrink-0" />
                  {!collapsed && <span className="text-sm font-medium">{label}</span>}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center justify-center h-10 border-t border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  )
}
