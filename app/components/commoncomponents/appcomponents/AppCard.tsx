// components/AppCard.tsx
import React from 'react';
import {
  View, TouchableOpacity, StyleSheet, Animated, ViewStyle,
} from 'react-native';
import { useTheme } from '../../../theme';

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'outlined' | 'gold' | 'flat';
  padding?: 'sm' | 'md' | 'lg' | 'none';
  radius?: 'sm' | 'md' | 'lg' | 'xl';
  style?: ViewStyle;
  /** Show left gold accent bar */
  accentBar?: boolean;
};

export default function AppCard({
  children, onPress,
  variant = 'default',
  padding = 'md',
  radius  = 'lg',
  style, accentBar = false,
}: Props) {
  const { COLORS, SIZES, SHADOWS, moderateScale } = useTheme();
  const scale = React.useRef(new Animated.Value(1)).current;

  const onIn  = () => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, speed: 40 }).start();
  const onOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 24 }).start();

  const paddings = {
    none: 0,
    sm:   SIZES.padding.sm,
    md:   SIZES.padding.lg,
    lg:   SIZES.padding.xxl,
  };
  const radii = {
    sm: SIZES.radius.sm,
    md: SIZES.radius.md,
    lg: SIZES.radius.lg,
    xl: SIZES.radius.xl,
  };

  const bgColor =
    variant === 'gold'     ? COLORS.goldLight
    : variant === 'flat'   ? COLORS.gray50
    : COLORS.white;

  const borderWidth = variant === 'outlined' ? 1.5 : 0;
  const borderColor = variant === 'outlined' ? COLORS.border : 'transparent';
  const shadow      = variant === 'flat' ? SHADOWS.none : SHADOWS.md;

  const inner = (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: bgColor,
          padding: paddings[padding],
          borderRadius: radii[radius],
          borderWidth, borderColor,
          overflow: 'hidden',
          transform: [{ scale }],
          ...shadow,
        },
        style,
      ]}
    >
      {accentBar && (
        <View style={[styles.accentBar, { backgroundColor: COLORS.primary }]} />
      )}
      {children}
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} onPressIn={onIn} onPressOut={onOut} activeOpacity={1}>
        {inner}
      </TouchableOpacity>
    );
  }
  return inner;
}

const styles = StyleSheet.create({
  card:      { position: 'relative' },
  accentBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
});