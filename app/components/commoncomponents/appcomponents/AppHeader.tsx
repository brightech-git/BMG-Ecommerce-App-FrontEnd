// components/AppHeader.tsx
import React, { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, StatusBar, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../../../theme';

export type HeaderAction = {
  iconName: string;
  onPress: () => void;
  badge?: number;
};

type Props = {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  actions?: HeaderAction[];
  leftComponent?: React.ReactNode;
  centerComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  variant?: 'primary' | 'white' | 'transparent' | 'gold';
  animated?: boolean;
};

export default function AppHeader({
  title, subtitle, showBack = false,
  onBackPress, actions = [],
  leftComponent, centerComponent, rightComponent,
  variant = 'primary', animated = true,
}: Props) {
  const { COLORS, FONTS, SIZES, SHADOWS, moderateScale, verticalScale } = useTheme();
  const navigation = useNavigation();
  const slideY = useRef(new Animated.Value(animated ? -30 : 0)).current;
  const fadeIn = useRef(new Animated.Value(animated ?  0   : 1)).current;

  useEffect(() => {
    if (!animated) return;
    Animated.parallel([
      Animated.spring(slideY, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 160 }),
      Animated.timing(fadeIn, { toValue: 1, duration: 260, useNativeDriver: true }),
    ]).start();
  }, []);

  const onDark = variant === 'primary' || variant === 'gold';
  const bg =
    variant === 'gold'        ? COLORS.primaryDark
    : variant === 'white'     ? COLORS.white
    : variant === 'transparent'? 'transparent'
    : COLORS.primary;

  const iconColor    = onDark ? COLORS.white        : COLORS.textPrimary;
  const iconBg       = onDark ? COLORS.whiteOpacity20: COLORS.gray100;
  const titleColor   = onDark ? COLORS.white        : COLORS.textPrimary;
  const subtitleColor= onDark ? COLORS.whiteOpacity70: COLORS.textSecondary;

  const handleBack = () => { onBackPress ? onBackPress() : navigation.canGoBack() && navigation.goBack(); };

  function ActionBtn({ action }: { action: HeaderAction }) {
    const s = useRef(new Animated.Value(1)).current;
    return (
      <TouchableOpacity
        onPressIn={() => Animated.spring(s, { toValue: 0.85, useNativeDriver: true, speed: 40 }).start()}
        onPressOut={() => Animated.spring(s, { toValue: 1,    useNativeDriver: true, speed: 24 }).start()}
        onPress={action.onPress} activeOpacity={1}
      >
        <Animated.View style={[styles.iconCircle, { backgroundColor: iconBg, transform: [{ scale: s }] }]}>
          <Ionicons name={action.iconName as any} size={moderateScale(20)} color={iconColor} />
          {!!action.badge && action.badge > 0 && (
            <View style={[styles.badgeDot, { borderColor: bg }]}>
              <Text style={styles.badgeText}>{action.badge > 99 ? '99+' : action.badge}</Text>
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={{ width: '100%' }}>
      <StatusBar barStyle={onDark ? 'light-content' : 'dark-content'} backgroundColor={bg} />
      <SafeAreaView edges={['top']} style={{ backgroundColor: bg, width: '100%', alignSelf: 'stretch' }}>
        {variant === 'gold' && (
          <>
            <View style={[styles.dc1, { backgroundColor: COLORS.orangeOpacity20 }]} />
            <View style={[styles.dc2, { backgroundColor: COLORS.goldOpacity20 }]} />
            <View style={[styles.goldStrip, { backgroundColor: COLORS.secondary }]} />
          </>
        )}
        <Animated.View style={[
          styles.bar,
          { minHeight: verticalScale(56), paddingHorizontal: SIZES.padding.md, width: '100%' },
          { transform: [{ translateY: slideY }], opacity: fadeIn },
        ]}>
          {/* Left */}
          <View style={styles.side}>
            {leftComponent ? leftComponent : showBack ? (
              <TouchableOpacity
                onPressIn={() => {}}
                onPress={handleBack}
                activeOpacity={0.7}
              >
                <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
                  <Ionicons name="arrow-back" size={moderateScale(20)} color={iconColor} />
                </View>
              </TouchableOpacity>
            ) : <View style={{ width: moderateScale(38) }} />}
          </View>

          {/* Center */}
          <View style={styles.center}>
            {centerComponent ? centerComponent : (
              <>
                {title && <Text numberOfLines={1} style={[styles.title, { color: titleColor, fontFamily: FONTS.family.bold, fontSize: SIZES.font.lg }]}>{title}</Text>}
                {subtitle && <Text numberOfLines={1} style={[styles.subtitle, { color: subtitleColor, fontFamily: FONTS.family.regular, fontSize: SIZES.font.xs }]}>{subtitle}</Text>}
                {!title && !subtitle && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={{ color: COLORS.secondary, fontSize: SIZES.font.sm }}>✦</Text>
                    <Text style={{ fontFamily: FONTS.family.bold, fontSize: SIZES.font.xl, color: titleColor }}>
                      Digi<Text style={{ color: onDark ? COLORS.secondary : COLORS.primary }}>Gold</Text>
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>

          {/* Right */}
          <View style={[styles.side, { alignItems: 'flex-end' }]}>
            {rightComponent ? rightComponent : (
              <View style={{ flexDirection: 'row', gap: SIZES.xs }}>
                {actions.map((a, i) => <ActionBtn key={i} action={a} />)}
                {actions.length === 0 && <View style={{ width: moderateScale(38) }} />}
              </View>
            )}
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', width: '100%', alignSelf: 'stretch' },
  side:      { minWidth: 46, justifyContent: 'center' },
  center:    { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
  title:     { textAlign: 'center' },
  subtitle:  { textAlign: 'center', marginTop: 1 },
  iconCircle:{ width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  badgeDot:  { position: 'absolute', top: 2, right: 2, minWidth: 15, height: 15, borderRadius: 8, backgroundColor: '#DC2626', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3, borderWidth: 1.5 },
  badgeText: { color: '#fff', fontSize: 8, fontWeight: '800' },
  dc1:       { position: 'absolute', width: 130, height: 130, borderRadius: 65, top: -50, right: -20 },
  dc2:       { position: 'absolute', width: 80,  height: 80,  borderRadius: 40, top: 10,  right: 90 },
  goldStrip: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2 },
});