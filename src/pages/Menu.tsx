import { Link } from 'react-router-dom'
import { Heart, Eye, Star, FolderOpen, Settings } from 'lucide-react'
import AppShell from '@/components/Layout/AppShell'
import Card from '@/components/Common/Card'

const menuItems = [
  { to: '/wellness', icon: Heart, label: 'Wellness', desc: 'Habits & routines', color: 'bg-orange-100 text-orange-600' },
  { to: '/visions', icon: Eye, label: 'Visions', desc: 'Goals & relationships', color: 'bg-purple-100 text-purple-600' },
  { to: '/reviews', icon: Star, label: 'Weekly Reviews', desc: 'Reflect & improve', color: 'bg-yellow-100 text-yellow-600' },
  { to: '/documents', icon: FolderOpen, label: 'Documents', desc: 'File vault', color: 'bg-blue-100 text-blue-600' },
  { to: '/settings', icon: Settings, label: 'Settings', desc: 'Profile & preferences', color: 'bg-slate-100 text-slate-600' },
]

export default function Menu() {
  return (
    <AppShell title="Menu">
      <div className="grid grid-cols-2 gap-3">
        {menuItems.map(({ to, icon: Icon, label, desc, color }) => (
          <Link key={to} to={to}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                <Icon size={20} />
              </div>
              <p className="font-semibold text-slate-800 dark:text-white text-sm">{label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </AppShell>
  )
}
