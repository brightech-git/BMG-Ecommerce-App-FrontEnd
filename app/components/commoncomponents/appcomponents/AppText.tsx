// components/AppText.tsx
import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme';

export type TextVariant =
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'bodyLarge' | 'body' | 'bodyMedium' | 'bodySmall'
  | 'caption' | 'captionBold' | 'label' | 'labelUppercase'
  | 'button' | 'buttonLarge' | 'buttonSmall'
  | 'goldText' | 'orangeText';

type Props = {
  children: React.ReactNode;
  variant?: TextVariant;
  color?: string;
  align?: 'left' | 'center' | 'right';
  numberOfLines?: number;
  style?: TextStyle;
};

export default function AppText({
  children, variant = 'body',
  color, align = 'left',
  numberOfLines, style,
}: Props) {
  const { FONTS, COLORS } = useTheme();

  const variantStyle: TextStyle = (FONTS as any)[variant] ?? FONTS.body;

  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        variantStyle,
        { textAlign: align, color: color ?? variantStyle.color ?? COLORS.textPrimary },
        style,
      ]}
    >
      {children}
    </Text>
  );
}