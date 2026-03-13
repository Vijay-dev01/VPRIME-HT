import { create } from 'zustand';
import { Habit, HabitLog, DailyTask } from './types';
import { supabase } from '../services/supabaseClient';

export const getWeekDates = (anchor: Date): string[] => {
  const d = new Date(anchor);
  const day = d.getDay();
  const start = new Date(d);
  start.setDate(d.getDate() - day);
  const out: string[] = [];
  for (let i = 0; i < 7; i++) {
    const x = new Date(start);
    x.setDate(start.getDate() + i);
    out.push(x.toISOString().slice(0, 10));
  }
  return out;
};

const formatDate = (d: Date) => d.toISOString().slice(0, 10);

interface HabitState {
  habits: Habit[];
  habitLogs: HabitLog[];
  dailyTasks: DailyTask[];
  selectedWeekStart: Date;

  setSelectedWeekStart: (d: Date) => void;
  weekDates: () => string[];
  toggleHabitDay: (habitId: string, date: string) => Promise<void>;
  setHabitLog: (habitId: string, date: string, completed: boolean) => void;
  getHabitCompleted: (habitId: string, date: string) => boolean;

  weeklyProgress: () => number; // 0-1
  weeklyProgressLabel: () => string;

  fetchHabits: () => Promise<void>;
  addHabit: (name: string) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  fetchHabitLogs: (startDate: string, endDate: string) => Promise<void>;
  fetchDailyTasks: (startDate: string, endDate: string) => Promise<void>;

  dailyProgress: (day: string) => number; // 0-1 for that day's tasks
  tasksForDay: (day: string) => DailyTask[];
  toggleDailyTask: (taskId: string) => Promise<void>;
  setTaskCompleted: (taskId: string, completed: boolean) => void;
  addDailyTask: (day: string, title: string) => Promise<void>;
  deleteDailyTask: (taskId: string) => Promise<void>;

  totalHabitsCompleted: () => number;
  bestStreak: () => number;
  completionByDay: (start: string, end: string) => Record<string, number>;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  habitLogs: [],
  dailyTasks: [],
  selectedWeekStart: (() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    return d;
  })(),

  setSelectedWeekStart: (d) => set({ selectedWeekStart: d }),

  weekDates: () => getWeekDates(get().selectedWeekStart),

  setHabitLog: (habitId, date, completed) => {
    set((s) => {
      const next = s.habitLogs.filter(
        (l) => !(l.habit_id === habitId && l.date === date)
      );
      const existing = s.habitLogs.find(
        (l) => l.habit_id === habitId && l.date === date
      );
      if (existing) {
        next.push({ ...existing, completed });
      } else {
        next.push({
          id: `local-${habitId}-${date}`,
          habit_id: habitId,
          date,
          completed,
        });
      }
      return { habitLogs: next };
    });
  },

  getHabitCompleted: (habitId, date) => {
    const log = get().habitLogs.find(
      (l) => l.habit_id === habitId && l.date === date
    );
    return log?.completed ?? false;
  },

  toggleHabitDay: async (habitId, date) => {
    const prev = get().getHabitCompleted(habitId, date);
    const next = !prev;
    get().setHabitLog(habitId, date, next);
    if (!supabase) return;
    try {
      const { data: existing } = await supabase
        .from('habit_logs')
        .select('id')
        .eq('habit_id', habitId)
        .eq('date', date)
        .maybeSingle();
      if (existing) {
        await supabase
          .from('habit_logs')
          .update({ completed: next })
          .eq('id', existing.id);
      } else {
        await supabase.from('habit_logs').insert({
          habit_id: habitId,
          date,
          completed: next,
        });
      }
    } catch {
      get().setHabitLog(habitId, date, prev);
    }
  },

  weeklyProgress: () => {
    const { habits, habitLogs, weekDates } = get();
    const dates = weekDates();
    let total = 0;
    let done = 0;
    habits.forEach((h) => {
      dates.forEach((d) => {
        total += 1;
        if (
          habitLogs.some(
            (l) => l.habit_id === h.id && l.date === d && l.completed
          )
        )
          done += 1;
      });
    });
    return total === 0 ? 0 : done / total;
  },

  weeklyProgressLabel: () => {
    const p = get().weeklyProgress();
    return `${Math.round(p * 100)}%`;
  },

  fetchHabits: async () => {
    if (!supabase) return;
    const { data } = await supabase.from('habits').select('*').order('created_at');
    set({ habits: (data ?? []) as Habit[] });
  },

  addHabit: async (name) => {
    const trimmed = name?.trim();
    if (!trimmed) return;
    if (!supabase) return;
    const { data, error } = await supabase
      .from('habits')
      .insert({ name: trimmed })
      .select()
      .single();
    if (error) {
      console.warn('[addHabit] Supabase error:', error.message, error.code);
      throw new Error(error.message);
    }
    if (data) set((s) => ({ habits: [...s.habits, data as Habit] }));
  },

  deleteHabit: async (habitId) => {
    if (!supabase) return;
    const { error } = await supabase.from('habits').delete().eq('id', habitId);
    if (error) {
      console.warn('[deleteHabit] Supabase error:', error.message, error.code);
      throw new Error(error.message);
    }
    set((s) => ({
      habits: s.habits.filter((h) => h.id !== habitId),
      habitLogs: s.habitLogs.filter((l) => l.habit_id !== habitId),
    }));
  },

  fetchHabitLogs: async (startDate, endDate) => {
    if (!supabase) return;
    const { data } = await supabase
      .from('habit_logs')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate);
    set((s) => {
      const existing = s.habitLogs.filter(
        (l) => l.date < startDate || l.date > endDate
      );
      return { habitLogs: [...existing, ...(data ?? [])] as HabitLog[] };
    });
  },

  fetchDailyTasks: async (startDate, endDate) => {
    if (!supabase) return;
    const { data } = await supabase
      .from('daily_tasks')
      .select('*')
      .gte('day', startDate)
      .lte('day', endDate)
      .order('sort_order');
    set((s) => {
      const existing = s.dailyTasks.filter(
        (t) => t.day < startDate || t.day > endDate
      );
      return { dailyTasks: [...existing, ...(data ?? [])] as DailyTask[] };
    });
  },

  tasksForDay: (day) =>
    get()
      .dailyTasks.filter((t) => t.day === day)
      .sort((a, b) => a.sort_order - b.sort_order),

  dailyProgress: (day) => {
    const tasks = get().tasksForDay(day);
    if (tasks.length === 0) return 0;
    const completed = tasks.filter((t) => t.completed).length;
    return completed / tasks.length;
  },

  setTaskCompleted: (taskId, completed) => {
    set((s) => ({
      dailyTasks: s.dailyTasks.map((t) =>
        t.id === taskId ? { ...t, completed } : t
      ),
    }));
  },

  toggleDailyTask: async (taskId) => {
    const tasks = get().dailyTasks;
    const t = tasks.find((x) => x.id === taskId);
    if (!t) return;
    const next = !t.completed;
    get().setTaskCompleted(taskId, next);
    if (!supabase) return;
    try {
      await supabase
        .from('daily_tasks')
        .update({ completed: next })
        .eq('id', taskId);
    } catch {
      get().setTaskCompleted(taskId, t.completed);
    }
  },

  addDailyTask: async (day, title) => {
    if (!supabase) return;
    const maxOrder =
      Math.max(0, ...get().dailyTasks.filter((t) => t.day === day).map((t) => t.sort_order)) + 1;
    const { data, error } = await supabase
      .from('daily_tasks')
      .insert({ title, day, completed: false, sort_order: maxOrder })
      .select()
      .single();
    if (error) {
      console.warn('[addDailyTask] Supabase error:', error.message, error.code);
      throw new Error(error.message);
    }
    if (data) set((s) => ({ dailyTasks: [...s.dailyTasks, data as DailyTask] }));
  },

  deleteDailyTask: async (taskId) => {
    if (!supabase) return;
    const { error } = await supabase.from('daily_tasks').delete().eq('id', taskId);
    if (error) {
      console.warn('[deleteDailyTask] Supabase error:', error.message, error.code);
      throw new Error(error.message);
    }
    set((s) => ({ dailyTasks: s.dailyTasks.filter((t) => t.id !== taskId) }));
  },

  totalHabitsCompleted: () =>
    get().habitLogs.filter((l) => l.completed).length,

  bestStreak: () => {
    const logs = get().habitLogs
      .filter((l) => l.completed)
      .map((l) => l.date)
      .sort();
    const uniq = [...new Set(logs)].sort();
    let max = 0;
    let curr = 1;
    for (let i = 1; i < uniq.length; i++) {
      const a = new Date(uniq[i - 1]).getTime();
      const b = new Date(uniq[i]).getTime();
      if (b - a === 86400000) curr += 1;
      else {
        max = Math.max(max, curr);
        curr = 1;
      }
    }
    return Math.max(max, curr, uniq.length ? 1 : 0);
  },

  completionByDay: (start, end) => {
    const { habitLogs, habits } = get();
    const out: Record<string, number> = {};
    const d = new Date(start);
    const endD = new Date(end);
    while (d <= endD) {
      const key = formatDate(d);
      const total = habits.length;
      const done = habitLogs.filter(
        (l) => l.date === key && l.completed
      ).length;
      out[key] = total === 0 ? 0 : done / total;
      d.setDate(d.getDate() + 1);
    }
    return out;
  },
}));
