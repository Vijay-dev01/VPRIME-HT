import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { HabitMatrix } from '../components/HabitMatrix';
import { useHabitStore } from '../store/useHabitStore';
import { useThemeColors } from '../theme/useThemeColors';
import type { Habit } from '../store/types';

const DURATION_PRESETS = [7, 30, 60, 90] as const;

export function HabitMatrixScreen() {
  const colors = useThemeColors();
  const fetchHabits = useHabitStore((s) => s.fetchHabits);
  const fetchHabitLogs = useHabitStore((s) => s.fetchHabitLogs);
  const addHabit = useHabitStore((s) => s.addHabit);
  const updateHabit = useHabitStore((s) => s.updateHabit);
  const selectedWeekStart = useHabitStore((s) => s.selectedWeekStart);
  const setSelectedWeekStart = useHabitStore((s) => s.setSelectedWeekStart);
  const weekDates = useHabitStore((s) => s.weekDates);
  const [addHabitVisible, setAddHabitVisible] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitDuration, setNewHabitDuration] = useState<number | null>(null);
  const [editHabit, setEditHabit] = useState<Habit | null>(null);
  const [editDuration, setEditDuration] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const selectedMonth = useHabitStore((s) => s.selectedMonth);
  const setSelectedMonth = useHabitStore((s) => s.setSelectedMonth);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  useEffect(() => {
    const dates = weekDates();
    if (dates.length === 0) return;
    fetchHabitLogs(dates[0], dates[dates.length - 1]);
  }, [selectedWeekStart, fetchHabitLogs, weekDates]);

  const monthDates = useHabitStore((s) => s.monthDates);
  useEffect(() => {
    if (viewMode !== 'month') return;
    const dates = monthDates();
    if (dates.length === 0) return;
    fetchHabitLogs(dates[0], dates[dates.length - 1]);
  }, [viewMode, selectedMonth.year, selectedMonth.month, fetchHabitLogs]);

  const weekLabel = (() => {
    const d = new Date(selectedWeekStart);
    const end = new Date(d);
    end.setDate(d.getDate() + 6);
    return `${d.getDate()} – ${end.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
  })();

  const monthLabel = `${new Date(selectedMonth.year, selectedMonth.month - 1).toLocaleString('default', { month: 'long' })} ${selectedMonth.year}`;

  const goPrev = () => {
    if (viewMode === 'week') {
      const d = new Date(selectedWeekStart);
      d.setDate(d.getDate() - 7);
      setSelectedWeekStart(d);
    } else {
      if (selectedMonth.month === 1) setSelectedMonth(selectedMonth.year - 1, 12);
      else setSelectedMonth(selectedMonth.year, selectedMonth.month - 1);
    }
  };
  const goNext = () => {
    if (viewMode === 'week') {
      const d = new Date(selectedWeekStart);
      d.setDate(d.getDate() + 7);
      setSelectedWeekStart(d);
    } else {
      if (selectedMonth.month === 12) setSelectedMonth(selectedMonth.year + 1, 1);
      else setSelectedMonth(selectedMonth.year, selectedMonth.month + 1);
    }
  };

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        titleRow: {
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 4,
          backgroundColor: colors.background,
        },
        titleTop: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        },
        addHabitBtn: {
          backgroundColor: colors.primaryRed,
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 8,
        },
        addHabitBtnText: {
          color: colors.text,
          fontSize: 14,
          fontWeight: '700',
        },
        modalOverlay: {
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.6)',
          justifyContent: 'center',
          padding: 24,
        },
        modalContentWrap: { width: '100%' },
        modalBox: {
          backgroundColor: colors.card,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 20,
        },
        modalTitle: {
          color: colors.text,
          fontSize: 18,
          fontWeight: '700',
          marginBottom: 12,
        },
        modalInput: {
          backgroundColor: colors.background,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 8,
          paddingHorizontal: 14,
          paddingVertical: 12,
          color: colors.text,
          fontSize: 16,
          marginBottom: 16,
        },
        modalActions: {
          flexDirection: 'row',
          justifyContent: 'flex-end',
          gap: 12,
        },
        modalCancelBtn: { paddingVertical: 10, paddingHorizontal: 16 },
        modalCancelText: { color: colors.subText, fontSize: 16 },
        modalAddBtn: {
          backgroundColor: colors.primaryRed,
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderRadius: 8,
        },
        modalAddBtnDisabled: { opacity: 0.5 },
        modalAddText: {
          color: colors.text,
          fontSize: 16,
          fontWeight: '700',
        },
        durationLabel: {
          color: colors.subText,
          fontSize: 14,
          marginBottom: 8,
        },
        durationRow: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 16,
        },
        durationBtn: {
          paddingVertical: 8,
          paddingHorizontal: 14,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: colors.border,
        },
        durationBtnSelected: {
          borderColor: colors.primaryRed,
          backgroundColor: colors.primaryRed + '20',
        },
        durationBtnText: { color: colors.text, fontSize: 14 },
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
        weekRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          marginTop: 4,
        },
        weekBtn: { padding: 4 },
        weekBtnText: {
          color: colors.primaryRed,
          fontSize: 20,
          fontWeight: '700',
        },
        viewToggle: {
          flexDirection: 'row',
          marginTop: 8,
          gap: 4,
        },
        viewToggleBtn: {
          paddingVertical: 4,
          paddingHorizontal: 10,
          borderRadius: 6,
          borderWidth: 1,
          borderColor: colors.border,
        },
        viewToggleBtnActive: {
          borderColor: colors.primaryRed,
          backgroundColor: colors.primaryRed + '30',
        },
        viewToggleBtnText: { color: colors.subText, fontSize: 12 },
        viewToggleBtnTextActive: { color: colors.primaryRed, fontWeight: '700' },
      }),
    [colors]
  );

  const handleAddHabit = async () => {
    if (!newHabitName.trim()) return;
    try {
      await addHabit(newHabitName.trim(), newHabitDuration ?? undefined);
      setNewHabitName('');
      setNewHabitDuration(null);
      setAddHabitVisible(false);
    } catch (e) {
      Alert.alert('Could not add habit', (e as Error).message);
    }
  };

  const handleSaveEditHabit = async () => {
    if (!editHabit) return;
    try {
      await updateHabit(editHabit.id, { duration_days: editDuration, start_date: editHabit.start_date ?? undefined });
      setEditHabit(null);
      setEditDuration(null);
    } catch (e) {
      Alert.alert('Could not update habit', (e as Error).message);
    }
  };

  const openEditHabit = (habit: Habit) => {
    setEditHabit(habit);
    setEditDuration(habit.duration_days ?? null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.titleTop}>
          <View>
            <Text style={styles.title}>Habit Matrix</Text>
            <View style={styles.weekRow}>
              <Pressable onPress={goPrev} style={styles.weekBtn} hitSlop={12}>
                <Text style={styles.weekBtnText}>‹</Text>
              </Pressable>
              <Text style={styles.subtitle}>{viewMode === 'week' ? weekLabel : monthLabel}</Text>
              <Pressable onPress={goNext} style={styles.weekBtn} hitSlop={12}>
                <Text style={styles.weekBtnText}>›</Text>
              </Pressable>
            </View>
            <View style={styles.viewToggle}>
              <Pressable
                style={[styles.viewToggleBtn, viewMode === 'week' && styles.viewToggleBtnActive]}
                onPress={() => setViewMode('week')}
              >
                <Text style={[styles.viewToggleBtnText, viewMode === 'week' && styles.viewToggleBtnTextActive]}>Week</Text>
              </Pressable>
              <Pressable
                style={[styles.viewToggleBtn, viewMode === 'month' && styles.viewToggleBtnActive]}
                onPress={() => setViewMode('month')}
              >
                <Text style={[styles.viewToggleBtnText, viewMode === 'month' && styles.viewToggleBtnTextActive]}>Month</Text>
              </Pressable>
            </View>
          </View>
          <Pressable
            style={styles.addHabitBtn}
            onPress={() => setAddHabitVisible(true)}
          >
            <Text style={styles.addHabitBtnText}>+ Habit</Text>
          </Pressable>
        </View>
      </View>
      <HabitMatrix onEditHabit={openEditHabit} viewMode={viewMode} />

      <Modal
        visible={addHabitVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddHabitVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setAddHabitVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalContentWrap}
          >
            <Pressable onPress={(e) => e.stopPropagation()} style={styles.modalBox}>
              <Text style={styles.modalTitle}>New habit</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Read 5 pages"
                placeholderTextColor={colors.subText}
                value={newHabitName}
                onChangeText={setNewHabitName}
                autoFocus
                onSubmitEditing={handleAddHabit}
              />
              <Text style={styles.durationLabel}>Duration (optional)</Text>
              <View style={styles.durationRow}>
                <Pressable
                  style={[styles.durationBtn, newHabitDuration === null && styles.durationBtnSelected]}
                  onPress={() => setNewHabitDuration(null)}
                >
                  <Text style={styles.durationBtnText}>No end</Text>
                </Pressable>
                {DURATION_PRESETS.map((d) => (
                  <Pressable
                    key={d}
                    style={[styles.durationBtn, newHabitDuration === d && styles.durationBtnSelected]}
                    onPress={() => setNewHabitDuration(d)}
                  >
                    <Text style={styles.durationBtnText}>{d} days</Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.modalActions}>
                <Pressable
                  style={styles.modalCancelBtn}
                  onPress={() => setAddHabitVisible(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalAddBtn, !newHabitName.trim() && styles.modalAddBtnDisabled]}
                  onPress={handleAddHabit}
                  disabled={!newHabitName.trim()}
                >
                  <Text style={styles.modalAddText}>Add</Text>
                </Pressable>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>

      <Modal
        visible={editHabit != null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditHabit(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setEditHabit(null)}
        >
          <Pressable onPress={(e) => e.stopPropagation()} style={styles.modalBox}>
            <Text style={styles.modalTitle}>Edit habit: {editHabit?.name}</Text>
            <Text style={styles.durationLabel}>Duration</Text>
            <View style={styles.durationRow}>
              <Pressable
                style={[styles.durationBtn, editDuration === null && styles.durationBtnSelected]}
                onPress={() => setEditDuration(null)}
              >
                <Text style={styles.durationBtnText}>No end</Text>
              </Pressable>
              {DURATION_PRESETS.map((d) => (
                <Pressable
                  key={d}
                  style={[styles.durationBtn, editDuration === d && styles.durationBtnSelected]}
                  onPress={() => setEditDuration(d)}
                >
                  <Text style={styles.durationBtnText}>{d} days</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalCancelBtn}
                onPress={() => setEditHabit(null)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalAddBtn} onPress={handleSaveEditHabit}>
                <Text style={styles.modalAddText}>Save</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
