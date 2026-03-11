-- ============================================================
-- Life OS 2.0 — Initial Schema + RLS
-- Run this in: Supabase Dashboard > SQL Editor
-- ============================================================

create extension if not exists "uuid-ossp";

-- ─── Enums ───────────────────────────────────────────────────
create type task_area       as enum ('Inbox','Professional','Financial','Wellness','Relationship','Personal','Vision');
create type task_status     as enum ('todo','completed');
create type task_recurrence as enum ('none','daily','weekly','monthly');
create type finance_bucket  as enum ('consumption','commitment','safety','growth');
create type esbi_type       as enum ('employee','self_employed','business','investor');
create type habit_routine   as enum ('morning','work','evening');

-- ─── 1. profiles ─────────────────────────────────────────────
create table public.profiles (
  id         uuid primary key references auth.users on delete cascade,
  full_name  text not null default '',
  avatar_url text,
  settings   jsonb not null default '{"theme":"light","start_week":"monday"}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "profiles: owner only" on public.profiles
  using (auth.uid() = id) with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── 2. projects (before tasks — tasks FK references this) ───
create table public.projects (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles on delete cascade,
  title      text not null,
  area       task_area not null default 'Inbox',
  color      text not null default '#336633',
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;
create policy "projects: owner only" on public.projects
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── 3. crm_connections (before tasks — tasks FK references this) ─
create table public.crm_connections (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles on delete cascade,
  full_name       text not null,
  type            text not null check (type in ('Client','Colleague','Partner','Relation','Other')),
  mobile          text,
  email           text,
  company         text,
  designation     text,
  date_of_birth   date,
  nationality     text,
  visa_status     text,
  emirates_id     text,
  passport_number text,
  emirate         text,
  notes           text,
  photo_url       text,
  created_at      timestamptz not null default now()
);

alter table public.crm_connections enable row level security;
create policy "crm_connections: owner only" on public.crm_connections
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── 4. tasks ────────────────────────────────────────────────
create table public.tasks (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references public.profiles on delete cascade,
  title          text not null,
  area           task_area not null default 'Inbox',
  project_id     uuid references public.projects on delete set null,
  connection_id  uuid references public.crm_connections on delete set null,
  priority       text not null default 'P3' check (priority in ('P1','P2','P3','P4')),
  due_date       timestamptz,
  is_today_focus boolean not null default false,
  status         task_status not null default 'todo',
  recurrence     task_recurrence not null default 'none',
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index tasks_user_status on public.tasks (user_id, status);
create index tasks_due_date    on public.tasks (user_id, due_date);

alter table public.tasks enable row level security;
create policy "tasks: owner only" on public.tasks
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── 5. finance_transactions ─────────────────────────────────
create table public.finance_transactions (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles on delete cascade,
  type       text not null check (type in ('income','expense')),
  bucket     finance_bucket not null default 'consumption',
  esbi_type  esbi_type,
  category   text not null,
  amount     numeric(12,2) not null check (amount > 0),
  date       date not null,
  is_need    boolean not null default false,
  notes      text,
  created_at timestamptz not null default now()
);

create index finance_txn_user_date on public.finance_transactions (user_id, date desc);

alter table public.finance_transactions enable row level security;
create policy "finance_transactions: owner only" on public.finance_transactions
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── 6. loans ────────────────────────────────────────────────
create table public.loans (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles on delete cascade,
  name          text not null,
  lender        text not null,
  amount        numeric(14,2) not null,
  outstanding   numeric(14,2) not null,
  emi           numeric(12,2) not null,
  interest_rate numeric(5,2)  not null,
  rate_type     text not null check (rate_type     in ('fixed','floating')),
  interest_type text not null check (interest_type in ('reducing','flat')),
  structure     text not null check (structure     in ('term','revolving')),
  purpose       text not null check (purpose       in ('productive','consumption')),
  collateral    text not null check (collateral    in ('secured','unsecured')),
  end_date      date,
  created_at    timestamptz not null default now()
);

alter table public.loans enable row level security;
create policy "loans: owner only" on public.loans
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── 7. insurance_policies ───────────────────────────────────
create table public.insurance_policies (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles on delete cascade,
  type            text not null check (type in ('health','life','motor','other')),
  provider        text not null,
  policy_number   text not null,
  coverage_amount numeric(14,2) not null,
  premium         numeric(12,2) not null,
  renewal_date    date not null,
  support_contact text,
  created_at      timestamptz not null default now()
);

alter table public.insurance_policies enable row level security;
create policy "insurance_policies: owner only" on public.insurance_policies
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── 8. finance_goals ────────────────────────────────────────
create table public.finance_goals (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references public.profiles on delete cascade,
  title          text not null,
  goal_type      text not null check (goal_type in ('emergency','retirement','lifestyle')),
  target_amount  numeric(14,2) not null,
  current_amount numeric(14,2) not null default 0,
  target_date    date,
  created_at     timestamptz not null default now()
);

alter table public.finance_goals enable row level security;
create policy "finance_goals: owner only" on public.finance_goals
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── 9. crm_leads ────────────────────────────────────────────
create table public.crm_leads (
  id                   uuid primary key default uuid_generate_v4(),
  user_id              uuid not null references public.profiles on delete cascade,
  name                 text not null,
  mobile               text not null,
  email                text,
  status               text not null default 'new'
                         check (status in ('new','qualified','appointment','negotiation','won','lost')),
  source               text not null,
  emirate              text,
  product              text,
  bank                 text,
  card_type            text,
  application_number   text,
  bpm_id               text,
  submission_date      date,
  completion_date      date,
  date_of_birth        date,
  nationality          text,
  visa_status          text,
  emirates_id          text,
  passport_number      text,
  aecb_score           integer,
  salary_bank          text,
  company_landline     text,
  monthly_basic_salary numeric(12,2),
  expected_value       numeric(12,2),
  notes                text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index crm_leads_user_status on public.crm_leads (user_id, status);

alter table public.crm_leads enable row level security;
create policy "crm_leads: owner only" on public.crm_leads
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── 10. crm_deals ───────────────────────────────────────────
create table public.crm_deals (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid not null references public.profiles on delete cascade,
  lead_id               uuid references public.crm_leads on delete set null,
  name                  text not null,
  status                text not null default 'processing'
                          check (status in ('processing','verification','activation','completed','unsuccessful')),
  value                 numeric(12,2),
  expected_closing_date date,
  notes                 text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

alter table public.crm_deals enable row level security;
create policy "crm_deals: owner only" on public.crm_deals
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── 11. habits ──────────────────────────────────────────────
create table public.habits (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles on delete cascade,
  title       text not null,
  time_of_day time not null,
  routine     habit_routine not null default 'morning',
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.habits enable row level security;
create policy "habits: owner only" on public.habits
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── 12. habit_logs ──────────────────────────────────────────
create table public.habit_logs (
  id       uuid primary key default uuid_generate_v4(),
  habit_id uuid not null references public.habits on delete cascade,
  date     date not null,
  status   boolean not null default false,
  unique (habit_id, date)
);

create index habit_logs_habit_date on public.habit_logs (habit_id, date desc);

alter table public.habit_logs enable row level security;
create policy "habit_logs: via habits owner" on public.habit_logs
  using (exists (
    select 1 from public.habits h
    where h.id = habit_id and h.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.habits h
    where h.id = habit_id and h.user_id = auth.uid()
  ));

-- ─── 13. vision_goals ────────────────────────────────────────
create table public.vision_goals (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles on delete cascade,
  title       text not null,
  description text,
  timeline    text not null check (timeline in ('1year','3year','5year')),
  progress    integer not null default 0 check (progress between 0 and 100),
  created_at  timestamptz not null default now()
);

alter table public.vision_goals enable row level security;
create policy "vision_goals: owner only" on public.vision_goals
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── 14. relationships ───────────────────────────────────────
create table public.relationships (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles on delete cascade,
  full_name       text not null,
  relation        text not null,
  phone           text,
  photo_url       text,
  notes           text,
  important_dates jsonb not null default '[]'::jsonb,
  created_at      timestamptz not null default now()
);

alter table public.relationships enable row level security;
create policy "relationships: owner only" on public.relationships
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── 15. weekly_reviews ──────────────────────────────────────
create table public.weekly_reviews (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles on delete cascade,
  week_start_date date not null,
  wins            text,
  challenges      text,
  lessons         text,
  rating          integer not null check (rating between 1 and 5),
  created_at      timestamptz not null default now()
);

alter table public.weekly_reviews enable row level security;
create policy "weekly_reviews: owner only" on public.weekly_reviews
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── 16. documents ───────────────────────────────────────────
create table public.documents (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles on delete cascade,
  file_name  text not null,
  file_path  text not null,
  category   text not null,
  size_bytes integer not null,
  mime_type  text not null,
  created_at timestamptz not null default now()
);

alter table public.documents enable row level security;
create policy "documents: owner only" on public.documents
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── Storage Buckets ─────────────────────────────────────────
-- Create these manually in Supabase Dashboard > Storage:
--
-- Bucket: "documents"  (Private)
--   INSERT policy: (storage.foldername(name))[1] = auth.uid()::text
--   SELECT policy: (storage.foldername(name))[1] = auth.uid()::text
--
-- Bucket: "avatars"  (Public)
--   INSERT policy: (storage.foldername(name))[1] = auth.uid()::text
--   SELECT policy: true  (public read)
