// components/AppBadge.tsx
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../../theme';

export type BadgeVariant = 'primary' | 'gold' | 'success' | 'error' | 'warning' | 'info' | 'neutral';

type Props = {
  label: string | number;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;          // show only colored dot, no label
  style?: ViewStyle;
};

export default function AppBadge({ label, variant = 'primary', size = 'md', dot = false, style }: Props) {
  const { COLORS, FONTS, SIZES } = useTheme();

  const configs: Record<BadgeVariant, { bg: string; text: string; border?: string }> = {
    primary: { bg: COLORS.primary,   text: COLORS.white          },
    gold:    { bg: COLORS.secondary, text: COLORS.white          },
    success: { bg: COLORS.success,   text: COLORS.white          },
    error:   { bg: COLORS.error,     text: COLORS.white          },
    warning: { bg: COLORS.warning,   text: COLORS.white          },
    info:    { bg: COLORS.info,      text: COLORS.white          },
    neutral: { bg: COLORS.gray200,   text: COLORS.textSecondary  },
  };
  const cfg = configs[variant];

  if (dot) {
    return <View style={[{ width: 8, height: 8, borderRadius: 4, backgroundColor: cfg.bg }, style]} />;
  }

  const h  = size === 'sm' ? 18 : 22;
  const fs = size === 'sm' ? SIZES.font.xxs : SIZES.font.xs;

  return (
    <View style={[
      styles.badge,
      { backgroundColor: cfg.bg, height: h, minWidth: h, borderRadius: h / 2, paddingHorizontal: size === 'sm' ? 5 : 7 },
      style,
    ]}>
      <Text style={[styles.text, { color: cfg.text, fontFamily: FONTS.family.bold, fontSize: fs }]}>
        {typeof label === 'number' && label > 99 ? '99+' : label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignItems: 'center', justifyContent: 'center' },
  text:  { letterSpacing: 0.3 },
});