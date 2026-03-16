import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useThemeColors } from '../theme/useThemeColors';
import { useThemeStore } from '../store/useThemeStore';
import { supabase } from '../services/supabaseClient';

const THEME_PRESETS = [
  { label: 'Red', hex: '#E50914' },
  { label: 'Blue', hex: '#2196F3' },
  { label: 'Green', hex: '#00C853' },
  { label: 'Purple', hex: '#9C27B0' },
  { label: 'Orange', hex: '#FF9800' },
  { label: 'Teal', hex: '#009688' },
];

const USER_SETTINGS_ID = 'default';

export function SettingsScreen() {
  const colors = useThemeColors();
  const accentColor = useThemeStore((s) => s.accentColor);
  const setAccentColor = useThemeStore((s) => s.setAccentColor);
  const [reportEmail, setReportEmail] = useState('');
  const [reportEmailSaving, setReportEmailSaving] = useState(false);
  const [reportEmailLoading, setReportEmailLoading] = useState(true);

  const loadReportEmail = useCallback(async () => {
    if (!supabase) {
      setReportEmailLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('report_email')
        .eq('id', USER_SETTINGS_ID)
        .maybeSingle();
      if (!error && data?.report_email != null) setReportEmail(data.report_email ?? '');
    } finally {
      setReportEmailLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReportEmail();
  }, [loadReportEmail]);

  const saveReportEmail = async () => {
    if (!supabase) return;
    setReportEmailSaving(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert(
          { id: USER_SETTINGS_ID, report_email: reportEmail.trim() || null, updated_at: new Date().toISOString() },
          { onConflict: 'id' }
        );
      if (error) throw error;
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to save email');
    } finally {
      setReportEmailSaving(false);
    }
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
          padding: 16,
        },
        title: {
          color: colors.text,
          fontSize: 24,
          fontWeight: '800',
          marginBottom: 8,
        },
        subtitle: {
          color: colors.subText,
          fontSize: 14,
          marginBottom: 20,
        },
        sectionTitle: {
          color: colors.primaryRed,
          fontSize: 14,
          fontWeight: '700',
          marginBottom: 12,
          textTransform: 'uppercase',
        },
        colorGrid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 12,
        },
        colorOption: {
          width: 52,
          height: 52,
          borderRadius: 26,
          borderWidth: 3,
          borderColor: colors.border,
          alignItems: 'center',
          justifyContent: 'center',
        },
        colorOptionSelected: {
          borderColor: colors.text,
          borderWidth: 4,
        },
        colorOptionInner: {
          width: 40,
          height: 40,
          borderRadius: 20,
        },
        input: {
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 8,
          color: colors.text,
          paddingHorizontal: 12,
          paddingVertical: 10,
          fontSize: 16,
          marginBottom: 8,
        },
        saveBtn: {
          alignSelf: 'flex-start',
          backgroundColor: colors.primaryRed,
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: 8,
        },
        saveBtnText: {
          color: '#fff',
          fontWeight: '600',
        },
      }),
    [colors]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Customize VPrime</Text>

      <Text style={styles.sectionTitle}>Theme color</Text>
      <View style={styles.colorGrid}>
        {THEME_PRESETS.map((preset) => {
          const isSelected = accentColor.toLowerCase() === preset.hex.toLowerCase();
          return (
            <Pressable
              key={preset.hex}
              style={[
                styles.colorOption,
                isSelected && styles.colorOptionSelected,
              ]}
              onPress={() => setAccentColor(preset.hex)}
            >
              <View
                style={[
                  styles.colorOptionInner,
                  { backgroundColor: preset.hex },
                ]}
              />
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Monthly report email</Text>
      <Text style={styles.subtitle}>Receive an automatic summary at the end of each month.</Text>
      {reportEmailLoading ? (
        <ActivityIndicator color={colors.primaryRed} style={{ marginVertical: 8 }} />
      ) : (
        <>
          <TextInput
            style={styles.input}
            value={reportEmail}
            onChangeText={setReportEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.subText}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!reportEmailSaving}
          />
          <Pressable style={styles.saveBtn} onPress={saveReportEmail} disabled={reportEmailSaving}>
            {reportEmailSaving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.saveBtnText}>Save email</Text>
            )}
          </Pressable>
        </>
      )}
    </View>
  );
}
