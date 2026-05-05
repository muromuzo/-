alter table public.users add column if not exists job_title text;

update public.users
set display_name = coalesce(display_name, contact_name, username)
where display_name is null;

update public.users
set contact_name = coalesce(contact_name, display_name, username)
where contact_name is null;

alter table public.team_schedule_memos add column if not exists is_global boolean not null default false;
alter table public.team_schedule_memos alter column owner_pro_id drop not null;

create index if not exists idx_team_schedule_memos_global_date
  on public.team_schedule_memos(is_global, scheduled_date);
