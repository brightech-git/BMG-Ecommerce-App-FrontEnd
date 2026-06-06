// components/AppInput.tsx
import React, { useState, useRef } from 'react';
import {
  View, TextInput, Text, TouchableOpacity,
  StyleSheet, Animated, TextInputProps, ViewStyle,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../../../theme';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
  required?: boolean;
  size?: 'sm' | 'md';
};

export default function AppInput({
  label, error, hint,
  leftIcon, rightIcon, onRightIconPress,
  isPassword = false,
  containerStyle, required = false,
  size = 'md',
  ...rest
}: Props) {
  const { COLORS, FONTS, SIZES, moderateScale } = useTheme();
  const [focused, setFocused]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;
  const labelAnim  = useRef(new Animated.Value(0)).current;

  const onFocus = () => {
    setFocused(true);
    Animated.parallel([
      Animated.spring(borderAnim, { toValue: 1, useNativeDriver: false, speed: 30 }),
      Animated.spring(labelAnim,  { toValue: 1, useNativeDriver: false, speed: 30 }),
    ]).start();
    rest.onFocus?.({} as any);
  };

  const onBlur = () => {
    setFocused(false);
    Animated.parallel([
      Animated.spring(borderAnim, { toValue: 0, useNativeDriver: false, speed: 30 }),
      Animated.spring(labelAnim,  { toValue: 0, useNativeDriver: false, speed: 30 }),
    ]).start();
    rest.onBlur?.({} as any);
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? COLORS.error : COLORS.border, error ? COLORS.error : COLORS.primary],
  });

  const hasError = !!error;
  const iSize = moderateScale(18);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {/* Label */}
      {label && (
        <Text style={[styles.label, {
          fontFamily: FONTS.family.medium,
          fontSize: SIZES.font.sm,
          color: hasError ? COLORS.error : focused ? COLORS.primary : COLORS.textSecondary,
          marginBottom: 6,
        }]}>
          {label}
          {required && <Text style={{ color: COLORS.error }}> *</Text>}
        </Text>
      )}

      {/* Input row */}
      <Animated.View style={[
        styles.inputRow,
        {
          borderColor,
          borderWidth: focused ? 1.5 : 1,
          backgroundColor: focused ? COLORS.white : COLORS.inputBackground,
          minHeight: size === 'sm' ? 42 : 50,
        },
      ]}>
        {leftIcon && (
          <Ionicons
            name={leftIcon as any}
            size={iSize}
            color={focused ? COLORS.primary : COLORS.textTertiary}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          {...rest}
          secureTextEntry={isPassword && !showPass}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholderTextColor={COLORS.inputPlaceholder}
          style={[
            styles.input,
            {
              fontFamily: FONTS.family.regular,
              fontSize: SIZES.font.md,
              color: COLORS.textPrimary,
            },
          ]}
        />

        {/* Right: password toggle OR custom icon */}
        {isPassword ? (
          <TouchableOpacity onPress={() => setShowPass(p => !p)} style={styles.rightIcon}>
            <Ionicons
              name={showPass ? 'eye-off-outline' : 'eye-outline'}
              size={iSize}
              color={COLORS.textTertiary}
            />
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            <Ionicons name={rightIcon as any} size={iSize} color={focused ? COLORS.primary : COLORS.textTertiary} />
          </TouchableOpacity>
        ) : null}
      </Animated.View>

      {/* Error / Hint */}
      {hasError ? (
        <View style={styles.helperRow}>
          <Ionicons name="alert-circle-outline" size={12} color={COLORS.error} />
          <Text style={[styles.helperText, { color: COLORS.error, fontFamily: FONTS.family.regular, fontSize: SIZES.font.xs }]}>
            {' '}{error}
          </Text>
        </View>
      ) : hint ? (
        <Text style={[styles.helperText, { color: COLORS.textTertiary, fontFamily: FONTS.family.regular, fontSize: SIZES.font.xs, marginTop: 4 }]}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 4 },
  label: {},
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    minHeight: 50,
    paddingHorizontal: 14,
  },
  leftIcon:  { marginRight: 10 },
  rightIcon: { marginLeft: 8, padding: 4 },
  input: {
    flex: 1,
    paddingVertical: 0,
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  helperText: {},
});