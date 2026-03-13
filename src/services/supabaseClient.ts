import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Tables: habits, habit_logs, daily_tasks
// Run in Supabase SQL editor:
//
// create table habits (
//   id uuid primary key default gen_random_uuid(),
//   name text not null,
//   created_at timestamptz default now()
// );
//
// create table habit_logs (
//   id uuid primary key default gen_random_uuid(),
//   habit_id uuid references habits(id) on delete cascade,
//   date date not null,
//   completed boolean default false,
//   unique(habit_id, date)
// );
//
// create table daily_tasks (
//   id uuid primary key default gen_random_uuid(),
//   title text not null,
//   day date not null,
//   completed boolean default false,
//   sort_order int default 0
// );
