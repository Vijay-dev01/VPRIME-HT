// Supabase Edge Function: monthly-report
// Invoke at end of month (e.g. last day 23:59) via Supabase cron or external scheduler.
// Secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function lastDayOfMonth(year: number, month: number): Date {
  return new Date(year, month, 0); // month is 1-based; day 0 = last day of previous month
}

function getMonthRange(year: number, month: number): { start: string; end: string } {
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const last = lastDayOfMonth(year, month);
  const end = last.toISOString().slice(0, 10);
  return { start, end };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const year = parseInt(url.searchParams.get('year') ?? '', 10);
    const month = parseInt(url.searchParams.get('month') ?? '', 10);

    let targetYear: number;
    let targetMonth: number; // 1-based
    if (year && month >= 1 && month <= 12) {
      targetYear = year;
      targetMonth = month;
    } else {
      const now = new Date();
      targetYear = now.getFullYear();
      targetMonth = now.getMonth() + 1; // current month (for cron on last day 23:59)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { start, end } = getMonthRange(targetYear, targetMonth);

    const [settingsRes, habitsRes, logsRes, tasksRes] = await Promise.all([
      supabase.from('user_settings').select('report_email').eq('id', 'default').maybeSingle(),
      supabase.from('habits').select('id, name'),
      supabase.from('habit_logs').select('habit_id, date, completed').gte('date', start).lte('date', end),
      supabase.from('daily_tasks').select('id, title, day, completed').gte('day', start).lte('day', end),
    ]);

    const email = (settingsRes.data as { report_email?: string } | null)?.report_email?.trim();
    if (!email) {
      return new Response(
        JSON.stringify({ ok: true, message: 'No report email configured; skip send' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const habits = (habitsRes.data ?? []) as { id: string; name: string }[];
    const logs = (logsRes.data ?? []) as { habit_id: string; date: string; completed: boolean }[];
    const tasks = (tasksRes.data ?? []) as { id: string; title: string; day: string; completed: boolean }[];

    const completedLogs = logs.filter((l) => l.completed);
    const completedTasks = tasks.filter((t) => t.completed);
    const totalTasks = tasks.length;
    const totalLogs = completedLogs.length;
    const habitDays = habits.length * (new Date(targetYear, targetMonth, 0).getDate());
    const pct = habitDays > 0 ? Math.round((totalLogs / habitDays) * 100) : 0;

    const monthLabel = new Date(targetYear, targetMonth - 1, 1).toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    });

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>VPrime Report – ${monthLabel}</title></head>
<body style="font-family:sans-serif;background:#0D0D0D;color:#fff;padding:24px;max-width:560px;">
  <h1 style="margin:0 0 8px;">VPrime Report</h1>
  <p style="color:#AAA;margin:0 0 24px;">${monthLabel}</p>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px;">
    <div style="background:#1A1A1A;padding:16px;border-radius:8px;">
      <div style="color:#AAA;font-size:12px;">Completion</div>
      <div style="font-size:24px;font-weight:700;">${pct}%</div>
    </div>
    <div style="background:#1A1A1A;padding:16px;border-radius:8px;">
      <div style="color:#AAA;font-size:12px;">Habit checks</div>
      <div style="font-size:24px;font-weight:700;">${totalLogs}</div>
    </div>
    <div style="background:#1A1A1A;padding:16px;border-radius:8px;">
      <div style="color:#AAA;font-size:12px;">Tasks done</div>
      <div style="font-size:24px;font-weight:700;">${completedTasks}/${totalTasks}</div>
    </div>
  </div>
  <p style="color:#AAA;font-size:14px;">This report was generated automatically by VPrime.</p>
</body>
</html>`;

    if (!resendKey) {
      return new Response(
        JSON.stringify({ ok: true, message: 'Report built; RESEND_API_KEY not set, email not sent' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: 'VPrime <onboarding@resend.dev>',
        to: [email],
        subject: `VPrime Report – ${monthLabel}`,
        html,
      }),
    });

    const resData = await res.json();
    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: 'Resend failed', details: resData }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true, message: 'Report sent', to: email }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
