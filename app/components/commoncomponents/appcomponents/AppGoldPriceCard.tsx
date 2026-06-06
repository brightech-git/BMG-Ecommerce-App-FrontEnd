// components/AppGoldPriceCard.tsx
//
// Usage:
//   <AppGoldPriceCard
//     rates={{ '24K': 6325, '22K': 5798, '18K': 4744 }}
//     change={{ '24K': 1.2, '22K': 1.1, '18K': 0.9 }}
//     sparkline={{ '24K': [6100,6150,6080,6200,6280,6310,6325], '22K': [5600,5640,5590,5680,5740,5780,5798], '18K': [4580,4610,4570,4640,4700,4730,4744] }}
//     updatedAt="Today, 10:32 AM"
//     onBuy={(karat) => {}}
//     onSell={(karat) => {}}
//   />

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Dimensions, ViewStyle,
} from 'react-native';
import Svg, { Polyline, Defs, LinearGradient, Stop, Polygon } from 'react-native-svg';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../../../theme';

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────
export type GoldKarat = '24K' | '22K' | '18K';

export type AppGoldPriceCardProps = {
  /** Price per gram for each karat */
  rates: Record<GoldKarat, number>;
  /** Daily change % — positive = up, negative = down */
  change: Record<GoldKarat, number>;
  /** Array of recent price points for sparkline (min 2 points) */
  sparkline: Record<GoldKarat, number[]>;
  /** Last updated label */
  updatedAt?: string;
  /** Loading skeleton state */
  loading?: boolean;
  showActions?: boolean;
  onBuy?: (karat: GoldKarat) => void;
  onSell?: (karat: GoldKarat) => void;
  /** Called when user taps the refresh icon */
  onRefresh?: () => void;
  style?: ViewStyle;
};

const KARATS: GoldKarat[] = ['24K', '22K', '18K'];
const PURITY: Record<GoldKarat, string> = {
  '24K': '99.9% Pure',
  '22K': '91.6% Pure',
  '18K': '75.0% Pure',
};

const CHART_W = Dimensions.get('window').width - 80; // approx card inner width
const CHART_H = 56;

// ─────────────────────────────────────────────────────────────────
// Sparkline
// ─────────────────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * CHART_W;
    const y = CHART_H - ((v - min) / range) * (CHART_H - 8) - 4;
    return `${x},${y}`;
  });

  const fillPts = [
    `0,${CHART_H}`,
    ...pts,
    `${CHART_W},${CHART_H}`,
  ].join(' ');

  return (
    <Svg width={CHART_W} height={CHART_H}>
      <Defs>
        <LinearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="0.25" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Polygon points={fillPts} fill="url(#sparkGrad)" />
      <Polyline
        points={pts.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ─────────────────────────────────────────────────────────────────
// Skeleton shimmer block
// ─────────────────────────────────────────────────────────────────
function Shimmer({ width, height, borderRadius = 6 }: { width: number | `${number}%`; height: number; borderRadius?: number }) {
  const anim = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1,   duration: 700, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={{ width, height, borderRadius, backgroundColor: '#E5E7EB', opacity: anim }} />
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────
export default function AppGoldPriceCard({
  rates, change, sparkline, showActions = true,
  updatedAt, loading = false,
  onBuy, onSell, onRefresh, style,
}: AppGoldPriceCardProps) {
  const { COLORS, FONTS, SIZES, SHADOWS, moderateScale } = useTheme();
  const [activeKarat, setActiveKarat] = useState<GoldKarat>('24K');

  // Tab indicator slide
  const tabAnim = useRef(new Animated.Value(0)).current;
  const TAB_W = 72;

  const selectKarat = useCallback((k: GoldKarat) => {
    const idx = KARATS.indexOf(k);
    Animated.spring(tabAnim, { toValue: idx * TAB_W, useNativeDriver: true, damping: 18, stiffness: 200 }).start();
    setActiveKarat(k);
  }, []);

  // Refresh spin
  const spinAnim = useRef(new Animated.Value(0)).current;
  const handleRefresh = () => {
    Animated.timing(spinAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start(() => spinAnim.setValue(0));
    onRefresh?.();
  };
  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  // Price pop animation on karat change
  const priceScale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.spring(priceScale, { toValue: 1.08, useNativeDriver: true, speed: 40 }),
      Animated.spring(priceScale, { toValue: 1,    useNativeDriver: true, speed: 24 }),
    ]).start();
  }, [activeKarat]);

  const price  = rates[activeKarat];
  const delta  = change[activeKarat];
  const isUp   = delta >= 0;
  const points = sparkline[activeKarat] ?? [];

  const accentColor = COLORS.secondary;   // gold
  const upColor     = COLORS.success;
  const downColor   = COLORS.error;
  const changeColor = isUp ? upColor : downColor;

  return (
    <View style={[styles.card, { backgroundColor: COLORS.card, ...SHADOWS.gold }, style]}>

      {/* ── Top bar: title + refresh ── */}
      <View style={styles.topBar}>
        <View style={styles.titleRow}>
          <View style={[styles.goldDot, { backgroundColor: accentColor }]} />
          <Text style={[styles.title, { fontFamily: FONTS.family.semiBold, fontSize: SIZES.font.md, color: COLORS.textPrimary }]}>
            Gold Rate
          </Text>
          <View style={[styles.livePill, { backgroundColor: upColor + '22', borderColor: upColor + '55' }]}>
            <View style={[styles.liveDot, { backgroundColor: upColor }]} />
            <Text style={[styles.liveText, { color: upColor, fontFamily: FONTS.family.semiBold, fontSize: SIZES.font.xxs }]}>LIVE</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleRefresh} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Ionicons name="refresh-outline" size={moderateScale(18)} color={COLORS.textTertiary} />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* ── Karat tabs ── */}
      <View style={[styles.tabsWrapper, { backgroundColor: COLORS.gray100, borderColor: COLORS.border }]}>
        {/* Sliding pill */}
        <Animated.View
          style={[
            styles.tabPill,
            {
              width: TAB_W,
              backgroundColor: COLORS.card,
              transform: [{ translateX: tabAnim }],
              ...SHADOWS.sm,
              borderColor: accentColor + '40',
            },
          ]}
        />
        {KARATS.map((k) => {
          const isActive = k === activeKarat;
          return (
            <TouchableOpacity
              key={k}
              style={[styles.tab, { width: TAB_W }]}
              onPress={() => selectKarat(k)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.tabText,
                {
                  fontFamily: isActive ? FONTS.family.bold : FONTS.family.medium,
                  fontSize: SIZES.font.sm,
                  color: isActive ? accentColor : COLORS.textTertiary,
                },
              ]}>
                {k}
              </Text>
              <Text style={[
                styles.tabSub,
                {
                  fontFamily: FONTS.family.regular,
                  fontSize: SIZES.font.xxs,
                  color: isActive ? accentColor + 'BB' : COLORS.textDisabled,
                },
              ]}>
                {PURITY[k]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Price + change ── */}
      {loading ? (
        <View style={styles.priceRow}>
          <Shimmer width={160} height={38} borderRadius={8} />
          <Shimmer width={72} height={26} borderRadius={20} />
        </View>
      ) : (
        <View style={styles.priceRow}>
          <Animated.View style={{ transform: [{ scale: priceScale }] }}>
            <Text style={[styles.priceLabel, { fontFamily: FONTS.family.regular, fontSize: SIZES.font.xs, color: COLORS.textTertiary }]}>
              Per gram (incl. GST)
            </Text>
            <Text style={[styles.price, { fontFamily: FONTS.family.bold, fontSize: SIZES.heading.h3, color: COLORS.textPrimary }]}>
              ₹{price.toLocaleString('en-IN')}
            </Text>
          </Animated.View>

          {/* Change badge */}
          <View style={[styles.changeBadge, { backgroundColor: changeColor + '18', borderColor: changeColor + '40' }]}>
            <Ionicons
              name={isUp ? 'trending-up' : 'trending-down'}
              size={moderateScale(14)}
              color={changeColor}
            />
            <Text style={[styles.changeText, { fontFamily: FONTS.family.semiBold, fontSize: SIZES.font.sm, color: changeColor }]}>
              {isUp ? '+' : ''}{delta.toFixed(2)}%
            </Text>
          </View>
        </View>
      )}

      {/* ── Sparkline chart ── */}
      <View style={styles.chartWrap}>
        {loading ? (
          <Shimmer width={'100%'} height={CHART_H} borderRadius={8} />
        ) : (
          <Sparkline data={points} color={isUp ? upColor : downColor} />
        )}
      </View>

      {/* ── Updated at ── */}
      {updatedAt && !loading && (
        <View style={styles.updatedRow}>
          <Ionicons name="time-outline" size={moderateScale(11)} color={COLORS.textDisabled} />
          <Text style={[styles.updatedText, { fontFamily: FONTS.family.regular, fontSize: SIZES.font.xxs, color: COLORS.textDisabled }]}>
            {' '}Updated {updatedAt}
          </Text>
        </View>
      )}

      {showActions && (
  <>
    <View
      style={[
        styles.divider,
        { backgroundColor: COLORS.border },
      ]}
    />

    <View style={styles.actions}>
      <TouchableOpacity
        style={[
          styles.actionBtn,
          styles.sellBtn,
          {
            borderColor: downColor + '60',
            backgroundColor: downColor + '0D',
          },
        ]}
        onPress={() => onSell?.(activeKarat)}
        activeOpacity={0.75}
      >
        <Ionicons
          name="arrow-up-circle-outline"
          size={moderateScale(16)}
          color={downColor}
        />
        <Text
          style={[
            styles.actionText,
            {
              fontFamily: FONTS.family.semiBold,
              fontSize: SIZES.font.sm,
              color: downColor,
            },
          ]}
        >
          Sell {activeKarat}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.actionBtn,
          styles.buyBtn,
          {
            backgroundColor: accentColor,
            ...SHADOWS.gold,
          },
        ]}
        onPress={() => onBuy?.(activeKarat)}
        activeOpacity={0.8}
      >
        <Ionicons
          name="add-circle-outline"
          size={moderateScale(16)}
          color={COLORS.white}
        />
        <Text
          style={[
            styles.actionText,
            {
              fontFamily: FONTS.family.semiBold,
              fontSize: SIZES.font.sm,
              color: COLORS.white,
            },
          ]}
        >
          Buy {activeKarat}
        </Text>
      </TouchableOpacity>
    </View>
  </>
)}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 18,
    overflow: 'hidden',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goldDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  title: {
    letterSpacing: 0.2,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  liveText: {
    letterSpacing: 0.8,
  },
  tabsWrapper: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
    marginBottom: 18,
    position: 'relative',
    overflow: 'hidden',
  },
  tabPill: {
    position: 'absolute',
    top: 3,
    left: 3,
    height: '100%',
    borderRadius: 10,
    borderWidth: 1,
  },
  tab: {
    alignItems: 'center',
    paddingVertical: 7,
    zIndex: 1,
  },
  tabText: {
    letterSpacing: 0.3,
  },
  tabSub: {
    marginTop: 1,
    letterSpacing: 0.1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  priceLabel: {
    marginBottom: 2,
  },
  price: {
    letterSpacing: -0.5,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 4,
  },
  changeText: {
    letterSpacing: 0.2,
  },
  chartWrap: {
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  updatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 2,
  },
  updatedText: {
    letterSpacing: 0.1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  sellBtn: {
    borderWidth: 1,
  },
  buyBtn: {},
  actionText: {
    letterSpacing: 0.2,
  },
});
