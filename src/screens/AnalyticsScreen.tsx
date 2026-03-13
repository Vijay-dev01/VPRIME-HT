import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useHabitStore } from '../store/useHabitStore';
import { colors } from '../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 32;
const CHART_HEIGHT = 200;

function getLast30Days(): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = 29; i >= 0; i--) {
    const x = new Date(d);
    x.setDate(d.getDate() - i);
    out.push(x.toISOString().slice(0, 10));
  }
  return out;
}

const chartConfig = {
  backgroundGradientFrom: colors.card,
  backgroundGradientTo: colors.card,
  color: (opacity: number) => `rgba(229, 9, 20, ${opacity})`,
  strokeWidth: 2,
  decimalPlaces: 0,
  labelColor: () => colors.subText,
  propsForLabels: { fontSize: 10 },
};

export function AnalyticsScreen() {
  const completionByDay = useHabitStore((s) => s.completionByDay);
  const totalHabitsCompleted = useHabitStore((s) => s.totalHabitsCompleted);
  const bestStreak = useHabitStore((s) => s.bestStreak);
  const fetchHabits = useHabitStore((s) => s.fetchHabits);
  const fetchHabitLogs = useHabitStore((s) => s.fetchHabitLogs);
  const habits = useHabitStore((s) => s.habits);

  const days30 = useMemo(() => getLast30Days(), []);
  const rangeStart = days30[0];
  const rangeEnd = days30[days30.length - 1];

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  useEffect(() => {
    fetchHabitLogs(rangeStart, rangeEnd);
  }, [rangeStart, rangeEnd, fetchHabitLogs]);

  const completionData = useMemo(() => {
    const byDay = completionByDay(rangeStart, rangeEnd);
    const values = days30.map((d) => (byDay[d] ?? 0) * 100);
    const labels = days30.map((d) => String(new Date(d).getDate()));
    return { labels, values };
  }, [completionByDay, rangeStart, rangeEnd, days30]);

  const totalPossible = habits.length * 30;
  const overallPct =
    totalPossible > 0
      ? (totalHabitsCompleted() / totalPossible) * 100
      : 0;
  const lineData = {
    labels: completionData.labels,
    datasets: [
      {
        data: completionData.values,
        color: (opacity = 1) => `rgba(229, 9, 20, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.titleRow}>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>Habit performance</Text>
      </View>

      <View style={styles.cardsRow}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Overall Progress</Text>
          <Text style={styles.cardValue}>{Math.round(overallPct)}%</Text>
          <View style={styles.miniBar}>
            <View
              style={[
                styles.miniBarFill,
                { width: `${Math.min(100, overallPct)}%` },
              ]}
            />
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Total Completed</Text>
          <Text style={styles.cardValue}>{totalHabitsCompleted()}</Text>
          <Text style={styles.cardSub}>habits</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Best Streak</Text>
          <Text style={styles.cardValue}>{bestStreak()}</Text>
          <Text style={styles.cardSub}>days</Text>
        </View>
      </View>

      <View style={styles.chartSection}>
        <Text style={styles.chartTitle}>Completion % (last 30 days)</Text>
        <LineChart
          data={lineData}
          width={CHART_WIDTH}
          height={CHART_HEIGHT}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withInnerLines={true}
          withOuterLines={true}
          fromZero
          yAxisSuffix="%"
          formatYLabel={(v) => `${Math.round(Number(v))}%`}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 32,
  },
  titleRow: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
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
  cardsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  cardLabel: {
    color: colors.subText,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  cardValue: {
    color: colors.primaryRed,
    fontSize: 22,
    fontWeight: '800',
  },
  cardSub: {
    color: colors.subText,
    fontSize: 12,
    marginTop: 2,
  },
  miniBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  miniBarFill: {
    height: '100%',
    backgroundColor: colors.progressGreen,
    borderRadius: 2,
  },
  chartSection: {
    paddingHorizontal: 16,
  },
  chartTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  chart: {
    borderRadius: 12,
    paddingRight: 8,
  },
});
