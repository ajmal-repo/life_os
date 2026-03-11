import type { ReactNode } from 'react'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import Header from './Header'

interface AppShellProps {
  children: ReactNode
  title: string
}

export default function AppShell({ children, title }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-6 px-4 md:px-6">
          <div className="max-w-5xl mx-auto py-4">
            {children}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
