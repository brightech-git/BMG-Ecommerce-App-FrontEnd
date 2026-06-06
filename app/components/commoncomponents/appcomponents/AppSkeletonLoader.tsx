// components/AppSkeletonLoader.tsx
//
// Usage:
//   <AppSkeletonLoader type="card" />
//   <AppSkeletonLoader type="list" count={5} />
//   <AppSkeletonLoader type="profile" />
//   <AppSkeletonLoader type="transaction" count={4} />
//   <AppSkeletonLoader type="portfolio" />
//   <AppSkeletonLoader type="banner" />
//   <AppSkeletonLoader type="grid" count={4} />
//   <AppSkeletonLoader type="detail" />
//   <AppSkeletonLoader type="chart" />
//   <AppSkeletonLoader type="notification" count={3} />
//   <AppSkeletonLoader type="text" lines={4} />
//
//  Or use primitives directly:
//   <SkeletonBox width={120} height={16} radius={8} />
//   <SkeletonCircle size={48} />
//   <SkeletonText lines={3} />

import React, { useEffect, useRef } from 'react';
import {
  View, StyleSheet, Animated, Dimensions, ViewStyle,
} from 'react-native';
import { useTheme } from '../../../theme';

const { width: SW } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────────
// Shimmer animation hook
// ─────────────────────────────────────────────────────────────────
function useShimmer() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return anim;
}

// ─────────────────────────────────────────────────────────────────
// Primitive: SkeletonBox
// ─────────────────────────────────────────────────────────────────
export function SkeletonBox({
  width, height, radius = 8, style,
}: {
  width?: number | `${number}%`;
  height: number;
  radius?: number;
  style?: ViewStyle;
}) {
  const { COLORS } = useTheme();
  const shimmer = useShimmer();

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 0.9],
  });

  return (
    <View
      style={[
        {
          width: width ?? '100%',
          height,
          borderRadius: radius,
          backgroundColor: COLORS.gray200,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View style={{ flex: 1, opacity }} />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────
// Primitive: SkeletonCircle
// ─────────────────────────────────────────────────────────────────
export function SkeletonCircle({ size = 44, style }: { size?: number; style?: ViewStyle }) {
  return <SkeletonBox width={size} height={size} radius={size / 2} style={style} />;
}

// ─────────────────────────────────────────────────────────────────
// Primitive: SkeletonText
// ─────────────────────────────────────────────────────────────────
export function SkeletonText({
  lines = 3, lineHeight = 14, gap = 8, lastLineWidth = '65%',
}: {
  lines?: number;
  lineHeight?: number;
  gap?: number;
  lastLineWidth?: number | `${number}%`;
}) {
  return (
    <View style={{ gap }}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBox
          key={i}
          height={lineHeight}
          radius={6}
          width={i === lines - 1 ? lastLineWidth : '100%'}
        />
      ))}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────
// Skeleton variants
// ─────────────────────────────────────────────────────────────────

// ── List item (avatar + two lines) ──────────────
function SkeletonListItem() {
  const { SIZES } = useTheme();
  return (
    <View style={styles.listItem}>
      <SkeletonCircle size={46} />
      <View style={{ flex: 1, gap: 8 }}>
        <SkeletonBox height={13} width="65%" radius={6} />
        <SkeletonBox height={11} width="40%" radius={6} />
      </View>
      <SkeletonBox width={52} height={24} radius={8} />
    </View>
  );
}

// ── Card ────────────────────────────────────────
function SkeletonCard() {
  const { SIZES } = useTheme();
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <SkeletonCircle size={40} />
        <View style={{ flex: 1, gap: 7 }}>
          <SkeletonBox height={13} width="55%" radius={6} />
          <SkeletonBox height={11} width="35%" radius={6} />
        </View>
        <SkeletonBox width={60} height={22} radius={10} />
      </View>
      <SkeletonBox height={1} style={{ marginVertical: 14 }} />
      <View style={styles.row}>
        {[1, 2, 3].map(i => (
          <View key={i} style={{ flex: 1, gap: 6, alignItems: 'center' }}>
            <SkeletonBox height={20} width="60%" radius={6} />
            <SkeletonBox height={11} width="80%" radius={5} />
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Profile ─────────────────────────────────────
function SkeletonProfile() {
  return (
    <View style={styles.profile}>
      {/* Cover */}
      <SkeletonBox height={120} radius={0} />
      {/* Avatar over cover */}
      <View style={styles.profileAvatarRow}>
        <View style={styles.profileAvatarWrap}>
          <SkeletonCircle size={80} />
        </View>
        <View style={{ flex: 1, paddingTop: 8, gap: 7 }}>
          <SkeletonBox height={14} width="55%" radius={6} />
          <SkeletonBox height={11} width="40%" radius={6} />
        </View>
        <SkeletonBox width={84} height={34} radius={12} />
      </View>
      {/* Stats row */}
      <View style={[styles.row, { paddingHorizontal: 16, paddingTop: 8, gap: 12 }]}>
        {[1, 2, 3].map(i => (
          <View key={i} style={{ flex: 1, gap: 6, alignItems: 'center' }}>
            <SkeletonBox height={20} width="50%" radius={6} />
            <SkeletonBox height={11} width="70%" radius={5} />
          </View>
        ))}
      </View>
      {/* Bio lines */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <SkeletonText lines={3} />
      </View>
    </View>
  );
}

// ── Transaction item ─────────────────────────────
function SkeletonTransaction() {
  return (
    <View style={styles.transaction}>
      <View style={[styles.txIcon]}>
        <SkeletonCircle size={42} />
      </View>
      <View style={{ flex: 1, gap: 7 }}>
        <SkeletonBox height={13} width="60%" radius={6} />
        <SkeletonBox height={11} width="38%" radius={6} />
      </View>
      <View style={{ alignItems: 'flex-end', gap: 7 }}>
        <SkeletonBox width={70} height={14} radius={6} />
        <SkeletonBox width={48} height={11} radius={5} />
      </View>
    </View>
  );
}

// ── Portfolio card ───────────────────────────────
function SkeletonPortfolio() {
  return (
    <View style={styles.portfolio}>
      {/* Big value */}
      <View style={{ alignItems: 'center', gap: 10, paddingVertical: 16 }}>
        <SkeletonBox height={12} width={100} radius={6} />
        <SkeletonBox height={38} width={180} radius={10} />
        <View style={styles.row}>
          <SkeletonBox height={20} width={80} radius={10} />
          <SkeletonBox height={20} width={60} radius={10} />
        </View>
      </View>
      {/* Divider */}
      <SkeletonBox height={1} />
      {/* Holdings list */}
      <View style={{ gap: 14, padding: 16 }}>
        {[1, 2, 3].map(i => (
          <View key={i} style={[styles.row, { gap: 12 }]}>
            <SkeletonCircle size={36} />
            <View style={{ flex: 1, gap: 7 }}>
              <SkeletonBox height={13} width="50%" radius={6} />
              <SkeletonBox height={11} width="35%" radius={6} />
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <SkeletonBox width={64} height={13} radius={6} />
              <SkeletonBox width={44} height={11} radius={5} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Banner / Hero ────────────────────────────────
function SkeletonBanner() {
  return (
    <View style={styles.banner}>
      <SkeletonBox height={160} radius={20} />
    </View>
  );
}

// ── Grid item ────────────────────────────────────
function SkeletonGridItem() {
  const cellW = (SW - 48) / 2;
  return (
    <View style={[styles.gridItem, { width: cellW }]}>
      <SkeletonBox height={cellW * 0.7} radius={14} />
      <View style={{ padding: 10, gap: 7 }}>
        <SkeletonBox height={13} width="75%" radius={6} />
        <SkeletonBox height={11} width="50%" radius={5} />
      </View>
    </View>
  );
}

// ── Detail page ──────────────────────────────────
function SkeletonDetail() {
  return (
    <View style={{ padding: 16, gap: 16 }}>
      {/* Hero image */}
      <SkeletonBox height={200} radius={18} />
      {/* Title block */}
      <View style={{ gap: 8 }}>
        <SkeletonBox height={22} width="70%" radius={8} />
        <SkeletonBox height={14} width="45%" radius={6} />
      </View>
      {/* Stats */}
      <View style={[styles.row, { gap: 10 }]}>
        {[1, 2, 3].map(i => (
          <View key={i} style={[styles.statBox, { flex: 1, gap: 7 }]}>
            <SkeletonBox height={20} width="60%" radius={6} />
            <SkeletonBox height={11} width="80%" radius={5} />
          </View>
        ))}
      </View>
      {/* Description */}
      <SkeletonText lines={5} lineHeight={13} gap={8} lastLineWidth="55%" />
      {/* Button */}
      <SkeletonBox height={50} radius={14} />
    </View>
  );
}

// ── Chart ────────────────────────────────────────
function SkeletonChart() {
  const bars = [55, 75, 45, 90, 60, 80, 50, 70, 40, 85, 65, 72];
  const maxH = 100;
  return (
    <View style={styles.chart}>
      {/* Y-axis labels */}
      <View style={{ gap: 20, marginRight: 10 }}>
        {[1, 2, 3, 4].map(i => (
          <SkeletonBox key={i} width={28} height={10} radius={5} />
        ))}
      </View>
      {/* Bars */}
      <View style={styles.chartBars}>
        {bars.map((pct, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: maxH }}>
            <SkeletonBox height={(pct / 100) * maxH} radius={5} />
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Notification item ────────────────────────────
function SkeletonNotification() {
  return (
    <View style={styles.notification}>
      <SkeletonCircle size={40} />
      <View style={{ flex: 1, gap: 7 }}>
        <SkeletonBox height={13} width="75%" radius={6} />
        <SkeletonBox height={11} width="55%" radius={6} />
        <SkeletonBox height={10} width="30%" radius={5} />
      </View>
    </View>
  );
}

// ── Plain text block ─────────────────────────────
function SkeletonTextBlock({ lines }: { lines: number }) {
  return (
    <View style={{ padding: 16 }}>
      <SkeletonText lines={lines} lineHeight={13} gap={10} lastLineWidth="50%" />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────
// AppSkeletonLoader — main export
// ─────────────────────────────────────────────────────────────────
export type SkeletonType =
  | 'list'
  | 'card'
  | 'profile'
  | 'transaction'
  | 'portfolio'
  | 'banner'
  | 'grid'
  | 'detail'
  | 'chart'
  | 'notification'
  | 'text';

type Props = {
  type: SkeletonType;
  /** Number of repeated items (list / transaction / notification / grid) */
  count?: number;
  /** For type="text" — how many lines */
  lines?: number;
  style?: ViewStyle;
};

export default function AppSkeletonLoader({ type, count = 3, lines = 4, style }: Props) {
  const { COLORS } = useTheme();

  const renderItem = (i: number) => {
    switch (type) {
      case 'list':         return <SkeletonListItem key={i} />;
      case 'card':         return <SkeletonCard key={i} />;
      case 'profile':      return <SkeletonProfile key={i} />;
      case 'transaction':  return <SkeletonTransaction key={i} />;
      case 'portfolio':    return <SkeletonPortfolio key={i} />;
      case 'banner':       return <SkeletonBanner key={i} />;
      case 'grid':         return <SkeletonGridItem key={i} />;
      case 'detail':       return <SkeletonDetail key={i} />;
      case 'chart':        return <SkeletonChart key={i} />;
      case 'notification': return <SkeletonNotification key={i} />;
      case 'text':         return <SkeletonTextBlock key={i} lines={lines} />;
      default:             return null;
    }
  };

  // Single-instance types
  const single = ['profile', 'portfolio', 'detail', 'chart', 'banner'];
  const isSingle = single.includes(type);

  if (type === 'grid') {
    return (
      <View style={[styles.gridWrap, style]}>
        {Array.from({ length: count }).map((_, i) => renderItem(i))}
      </View>
    );
  }

  return (
    <View style={style}>
      {isSingle
        ? renderItem(0)
        : Array.from({ length: count }).map((_, i) => (
            <View key={i} style={i < count - 1 ? { marginBottom: type === 'card' ? 14 : 0 } : undefined}>
              {renderItem(i)}
              {type !== 'card' && i < count - 1 && (
                <View style={[styles.separator, { backgroundColor: COLORS.borderLight }]} />
              )}
            </View>
          ))
      }
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // list
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  separator: { height: StyleSheet.hairlineWidth },

  // card
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  // profile
  profile: { overflow: 'hidden' },
  profileAvatarRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 0,
    gap: 12,
    marginTop: -30,
  },
  profileAvatarWrap: {
    borderRadius: 42,
    borderWidth: 3,
    borderColor: '#fff',
    overflow: 'hidden',
  },

  // transaction
  transaction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  txIcon: { borderRadius: 21 },

  // portfolio
  portfolio: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginHorizontal: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },

  // banner
  banner: { paddingHorizontal: 16 },

  // grid
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    paddingHorizontal: 16,
  },
  gridItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },

  // detail stat boxes
  statBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },

  // chart
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 16,
    height: 140,
  },
  chartBars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 5,
    height: 100,
  },

  // notification
  notification: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});