// app/components/common/StateViews.tsx
// Lightweight, theme-aware loading / empty / error views reused across all
// new commerce screens. Built on the working constants/theme (COLORS/FONTS/SIZES).
import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

type LoaderProps = { message?: string; style?: any };
export const Loader: React.FC<LoaderProps> = ({ message, style }) => (
  <View style={[styles.center, style]}>
    <ActivityIndicator size="large" color={COLORS.primary} />
    {!!message && <Text style={styles.muted}>{message}</Text>}
  </View>
);

type EmptyProps = {
  icon?: keyof typeof Feather.glyphMap;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  onCta?: () => void;
  style?: any;
};
export const EmptyState: React.FC<EmptyProps> = ({
  icon = 'inbox', title = 'Nothing here yet', subtitle, ctaLabel, onCta, style,
}) => (
  <View style={[styles.center, style]}>
    <View style={styles.iconCircle}>
      <Feather name={icon} size={34} color={COLORS.primary} />
    </View>
    <Text style={styles.title}>{title}</Text>
    {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    {!!ctaLabel && !!onCta && (
      <TouchableOpacity style={styles.cta} onPress={onCta} activeOpacity={0.85}>
        <Text style={styles.ctaText}>{ctaLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

type ErrorProps = { message?: string; onRetry?: () => void; style?: any };
export const ErrorState: React.FC<ErrorProps> = ({ message, onRetry, style }) => (
  <View style={[styles.center, style]}>
    <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,49,49,0.08)' }]}>
      <Feather name="alert-triangle" size={32} color={COLORS.danger} />
    </View>
    <Text style={styles.title}>Something went wrong</Text>
    <Text style={styles.subtitle}>{message ?? 'Please try again in a moment.'}</Text>
    {!!onRetry && (
      <TouchableOpacity style={styles.cta} onPress={onRetry} activeOpacity={0.85}>
        <Text style={styles.ctaText}>Retry</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 6 },
  muted: { ...FONTS.font, color: COLORS.textLight, marginTop: 12 },
  iconCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  title: { ...FONTS.h5, ...FONTS.fontSemiBold, color: COLORS.title, textAlign: 'center' },
  subtitle: { ...FONTS.font, color: COLORS.textLight, textAlign: 'center', marginTop: 2, maxWidth: 280 },
  cta: {
    marginTop: 18, backgroundColor: COLORS.primary,
    paddingHorizontal: 26, paddingVertical: 12, borderRadius: SIZES.radius_lg,
  },
  ctaText: { ...FONTS.font, ...FONTS.fontSemiBold, color: COLORS.white },
});
