-- Run this in Supabase: SQL Editor → New query → paste → Run
-- Fixes: "new row violates row-level security policy for table 'habits'"

-- habits
drop policy if exists "Allow anon select habits" on habits;
drop policy if exists "Allow anon insert habits" on habits;
drop policy if exists "Allow anon delete habits" on habits;
create policy "Allow anon select habits" on habits for select to anon using (true);
create policy "Allow anon insert habits" on habits for insert to anon with check (true);
create policy "Allow anon delete habits" on habits for delete to anon using (true);

-- habit_logs
drop policy if exists "Allow anon select habit_logs" on habit_logs;
drop policy if exists "Allow anon insert habit_logs" on habit_logs;
drop policy if exists "Allow anon update habit_logs" on habit_logs;
drop policy if exists "Allow anon delete habit_logs" on habit_logs;
create policy "Allow anon select habit_logs" on habit_logs for select to anon using (true);
create policy "Allow anon insert habit_logs" on habit_logs for insert to anon with check (true);
create policy "Allow anon update habit_logs" on habit_logs for update to anon using (true) with check (true);
create policy "Allow anon delete habit_logs" on habit_logs for delete to anon using (true);

-- daily_tasks
drop policy if exists "Allow anon select daily_tasks" on daily_tasks;
drop policy if exists "Allow anon insert daily_tasks" on daily_tasks;
drop policy if exists "Allow anon update daily_tasks" on daily_tasks;
drop policy if exists "Allow anon delete daily_tasks" on daily_tasks;
create policy "Allow anon select daily_tasks" on daily_tasks for select to anon using (true);
create policy "Allow anon insert daily_tasks" on daily_tasks for insert to anon with check (true);
create policy "Allow anon update daily_tasks" on daily_tasks for update to anon using (true) with check (true);
create policy "Allow anon delete daily_tasks" on daily_tasks for delete to anon using (true);
