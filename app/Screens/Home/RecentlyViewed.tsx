// app/Screens/Home/RecentlyViewed.tsx
// Full-page 2-column grid of all recently viewed products.
import React, { useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  FlatList, Dimensions, StatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
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
  const { colors: C } = useTheme();
  const { data, isLoading, isError, error, refetch } = useRecentlyViewed();

  const items: any[] = useMemo(() => {
    const raw = data as any;
    if (!raw) return [];
    if (Array.isArray(raw))                return raw;
    if (Array.isArray(raw.data))           return raw.data;
    if (Array.isArray(raw.products))       return raw.products;
    if (Array.isArray(raw.items))          return raw.items;
    if (Array.isArray(raw.recentlyViewed)) return raw.recentlyViewed;
    return [];
  }, [data]);

  return (
    <View style={[styles.safe, { backgroundColor: C.background }]}>
      <StatusBar barStyle={C.statusBar} backgroundColor={C.card} />

      <View style={[styles.header, { backgroundColor: C.card, borderBottomColor: C.borderColor }]}>
        <TouchableOpacity style={styles.hBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={C.title} />
        </TouchableOpacity>
        <Text style={[styles.hTitle, { color: C.title }]}>Recently Viewed</Text>
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
            const img     = parseImages(item.ImagePath)[0];
            const hasOffer = item.OfferPercentage && item.OfferPercentage !== '0';
            return (
              <TouchableOpacity
                style={[styles.card, { width: CARD_W, backgroundColor: C.card }]}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('ProductDetails', { tagKey: item.TAGKEY })}
              >
                <View style={styles.imgWrap}>
                  <SmartImage uri={img} style={[styles.img, { backgroundColor: C.borderColor }]} />
                  {hasOffer && (
                    <View style={[styles.badge, { backgroundColor: C.danger }]}>
                      <Text style={[styles.badgeTxt, { color: C.white }]}>{item.OfferPercentage}% OFF</Text>
                    </View>
                  )}
                </View>
                <View style={styles.info}>
                  <Text style={[styles.name, { color: C.title }]} numberOfLines={2}>{item.ITEMNAME}</Text>
                  {!!item.SUBITEMNAME && (
                    <Text style={[styles.sub, { color: C.textLight }]} numberOfLines={1}>{item.SUBITEMNAME}</Text>
                  )}
                  <View style={styles.priceRow}>
                    <Text style={[styles.price, { color: C.title }]}>₹{item.FinalAmount}</Text>
                    {!!item.OriginalAmount && item.OriginalAmount !== item.FinalAmount && (
                      <Text style={[styles.orig, { color: C.textLight }]}>₹{item.OriginalAmount}</Text>
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
  safe:      { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 12,
    borderBottomWidth: 1,
  },
  hBtn:    { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  hTitle:  { flex: 1, ...FONTS.h5, ...FONTS.fontSemiBold },
  list:    { padding: SIZES.padding },
  card: {
    borderRadius: 14, overflow: 'hidden', elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 5, shadowOffset: { width: 0, height: 2 },
  },
  imgWrap:  { position: 'relative' },
  img:      { width: '100%', height: CARD_W },
  badge: {
    position: 'absolute', top: 7, left: 7,
    borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2,
  },
  badgeTxt: { ...FONTS.fontXs, fontWeight: '700' },
  info:     { padding: 10, gap: 3 },
  name:     { ...FONTS.fontSm, ...FONTS.fontSemiBold, lineHeight: 17 },
  sub:      { ...FONTS.fontXs },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  price:    { ...FONTS.font, ...FONTS.fontBold },
  orig:     { ...FONTS.fontXs, textDecorationLine: 'line-through' },
});

export default RecentlyViewed;
