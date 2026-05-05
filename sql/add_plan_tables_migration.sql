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
