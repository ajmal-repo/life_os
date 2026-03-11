# Life OS 2.0 - Project Context
**Version:** 3.0.0 (Production Master) | **Last Updated:** February 04, 2026
**Architecture:** Offline-First PWA | Mobile-First | Performance Optimized
**Core Philosophy:** A unified "Second Brain" managing Productivity, Finance, CRM, Wellness, and Vision.

---

## 📋 Executive Summary
Life OS 2.0 is a high-performance Progressive Web Application (PWA) designed to manage every aspect of a user's life. It consolidates disparate tools (Todoist, Mint, HubSpot, Streaks, Notion) into a single, offline-capable ecosystem.

- **Primary User:** Individual (Single Tenant Architecture)
- **Design System:** Mobile-First, Card-Based Layout, "Swipe-to-Action" Interactions
- **Base Font:** Figtree (400, 500, 600, 700)
- **Primary Color:** #336633 (Forest Green)
- **Performance:** LCP < 2.0s via Manual Chunking & Critical CSS
- **Offline Strategy:** Optimistic UI + LocalStorage Queue + Background Sync

---

## 📱 App Navigation & Layout Strategy

### Global Navigation
- **Mobile (Bottom Bar):** Fixed position. Icons: Home, Tasks, Finance, CRM, Menu (Hamburger)
- **Desktop (Sidebar):** Collapsible (Left). Full menu visible

### Page-Level Navigation (Internal Tabs)
To optimize mobile screen real estate, complex modules use internal Tab navigation. Navigation between these tabs does NOT reload the page.
- **Tasks Page:** [Today] | [Inbox] | [Upcoming] | [Projects]
- **Finance Page:** [Overview] | [Transactions] | [Budget] | [Loans] | [Planning]
- **Professional Page:** [Leads] | [Deals] | [Network]
- **Wellness Page:** [Habits] | [Routines] | [History]
- **Vision Page:** [Mission] | [Goals] | [Vision Board] | [Values]

---

## 📦 Modules & Features (Detailed)

### 1. Dashboard (The Command Center)
Purpose: Instant situational awareness and daily motivation.

**1.1 Dynamic Greeting:**
- 05:00–11:59: "Good morning, [Name]"
- 12:00–16:59: "Good afternoon, [Name]"
- 17:00–23:59: "Good evening, [Name]"
- 00:00–04:59: "Up late, [Name]"
- Display: Current Date + Live Clock (HH:MM). Updates every 60s.

**1.2 Daily Wisdom:** Random motivational quote. "Shuffle" button to refresh.

**1.3 Winner's Mindset (Affirmations):** Expandable accordion. Auto-shuffles on load.
The 21 Affirmations:
1. "I am a top performer who creates massive value for my clients."
2. "Every 'no' brings me closer to a 'yes.' Rejection is redirection."
3. "I am disciplined, focused, and unstoppable."
4. "Success is my natural state. I was born to win."
5. "I turn obstacles into opportunities."
6. "My income grows as I grow. I invest in myself daily."
7. "I am worthy of abundance, prosperity, and financial freedom."
8. "Rest is part of my success strategy, not a weakness."
9. "I attract ideal clients effortlessly because I provide real value."
10. "Every single day, I am getting better at what I do."
11. "I am a magnet for financial opportunities, and abundance flows to me easily."
12. "I am confident in my skills, my choices, and my worth."
13. "I accept myself completely. I deserve all the good things life has to offer."
14. "My mind is calm, and my body is strong and full of energy."
15. "I have the power to achieve anything I can imagine. My potential has no limits."
16. "Love flows freely in my family. I give and receive love."
17. "My family is my strength, sharing happiness and support."
18. "Taking care of my loved ones is easy and brings me joy."
19. "I have plenty of money to make my family's dreams come true."
20. "I create strong, honest, and meaningful connections everywhere I go."
21. "I let go of all negativity. I breathe in peace, success, and pure happiness."

**1.4 Today's Focus:** Strictly displays Top 3 Tasks marked as `is_today_focus`. Error if user tries to add a 4th.

**1.5 Next Up (Habits):** Filter habits by `time >= current_time`. Show next 3. Swipe right to complete.

**1.6 Financial Health Gauge:**
- Formula: `Safe-to-Spend = Income - (Safety + Growth)`
- Visual: Radial Gauge. Green (>0), Red (<0)

---

### 2. Tasks (GTD System)
Purpose: Execution system.

**Hierarchy:**
- Level 1 (Area): Inbox, Professional, Financial, Wellness, Relationship, Personal, Vision
- Level 2 (Project): Optional. Must belong to ONE Area
- Level 3 (Task): Must belong to an Area. Can belong to a Project

**Constraint: NO CONJUNCTIONS. Tasks must be atomic.**
- Bad: "Call Client AND Email Boss."
- Good: "Call Client." (Task 1) + "Email Boss." (Task 2)

**Properties:**
- Priority: P1 (Red), P2 (Green), P3 (Blue), P4 (Orange)
- Recurrence: Daily, Weekly, Monthly (Completion creates NEW task instance)
- CRM Link: Link task to a Connection

**Smart Lists (Tabs):**
- Today: [Overdue (Red)] + [Due Today (Sorted by Time)]
- Inbox: Tasks with `project_id = null`
- Projects: Grouped by Area

**Actions:** Bulk Edit (Long press), Swipe Actions (Left: Delete, Right: Complete)

---

### 3. Finance (The "A to Z" Methodology)
Purpose: Wealth Management.

**3.1 Income Engine (Tab 1):**
- ESBI Model: Track Income as Employee, Self-Employed, Business, Investor
- Calculators:
  - Target Income: `(Living Costs + Goals) / (1 - Tax Rate)`
  - Growth Strategizer: Text inputs for Skills (S), Network (N), Leverage (L), Geography (G)

**3.2 Spending (Tab 2 — The 4 Buckets):**
- Philosophy: `Income - (Safety + Growth) = Allowable Expenses`
- Buckets: Consumption (Needs vs. Wants toggles), Commitment (Loan EMIs), Safety (Insurance, Emergency Fund), Growth (SIPs, Stocks, Assets)
- Visual: Pie Chart of Allocation

**3.3 Loan Analyzer (Tab 3) — The 5 Lenses:**
1. Purpose: Productive vs. Consumption
2. Collateral: Secured vs. Unsecured
3. Structure: Term vs. Revolving
4. Interest: Reducing vs. Flat
5. Rate: Fixed vs. Floating
- Metrics: Good Debt % vs. Bad Debt %

**3.4 Insurance (Tab 4):**
- Vault: Health, Life, Motor policy details (Policy #, Renewal Date, Support Contact)
- Gap Calculator: `Required Cover = (Annual Income * 10) + Liabilities`

**3.5 Planning (Tab 5) — 3-Plan Framework:**
- Safety Plan: Emergency Fund Tracker (Target: 6x Monthly Expenses)
- Future Goals: Retirement Calculator
- Lifestyle Goals: "Dream Life" Cost Estimator

---

### 4. Professional (UAE CRM)
Purpose: Manage sales pipeline in UAE context.

**4.1 Leads (Tab 1 — Kanban):**
Stages: New → Qualified → Appointment → Negotiation → Deal

Lead Sources: LinkedIn, Cold Calling, Referrals, Follow up, Other

UAE Emirates (Dropdown): Abu Dhabi, Dubai, Sharjah, Ajman, Umm Al Quwain, Ras Al Khaimah, Fujairah

UAE Banks (Target Bank Dropdown): ADCB, ENBD, DIB, FAB, Mashreq Bank, CBD, RAKBANK, ADIB, Emirates Islamic Bank, Sharjah Islamic Bank, HSBC UAE, Standard Chartered UAE, Citi Bank UAE

Products (Product Type Dropdown): Credit Card, Personal Loan, Auto Loan, Account Opening, Other

Credit Card Types (Emirates Islamic Specific):
- Etihad Guest, Etihad Guest Saqer, Etihad Guest Platinum, Etihad Guest Premium
- Skywards Black, Skywards Infinite, Skywards Signature
- Switch Cashback, Cashback Plus, Cashback, RTA, Amazon World, Amazon Platinum

Detailed CRM Fields: Application Number, BPM ID, Card Type Requested, Submission Date, Completion Date, Date of Birth, Nationality, Visa Status, Emirates ID, Passport Number, AECB Score, Location Emirate, Salary Bank, Company Landline, Monthly Basic Salary

**4.2 Deals (Tab 2 — Kanban):**
Stages: Application Processing → Verification Needed → Activation Needed → Completed → Unsuccessful
Logic: Converted from Lead. Tracks Value (AED) and Expected Closing Date.

**4.3 Connections (Tab 3 — List):**
Types: Client, Colleague, Partner, Relation, Other
Extended Fields: Date of Birth, Nationality, Visa Status, Emirates ID, Passport Number, Location Emirate, Company Name, Designation
Actions: Quick WhatsApp (`wa.me`), Call (`tel:`), Email (`mailto:`)
Integration: Dropdown "Connection" option in Task Add/Edit form. Auto-populate contact actions in task view.

---

### 5. Wellness (Habits)
Purpose: Routine consistency. **Constraint: NO CONJUNCTIONS. Single actions only.**

**5.1 Habit Tracker:**

Routine — Morning:
- Start day at 6 am (06:00)
- Drink 1 full glass of water (06:05)
- Read my positive affirmation (06:10)
- Review Daily Goals (06:15)
- Morning Exercise (06:30)
- Deep breathing exercise (07:00)
- Meditate for 3 minutes (07:10)
- Listen to an Educational Video (07:25)
- Leave for the office (07:59)

Routine — Work:
- Follow up with leads (09:00)
- New LinkedIn Connections (09:30)
- Meet 30 new customers (10:00)

Routine — Evening:
- Set out things for tomorrow (21:00)
- Evening Review (22:30)
- Plan Tomorrow (22:40)
- Define the MIT for tomorrow (22:50)

Logic: Cannot log future dates. Status: Active/Archived toggle.

**5.2 History:** Grid: 7-Day rolling view (Sun–Sat). Streaks: Consecutive days count.

---

### 6. Visions & Relationships
Purpose: Long-term alignment.

**6.1 Vision:**
- Mission: Rich text editor for Personal Mission
- Values (Tag Cloud): Integrity, Excellence, Growth, Family, Service, Discipline, Innovation, Compassion (Max 10–12)
- Timeline: 1-Year / 3-Year / 5-Year Goal Cards

**6.2 Relationships:**
- Types: Father, Mother, Spouse, Sibling, Child, Extended Family, Close Friend
- Key People: Profile Cards (Photo, Relation, Phone, Notes)
- Important Dates: Birthday, Anniversary, Other
- Countdown: "X Days Until [Event]" — Red (<7 days), Yellow (<30 days), Green (>30 days)

---

### 7. System Tools
- **Reviews:** Weekly Review Form. Fields: Week Start Date, Wins, Challenges, Lessons, Rating (1–5 Stars). History: Accordion View with color-coded ratings.
- **Documents:** File Upload (Supabase Storage). Categories: All, Personal, Work, Finance, ID & Passports, Education, Other. Formats: PDF, DOC, DOCX, TXT, JPG, PNG, XLS, ZIP.
- **Settings:** Profile (Name, Bio, Avatar), Theme (Light/Dark), Start of Week (Mon/Sat), Data Export.

---

## 🛠 Technical Architecture & Performance

### Tech Stack
- **Frontend:** React 18 (Vite), TypeScript 5, TailwindCSS 3.4
- **State:** React Context + `useStore` Hook (No Redux/Zustand)
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Icons:** Lucide React

### Performance Optimization
**Manual Chunking (Vite Config):**
- `vendor-react`: [react, react-dom, react-router-dom]
- `vendor-supabase`: [@supabase/supabase-js]
- `vendor-ui`: [lucide-react, clsx, tailwind-merge]
- `vendor-utils`: [date-fns]

**Lazy Loading:** Top-level Pages via `React.lazy()`. Heavy Widgets: QuoteCarousel, FinancialSnapshot.

**Critical Rendering:** Inline Critical CSS in `index.html`. Defer Auth Check to `requestIdleCallback`.

**Metrics Targets:** LCP < 2.0s | CLS < 0.1 | Initial bundle < 200KB (gzipped)

### File Structure
```
src/
├── components/
│   ├── Common/              # Shared UI (Button, Input, Modal, Tabs, Card, Badge)
│   ├── Dashboard/           # QuoteCarousel, FocusWidget, FinanceGauge, HabitSwipe
│   ├── Finance/             # TransactionList, BudgetCard, LoanAnalyzer, InsurVault
│   ├── Tasks/               # TaskCard, TaskList, TaskForm, ProjectBadge
│   ├── Professional/        # KanbanBoard, LeadCard, DealCard, ConnectionForm
│   ├── Wellness/            # HabitCard, StreakChart, RoutineList
│   ├── Vision/              # GoalCard, ValueTag, TimelineView
│   └── Layout/              # Sidebar (Desktop), BottomNav (Mobile), Header
├── pages/
│   ├── Dashboard.tsx        # Lazy Loaded
│   ├── Tasks.tsx            # Lazy Loaded (Tabs: Today, Inbox, Projects)
│   ├── Finance.tsx          # Lazy Loaded (Tabs: Overview, Budget, Loans, Plans)
│   ├── Professional.tsx     # Lazy Loaded (Tabs: Leads, Deals, Network)
│   ├── Wellness.tsx         # Lazy Loaded (Tabs: Habits, History)
│   ├── Visions.tsx          # Lazy Loaded (Tabs: Mission, Goals, Relations)
│   ├── Reviews.tsx          # Weekly Review Form & History
│   ├── Documents.tsx        # File Manager
│   └── Settings.tsx         # App Config
├── utils/
│   ├── store/
│   │   ├── index.ts         # Global Context Provider
│   │   ├── syncQueue.ts     # LocalStorage Offline Queue Manager
│   │   ├── taskOps.ts       # CRUD: Tasks, Projects
│   │   ├── financeOps.ts    # CRUD: Transactions, Loans + Formulas
│   │   ├── crmOps.ts        # CRUD: Leads, Deals, Connections
│   │   └── wellnessOps.ts   # CRUD: Habits, Logs
│   ├── hooks/               # Custom Hooks (useStore, useAuth, useMedia)
│   └── helpers/             # Date formatters (date-fns), Validators
├── types/
│   ├── index.ts             # Global TypeScript Interfaces
│   └── supabase.ts          # Supabase Generated Types
├── styles/
│   └── tailwind.css         # Tailwind Directives & Custom Utilities
└── App.tsx                  # Routes, Suspense, Providers
```

---

## 🗄 Core Data Entities (Database Schema)

### 1. profiles
| Column | Type |
|--------|------|
| id | UUID, PK → auth.users |
| full_name | Text |
| avatar_url | Text |
| settings | JSONB `{ theme, start_week }` |

### 2. tasks
| Column | Type |
|--------|------|
| id | UUID, PK |
| user_id | UUID, FK |
| title | Text |
| area | Enum: Inbox, Professional, Financial, Wellness, Relationship, Personal, Vision |
| project_id | UUID, FK, Nullable |
| connection_id | UUID, FK, Nullable |
| priority | Text: P1, P2, P3, P4 |
| due_date | Timestamptz |
| is_today_focus | Boolean [Max 3 True per user] |
| status | Text: todo, completed |

### 3. projects
| Column | Type |
|--------|------|
| id | UUID, PK |
| user_id | UUID, FK |
| title | Text |
| area | Enum |
| color | Text (Hex) |

### 4. finance_transactions
| Column | Type |
|--------|------|
| id | UUID, PK |
| user_id | UUID, FK |
| type | Enum: income, expense |
| bucket | Enum: consumption, commitment, safety, growth |
| category | Text |
| amount | Numeric |
| date | Date |
| is_need | Boolean |

### 5. crm_leads
| Column | Type |
|--------|------|
| id | UUID, PK |
| user_id | UUID, FK |
| name | Text |
| mobile | Text |
| status | Enum: new, qualified, appointment, negotiation, won, lost |
| emirate | Enum: Dubai, Abu Dhabi, Sharjah, Ajman, UAQ, RAK, Fujairah |
| product | Text |
| bank | Text |
| expected_value | Numeric |

### 6. crm_connections
| Column | Type |
|--------|------|
| id | UUID, PK |
| user_id | UUID, FK |
| full_name | Text |
| type | Enum: Client, Colleague, Partner, Relation, Other |
| mobile | Text |
| email | Text |
| company | Text |
| designation | Text |

### 7. habits
| Column | Type |
|--------|------|
| id | UUID, PK |
| user_id | UUID, FK |
| title | Text |
| time_of_day | Time |
| routine | Enum: morning, evening, work |
| active | Boolean |

### 8. habit_logs
| Column | Type |
|--------|------|
| id | UUID, PK |
| habit_id | UUID, FK |
| date | Date |
| status | Boolean |
| | Unique(habit_id, date) |

### 9. reviews
| Column | Type |
|--------|------|
| id | UUID, PK |
| user_id | UUID, FK |
| week_start_date | Date |
| wins | Text |
| challenges | Text |
| lessons | Text |
| rating | Integer: 1–5 |

### 10. documents
| Column | Type |
|--------|------|
| id | UUID, PK |
| user_id | UUID, FK |
| file_name | Text |
| file_path | Text |
| category | Text |
| size_bytes | Integer |

---

## ⚙️ Configuration & Environment

### Environment Variables (.env)
- `VITE_SUPABASE_URL` — Required
- `VITE_SUPABASE_ANON_KEY` — Required

### Storage Buckets (Supabase)
- `documents` — Private. Path: `{user_id}/{category}/{filename}`
- `avatars` — Public. Profile pictures.

### LocalStorage Keys (Offline Sync)
- `life-os-offline-queue` — Array of pending operations
- `life-os-theme` — `'light' | 'dark'`
- `life-os-auth-token` — Supabase session token

---

## 🔒 Security & Integrity
- **RLS:** All tables have Row Level Security. Users can only access rows where `user_id = auth.uid()`.
- **Input Validation:** Zod schemas for all forms.
- **Sanitization:** React automatically escapes output (XSS prevention).
- **Rate Limiting:** Login/Signup endpoints limited to 5 attempts / 15 mins.
