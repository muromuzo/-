create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  display_name text,
  password_hash text not null,
  role text not null default 'user' check (role in ('master', 'admin', 'user')),
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

-- If you already ran the old schema, execute the statement below once in Supabase SQL Editor.
-- create table if not exists public.savings_items (
--   id uuid primary key default gen_random_uuid(),
--   report_id uuid not null references public.monthly_reports(id) on delete cascade,
--   name text not null,
--   value bigint not null default 0,
--   created_at timestamptz not null default now()
-- );
