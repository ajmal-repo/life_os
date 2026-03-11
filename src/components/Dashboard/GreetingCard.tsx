import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { getGreeting } from '@/utils/helpers'
import { useStore } from '@/utils/store'
import Card from '@/components/Common/Card'

const QUOTES = [
  "The secret of getting ahead is getting started. — Mark Twain",
  "You don't have to be great to start, but you have to start to be great. — Zig Ziglar",
  "Discipline is the bridge between goals and accomplishment. — Jim Rohn",
  "Success is the sum of small efforts repeated day in and day out. — Robert Collier",
  "The future depends on what you do today. — Mahatma Gandhi",
  "Focus on being productive instead of busy. — Tim Ferriss",
  "It always seems impossible until it's done. — Nelson Mandela",
  "Small daily improvements over time lead to stunning results.",
  "Motivation is what gets you started. Habit is what keeps you going. — Jim Ryun",
  "Your time is limited, don't waste it living someone else's life. — Steve Jobs",
]

export default function GreetingCard() {
  const { state } = useStore()
  const name = state.profile?.full_name?.split(' ')[0] ?? 'Friend'
  const [time, setTime] = useState(new Date())
  const [quoteIdx, setQuoteIdx] = useState(() => Math.floor(Math.random() * QUOTES.length))

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60_000)
    return () => clearInterval(t)
  }, [])

  return (
    <Card className="bg-gradient-to-br from-primary-500 to-primary-700 text-white border-0" padding="lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-primary-100 text-sm font-medium">{format(time, 'EEEE, d MMMM yyyy')}</p>
          <h2 className="text-2xl font-bold mt-0.5">{getGreeting(name)}</h2>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold tabular-nums">{format(time, 'HH:mm')}</p>
        </div>
      </div>

      {/* Quote */}
      <div className="mt-4 pt-4 border-t border-white/20">
        <p className="text-primary-100 text-sm italic leading-relaxed">{QUOTES[quoteIdx]}</p>
        <button
          onClick={() => setQuoteIdx((i) => (i + 1) % QUOTES.length)}
          className="mt-2 text-xs text-white/70 hover:text-white transition-colors underline underline-offset-2"
        >
          Shuffle
        </button>
      </div>
    </Card>
  )
}
