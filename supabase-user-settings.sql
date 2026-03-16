-- Run in Supabase SQL Editor (for monthly report email)
create table if not exists user_settings (
  id text primary key default 'default',
  report_email text,
  updated_at timestamptz default now()
);

insert into user_settings (id) values ('default')
on conflict (id) do nothing;

-- RLS
alter table user_settings enable row level security;

drop policy if exists "Allow anon select user_settings" on user_settings;
drop policy if exists "Allow anon update user_settings" on user_settings;
create policy "Allow anon select user_settings" on user_settings for select to anon using (true);
create policy "Allow anon update user_settings" on user_settings for update to anon using (true) with check (true);
create policy "Allow anon insert user_settings" on user_settings for insert to anon with check (true);
