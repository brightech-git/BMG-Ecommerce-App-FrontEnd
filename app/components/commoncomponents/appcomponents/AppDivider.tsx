// components/AppDivider.tsx
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../../theme';

type Props = {
  label?: string;
  orientation?: 'horizontal' | 'vertical';
  thickness?: number;
  color?: string;
  style?: ViewStyle;
  marginVertical?: number;
};

export default function AppDivider({
  label, orientation = 'horizontal',
  thickness = StyleSheet.hairlineWidth,
  color, style, marginVertical = 16,
}: Props) {
  const { COLORS, FONTS, SIZES } = useTheme();
  const lineColor = color ?? COLORS.border;

  if (orientation === 'vertical') {
    return <View style={[{ width: thickness, backgroundColor: lineColor, alignSelf: 'stretch' }, style]} />;
  }

  if (label) {
    return (
      <View style={[styles.row, { marginVertical }, style]}>
        <View style={[styles.line, { backgroundColor: lineColor, height: thickness }]} />
        <Text style={[styles.label, { fontFamily: FONTS.family.medium, fontSize: SIZES.font.xs, color: COLORS.textTertiary, marginHorizontal: 12 }]}>
          {label}
        </Text>
        <View style={[styles.line, { backgroundColor: lineColor, height: thickness }]} />
      </View>
    );
  }

  return <View style={[{ height: thickness, backgroundColor: lineColor, marginVertical }, style]} />;
}

const styles = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center' },
  line:  { flex: 1 },
  label: { letterSpacing: 0.5 },
});