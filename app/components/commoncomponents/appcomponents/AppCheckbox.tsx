// components/AppCheckbox.tsx
import React, { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Animated, StyleSheet, ViewStyle,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../../../theme';

type Props = {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  sublabel?: string;
  disabled?: boolean;
  variant?: 'primary' | 'gold' | 'success';
  size?: 'sm' | 'md' | 'lg';
  indeterminate?: boolean;
  style?: ViewStyle;
};

export default function AppCheckbox({
  checked, onChange, label, sublabel,
  disabled = false, variant = 'primary',
  size = 'md', indeterminate = false, style,
}: Props) {
  const { COLORS, FONTS, SIZES, moderateScale } = useTheme();

  const scale    = useRef(new Animated.Value(checked ? 1 : 0)).current;
  const boxScale = useRef(new Animated.Value(1)).current;
  const bgAnim   = useRef(new Animated.Value(checked ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale,  { toValue: checked ? 1 : 0, useNativeDriver: true, damping: 12, stiffness: 220 }),
      Animated.timing(bgAnim, { toValue: checked ? 1 : 0, duration: 180, useNativeDriver: false }),
    ]).start();
  }, [checked]);

  const dims = { sm: 18, md: 22, lg: 28 }[size];
  const iconSz = dims * 0.65;

  const activeColor =
    variant === 'gold'    ? COLORS.secondary :
    variant === 'success' ? COLORS.success   : COLORS.primary;

  const bgColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', activeColor],
  });
  const borderColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.border, activeColor],
  });

  const handlePress = () => {
    if (disabled) return;
    Animated.sequence([
      Animated.spring(boxScale, { toValue: 0.88, useNativeDriver: true, speed: 50 }),
      Animated.spring(boxScale, { toValue: 1,    useNativeDriver: true, speed: 30 }),
    ]).start();
    onChange(!checked);
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={1} disabled={disabled} style={[styles.row, style]}>
      <Animated.View style={{ transform: [{ scale: boxScale }] }}>
        <Animated.View style={[
          styles.box,
          {
            width: dims, height: dims, borderRadius: dims * 0.28,
            backgroundColor: bgColor,
            borderColor,
            borderWidth: 2,
            opacity: disabled ? 0.45 : 1,
          },
        ]}>
          <Animated.View style={{ transform: [{ scale }] }}>
            <Ionicons
              name={indeterminate ? 'remove' : 'checkmark'}
              size={iconSz}
              color={COLORS.white}
            />
          </Animated.View>
        </Animated.View>
      </Animated.View>

      {(label || sublabel) && (
        <View style={{ flex: 1, marginLeft: 10 }}>
          {label && (
            <Text style={[{ fontFamily: FONTS.family.medium, fontSize: SIZES.font.md, color: disabled ? COLORS.textDisabled : COLORS.textPrimary }]}>
              {label}
            </Text>
          )}
          {sublabel && (
            <Text style={[{ fontFamily: FONTS.family.regular, fontSize: SIZES.font.xs, color: COLORS.textTertiary, marginTop: 1 }]}>
              {sublabel}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  box: { alignItems: 'center', justifyContent: 'center' },
});