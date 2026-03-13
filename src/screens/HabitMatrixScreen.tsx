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
import { colors } from '../theme/colors';

export function HabitMatrixScreen() {
  const fetchHabits = useHabitStore((s) => s.fetchHabits);
  const fetchHabitLogs = useHabitStore((s) => s.fetchHabitLogs);
  const addHabit = useHabitStore((s) => s.addHabit);
  const selectedWeekStart = useHabitStore((s) => s.selectedWeekStart);
  const setSelectedWeekStart = useHabitStore((s) => s.setSelectedWeekStart);
  const weekDates = useHabitStore((s) => s.weekDates);
  const [addHabitVisible, setAddHabitVisible] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  useEffect(() => {
    const dates = weekDates();
    if (dates.length === 0) return;
    fetchHabitLogs(dates[0], dates[dates.length - 1]);
  }, [selectedWeekStart, fetchHabitLogs, weekDates]);

  const weekLabel = (() => {
    const d = new Date(selectedWeekStart);
    const end = new Date(d);
    end.setDate(d.getDate() + 6);
    return `${d.getDate()} – ${end.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
  })();

  const goPrev = () => {
    const d = new Date(selectedWeekStart);
    d.setDate(d.getDate() - 7);
    setSelectedWeekStart(d);
  };
  const goNext = () => {
    const d = new Date(selectedWeekStart);
    d.setDate(d.getDate() + 7);
    setSelectedWeekStart(d);
  };

  const handleAddHabit = async () => {
    if (!newHabitName.trim()) return;
    try {
      await addHabit(newHabitName.trim());
      setNewHabitName('');
      setAddHabitVisible(false);
    } catch (e) {
      Alert.alert('Could not add habit', (e as Error).message);
    }
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
              <Text style={styles.subtitle}>{weekLabel}</Text>
              <Pressable onPress={goNext} style={styles.weekBtn} hitSlop={12}>
                <Text style={styles.weekBtnText}>›</Text>
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
      <HabitMatrix />

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
  modalContentWrap: {
    width: '100%',
  },
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
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  modalCancelText: {
    color: colors.subText,
    fontSize: 16,
  },
  modalAddBtn: {
    backgroundColor: colors.primaryRed,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalAddBtnDisabled: {
    opacity: 0.5,
  },
  modalAddText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
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
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  weekBtn: {
    padding: 4,
  },
  weekBtnText: {
    color: colors.primaryRed,
    fontSize: 20,
    fontWeight: '700',
  },
});
