// components/AppChip.tsx
import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ViewStyle } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../../../theme';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  leftIcon?: string;
  variant?: 'default' | 'gold' | 'outlined';
  size?: 'sm' | 'md';
  style?: ViewStyle;
  disabled?: boolean;
};

export default function AppChip({
  label, selected = false, onPress, onRemove,
  leftIcon, variant = 'default', size = 'md',
  style, disabled = false,
}: Props) {
  const { COLORS, FONTS, SIZES, moderateScale } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const onIn  = () => Animated.spring(scale, { toValue: 0.94, useNativeDriver: true, speed: 40 }).start();
  const onOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 24 }).start();

  const h  = size === 'sm' ? moderateScale(28) : moderateScale(36);
  const fs = size === 'sm' ? SIZES.font.xs     : SIZES.font.sm;

  const bg = selected
    ? variant === 'gold' ? COLORS.secondary : COLORS.primary
    : variant === 'outlined' ? 'transparent' : COLORS.gray100;

  const textColor = selected
    ? COLORS.white
    : variant === 'gold' ? COLORS.secondary : COLORS.textSecondary;

  const borderColor = variant === 'outlined'
    ? (selected ? COLORS.primary : COLORS.border)
    : 'transparent';

  const iconColor = selected ? COLORS.white : COLORS.textTertiary;

  return (
    <TouchableOpacity
      onPress={onPress} onPressIn={onIn} onPressOut={onOut}
      activeOpacity={1} disabled={disabled}
    >
      <Animated.View style={[
        styles.chip,
        { height: h, backgroundColor: bg, borderColor, borderWidth: variant === 'outlined' ? 1 : 0, opacity: disabled ? 0.5 : 1, transform: [{ scale }], paddingHorizontal: size === 'sm' ? 10 : 14 },
        style,
      ]}>
        {leftIcon && <Ionicons name={leftIcon as any} size={size === 'sm' ? 12 : 14} color={iconColor} style={{ marginRight: 5 }} />}
        <Text style={[styles.label, { fontFamily: FONTS.family.medium, fontSize: fs, color: textColor }]}>{label}</Text>
        {onRemove && (
          <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
            <Ionicons name="close" size={12} color={iconColor} />
          </TouchableOpacity>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip:      { flexDirection: 'row', alignItems: 'center', borderRadius: 999 },
  label:     { letterSpacing: 0.2 },
  removeBtn: { marginLeft: 5, padding: 1 },
});