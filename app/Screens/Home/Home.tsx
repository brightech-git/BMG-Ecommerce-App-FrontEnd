// app/Screens/Home/Home.tsx
// Website page: / (Home). Primary content comes from /budget-categories/getOnlyVisible,
// which returns ordered, configurable sections (heroBanner, bmgWorld, offerBanner,
// shopByOccasion, ShopByGender). Each section drives its own layout from:
//   visibleCount.mobile (items per row), images[].mobile/desktop.{url,link,ratio}.
// A tap routes to Products using the image `link` (itemId=, itemName=, filterId=).
// NOTE: root App.tsx provides SafeAreaView, so this screen uses a plain View.
import React, { useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  FlatList, Dimensions, StatusBar, RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { useTodayRate } from '../../api/hooks/useRate';
import { useBudgetBanners, useNewArrivals, useTrending, useRecentlyViewed } from '../../api/hooks/useHome';
import { useCart } from '../../api/hooks/useCart';
import { useWishlist } from '../../api/hooks/useWishlist';
import { firstImage, absUrl } from '../../utils/image';
import { SmartImage } from '../../components/common/SmartImage';

const { width } = Dimensions.get('window');
const PAD = SIZES.padding;
const GAP = 10;
type Nav = StackNavigationProp<RootStackParamList>;

const asArray = (d: any): any[] => (Array.isArray(d) ? d : d?.data ?? []);

// "16/4" -> 4/16 (height as a fraction of width)
const ratioToFraction = (ratio?: string): number => {
  if (!ratio || typeof ratio !== 'string') return 1;
  const [w, h] = ratio.split('/').map(Number);
  if (!w || !h) return 1;
  return h / w;
};

// Pick the mobile-first variant of a configurable image.
const pickImage = (img: any): { url?: string; link?: string; ratio?: string; filterId?: any } => {
  if (!img) return {};
  if (img.isSingle && img.url) return { url: img.url, link: img.link, ratio: img.ratio, filterId: img.filterId };
  const v = img.mobile || img.desktop || img;
  return { url: v.url ?? img.url, link: v.link ?? img.link, ratio: v.ratio ?? img.ratio, filterId: v.filterId ?? img.filterId };
};

// Parse a link like "itemId=2" / "itemName=KADA" / "filterId=28" into Products params.
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

const SectionHeader = ({ title }: { title?: string }) =>
  title ? (
    <View style={styles.secHead}>
      <Text style={styles.secTitle}>{title}</Text>
    </View>
  ) : null;

// Renders one configurable section based on its visibleCount + image ratios.
const BudgetSection = ({ section, onOpen }: { section: any; onOpen: (link: string | undefined, filterId: any, title?: string) => void }) => {
  const images = Array.isArray(section?.images) ? section.images : [];
  if (images.length === 0) return null;

  const perRow = Math.max(1, Number(section?.visibleCount?.mobile) || 1);
  const fullBleed = perRow === 1;
  const itemW = fullBleed ? width : (width - PAD * 2 - GAP * (perRow - 1)) / perRow;
  // use the first image's ratio as the section ratio
  const ratioFrac = ratioToFraction(pickImage(images[0]).ratio);
  const itemH = Math.round(itemW * ratioFrac);

  return (
    <View style={{ marginTop: section?.title ? 6 : 14 }}>
      <SectionHeader title={section?.title} />
      <FlatList
        data={images}
        horizontal
        pagingEnabled={fullBleed}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={{ paddingHorizontal: fullBleed ? 0 : PAD, gap: GAP }}
        renderItem={({ item }) => {
          const { url, link, filterId } = pickImage(item);
          return (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => onOpen(link, filterId, section?.title)}
              style={{ width: itemW, height: itemH, borderRadius: fullBleed ? 0 : 12, overflow: 'hidden' }}
            >
              <SmartImage uri={absUrl(url)} style={{ width: itemW, height: itemH }} />
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const ProductTile = ({ item, onPress }: { item: any; onPress: () => void }) => (
  <TouchableOpacity style={styles.tile} activeOpacity={0.85} onPress={onPress}>
    <SmartImage uri={firstImage(item.ImagePath)} style={styles.tileImg} />
    <Text style={styles.tileName} numberOfLines={1}>{item.ITEMNAME}</Text>
    <Text style={styles.tilePrice}>{'₹'}{item.FinalAmount}</Text>
  </TouchableOpacity>
);

const Home = () => {
  const navigation = useNavigation<Nav>();
  const rate = useTodayRate();
  const budget = useBudgetBanners();
  const newArrivals = useNewArrivals();
  const trending = useTrending();
  const { cartCount } = useCart();
  const { favoritesCount } = useWishlist();

  // Ordered, visible-only sections from /budget-categories/getOnlyVisible
  const sections = useMemo(() => {
    const data = (budget.data as any)?.data ?? {};
    return Object.values<any>(data)
      .filter((s) => s && s.isVisible !== false)
      .sort((a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99));
  }, [budget.data]);

  const recentlyViewed = useRecentlyViewed();

  const arrivals = useMemo(() => asArray(newArrivals.data).slice(0, 10), [newArrivals.data]);
  const trend    = useMemo(() => asArray(trending.data).slice(0, 10),     [trending.data]);
  // No slice — show all items in horizontal scroll; full list on "See All" screen
  const recent = useMemo(() => {
    const raw = recentlyViewed.data as any;
    // Log once so we can see the real response shape in Metro / Expo console
    if (__DEV__ && raw) console.log('[RecentlyViewed] raw API response:', JSON.stringify(raw)?.slice(0, 400));
    if (!raw) return [];
    // Handle all common API response shapes
    if (Array.isArray(raw))           return raw;          // plain array
    if (Array.isArray(raw.data))      return raw.data;     // { data: [...] }
    if (Array.isArray(raw.products))  return raw.products; // { products: [...] }
    if (Array.isArray(raw.items))     return raw.items;    // { items: [...] }
    if (Array.isArray(raw.recentlyViewed)) return raw.recentlyViewed;
    return [];
  }, [recentlyViewed.data]);

  const onRefresh = () => {
    rate.refetch(); budget.refetch(); newArrivals.refetch();
    trending.refetch(); recentlyViewed.refetch();
  };
  const refreshing = rate.isRefetching || budget.isRefetching ||
    newArrivals.isRefetching || trending.isRefetching || recentlyViewed.isRefetching;

  const r: any = rate.data ?? {};
  const goGold = r.GOLDRATE ?? r.gold ?? r.goldRate;
  const goSilver = r.SILVERRATE ?? r.silver ?? r.silverRate;

  const openLink = (link: string | undefined, filterId: any, title?: string) => {
    const p = linkToParams(link, title);
    if (!p.itemId && !p.ItemName && !p.filterId && filterId != null) p.filterId = String(filterId);
    navigation.navigate("Products", p);
  };

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.topbar}>
        <Text style={styles.brand}>BMG <Text style={{ color: COLORS.secondary }}>Jewels</Text></Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Search')}>
            <Feather name="search" size={20} color={COLORS.title} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Wishlist')}>
            <Feather name="heart" size={20} color={COLORS.title} />
            {favoritesCount > 0 && <View style={styles.badge}><Text style={styles.badgeTxt}>{favoritesCount}</Text></View>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('MyCart')}>
            <Feather name="shopping-bag" size={20} color={COLORS.title} />
            {cartCount > 0 && <View style={styles.badge}><Text style={styles.badgeTxt}>{cartCount}</Text></View>}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: SIZES.TAB_BAR_HEIGHT }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {(goGold || goSilver) && (
          <View style={styles.rateStrip}>
            <Feather name="trending-up" size={15} color={COLORS.secondary} />
            <Text style={styles.rateTxt}>Today's Rate  —  Gold: {String(goGold ?? '-')}  |  Silver: {String(goSilver ?? '-')}</Text>
          </View>
        )}

        {/* Configurable home sections */}
        {sections.map((sec, i) => (
          <BudgetSection key={sec.imageKey ?? i} section={sec} onOpen={openLink} />
        ))}

        {arrivals.length > 0 && (
          <>
            <View style={styles.secHead}><Text style={styles.secTitle}>New Arrivals</Text></View>
            <FlatList
              data={arrivals} horizontal showsHorizontalScrollIndicator={false}
              keyExtractor={(it: any, i) => String(it.TAGKEY ?? i)}
              contentContainerStyle={styles.hList}
              renderItem={({ item }) => (
                <ProductTile item={item} onPress={() => navigation.navigate('ProductDetails', { tagKey: item.TAGKEY })} />
              )}
            />
          </>
        )}

        {trend.length > 0 && (
          <>
            <View style={styles.secHead}><Text style={styles.secTitle}>Trending Now</Text></View>
            <FlatList
              data={trend} horizontal showsHorizontalScrollIndicator={false}
              keyExtractor={(it: any, i) => String(it.TAGKEY ?? i)}
              contentContainerStyle={styles.hList}
              renderItem={({ item }) => (
                <ProductTile item={item} onPress={() => navigation.navigate('ProductDetails', { tagKey: item.TAGKEY })} />
              )}
            />
          </>
        )}

        {recent.length > 0 && (
          <>
            <View style={styles.secHead}>
              <Text style={styles.secTitle}>Recently Viewed</Text>
              <TouchableOpacity onPress={() => navigation.navigate('RecentlyViewed')}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={recent} horizontal showsHorizontalScrollIndicator={false}
              keyExtractor={(it: any, i) => String(it.TAGKEY ?? i)}
              contentContainerStyle={styles.hList}
              renderItem={({ item }) => (
                <ProductTile item={item} onPress={() => navigation.navigate('ProductDetails', { tagKey: item.TAGKEY })} />
              )}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9F6F1' },
  topbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: PAD, paddingVertical: 12, backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderColor,
  },
  brand: { ...FONTS.h4, fontFamily: 'MarcellusRegular', color: COLORS.title },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 4, right: 4, minWidth: 16, height: 16, borderRadius: 8,
    backgroundColor: COLORS.danger, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeTxt: { ...FONTS.fontXs, color: COLORS.white, fontSize: 9, fontWeight: '700' },
  rateStrip: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.primaryLight,
    paddingHorizontal: PAD, paddingVertical: 9 },
  rateTxt: { ...FONTS.fontSm, color: COLORS.title, flex: 1 },
  secHead: {
    paddingHorizontal: PAD, marginTop: 18, marginBottom: 8,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  secTitle: { ...FONTS.h5, fontFamily: 'MarcellusRegular', color: COLORS.title },
  seeAll: { ...FONTS.fontSm, color: COLORS.primary, ...FONTS.fontSemiBold },
  hList: { paddingHorizontal: PAD, gap: 12 },
  tile: { width: 140 },
  tileImg: { width: 140, height: 140, borderRadius: 12, backgroundColor: '#EDE8DF' },
  tileName: { ...FONTS.fontSm, ...FONTS.fontSemiBold, color: COLORS.title, marginTop: 6 },
  tilePrice: { ...FONTS.fontSm, color: COLORS.secondary },
});

export default Home;
