import { useState } from 'react'
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import Card from '@/components/Common/Card'

const AFFIRMATIONS = [
  "I am a top performer who creates massive value for my clients.",
  "Every 'no' brings me closer to a 'yes.' Rejection is redirection.",
  "I am disciplined, focused, and unstoppable.",
  "Success is my natural state. I was born to win.",
  "I turn obstacles into opportunities.",
  "My income grows as I grow. I invest in myself daily.",
  "I am worthy of abundance, prosperity, and financial freedom.",
  "Rest is part of my success strategy, not a weakness.",
  "I attract ideal clients effortlessly because I provide real value.",
  "Every single day, I am getting better at what I do.",
  "I am a magnet for financial opportunities, and abundance flows to me easily.",
  "I am confident in my skills, my choices, and my worth.",
  "I accept myself completely. I deserve all the good things life has to offer.",
  "My mind is calm, and my body is strong and full of energy.",
  "I have the power to achieve anything I can imagine. My potential has no limits.",
  "Love flows freely in my family. I give and receive love.",
  "My family is my strength, sharing happiness and support.",
  "Taking care of my loved ones is easy and brings me joy.",
  "I have plenty of money to make my family's dreams come true.",
  "I create strong, honest, and meaningful connections everywhere I go.",
  "I let go of all negativity. I breathe in peace, success, and pure happiness.",
]

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export default function AffirmationsCard() {
  const [open, setOpen] = useState(false)
  const [items] = useState(() => shuffle(AFFIRMATIONS))
  const [highlighted] = useState(() => Math.floor(Math.random() * items.length))

  return (
    <Card>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
            <Sparkles size={14} className="text-yellow-500" />
          </div>
          <span className="font-semibold text-sm text-slate-800 dark:text-white">Winner's Mindset</span>
        </div>
        {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>

      {/* Always show today's affirmation */}
      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 italic bg-yellow-50 dark:bg-yellow-900/20 rounded-xl px-3 py-2.5">
        "{items[highlighted]}"
      </p>

      {open && (
        <div className="mt-3 space-y-2">
          {items.map((a, i) => (
            <div key={i} className="flex gap-2.5 text-sm text-slate-600 dark:text-slate-300">
              <span className="text-primary-400 font-bold flex-shrink-0 w-5">{i + 1}.</span>
              <span>"{a}"</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
