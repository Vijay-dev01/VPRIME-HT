import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../theme/useThemeColors';

interface ProgressBarProps {
  progress: number; // 0–1
  label?: string;
  height?: number;
}

export function ProgressBar({
  progress,
  label,
  height = 10,
}: ProgressBarProps) {
  const colors = useThemeColors();
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        },
        track: {
          flex: 1,
          backgroundColor: colors.border,
          borderRadius: 4,
          overflow: 'hidden',
        },
        fill: {
          backgroundColor: colors.progressGreen,
          borderRadius: 4,
        },
        label: {
          color: colors.subText,
          fontSize: 14,
          minWidth: 40,
          textAlign: 'right',
        },
      }),
    [colors]
  );
  const pct = Math.round(progress * 100);
  return (
    <View style={styles.wrap}>
      <View style={[styles.track, { height }]}>
        <View
          style={[
            styles.fill,
            { width: `${Math.min(100, pct)}%`, height },
          ]}
        />
      </View>
      {label != null && (
        <Text style={styles.label}>{label}</Text>
      )}
    </View>
  );
}
