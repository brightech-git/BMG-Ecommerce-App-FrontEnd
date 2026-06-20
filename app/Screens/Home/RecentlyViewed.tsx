// app/Screens/Home/RecentlyViewed.tsx
// Full-page list of all recently viewed products (GET /recently-viewed/list).
// Shows a 2-column grid, infinite scroll not needed — the API returns a bounded list.
import React, { useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  FlatList, Dimensions, StatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { useRecentlyViewed } from '../../api/hooks/useHome';
import { parseImages } from '../../utils/image';
import { SmartImage } from '../../components/common/SmartImage';
import { Loader, EmptyState, ErrorState } from '../../components/common/StateViews';
import { CartWishlistBadge } from '../../components/common/CartWishlistBadge';

const { width } = Dimensions.get('window');
const GAP    = 12;
const COLS   = 2;
const CARD_W = (width - SIZES.padding * 2 - GAP) / COLS;

type Nav = StackNavigationProp<RootStackParamList>;

const RecentlyViewed = () => {
  const navigation = useNavigation<Nav>();
  const { data, isLoading, isError, error, refetch } = useRecentlyViewed();

  const items: any[] = useMemo(() => {
    const raw = data as any;
    if (__DEV__ && raw) console.log('[RecentlyViewed screen] raw:', JSON.stringify(raw)?.slice(0, 400));
    if (!raw) return [];
    if (Array.isArray(raw))                return raw;
    if (Array.isArray(raw.data))           return raw.data;
    if (Array.isArray(raw.products))       return raw.products;
    if (Array.isArray(raw.items))          return raw.items;
    if (Array.isArray(raw.recentlyViewed)) return raw.recentlyViewed;
    return [];
  }, [data]);

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.hBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={COLORS.title} />
        </TouchableOpacity>
        <Text style={styles.hTitle}>Recently Viewed</Text>
        <CartWishlistBadge />
      </View>

      {isLoading ? (
        <Loader message="Loading..." />
      ) : isError ? (
        <ErrorState message={(error as any)?.message} onRetry={refetch} />
      ) : items.length === 0 ? (
        <EmptyState
          icon="clock"
          title="Nothing viewed yet"
          subtitle="Products you view will appear here."
          ctaLabel="Explore Products"
          onCta={() => navigation.navigate('Products', {})}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it: any, i) => String(it.TAGKEY ?? i)}
          numColumns={COLS}
          contentContainerStyle={styles.list}
          columnWrapperStyle={{ gap: GAP, marginBottom: GAP }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const img = parseImages(item.ImagePath)[0];
            const hasOffer = item.OfferPercentage && item.OfferPercentage !== '0';
            return (
              <TouchableOpacity
                style={[styles.card, { width: CARD_W }]}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('ProductDetails', { tagKey: item.TAGKEY })}
              >
                <View style={styles.imgWrap}>
                  <SmartImage uri={img} style={styles.img} />
                  {hasOffer && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeTxt}>{item.OfferPercentage}% OFF</Text>
                    </View>
                  )}
                </View>
                <View style={styles.info}>
                  <Text style={styles.name} numberOfLines={2}>{item.ITEMNAME}</Text>
                  {!!item.SUBITEMNAME && (
                    <Text style={styles.sub} numberOfLines={1}>{item.SUBITEMNAME}</Text>
                  )}
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>₹{item.FinalAmount}</Text>
                    {!!item.OriginalAmount && item.OriginalAmount !== item.FinalAmount && (
                      <Text style={styles.orig}>₹{item.OriginalAmount}</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9F6F1' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderColor,
  },
  hBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  hTitle: { flex: 1, ...FONTS.h5, ...FONTS.fontSemiBold, color: COLORS.title },
  list: { padding: SIZES.padding },
  card: {
    backgroundColor: COLORS.white, borderRadius: 14, overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 5, shadowOffset: { width: 0, height: 2 },
  },
  imgWrap: { position: 'relative' },
  img: { width: '100%', height: CARD_W, backgroundColor: '#EDE8DF' },
  badge: {
    position: 'absolute', top: 7, left: 7,
    backgroundColor: COLORS.danger, borderRadius: 5,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  badgeTxt: { ...FONTS.fontXs, color: COLORS.white, fontWeight: '700' },
  info: { padding: 10, gap: 3 },
  name: { ...FONTS.fontSm, ...FONTS.fontSemiBold, color: COLORS.title, lineHeight: 17 },
  sub: { ...FONTS.fontXs, color: COLORS.textLight },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  price: { ...FONTS.font, ...FONTS.fontBold, color: COLORS.title },
  orig: { ...FONTS.fontXs, color: COLORS.textLight, textDecorationLine: 'line-through' },
});

export default RecentlyViewed;
