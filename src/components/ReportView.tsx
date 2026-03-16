import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useHabitStore } from '../store/useHabitStore';
import { useThemeColors } from '../theme/useThemeColors';
import { getMonthDates } from '../store/useHabitStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const REPORT_WIDTH = Math.min(SCREEN_WIDTH, 400);
const CHART_WIDTH = REPORT_WIDTH - 32;
const CHART_HEIGHT = 160;

function hexToRgba(hex: string, opacity: number): string {
  const n = hex.replace('#', '');
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

interface ReportViewProps {
  year: number;
  month: number;
}

export function ReportView({ year, month }: ReportViewProps) {
  const colors = useThemeColors();
  const habits = useHabitStore((s) => s.habits);
  const habitLogs = useHabitStore((s) => s.habitLogs);

  const monthDates = useMemo(() => getMonthDates(year, month), [year, month]);
  const start = monthDates[0];
  const end = monthDates[monthDates.length - 1];

  const completionByDay = useMemo(() => {
    const out: Record<string, number> = {};
    monthDates.forEach((d) => {
      const total = habits.length;
      const done = habitLogs.filter((l) => l.date === d && l.completed).length;
      out[d] = total === 0 ? 0 : done / total;
    });
    return out;
  }, [habits.length, habitLogs, monthDates]);

  const totalCompleted = useMemo(
    () => habitLogs.filter((l) => l.completed && l.date >= start && l.date <= end).length,
    [habitLogs, start, end]
  );

  const totalPossible = habits.length * monthDates.length;
  const overallPct = totalPossible > 0 ? (totalCompleted / totalPossible) * 100 : 0;

  const chartLabels = useMemo(() => monthDates.map((d) => String(new Date(d).getDate())), [monthDates]);
  const chartValues = useMemo(
    () => monthDates.map((d) => (completionByDay[d] ?? 0) * 100),
    [monthDates, completionByDay]
  );

  const lineData = {
    labels: chartLabels,
    datasets: [
      {
        data: chartValues,
        color: (opacity = 1) => hexToRgba(colors.primaryRed, opacity),
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = useMemo(
    () => ({
      backgroundGradientFrom: colors.card,
      backgroundGradientTo: colors.card,
      color: (opacity: number) => hexToRgba(colors.primaryRed, opacity),
      strokeWidth: 2,
      decimalPlaces: 0,
      labelColor: () => colors.subText,
      propsForLabels: { fontSize: 8 },
    }),
    [colors]
  );

  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          width: REPORT_WIDTH,
          backgroundColor: colors.background,
          padding: 20,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
        },
        title: {
          color: colors.text,
          fontSize: 20,
          fontWeight: '800',
          marginBottom: 4,
          textAlign: 'center',
        },
        subtitle: {
          color: colors.subText,
          fontSize: 14,
          marginBottom: 16,
          textAlign: 'center',
        },
        cardsRow: {
          flexDirection: 'row',
          gap: 10,
          marginBottom: 16,
        },
        card: {
          flex: 1,
          backgroundColor: colors.card,
          borderRadius: 10,
          padding: 12,
          borderWidth: 1,
          borderColor: colors.border,
        },
        cardLabel: {
          color: colors.subText,
          fontSize: 10,
          fontWeight: '600',
          textTransform: 'uppercase',
          marginBottom: 4,
        },
        cardValue: {
          color: colors.primaryRed,
          fontSize: 18,
          fontWeight: '800',
        },
        chartWrap: {
          borderRadius: 8,
          overflow: 'hidden',
        },
      }),
    [colors]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>VPrime Report</Text>
      <Text style={styles.subtitle}>{monthName} {year}</Text>
      <View style={styles.cardsRow}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Completion</Text>
          <Text style={styles.cardValue}>{Math.round(overallPct)}%</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Total done</Text>
          <Text style={styles.cardValue}>{totalCompleted}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Habits</Text>
          <Text style={styles.cardValue}>{habits.length}</Text>
        </View>
      </View>
      <View style={styles.chartWrap}>
        <LineChart
          data={lineData}
          width={CHART_WIDTH}
          height={CHART_HEIGHT}
          chartConfig={chartConfig}
          bezier
          withInnerLines={true}
          withOuterLines={true}
          fromZero
          yAxisSuffix="%"
          formatYLabel={(v) => `${Math.round(Number(v))}%`}
        />
      </View>
    </View>
  );
}
