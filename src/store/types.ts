export interface Habit {
  id: string;
  name: string;
  created_at: string;
  duration_days?: number | null;
  start_date?: string | null; // YYYY-MM-DD
}

export interface HabitLog {
  id: string;
  habit_id: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
}

export interface DailyTask {
  id: string;
  title: string;
  day: string; // YYYY-MM-DD
  completed: boolean;
  sort_order: number;
}

export type DayKey = string; // YYYY-MM-DD
export type HabitDayState = Record<string, Record<DayKey, boolean>>; // habitId -> date -> completed
