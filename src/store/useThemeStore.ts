import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_ACCENT = '#E50914';

interface ThemeState {
  accentColor: string;
  setAccentColor: (color: string) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      accentColor: DEFAULT_ACCENT,
      setAccentColor: (color) => set({ accentColor: color || DEFAULT_ACCENT }),
    }),
    {
      name: 'vprime-theme',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ accentColor: s.accentColor }),
    }
  )
);
