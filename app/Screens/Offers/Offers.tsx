// app/Screens/Offers/Offers.tsx
// Website page: Offer banners + Instant offers sections on home page (/offer_banner/list,
// /instant_offers/list). Mirrors the website's offer display in mobile layout.
// Files created: app/Screens/Offers/Offers.tsx
// Files modified: StackNavigator.tsx (register route), RootStackParamList.tsx (already typed).
// Navigation: accessible from Profile menu and Home screen.
// API:
//   useOfferBanners()  → HOME.OFFER_BANNERS  → /offer_banner/list
//   useInstantOffers() → HOME.INSTANT_OFFERS → /instant_offers/list
// Tap any banner/offer → navigate to Products with filter params from the image link.
// States: loading (Loader), empty (EmptyState), error (ErrorState), pull-to-refresh.
// NOTE: root App.tsx provides SafeAreaView — use a plain View container.
import React, { useMemo, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Dimensions, StatusBar, RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { useOfferBanners, useInstantOffers } from '../../api/hooks/useHome';
import { absUrl } from '../../utils/image';
import { SmartImage } from '../../components/common/SmartImage';
import { Loader, EmptyState, ErrorState } from '../../components/common/StateViews';

const { width } = Dimensions.get('window');
const PAD = SIZES.padding;
const GAP = 10;
type Nav = StackNavigationProp<RootStackParamList>;

const asArray = (d: any): any[] => (Array.isArray(d) ? d : d?.data ?? []);

// Parse offer image link → Products params  (mirrors Home.tsx linkToParams)
const linkToParams = (link?: string, title?: string) => {
  const p: any = { title };
  if (!link) return p;
  link.split('&').forEach((pair) => {
    const [k, v] = pair.split('=');
    if (!k || v === undefined || v === '') return;
    const key = k.trim();
    const val = decodeURIComponent(v.trim());
    if (key === 'itemName') p.ItemName = val;
    else if (key === 'itemId') p.itemId = val;
    else if (key === 'filterId') p.filterId = val;
    else p[key] = val;
  });
  return p;
};

// Pick the best image url from an offer item (various shapes from different endpoints)
const pickUrl = (item: any): string => {
  return (
    item.mobile?.url ?? item.image_url ?? item.imageUrl ?? item.image ??
    item.bannerImage ?? item.banner_image ?? item.url ?? ''
  );
};
const pickLink = (item: any): string | undefined =>
  item.mobile?.link ?? item.link ?? item.redirectUrl ?? item.redirect_url;
const pickTitle = (item: any): string =>
  item.title ?? item.name ?? item.offerName ?? item.heading ?? '';
const pickBadge = (item: any): string =>
  item.discountText ?? item.badge ?? item.offer ?? item.discount ?? '';

// Full-width offer banner card
const BannerCard = ({
  item, onPress,
}: { item: any; onPress: () => void }) => {
  const url = absUrl(pickUrl(item));
  const badge = pickBadge(item);
  const title = pickTitle(item);
  return (
    <TouchableOpacity
      style={styles.bannerCard}
      activeOpacity={0.88}
      onPress={onPress}
    >
      <SmartImage uri={url} style={styles.bannerImg} />
      {(!!badge || !!title) && (
        <View style={styles.bannerOverlay}>
          {!!badge && (
            <View style={styles.badgePill}>
              <Text style={styles.badgeTxt}>{badge}</Text>
            </View>
          )}
          {!!title && (
            <Text style={styles.bannerTitle} numberOfLines={1}>{title}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

// Half-width instant offer card
const OfferCard = ({
  item, cardW, onPress,
}: { item: any; cardW: number; onPress: () => void }) => {
  const url = absUrl(pickUrl(item));
  const badge = pickBadge(item);
  const title = pickTitle(item);
  return (
    <TouchableOpacity
      style={[styles.offerCard, { width: cardW }]}
      activeOpacity={0.88}
      onPress={onPress}
    >
      <SmartImage uri={url} style={[styles.offerImg, { width: cardW, height: cardW * 0.75 }]} />
      {!!badge && (
        <View style={styles.offerBadge}>
          <Text style={styles.offerBadgeTxt}>{badge}</Text>
        </View>
      )}
      {!!title && (
        <Text style={styles.offerTitle} numberOfLines={2}>{title}</Text>
      )}
      <View style={styles.shopRow}>
        <Text style={styles.shopTxt}>Shop Now</Text>
        <Feather name="arrow-right" size={12} color={COLORS.primary} />
      </View>
    </TouchableOpacity>
  );
};

const Offers = () => {
  const navigation = useNavigation<Nav>();
  const offerBanners = useOfferBanners();
  const instantOffers = useInstantOffers();

  const banners = useMemo(() => asArray(offerBanners.data), [offerBanners.data]);
  const offers  = useMemo(() => asArray(instantOffers.data), [instantOffers.data]);

  const isLoading  = offerBanners.isLoading || instantOffers.isLoading;
  const isError    = offerBanners.isError   && instantOffers.isError;
  const refreshing = offerBanners.isRefetching || instantOffers.isRefetching;
  const isEmpty    = !isLoading && !isError && banners.length === 0 && offers.length === 0;

  const onRefresh = useCallback(() => {
    offerBanners.refetch();
    instantOffers.refetch();
  }, [offerBanners, instantOffers]);

  const openItem = (item: any, fallbackTitle?: string) => {
    const link  = pickLink(item);
    const title = pickTitle(item) || fallbackTitle;
    const p = linkToParams(link, title);
    navigation.navigate('Products', p);
  };

  const cardW = (width - PAD * 2 - GAP) / 2;

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        {navigation.canGoBack() && (
          <TouchableOpacity style={styles.hBtn} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={22} color={COLORS.title} />
          </TouchableOpacity>
        )}
        <Text style={styles.hTitle}>Offers & Deals</Text>
        <TouchableOpacity style={styles.hBtn} onPress={() => navigation.navigate('Search')}>
          <Feather name="search" size={20} color={COLORS.title} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <Loader message="Loading offers..." />
      ) : isError ? (
        <ErrorState
          message="Could not load offers."
          onRetry={onRefresh}
        />
      ) : isEmpty ? (
        <EmptyState
          icon="tag"
          title="No active offers"
          subtitle="Check back soon for exclusive deals and discounts."
          ctaLabel="Browse Products"
          onCta={() => navigation.navigate('Products', {})}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
        >
          {/* ── Offer Banners ── */}
          {banners.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.secTitle}>Exclusive Offers</Text>
              {banners.map((b, i) => (
                <BannerCard
                  key={b.id ?? b._id ?? i}
                  item={b}
                  onPress={() => openItem(b, 'Offer')}
                />
              ))}
            </View>
          )}

          {/* ── Instant Offers Grid ── */}
          {offers.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.secTitle}>Instant Deals</Text>
              <View style={styles.grid}>
                {offers.map((o, i) => (
                  <OfferCard
                    key={o.id ?? o._id ?? i}
                    item={o}
                    cardW={cardW}
                    onPress={() => openItem(o, 'Instant Offer')}
                  />
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9F6F1' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderColor,
  },
  hBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  hTitle: { flex: 1, ...FONTS.h5, ...FONTS.fontSemiBold, color: COLORS.title },
  scroll: { paddingBottom: 30 },
  section: { marginTop: 20, paddingHorizontal: PAD },
  secTitle: {
    ...FONTS.h5, fontFamily: 'MarcellusRegular', color: COLORS.title, marginBottom: 12,
  },
  // Full-width banner
  bannerCard: {
    borderRadius: 14, overflow: 'hidden', marginBottom: 12,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.08,
    shadowRadius: 5, shadowOffset: { width: 0, height: 3 },
  },
  bannerImg: {
    width: '100%', height: (width - PAD * 2) * 0.5,
    backgroundColor: COLORS.input,
  },
  bannerOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.38)', padding: 12,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  badgePill: {
    backgroundColor: COLORS.danger, paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: 4,
  },
  badgeTxt: { ...FONTS.fontXs, color: COLORS.white, fontWeight: '700' },
  bannerTitle: { flex: 1, ...FONTS.fontSm, ...FONTS.fontSemiBold, color: COLORS.white },
  // Half-width offer card
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: GAP,
  },
  offerCard: {
    backgroundColor: COLORS.white, borderRadius: 14, overflow: 'hidden',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06,
    shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
    marginBottom: 4,
  },
  offerImg: { backgroundColor: COLORS.input },
  offerBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: COLORS.danger, borderRadius: 4,
    paddingHorizontal: 7, paddingVertical: 3,
  },
  offerBadgeTxt: { ...FONTS.fontXs, color: COLORS.white, fontWeight: '700' },
  offerTitle: {
    ...FONTS.fontSm, ...FONTS.fontSemiBold, color: COLORS.title,
    paddingHorizontal: 10, paddingTop: 8, lineHeight: 17,
  },
  shopRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 8,
  },
  shopTxt: { ...FONTS.fontXs, ...FONTS.fontSemiBold, color: COLORS.primary },
});

export default Offers;
