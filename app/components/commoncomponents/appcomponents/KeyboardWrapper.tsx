// components/KeyboardWrapper.tsx
import React from 'react';
import {
  KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback,
  Keyboard, Platform, StyleSheet, View, ViewStyle,
} from 'react-native';
import { useTheme } from '../../../theme';

type Props = {
  children: React.ReactNode;
  /** Dismiss keyboard on tap outside inputs */
  dismissOnTap?: boolean;
  /** Extra bottom padding when keyboard is visible */
  extraScrollHeight?: number;
  scroll?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
};

export default function KeyboardWrapper({
  children, dismissOnTap = true,
  extraScrollHeight = 24,
  scroll = true,
  style, contentStyle,
}: Props) {
  const { SIZES } = useTheme();

  const inner = scroll ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[{ paddingBottom: extraScrollHeight }, contentStyle]}
    >
      {children}
    </ScrollView>
  ) : (
    React.Children.only(children)
  );

  const wrapped = dismissOnTap ? (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.flex}>{inner}</View>
    </TouchableWithoutFeedback>
  ) : inner;

  return (
    <KeyboardAvoidingView
      style={[styles.flex, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {wrapped}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});