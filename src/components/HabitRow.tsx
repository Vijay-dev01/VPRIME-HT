import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useHabitStore } from '../store/useHabitStore';
import { colors } from '../theme/colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const CELL_SIZE = 44;
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface HabitRowProps {
  habitId: string;
  habitName: string;
  dates: string[];
}

function CheckCell({
  habitId,
  date,
  dayIndex,
}: {
  habitId: string;
  date: string;
  dayIndex: number;
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
        styles.cell,
        animatedStyle,
        completed && styles.cellChecked,
      ]}
    >
      <Text style={[styles.check, completed && styles.checkChecked]}>
        {completed ? '✓' : ''}
      </Text>
    </AnimatedPressable>
  );
}

export function HabitRow({ habitId, habitName, dates }: HabitRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.habitNameCell}>
        <Text style={styles.habitName} numberOfLines={1}>
          {habitName}
        </Text>
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
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  habitNameCell: {
    width: 120,
    minWidth: 120,
    paddingVertical: 12,
    paddingHorizontal: 10,
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  habitName: {
    color: colors.text,
    fontSize: 14,
  },
  daysScroll: {
    flex: 1,
  },
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
});

export { CELL_SIZE };
