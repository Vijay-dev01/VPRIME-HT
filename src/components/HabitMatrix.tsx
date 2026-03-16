import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { HabitRow, CELL_SIZE } from './HabitRow';
import { ProgressBar } from './ProgressBar';
import { useHabitStore, getWeekDates, getMonthDates } from '../store/useHabitStore';
import { useThemeColors } from '../theme/useThemeColors';
import type { Habit } from '../store/types';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface HabitMatrixProps {
  onEditHabit?: (habit: Habit) => void;
  viewMode?: 'week' | 'month';
}

export function HabitMatrix({ onEditHabit, viewMode = 'week' }: HabitMatrixProps) {
  const colors = useThemeColors();
  const habits = useHabitStore((s) => s.habits);
  const habitLogs = useHabitStore((s) => s.habitLogs);
  const sortedHabits = useMemo(
    () =>
      [...habits].sort((a, b) => {
        const aCount = habitLogs.filter((l) => l.habit_id === a.id && l.completed).length;
        const bCount = habitLogs.filter((l) => l.habit_id === b.id && l.completed).length;
        return bCount - aCount;
      }),
    [habits, habitLogs]
  );
  const selectedWeekStart = useHabitStore((s) => s.selectedWeekStart);
  const selectedMonth = useHabitStore((s) => s.selectedMonth);
  const weekDates = useMemo(
    () => getWeekDates(selectedWeekStart),
    [selectedWeekStart.getTime()]
  );
  const monthDates = useMemo(
    () => getMonthDates(selectedMonth.year, selectedMonth.month),
    [selectedMonth.year, selectedMonth.month]
  );
  const dates = viewMode === 'month' ? monthDates : weekDates;
  const weeklyProgress = useHabitStore((s) => s.weeklyProgress());
  const weeklyProgressLabel = useHabitStore((s) => s.weeklyProgressLabel());

  const dateLabels = useMemo(() => {
    if (viewMode === 'month') {
      return monthDates.map((d) => {
        const date = new Date(d);
        return { day: String(date.getDate()), date: date.getDate(), key: d };
      });
    }
    return weekDates.map((d) => {
      const date = new Date(d);
      return { day: DAY_LABELS[date.getDay()], date: date.getDate(), key: d };
    });
  }, [viewMode, weekDates, monthDates]);

  const monthlyProgress = useMemo(() => {
    if (viewMode !== 'month' || habits.length === 0) return 0;
    const total = habits.length * monthDates.length;
    const done = monthDates.reduce(
      (sum, d) =>
        sum +
        habitLogs.filter((l) => l.date === d && l.completed).length,
      0
    );
    return total === 0 ? 0 : done / total;
  }, [viewMode, habits.length, monthDates, habitLogs]);

  const progress = viewMode === 'month' ? monthlyProgress : weeklyProgress;
  const progressLabel = viewMode === 'month' ? `${Math.round(monthlyProgress * 100)}%` : weeklyProgressLabel;
  const footerSub = viewMode === 'month' ? 'Monthly completion' : 'Weekly completion';

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        headerRow: {
          flexDirection: 'row',
          backgroundColor: colors.card,
          borderBottomWidth: 2,
          borderBottomColor: colors.border,
          paddingVertical: 10,
        },
        habitHeader: {
          width: 120,
          minWidth: 120,
          justifyContent: 'center',
          paddingLeft: 10,
        },
        headerText: {
          color: colors.primaryRed,
          fontSize: 16,
          fontWeight: '700',
        },
        daysHeaderScroll: { flex: 1 },
        daysHeaderContent: {
          flexDirection: 'row',
          paddingRight: 16,
          gap: 6,
        },
        dayHeaderCell: {
          width: CELL_SIZE,
          alignItems: 'center',
          justifyContent: 'center',
        },
        dayLabel: { color: colors.subText, fontSize: 11 },
        dateLabel: {
          color: colors.text,
          fontSize: 14,
          fontWeight: '600',
        },
        body: { flex: 1 },
        footer: {
          padding: 16,
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        footerSub: {
          color: colors.subText,
          fontSize: 12,
          marginTop: 4,
        },
      }),
    [colors]
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.habitHeader}>
          <Text style={styles.headerText}>Habits</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.daysHeaderScroll}
          contentContainerStyle={styles.daysHeaderContent}
        >
          {dateLabels.map(({ day, date, key }) => (
            <View key={key} style={styles.dayHeaderCell}>
              {viewMode === 'week' && <Text style={styles.dayLabel}>{day}</Text>}
              <Text style={styles.dateLabel}>{viewMode === 'month' ? day : date}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {sortedHabits.map((h) => (
          <HabitRow
            key={h.id}
            habit={h}
            dates={dates}
            onEdit={onEditHabit}
          />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <ProgressBar
          progress={progress}
          label={progressLabel}
          height={12}
        />
        <Text style={styles.footerSub}>{footerSub}</Text>
      </View>
    </View>
  );
}
