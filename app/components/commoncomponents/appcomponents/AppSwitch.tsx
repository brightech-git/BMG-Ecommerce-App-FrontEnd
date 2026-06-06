// components/AppSwitch.tsx
import React, { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Animated, StyleSheet, ViewStyle,
} from 'react-native';
import { useTheme } from '../../../theme';

type Props = {
  value: boolean;
  onValueChange: (v: boolean) => void;
  label?: string;
  sublabel?: string;
  disabled?: boolean;
  variant?: 'primary' | 'gold' | 'success';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
};

export default function AppSwitch({
  value, onValueChange, label, sublabel,
  disabled = false, variant = 'primary', size = 'md', style,
}: Props) {
  const { COLORS, FONTS, SIZES, moderateScale } = useTheme();
  const translateX = useRef(new Animated.Value(value ? 1 : 0)).current;
  const bgAnim     = useRef(new Animated.Value(value ? 1 : 0)).current;
  const scaleAnim  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateX, { toValue: value ? 1 : 0, useNativeDriver: true, damping: 15, stiffness: 200 }),
      Animated.timing(bgAnim,     { toValue: value ? 1 : 0, duration: 200, useNativeDriver: false }),
    ]).start();
  }, [value]);

  const dims = {
    sm: { trackW: 40, trackH: 22, thumbSz: 16, travel: 18 },
    md: { trackW: 52, trackH: 28, thumbSz: 22, travel: 24 },
    lg: { trackW: 62, trackH: 34, thumbSz: 28, travel: 28 },
  }[size];

  const activeColor =
    variant === 'gold'    ? COLORS.secondary :
    variant === 'success' ? COLORS.success   : COLORS.primary;

  const trackBg = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.gray300, activeColor],
  });
  const thumbX = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: [2, dims.travel],
  });

  const handlePress = () => {
    if (disabled) return;
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 0.92, useNativeDriver: true, speed: 50 }),
      Animated.spring(scaleAnim, { toValue: 1,    useNativeDriver: true, speed: 30 }),
    ]).start();
    onValueChange(!value);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={1}
      disabled={disabled}
      style={[styles.row, style]}
    >
      {(label || sublabel) && (
        <View style={{ flex: 1, marginRight: 12 }}>
          {label && (
            <Text style={[styles.label, { fontFamily: FONTS.family.medium, fontSize: SIZES.font.md, color: disabled ? COLORS.textDisabled : COLORS.textPrimary }]}>
              {label}
            </Text>
          )}
          {sublabel && (
            <Text style={[styles.sublabel, { fontFamily: FONTS.family.regular, fontSize: SIZES.font.xs, color: COLORS.textTertiary }]}>
              {sublabel}
            </Text>
          )}
        </View>
      )}

      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Animated.View style={[
          styles.track,
          { width: dims.trackW, height: dims.trackH, borderRadius: dims.trackH / 2, backgroundColor: trackBg, opacity: disabled ? 0.45 : 1 },
        ]}>
          <Animated.View style={[
            styles.thumb,
            {
              width: dims.thumbSz, height: dims.thumbSz,
              borderRadius: dims.thumbSz / 2,
              transform: [{ translateX: thumbX }],
              backgroundColor: COLORS.white,
              shadowColor: COLORS.black,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3,
              elevation: 3,
            },
          ]} />
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row:      { flexDirection: 'row', alignItems: 'center' },
  track:    { justifyContent: 'center' },
  thumb:    { position: 'absolute' },
  label:    {},
  sublabel: { marginTop: 1 },
});