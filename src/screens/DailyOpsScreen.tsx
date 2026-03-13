import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native';
import { DayCard, CARD_WIDTH } from '../components/DayCard';
import { useHabitStore } from '../store/useHabitStore';
import { colors } from '../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PADDING = (SCREEN_WIDTH - CARD_WIDTH) / 2 - 12;

function getDaysAroundToday(count: number): string[] {
  const out: string[] = [];
  const d = new Date();
  const start = count >> 1;
  for (let i = -start; i <= count - start - 1; i++) {
    const x = new Date(d);
    x.setDate(d.getDate() + i);
    out.push(x.toISOString().slice(0, 10));
  }
  return out;
}

const DAYS_TO_SHOW = 14;
const daysList = getDaysAroundToday(DAYS_TO_SHOW);

export function DailyOpsScreen() {
  const fetchDailyTasks = useHabitStore((s) => s.fetchDailyTasks);

  const startDate = useMemo(() => daysList[0], []);
  const endDate = useMemo(() => daysList[daysList.length - 1], []);

  useEffect(() => {
    fetchDailyTasks(startDate, endDate);
  }, [startDate, endDate, fetchDailyTasks]);

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Daily Ops</Text>
        <Text style={styles.subtitle}>Tap to check off</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
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
  listContent: {
    paddingVertical: 16,
  },
});
