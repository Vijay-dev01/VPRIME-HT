-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New query)

create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table if not exists habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid references habits(id) on delete cascade,
  date date not null,
  completed boolean default false,
  unique(habit_id, date)
);

create table if not exists daily_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  day date not null,
  completed boolean default false,
  sort_order int default 0
);

-- Optional: enable RLS and add policies for authenticated users
-- alter table habits enable row level security;
-- alter table habit_logs enable row level security;
-- alter table daily_tasks enable row level security;

-- Seed a few habits (optional; run once)
-- insert into habits (name) values
--   ('Sleep 5h'),
--   ('Gym'),
--   ('Read 5 pages'),
--   ('Meditate'),
--   ('Deep Work');
