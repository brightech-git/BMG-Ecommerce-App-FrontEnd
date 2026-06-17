import React, {useRef, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {colors, fonts} from '../../theme/theme';
import {useFavorites} from '../../hooks/useFavorites';
import {useRates} from '../../hooks/useRates';
import Logo from './Logo';

// ── Badge ─────────────────────────────────────────────────────────────────────
const Badge = ({count}) => {
  if (!count || count === 0) return null;
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
};

// ── Rates Ticker ──────────────────────────────────────────────────────────────
const RatesTicker = ({ratesData}) => {
  const translateX = useRef(new Animated.Value(300)).current;

  const goldRate =
    ratesData?.goldRate ?? ratesData?.gold22 ?? ratesData?.gold ?? null;
  const silverRate =
    ratesData?.silverRate ?? ratesData?.silver ?? null;

  const tickerText = [
    goldRate
      ? `🥇 Gold 22K: ₹${Number(goldRate).toLocaleString('en-IN')}/g`
      : null,
    silverRate
      ? `⚪ Silver: ₹${Number(silverRate).toLocaleString('en-IN')}/g`
      : null,
  ]
    .filter(Boolean)
    .join('     •     ');

  useEffect(() => {
    if (!tickerText) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: -400,
          duration: 12000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 300,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [tickerText, translateX]);

  if (!tickerText) return null;

  return (
    <View style={styles.ticker}>
      <Animated.Text
        style={[styles.tickerText, {transform: [{translateX}]}]}
        numberOfLines={1}>
        {tickerText}
      </Animated.Text>
    </View>
  );
};

// ── AppHeader ─────────────────────────────────────────────────────────────────
const AppHeader = ({navigation}) => {
  const {favoritesCount} = useFavorites();
  const {data: ratesData} = useRates();

  return (
    <View style={styles.container}>
      {/* ── Top Row ── */}
      <View style={styles.topRow}>
        {/* Logo */}
        <TouchableOpacity
          style={styles.logoWrap}
          onPress={() => navigation?.navigate('Home')}
          activeOpacity={0.8}>
          <Logo width={132} height={40} />
        </TouchableOpacity>

        {/* Right icons — Search + Wishlist only */}
        <View style={styles.iconRow}>
          <IconBtn
            name="search-outline"
            onPress={() => navigation?.navigate('Search')}
          />
          <IconBtn
            name="heart-outline"
            onPress={() => navigation?.navigate('Wishlist')}
            badge={favoritesCount}
          />
        </View>
      </View>

      {/* ── Rates Ticker ── */}
      <RatesTicker ratesData={ratesData} />
    </View>
  );
};

const IconBtn = ({name, onPress, badge = 0}) => (
  <TouchableOpacity
    style={styles.iconBtn}
    onPress={onPress}
    hitSlop={{top: 8, bottom: 8, left: 6, right: 6}}>
    <Ionicons name={name} size={22} color={colors.headerText} />
    <Badge count={badge} />
  </TouchableOpacity>
);

export default AppHeader;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.headerBg,
    elevation: 6,
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  logoWrap: {flexDirection: 'row', alignItems: 'center'},
  logoMain: {
    fontSize: 22,
    fontWeight: fonts.weight.black,
    color: colors.headerText,
    letterSpacing: 3,
  },
  logoDivider: {
    width: 1.5,
    height: 18,
    backgroundColor: colors.white,
    marginHorizontal: 7,
    opacity: 0.6,
  },
  logoSub: {
    fontSize: 9,
    fontWeight: fonts.weight.extraBold,
    color: colors.headerText,
    letterSpacing: 4,
  },
  iconRow: {flexDirection: 'row', alignItems: 'center'},
  iconBtn: {
    paddingHorizontal: 7,
    paddingVertical: 6,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 1,
    right: 1,
    minWidth: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: fonts.weight.extraBold,
    color: colors.white,
  },
  ticker: {
    backgroundColor: colors.tickerBg,
    paddingVertical: 5,
    overflow: 'hidden',
  },
  tickerText: {
    fontSize: 11,
    color: colors.tickerText,
    fontWeight: fonts.weight.semiBold,
    letterSpacing: 0.5,
    width: 700,
  },
});
