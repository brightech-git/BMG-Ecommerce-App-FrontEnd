// components/AppLoader.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Modal } from 'react-native';
import { useTheme } from '../../../theme';

type Props = {
  visible?: boolean;
  /** 'overlay' = full-screen modal, 'inline' = renders in place */
  mode?: 'overlay' | 'inline';
  message?: string;
  size?: 'sm' | 'md' | 'lg';
};

export default function AppLoader({
  visible = true, mode = 'overlay',
  message, size = 'md',
}: Props) {
  const { COLORS, FONTS, SIZES, moderateScale } = useTheme();

  const rot1  = useRef(new Animated.Value(0)).current;
  const rot2  = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.loop(Animated.timing(rot1, { toValue: 1, duration: 1000, useNativeDriver: true })).start();
    Animated.loop(Animated.timing(rot2, { toValue: -1, duration: 700, useNativeDriver: true })).start();
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.1, duration: 600, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0.9, duration: 600, useNativeDriver: true }),
    ])).start();
  }, []);

  const spin1 = rot1.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const spin2 = rot2.interpolate({ inputRange: [-1, 0], outputRange: ['-360deg', '0deg'] });

  const ringSize: Record<string, number> = { sm: moderateScale(36), md: moderateScale(52), lg: moderateScale(68) };
  const dotSize:  Record<string, number> = { sm: moderateScale(22), md: moderateScale(32), lg: moderateScale(44) };

  const content = (
    <View style={styles.center}>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        {/* Outer ring */}
        <Animated.View style={[
          styles.ring,
          {
            width: ringSize[size], height: ringSize[size],
            borderRadius: ringSize[size] / 2,
            borderColor: COLORS.primaryPale,
            borderTopColor: COLORS.primary,
            transform: [{ rotate: spin1 }],
          },
        ]} />
        {/* Inner ring */}
        <Animated.View style={[
          styles.ring,
          styles.innerRing,
          {
            width: dotSize[size], height: dotSize[size],
            borderRadius: dotSize[size] / 2,
            borderColor: COLORS.orangeIce,
            borderBottomColor: COLORS.secondary,
            transform: [{ rotate: spin2 }],
          },
        ]} />
        {/* Center dot */}
        <Animated.View style={[
          styles.dot,
          { backgroundColor: COLORS.primary, transform: [{ scale: pulse }] },
        ]} />
      </View>
      {message && (
        <Text style={[styles.msg, {
          fontFamily: FONTS.family.medium,
          fontSize: SIZES.font.sm,
          color: mode === 'overlay' ? COLORS.white : COLORS.textSecondary,
          marginTop: SIZES.margin.md,
        }]}>
          {message}
        </Text>
      )}
    </View>
  );

  if (mode === 'inline') return visible ? content : null;

  return (
    <Modal transparent visible={visible} animationType="fade" statusBarTranslucent>
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.55)' }]}>
        <View style={[styles.card, { backgroundColor: 'rgba(26,18,9,0.85)' }]}>
          {content}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay:   { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card:      { borderRadius: 20, padding: 32, alignItems: 'center', minWidth: 140 },
  center:    { alignItems: 'center', justifyContent: 'center' },
  ring:      { position: 'absolute', borderWidth: 3 },
  innerRing: { borderWidth: 2.5 },
  dot:       { width: 8, height: 8, borderRadius: 4 },
  msg:       { letterSpacing: 0.3, textAlign: 'center' },
});