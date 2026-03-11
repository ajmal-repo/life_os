import { Wifi, WifiOff, Bell } from 'lucide-react'
import { useStore } from '@/utils/store'
import { avatarInitials } from '@/utils/helpers'

interface HeaderProps {
  title: string
}

export default function Header({ title }: HeaderProps) {
  const { state } = useStore()
  const name = state.profile?.full_name ?? ''
  const avatar = state.profile?.avatar_url

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 h-14 flex items-center px-4 gap-3">
      <h1 className="flex-1 text-base font-bold text-slate-900 dark:text-white">{title}</h1>

      {/* Online indicator */}
      <div title={state.online ? 'Online' : 'Offline'}>
        {state.online
          ? <Wifi size={16} className="text-primary-500" />
          : <WifiOff size={16} className="text-red-400" />
        }
      </div>

      <button className="relative btn-ghost p-2">
        <Bell size={18} />
      </button>

      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
        {avatar
          ? <img src={avatar} alt={name} className="w-full h-full object-cover" />
          : <span className="text-white text-xs font-bold">{avatarInitials(name || 'U')}</span>
        }
      </div>
    </header>
  )
}
