import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Checkbox from 'expo-checkbox';
import { useHabitStore } from '../store/useHabitStore';
import { colors } from '../theme/colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface TaskItemProps {
  taskId: string;
  title: string;
  completed: boolean;
}

export function TaskItem({ taskId, title, completed }: TaskItemProps) {
  const toggleDailyTask = useHabitStore((s) => s.toggleDailyTask);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPress = () => {
    scale.value = withSpring(0.98, { damping: 15 }, () => {
      scale.value = withSpring(1);
    });
    toggleDailyTask(taskId);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      style={[styles.row, animatedStyle]}
    >
      <Checkbox
        value={completed}
        onValueChange={() => toggleDailyTask(taskId)}
        color={completed ? colors.primaryRed : colors.border}
        style={styles.checkbox}
      />
      <Text
        style={[styles.title, completed && styles.titleCompleted]}
        numberOfLines={1}
      >
        {title}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
  },
  titleCompleted: {
    color: colors.subText,
    textDecorationLine: 'line-through',
  },
});
