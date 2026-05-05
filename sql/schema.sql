create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  display_name text,
  password_hash text not null,
  role text not null default 'general' check (role in ('master', 'pro', 'general')),
  approval_status text not null default 'approved' check (approval_status in ('pending', 'approved', 'rejected')),
  manager_user_id uuid references public.users(id) on delete set null,
  approved_by uuid references public.users(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.monthly_reports (
  id uuid primary key default gen_random_uuid(),
  brand_name text not null,
  month_label text not null,
  gross_revenue bigint not null default 0,
  revenue_deduction bigint not null default 0,
  adjusted_revenue bigint not null default 0,
  baseline_revenue bigint not null default 0,
  increase_amount bigint not null default 0,
  growth_rate numeric(10,2) not null default 0,
  fee_rate numeric(10,2) not null default 16.5,
  supply_increase bigint not null default 0,
  fee_amount bigint not null default 0,
  manager_note text,
  other_note text,
  status_memo text,
  created_by uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.marketing_items (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.monthly_reports(id) on delete cascade,
  name text not null,
  value bigint not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.revenue_channels (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.monthly_reports(id) on delete cascade,
  name text not null,
  revenue bigint not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.savings_items (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.monthly_reports(id) on delete cascade,
  name text not null,
  value bigint not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.monthly_plan_pages (
  id uuid primary key default gen_random_uuid(),
  brand_name text not null,
  month_label text not null,
  plan_memo text,
  created_by uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.plan_items (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.monthly_plan_pages(id) on delete cascade,
  title text not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.board_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  created_by uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.team_schedule_memos (
  id uuid primary key default gen_random_uuid(),
  owner_pro_id uuid not null references public.users(id) on delete cascade,
  scheduled_date date not null,
  category text not null default '운영',
  title text not null,
  note text,
  is_checked boolean not null default false,
  created_by uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists idx_team_schedule_memos_owner_date on public.team_schedule_memos(owner_pro_id, scheduled_date);
create index if not exists idx_board_posts_created_at on public.board_posts(created_at desc);
