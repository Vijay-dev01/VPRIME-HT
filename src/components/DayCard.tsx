import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';
import { TaskItem } from './TaskItem';
import { useHabitStore } from '../store/useHabitStore';
import { useThemeColors } from '../theme/useThemeColors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 340);
const RING_SIZE = 100;

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface DayCardProps {
  date: string; // YYYY-MM-DD
}

export function DayCard({ date }: DayCardProps) {
  const colors = useThemeColors();
  const addDailyTask = useHabitStore((s) => s.addDailyTask);
  const dailyTasks = useHabitStore((s) => s.dailyTasks);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const tasks = useMemo(
    () =>
      dailyTasks
        .filter((t) => t.day === date)
        .sort((a, b) => a.sort_order - b.sort_order),
    [dailyTasks, date]
  );
  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = tasks.length === 0 ? 0 : completedCount / tasks.length;

  const d = new Date(date + 'T12:00:00');
  const dayName = DAY_NAMES[d.getDay()];
  const dateLabel = d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          width: CARD_WIDTH,
          marginHorizontal: 12,
          backgroundColor: colors.card,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: 'hidden',
          paddingBottom: 20,
        },
        header: {
          paddingTop: 20,
          paddingHorizontal: 20,
          paddingBottom: 8,
        },
        dayName: {
          color: colors.text,
          fontSize: 22,
          fontWeight: '800',
        },
        dateLabel: {
          color: colors.subText,
          fontSize: 14,
          marginTop: 2,
        },
        ringWrap: {
          alignItems: 'center',
          paddingVertical: 16,
        },
        tasksSection: {
          paddingHorizontal: 16,
          paddingTop: 8,
        },
        tasksLabel: {
          color: colors.primaryRed,
          fontSize: 14,
          fontWeight: '700',
          marginBottom: 8,
        },
        empty: {
          color: colors.subText,
          fontSize: 14,
          fontStyle: 'italic',
          paddingVertical: 12,
        },
        addTaskRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          marginTop: 12,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        addTaskInput: {
          flex: 1,
          backgroundColor: colors.background,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
          color: colors.text,
          fontSize: 14,
        },
        addTaskBtn: {
          backgroundColor: colors.primaryRed,
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderRadius: 8,
        },
        addTaskBtnDisabled: {
          opacity: 0.5,
        },
        addTaskBtnText: {
          color: colors.text,
          fontSize: 14,
          fontWeight: '700',
        },
      }),
    [colors]
  );

  const handleAddTask = async () => {
    const title = newTaskTitle.trim();
    if (!title) return;
    try {
      await addDailyTask(date, title);
      setNewTaskTitle('');
    } catch (e) {
      Alert.alert('Could not add task', (e as Error).message);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.dayName}>{dayName}</Text>
        <Text style={styles.dateLabel}>{dateLabel}</Text>
      </View>
      <View style={styles.ringWrap}>
        <CircularProgress
          value={progress * 100}
          maxValue={100}
          radius={RING_SIZE / 2 - 6}
          duration={400}
          activeStrokeColor={colors.primaryRed}
          inActiveStrokeColor={colors.border}
          activeStrokeWidth={8}
          inActiveStrokeWidth={6}
          showProgressValue={false}
          title={`${Math.round(progress * 100)}%`}
          titleColor={colors.primaryRed}
          titleFontSize={24}
        />
      </View>
      <View style={styles.tasksSection}>
        <Text style={styles.tasksLabel}>Tasks</Text>
        {tasks.length === 0 ? (
          <Text style={styles.empty}>No tasks for this day</Text>
        ) : (
          tasks.map((t) => (
            <TaskItem
              key={t.id}
              taskId={t.id}
              title={t.title}
              completed={t.completed}
            />
          ))
        )}
        <View style={styles.addTaskRow}>
          <TextInput
            style={styles.addTaskInput}
            placeholder="New task..."
            placeholderTextColor={colors.subText}
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
            onSubmitEditing={handleAddTask}
          />
          <Pressable
            style={[styles.addTaskBtn, !newTaskTitle.trim() && styles.addTaskBtnDisabled]}
            onPress={handleAddTask}
            disabled={!newTaskTitle.trim()}
          >
            <Text style={styles.addTaskBtnText}>Add</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export { CARD_WIDTH };
