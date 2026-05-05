alter table public.users add column if not exists contact_name text;

update public.users
set contact_name = coalesce(contact_name, display_name, username)
where contact_name is null;
