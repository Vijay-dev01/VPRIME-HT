import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native';
import { DayCard, CARD_WIDTH } from '../components/DayCard';
import { useHabitStore } from '../store/useHabitStore';
import { useThemeColors } from '../theme/useThemeColors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PADDING = (SCREEN_WIDTH - CARD_WIDTH) / 2 - 12;

const PAST_DAYS = 7;
const FUTURE_DAYS = 6;

function getDaysAroundToday(pastDays: number, futureDays: number): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = -pastDays; i <= futureDays; i++) {
    const x = new Date(d);
    x.setDate(d.getDate() + i);
    out.push(x.toISOString().slice(0, 10));
  }
  return out;
}

const daysList = getDaysAroundToday(PAST_DAYS, FUTURE_DAYS);

export function DailyOpsScreen() {
  const colors = useThemeColors();
  const fetchDailyTasks = useHabitStore((s) => s.fetchDailyTasks);

  const startDate = useMemo(() => daysList[0], []);
  const endDate = useMemo(() => daysList[daysList.length - 1], []);

  useEffect(() => {
    fetchDailyTasks(startDate, endDate);
  }, [startDate, endDate, fetchDailyTasks]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        titleRow: {
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 12,
          backgroundColor: colors.background,
        },
        title: {
          color: colors.text,
          fontSize: 24,
          fontWeight: '800',
        },
        subtitle: {
          color: colors.subText,
          fontSize: 14,
          marginTop: 2,
        },
        listContent: { paddingVertical: 16 },
      }),
    [colors]
  );

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Daily Ops</Text>
        <Text style={styles.subtitle}>Past 7 days · Today · Next 6</Text>
      </View>
      <FlatList
        data={daysList}
        keyExtractor={(item) => item}
        horizontal
        pagingEnabled={false}
        snapToInterval={CARD_WIDTH + 24}
        snapToAlignment="center"
        decelerationRate="fast"
        contentContainerStyle={[styles.listContent, { paddingHorizontal: PADDING }]}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => <DayCard date={item} />}
      />
    </View>
  );
}
