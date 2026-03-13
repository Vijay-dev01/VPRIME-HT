import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { HabitRow, CELL_SIZE } from './HabitRow';
import { ProgressBar } from './ProgressBar';
import { useHabitStore, getWeekDates } from '../store/useHabitStore';
import { colors } from '../theme/colors';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function HabitMatrix() {
  const habits = useHabitStore((s) => s.habits);
  const selectedWeekStart = useHabitStore((s) => s.selectedWeekStart);
  const weekDates = useMemo(
    () => getWeekDates(selectedWeekStart),
    [selectedWeekStart.getTime()]
  );
  const weeklyProgress = useHabitStore((s) => s.weeklyProgress());
  const weeklyProgressLabel = useHabitStore((s) => s.weeklyProgressLabel());

  const dateLabels = useMemo(() => {
    return weekDates.map((d) => {
      const date = new Date(d);
      return { day: DAY_LABELS[date.getDay()], date: date.getDate(), key: d };
    });
  }, [weekDates]);

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
              <Text style={styles.dayLabel}>{day}</Text>
              <Text style={styles.dateLabel}>{date}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {habits.map((h) => (
          <HabitRow
            key={h.id}
            habitId={h.id}
            habitName={h.name}
            dates={weekDates}
          />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <ProgressBar
          progress={weeklyProgress}
          label={weeklyProgressLabel}
          height={12}
        />
        <Text style={styles.footerSub}>Weekly completion</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
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
  daysHeaderScroll: {
    flex: 1,
  },
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
  dayLabel: {
    color: colors.subText,
    fontSize: 11,
  },
  dateLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  body: {
    flex: 1,
  },
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
});
