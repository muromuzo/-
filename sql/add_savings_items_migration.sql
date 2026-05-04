create table if not exists public.savings_items (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.monthly_reports(id) on delete cascade,
  name text not null,
  value bigint not null default 0,
  created_at timestamptz not null default now()
);
