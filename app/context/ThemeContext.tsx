// app/context/ThemeContext.tsx
// Provides light/dark mode across the app.
// - Default follows the device system setting (useColorScheme).
// - User can manually override via toggleTheme() or setMode().
// - Preference is persisted to AsyncStorage under key 'bmg_theme_mode'.
//
// Usage:
//   const { isDark, colors, toggleTheme } = useTheme();
//   <View style={{ backgroundColor: colors.background }}>

import React, {
  createContext, useContext, useState, useEffect, useMemo,
} from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'bmg_theme_mode';

/* ── Single source of truth for brand colors ─────────────────── */
export const PRIMARY       = '#ea580c';
export const PRIMARY_LIGHT_LT = 'rgba(234,88,12,0.10)';
export const PRIMARY_LIGHT_DK = 'rgba(234,88,12,0.15)';
export const SECONDARY     = '#041f60';
export const DANGER        = '#FF3131';
export const SUCCESS       = '#159E42';
export const WARNING       = '#ffb02c';
export const INFO          = '#2B39B9';

/* ── Colour tokens ───────────────────────────────────────────── */
const LIGHT = {
  // Brand
  primary:      PRIMARY,
  primaryLight: PRIMARY_LIGHT_LT,
  secondary:    SECONDARY,
  success:      SUCCESS,
  danger:       DANGER,
  warning:      WARNING,
  info:         INFO,
  white:        '#ffffff',
  black:        '#000000',
  // Surface
  background:   '#F9F6F1',
  card:         '#ffffff',
  input:        '#FFF9F4',
  // Text
  title:        '#000000',
  text:         '#000000',
  textLight:    '#8A8A8A',
  placeholder:  'rgba(0,0,0,0.50)',
  // Borders
  borderColor:  '#F0DFC0',
  // Status bar
  statusBar:    'dark-content' as 'dark-content' | 'light-content',
};

const DARK = {
  // Brand
  primary:      PRIMARY,
  primaryLight: PRIMARY_LIGHT_DK,
  secondary:    SECONDARY,
  success:      SUCCESS,
  danger:       DANGER,
  warning:      WARNING,
  info:         INFO,
  white:        '#ffffff',
  black:        '#000000',
  // Surface
  background:   '#0C0A04',
  card:         '#1C1A12',
  input:        '#1A1810',
  // Text
  title:        '#ffffff',
  text:         '#B8B8B8',
  textLight:    '#6C6E77',
  placeholder:  'rgba(255,255,255,0.50)',
  // Borders
  borderColor:  'rgba(255,255,255,0.10)',
  // Status bar
  statusBar:    'light-content' as 'dark-content' | 'light-content',
};

export type ThemeColors = typeof LIGHT;
export type ThemeMode   = 'light' | 'dark' | 'system';

interface ThemeCtx {
  isDark:      boolean;
  mode:        ThemeMode;
  colors:      ThemeColors;
  toggleTheme: () => void;
  setMode:     (m: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeCtx>({
  isDark:      false,
  mode:        'system',
  colors:      LIGHT,
  toggleTheme: () => {},
  setMode:     () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const system = useColorScheme();                        // 'light' | 'dark' | null
  const [mode, setModeState] = useState<ThemeMode>('system');

  // Restore saved preference on boot
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (v === 'light' || v === 'dark' || v === 'system') setModeState(v);
    });
  }, []);

  const isDark = mode === 'system' ? system === 'dark' : mode === 'dark';
  const colors: ThemeColors = isDark ? DARK : LIGHT;

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(STORAGE_KEY, m);
  };

  const toggleTheme = () => setMode(isDark ? 'light' : 'dark');

  const value = useMemo(
    () => ({ isDark, mode, colors, toggleTheme, setMode }),
    [isDark, mode, colors],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

/** Use inside any component to get the current theme colours and toggle fn. */
export const useTheme = () => useContext(ThemeContext);
