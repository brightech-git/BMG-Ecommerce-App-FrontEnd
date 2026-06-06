// components/ScreenWrapper.tsx
import React from 'react';
import {
  View, ScrollView, RefreshControl,
  StyleSheet, ViewStyle, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme';

type Props = {
  children: React.ReactNode;
  /** Enable ScrollView */
  scroll?: boolean;
  /** Pull-to-refresh handler */
  onRefresh?: () => void;
  refreshing?: boolean;
  backgroundColor?: string;
  /** Horizontal padding on content */
  paddingHorizontal?: number;
  paddingTop?: number;
  paddingBottom?: number;
  statusBarStyle?: 'light-content' | 'dark-content';
  statusBarBg?: string;
  /** Render something fixed above the scroll area */
  header?: React.ReactNode;
  /** Render something fixed below the scroll area */
  footer?: React.ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  style?: ViewStyle;
  contentStyle?: ViewStyle;
};

export default function ScreenWrapper({
  children, scroll = false,
  onRefresh, refreshing = false,
  backgroundColor, paddingHorizontal,
  paddingTop = 0, paddingBottom = 24,
  statusBarStyle = 'dark-content',
  statusBarBg,
  edges = ['top', 'bottom'],
  header, footer,
  style, contentStyle,
}: Props) {
  const { COLORS, SIZES } = useTheme();

  const bg = backgroundColor ?? COLORS.background;
  const ph = paddingHorizontal ?? SIZES.padding.container;

  return (
    <SafeAreaView edges={edges} style={[styles.safe, { backgroundColor: bg }, style]}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={statusBarBg ?? bg} />

      {header}

      {scroll ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            { paddingHorizontal: ph, paddingTop, paddingBottom },
            contentStyle,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flat, { paddingHorizontal: ph, paddingTop, paddingBottom }, contentStyle]}>
          {children}
        </View>
      )}

      {footer}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flat: { flex: 1 },
});