# monthly-report Edge Function

Generates a monthly VPrime report (habits + tasks) and emails it via Resend.

## Setup

1. **DB:** Run `supabase-user-settings.sql` in the Supabase SQL editor so `user_settings` exists and has a row for `report_email`.
2. **Secrets (Supabase Dashboard → Edge Functions → Secrets):**
   - `RESEND_API_KEY` – from [resend.com](https://resend.com). Use a verified domain or `onboarding@resend.dev` for testing.
   - `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are usually set automatically.
3. **Deploy:**
   ```bash
   supabase functions deploy monthly-report
   ```

## Invoke

- **Manual (report for a specific month):**
  ```bash
  curl -X POST "https://<project-ref>.supabase.co/functions/v1/monthly-report?year=2025&month=3" \
    -H "Authorization: Bearer <anon-or-service-role-key>"
  ```
- **No query params:** Uses the **current** month (for cron on the last day of the month).

## Schedule (end of month 23:59)

- **Supabase:** Use [pg_cron](https://supabase.com/docs/guides/database/extensions/pg_cron) + [pg_net](https://supabase.com/docs/guides/database/extensions/pg_net) to HTTP POST the function URL at 23:59 on the last day of each month.
- **External:** e.g. [cron-job.org](https://cron-job.org) or GitHub Actions: trigger `POST …/monthly-report` at 23:59 on the last day of every month (cron: `59 23 L * *` or equivalent).

Users set “Email for monthly report” in the app (Settings); the function reads `user_settings.report_email` and skips sending if empty.
