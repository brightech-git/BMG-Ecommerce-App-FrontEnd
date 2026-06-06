// components/AppIcon.tsx
import React, { useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, ViewStyle } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../../../theme';

type IconVariant = 'default' | 'primary' | 'gold' | 'success' | 'error' | 'ghost';

type Props = {
  name: string;
  size?: number;
  variant?: IconVariant;
  onPress?: () => void;
  containerStyle?: ViewStyle;
  rounded?: boolean;
};

export default function AppIcon({ name, size, variant = 'default', onPress, containerStyle, rounded = true }: Props) {
  const { COLORS, moderateScale } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const configs: Record<IconVariant, { bg: string; color: string }> = {
    default: { bg: COLORS.gray100,        color: COLORS.textSecondary },
    primary: { bg: COLORS.primaryPale,    color: COLORS.primary       },
    gold:    { bg: COLORS.goldLight,      color: COLORS.secondary     },
    success: { bg: 'rgba(123,174,58,.12)',color: COLORS.success       },
    error:   { bg: 'rgba(220,38,38,.1)',  color: COLORS.error         },
    ghost:   { bg: 'transparent',         color: COLORS.textPrimary   },
  };
  const cfg  = configs[variant];
  const sz   = size ?? moderateScale(22);
  const cont = moderateScale(42);

  const inner = (
    <Animated.View style={[
      { width: cont, height: cont, borderRadius: rounded ? cont / 2 : 12, backgroundColor: cfg.bg, alignItems: 'center', justifyContent: 'center', transform: [{ scale }] },
      containerStyle,
    ]}>
      <Ionicons name={name as any} size={sz} color={cfg.color} />
    </Animated.View>
  );

  if (!onPress) return inner;
  return (
    <TouchableOpacity
      onPressIn={() => Animated.spring(scale, { toValue: 0.88, useNativeDriver: true, speed: 40 }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 24 }).start()}
      onPress={onPress} activeOpacity={1}
    >{inner}</TouchableOpacity>
  );
}