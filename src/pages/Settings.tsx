import { useState } from 'react'
import { LogOut, Moon, Sun, Download, User } from 'lucide-react'
import AppShell from '@/components/Layout/AppShell'
import Card from '@/components/Common/Card'
import Button from '@/components/Common/Button'
import { Input, Select } from '@/components/Common/Input'
import { useStore } from '@/utils/store'
import { supabase } from '@/lib/supabase'
import { avatarInitials } from '@/utils/helpers'

export default function Settings() {
  const { state, dispatch } = useStore()
  const profile = state.profile
  const [name, setName] = useState(profile?.full_name ?? '')
  const [theme, setTheme] = useState<'light' | 'dark'>(profile?.settings?.theme ?? 'light')
  const [startWeek, setStartWeek] = useState<'monday' | 'saturday'>(profile?.settings?.start_week ?? 'monday')
  const [saving, setSaving] = useState(false)

  async function saveProfile() {
    if (!profile) return
    setSaving(true)
    const updated = { full_name: name, settings: { ...profile.settings, theme, start_week: startWeek } }
    await supabase.from('profiles').update(updated).eq('id', profile.id)
    dispatch({ type: 'SET_PROFILE', payload: { ...profile, ...updated } })

    // Apply theme
    if (theme === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')

    setSaving(false)
  }

  async function exportData() {
    const data = {
      tasks: state.tasks,
      projects: state.projects,
      transactions: state.transactions,
      loans: state.loans,
      habits: state.habits,
      habitLogs: state.habitLogs,
      leads: state.leads,
      connections: state.connections,
      reviews: state.reviews,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `life-os-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function signOut() {
    await supabase.auth.signOut()
    dispatch({ type: 'SET_PROFILE', payload: null })
  }

  return (
    <AppShell title="Settings">
      <div className="space-y-6 max-w-lg">
        {/* Profile */}
        <Card>
          <h3 className="font-bold text-sm text-slate-700 dark:text-white mb-4 flex items-center gap-2">
            <User size={16} /> Profile
          </h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-500 flex items-center justify-center">
              <span className="text-white text-xl font-bold">{avatarInitials(name || 'U')}</span>
            </div>
            <div className="flex-1">
              <Input
                label="Display Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
          </div>
          <p className="text-xs text-slate-400 mb-4">{state.profile?.id}</p>
        </Card>

        {/* Appearance */}
        <Card>
          <h3 className="font-bold text-sm text-slate-700 dark:text-white mb-4 flex items-center gap-2">
            {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />} Appearance
          </h3>
          <div className="space-y-3">
            <div className="flex gap-3">
              {(['light', 'dark'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-colors ${
                    theme === t ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {t === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                  <span className="text-xs font-semibold capitalize">{t}</span>
                </button>
              ))}
            </div>
            <Select
              label="Week Starts On"
              value={startWeek}
              onChange={(e) => setStartWeek(e.target.value as 'monday' | 'saturday')}
              options={[{ value: 'monday', label: 'Monday' }, { value: 'saturday', label: 'Saturday' }]}
            />
          </div>
        </Card>

        <Button onClick={saveProfile} loading={saving} className="w-full justify-center">
          Save Settings
        </Button>

        {/* Data */}
        <Card>
          <h3 className="font-bold text-sm text-slate-700 dark:text-white mb-4 flex items-center gap-2">
            <Download size={16} /> Data
          </h3>
          <Button onClick={exportData} variant="secondary" icon={<Download size={16} />} className="w-full justify-center">
            Export All Data (JSON)
          </Button>
        </Card>

        {/* Sign out */}
        <Button onClick={signOut} variant="danger" icon={<LogOut size={16} />} className="w-full justify-center">
          Sign Out
        </Button>
      </div>
    </AppShell>
  )
}
