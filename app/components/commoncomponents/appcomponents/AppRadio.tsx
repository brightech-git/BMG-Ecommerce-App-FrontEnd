// components/AppRadio.tsx
import React, { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Animated, StyleSheet, ViewStyle,
} from 'react-native';
import { useTheme } from '../../../theme';

// ── Single radio button ──────────────────────────
type RadioItemProps = {
  selected: boolean;
  onPress: () => void;
  label?: string;
  sublabel?: string;
  disabled?: boolean;
  variant?: 'primary' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
};

export function AppRadioItem({
  selected, onPress, label, sublabel,
  disabled = false, variant = 'primary', size = 'md', style,
}: RadioItemProps) {
  const { COLORS, FONTS, SIZES } = useTheme();

  const dotScale  = useRef(new Animated.Value(selected ? 1 : 0)).current;
  const ringAnim  = useRef(new Animated.Value(selected ? 1 : 0)).current;
  const pressScale= useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(dotScale, { toValue: selected ? 1 : 0, useNativeDriver: true, damping: 14, stiffness: 220 }),
      Animated.timing(ringAnim, { toValue: selected ? 1 : 0, duration: 180, useNativeDriver: false }),
    ]).start();
  }, [selected]);

  const dims = { sm: 18, md: 22, lg: 26 }[size];
  const dotSz = dims * 0.45;

  const activeColor = variant === 'gold' ? COLORS.secondary : COLORS.primary;

  const ringBorder = ringAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.border, activeColor],
  });

  const handlePress = () => {
    if (disabled) return;
    Animated.sequence([
      Animated.spring(pressScale, { toValue: 0.88, useNativeDriver: true, speed: 50 }),
      Animated.spring(pressScale, { toValue: 1,    useNativeDriver: true, speed: 30 }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={1} disabled={disabled} style={[styles.row, style]}>
      <Animated.View style={{ transform: [{ scale: pressScale }] }}>
        <Animated.View style={[
          styles.ring,
          { width: dims, height: dims, borderRadius: dims / 2, borderColor: ringBorder, borderWidth: 2, opacity: disabled ? 0.45 : 1 },
        ]}>
          <Animated.View style={[
            styles.dot,
            { width: dotSz, height: dotSz, borderRadius: dotSz / 2, backgroundColor: activeColor, transform: [{ scale: dotScale }] },
          ]} />
        </Animated.View>
      </Animated.View>

      {(label || sublabel) && (
        <View style={{ flex: 1, marginLeft: 10 }}>
          {label && (
            <Text style={{ fontFamily: FONTS.family.medium, fontSize: SIZES.font.md, color: disabled ? COLORS.textDisabled : COLORS.textPrimary }}>
              {label}
            </Text>
          )}
          {sublabel && (
            <Text style={{ fontFamily: FONTS.family.regular, fontSize: SIZES.font.xs, color: COLORS.textTertiary, marginTop: 1 }}>
              {sublabel}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

// ── Radio group ─────────────────────────────────
export type RadioOption = {
  value: string;
  label: string;
  sublabel?: string;
  disabled?: boolean;
};

type GroupProps = {
  options: RadioOption[];
  value: string;
  onChange: (v: string) => void;
  variant?: 'primary' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  direction?: 'vertical' | 'horizontal';
  style?: ViewStyle;
};

export default function AppRadio({
  options, value, onChange,
  variant = 'primary', size = 'md',
  direction = 'vertical', style,
}: GroupProps) {
  return (
    <View style={[direction === 'horizontal' ? styles.horizontal : styles.vertical, style]}>
      {options.map((opt) => (
        <AppRadioItem
          key={opt.value}
          selected={value === opt.value}
          onPress={() => onChange(opt.value)}
          label={opt.label}
          sublabel={opt.sublabel}
          disabled={opt.disabled}
          variant={variant}
          size={size}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row:        { flexDirection: 'row', alignItems: 'center' },
  ring:       { alignItems: 'center', justifyContent: 'center' },
  dot:        {},
  vertical:   { gap: 14 },
  horizontal: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
});