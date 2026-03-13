import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
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
  const deleteDailyTask = useHabitStore((s) => s.deleteDailyTask);
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

  const onDelete = () => {
    Alert.alert(
      'Delete task',
      `Remove "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteDailyTask(taskId).catch((e) => Alert.alert('Error', (e as Error).message)),
        },
      ]
    );
  };

  return (
    <View style={styles.row}>
      <AnimatedPressable onPress={onPress} style={[styles.rowMain, animatedStyle]}>
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
      <Pressable style={styles.deleteBtn} onPress={onDelete} hitSlop={8}>
        <Text style={styles.deleteBtnText}>×</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  deleteBtn: {
    padding: 4,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: {
    color: colors.subText,
    fontSize: 22,
    fontWeight: '300',
    lineHeight: 24,
  },
});
