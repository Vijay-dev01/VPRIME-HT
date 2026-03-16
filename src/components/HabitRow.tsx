import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Alert } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useHabitStore } from '../store/useHabitStore';
import { useThemeColors } from '../theme/useThemeColors';
import type { Habit } from '../store/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const CELL_SIZE = 44;

interface HabitRowProps {
  habit: Habit;
  dates: string[];
  onEdit?: (habit: Habit) => void;
}

function CheckCell({
  habitId,
  date,
  cellStyles,
}: {
  habitId: string;
  date: string;
  dayIndex: number;
  cellStyles: { cell: object; cellChecked: object; check: object; checkChecked: object };
}) {
  const completed = useHabitStore((s) => s.getHabitCompleted(habitId, date));
  const toggleHabitDay = useHabitStore((s) => s.toggleHabitDay);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPress = () => {
    scale.value = withSpring(0.9, { damping: 12 }, () => {
      scale.value = withSpring(1);
    });
    toggleHabitDay(habitId, date);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      style={[
        cellStyles.cell,
        animatedStyle,
        completed && cellStyles.cellChecked,
      ]}
    >
      <Text style={[cellStyles.check, completed && cellStyles.checkChecked]}>
        {completed ? '✓' : ''}
      </Text>
    </AnimatedPressable>
  );
}

export function HabitRow({ habit, dates, onEdit }: HabitRowProps) {
  const { id: habitId, name: habitName } = habit;
  const colors = useThemeColors();
  const deleteHabit = useHabitStore((s) => s.deleteHabit);
  const getHabitProgress = useHabitStore((s) => s.getHabitProgress);
  const progress = getHabitProgress(habitId);

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: 'row',
          alignItems: 'stretch',
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        habitNameCell: {
          width: 120,
          minWidth: 120,
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal: 10,
          backgroundColor: colors.card,
          gap: 4,
        },
        habitNameWrap: { flex: 1, minWidth: 0 },
        habitName: {
          color: colors.text,
          fontSize: 14,
        },
        habitProgress: {
          color: colors.subText,
          fontSize: 11,
          marginTop: 2,
        },
        editHabitBtn: {
          padding: 2,
          minWidth: 24,
          alignItems: 'center',
          justifyContent: 'center',
        },
        editHabitBtnText: {
          color: colors.subText,
          fontSize: 14,
        },
        deleteHabitBtn: {
          padding: 2,
          minWidth: 24,
          alignItems: 'center',
          justifyContent: 'center',
        },
        deleteHabitBtnText: {
          color: colors.subText,
          fontSize: 20,
          fontWeight: '300',
          lineHeight: 20,
        },
        daysScroll: { flex: 1 },
        daysContent: {
          flexDirection: 'row',
          paddingVertical: 8,
          paddingRight: 16,
        },
        cell: {
          width: CELL_SIZE,
          height: CELL_SIZE,
          marginLeft: 6,
          borderRadius: 8,
          borderWidth: 2,
          borderColor: colors.border,
          backgroundColor: colors.background,
          alignItems: 'center',
          justifyContent: 'center',
        },
        cellChecked: {
          backgroundColor: colors.primaryRed,
          borderColor: colors.secondaryRed,
        },
        check: {
          color: colors.subText,
          fontSize: 18,
        },
        checkChecked: {
          color: colors.text,
        },
      }),
    [colors]
  );

  const onDelete = () => {
    Alert.alert(
      'Delete habit',
      `Remove "${habitName}" and all its history?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteHabit(habitId).catch((e) => Alert.alert('Error', (e as Error).message)),
        },
      ]
    );
  };

  const cellStyles = {
    cell: styles.cell,
    cellChecked: styles.cellChecked,
    check: styles.check,
    checkChecked: styles.checkChecked,
  };

  return (
    <View style={styles.row}>
      <View style={styles.habitNameCell}>
        <View style={styles.habitNameWrap}>
          <Text style={styles.habitName} numberOfLines={1}>
            {habitName}
          </Text>
          {progress != null && (
            <Text style={styles.habitProgress} numberOfLines={1}>
              {progress.label}
            </Text>
          )}
        </View>
        {onEdit && (
          <Pressable style={styles.editHabitBtn} onPress={() => onEdit(habit)} hitSlop={8}>
            <Text style={styles.editHabitBtnText}>✎</Text>
          </Pressable>
        )}
        <Pressable style={styles.deleteHabitBtn} onPress={onDelete} hitSlop={8}>
          <Text style={styles.deleteHabitBtnText}>×</Text>
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.daysScroll}
        contentContainerStyle={styles.daysContent}
      >
        {dates.map((date, i) => (
          <CheckCell
            key={date}
            habitId={habitId}
            date={date}
            dayIndex={i}
            cellStyles={cellStyles}
          />
        ))}
      </ScrollView>
    </View>
  );
}

export { CELL_SIZE };
