create extension if not exists pgcrypto;

alter table public.users add column if not exists approval_status text not null default 'approved';
alter table public.users add column if not exists manager_user_id uuid references public.users(id) on delete set null;
alter table public.users add column if not exists approved_by uuid references public.users(id) on delete set null;
alter table public.users add column if not exists approved_at timestamptz;

alter table public.users drop constraint if exists users_role_check;
alter table public.users add constraint users_role_check check (role in ('master', 'pro', 'general'));

alter table public.users drop constraint if exists users_approval_status_check;
alter table public.users add constraint users_approval_status_check check (approval_status in ('pending', 'approved', 'rejected'));

update public.users set role = 'pro' where role = 'admin';
update public.users set role = 'general' where role = 'user';
update public.users set approval_status = 'approved' where approval_status is null;
update public.users set approved_at = coalesce(approved_at, created_at) where approval_status = 'approved';
update public.users set manager_user_id = null where role in ('master', 'pro');

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
