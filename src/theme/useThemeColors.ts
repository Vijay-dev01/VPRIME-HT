import { useMemo } from 'react';
import { useThemeStore } from '../store/useThemeStore';

function darkenHex(hex: string, factor: number): string {
  const n = hex.replace('#', '');
  const r = Math.max(0, Math.round(parseInt(n.slice(0, 2), 16) * factor));
  const g = Math.max(0, Math.round(parseInt(n.slice(2, 4), 16) * factor));
  const b = Math.max(0, Math.round(parseInt(n.slice(4, 6), 16) * factor));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function useThemeColors() {
  const accentColor = useThemeStore((s) => s.accentColor);

  return useMemo(
    () => ({
      background: '#0D0D0D',
      card: '#1A1A1A',
      primaryRed: accentColor,
      secondaryRed: darkenHex(accentColor, 0.6),
      text: '#FFFFFF',
      subText: '#AAAAAA',
      progressGreen: '#00C853',
      border: '#2A2A2A',
      unchecked: '#333333',
    }),
    [accentColor]
  );
}
