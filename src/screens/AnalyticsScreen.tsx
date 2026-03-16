import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Share from 'expo-sharing';
import { LineChart } from 'react-native-chart-kit';
import { useHabitStore } from '../store/useHabitStore';
import { useThemeColors } from '../theme/useThemeColors';
import { ReportView } from '../components/ReportView';

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

function hexToRgba(hex: string, opacity: number): string {
  const n = hex.replace('#', '');
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function getReportMonth(): { year: number; month: number } {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

export function AnalyticsScreen() {
  const colors = useThemeColors();
  const reportRef = useRef<View>(null);
  const [exportMonth, setExportMonth] = useState(getReportMonth);
  const [exporting, setExporting] = useState(false);
  const completionByDay = useHabitStore((s) => s.completionByDay);
  const totalHabitsCompleted = useHabitStore((s) => s.totalHabitsCompleted);
  const bestStreak = useHabitStore((s) => s.bestStreak);
  const fetchHabits = useHabitStore((s) => s.fetchHabits);
  const fetchHabitLogs = useHabitStore((s) => s.fetchHabitLogs);
  const habits = useHabitStore((s) => s.habits);

  const days30 = useMemo(() => getLast30Days(), []);
  const rangeStart = days30[0];
  const rangeEnd = days30[days30.length - 1];

  const reportStart = useMemo(() => {
    const d = new Date(exportMonth.year, exportMonth.month - 1, 1);
    return d.toISOString().slice(0, 10);
  }, [exportMonth.year, exportMonth.month]);
  const reportEnd = useMemo(() => {
    const d = new Date(exportMonth.year, exportMonth.month, 0);
    return d.toISOString().slice(0, 10);
  }, [exportMonth.year, exportMonth.month]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  useEffect(() => {
    fetchHabitLogs(rangeStart, rangeEnd);
  }, [rangeStart, rangeEnd, fetchHabitLogs]);

  useEffect(() => {
    fetchHabitLogs(reportStart, reportEnd);
  }, [reportStart, reportEnd, fetchHabitLogs]);

  const handleExport = async () => {
    if (!reportRef.current) return;
    setExporting(true);
    try {
      const canShare = await Share.isAvailableAsync();
      if (!canShare) {
        Alert.alert('Export', 'Sharing is not available on this device.');
        return;
      }
      const uri = await captureRef(reportRef, {
        format: 'png',
        result: 'tmpfile',
        quality: 1,
        width: 400,
        height: 420,
      });
      await Share.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: `VPrime Report ${exportMonth.month}/${exportMonth.year}`,
      });
    } catch (e) {
      Alert.alert('Export failed', (e as Error).message);
    } finally {
      setExporting(false);
    }
  };

  const reportMonthLabel = `${new Date(exportMonth.year, exportMonth.month - 1).toLocaleString('default', { month: 'long' })} ${exportMonth.year}`;
  const goReportPrev = () => {
    if (exportMonth.month === 1) setExportMonth({ year: exportMonth.year - 1, month: 12 });
    else setExportMonth({ year: exportMonth.year, month: exportMonth.month - 1 });
  };
  const goReportNext = () => {
    if (exportMonth.month === 12) setExportMonth({ year: exportMonth.year + 1, month: 1 });
    else setExportMonth({ year: exportMonth.year, month: exportMonth.month + 1 });
  };

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
      propsForLabels: { fontSize: 10 },
    }),
    [colors]
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        content: { paddingBottom: 32 },
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
        chartSection: { paddingHorizontal: 16 },
        chartTitle: {
          color: colors.text,
          fontSize: 16,
          fontWeight: '700',
          marginBottom: 12,
        },
        chart: { borderRadius: 12, paddingRight: 8 },
        exportSection: {
          marginHorizontal: 16,
          marginTop: 24,
          marginBottom: 16,
          backgroundColor: colors.card,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 16,
        },
        exportTitle: {
          color: colors.text,
          fontSize: 16,
          fontWeight: '700',
          marginBottom: 12,
        },
        exportRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        },
        exportMonthLabel: { color: colors.subText, fontSize: 14 },
        exportNav: { flexDirection: 'row', gap: 8 },
        exportNavBtn: {
          paddingVertical: 6,
          paddingHorizontal: 12,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: colors.border,
        },
        exportNavBtnText: { color: colors.primaryRed, fontSize: 14, fontWeight: '700' },
        exportBtn: {
          backgroundColor: colors.primaryRed,
          paddingVertical: 12,
          borderRadius: 8,
          alignItems: 'center',
        },
        exportBtnDisabled: { opacity: 0.6 },
        exportBtnText: { color: colors.text, fontSize: 16, fontWeight: '700' },
        reportHidden: {
          position: 'absolute',
          left: -9999,
          top: 0,
          opacity: 0,
          overflow: 'hidden',
        },
      }),
    [colors]
  );

  return (
    <>
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

      <View style={styles.exportSection}>
        <Text style={styles.exportTitle}>Monthly report export</Text>
        <View style={styles.exportRow}>
          <Text style={styles.exportMonthLabel}>{reportMonthLabel}</Text>
          <View style={styles.exportNav}>
            <Pressable style={styles.exportNavBtn} onPress={goReportPrev}>
              <Text style={styles.exportNavBtnText}>‹ Prev</Text>
            </Pressable>
            <Pressable style={styles.exportNavBtn} onPress={goReportNext}>
              <Text style={styles.exportNavBtnText}>Next ›</Text>
            </Pressable>
          </View>
        </View>
        <Pressable
          style={[styles.exportBtn, exporting && styles.exportBtnDisabled]}
          onPress={handleExport}
          disabled={exporting}
        >
          {exporting ? (
            <ActivityIndicator color={colors.text} size="small" />
          ) : (
            <Text style={styles.exportBtnText}>Export & share report</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>

    <View ref={reportRef} style={styles.reportHidden} collapsable={false}>
      <ReportView year={exportMonth.year} month={exportMonth.month} />
    </View>
    </>
  );
}
