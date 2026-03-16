-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Fixes: Could not find the 'duration_days' column of 'habits' in the schema cache (PGRST204)

alter table habits add column if not exists duration_days int;
alter table habits add column if not exists start_date date;
