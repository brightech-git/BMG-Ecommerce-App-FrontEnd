// app/Screens/Home/Home.tsx
import React, { useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  FlatList, Dimensions, StatusBar, RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { FONTS, SIZES } from '../../constants/theme';
import { useTheme, ThemeColors } from '../../context/ThemeContext';
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

const ratioToFraction = (ratio?: string): number => {
  if (!ratio || typeof ratio !== 'string') return 1;
  const [w, h] = ratio.split('/').map(Number);
  if (!w || !h) return 1;
  return h / w;
};

const pickImage = (img: any): { url?: string; link?: string; ratio?: string; filterId?: any } => {
  if (!img) return {};
  if (img.isSingle && img.url) return { url: img.url, link: img.link, ratio: img.ratio, filterId: img.filterId };
  const v = img.mobile || img.desktop || img;
  return { url: v.url ?? img.url, link: v.link ?? img.link, ratio: v.ratio ?? img.ratio, filterId: v.filterId ?? img.filterId };
};

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

const BudgetSection = ({
  section, onOpen,
}: {
  section: any;
  onOpen: (link: string | undefined, filterId: any, title?: string) => void;
}) => {
  const images = Array.isArray(section?.images) ? section.images : [];
  if (images.length === 0) return null;
  const perRow    = Math.max(1, Number(section?.visibleCount?.mobile) || 1);
  const fullBleed = perRow === 1;
  const itemW     = fullBleed ? width : (width - PAD * 2 - GAP * (perRow - 1)) / perRow;
  const ratioFrac = ratioToFraction(pickImage(images[0]).ratio);
  const itemH     = Math.round(itemW * ratioFrac);
  return (
    <View style={{ marginTop: section?.title ? 6 : 14 }}>
      {!!section?.title && (
        <View style={styles.secHead}>
          <Text style={styles.secTitle}>{section.title}</Text>
        </View>
      )}
      <FlatList
        data={images} horizontal pagingEnabled={fullBleed}
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

const ProductTile = ({ item, onPress, C }: { item: any; onPress: () => void; C: ThemeColors }) => (
  <TouchableOpacity style={[styles.tile, { backgroundColor: C.card }]} activeOpacity={0.85} onPress={onPress}>
    <SmartImage uri={firstImage(item.ImagePath)} style={[styles.tileImg, { backgroundColor: C.borderColor }]} />
    <Text style={[styles.tileName, { color: C.title }]} numberOfLines={1}>{item.ITEMNAME}</Text>
    <Text style={[styles.tilePrice, { color: C.primary }]}>{'\u20b9'}{item.FinalAmount}</Text>
  </TouchableOpacity>
);

const Home = () => {
  const navigation = useNavigation<Nav>();
  const { colors: C } = useTheme();
  const rate         = useTodayRate();
  const budget       = useBudgetBanners();
  const newArrivals  = useNewArrivals();
  const trending     = useTrending();
  const { cartCount }      = useCart();
  const { favoritesCount } = useWishlist();
  const recentlyViewed     = useRecentlyViewed();

  const sections = useMemo(() => {
    const data = (budget.data as any)?.data ?? {};
    return Object.values<any>(data)
      .filter((s) => s && s.isVisible !== false)
      .sort((a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99));
  }, [budget.data]);

  const arrivals = useMemo(() => asArray(newArrivals.data).slice(0, 10), [newArrivals.data]);
  const trend    = useMemo(() => asArray(trending.data).slice(0, 10), [trending.data]);

  const recent = useMemo(() => {
    const raw = recentlyViewed.data as any;
    if (!raw) return [];
    if (Array.isArray(raw))                return raw;
    if (Array.isArray(raw.data))           return raw.data;
    if (Array.isArray(raw.products))       return raw.products;
    if (Array.isArray(raw.items))          return raw.items;
    if (Array.isArray(raw.recentlyViewed)) return raw.recentlyViewed;
    return [];
  }, [recentlyViewed.data]);

  const onRefresh = () => {
    rate.refetch(); budget.refetch(); newArrivals.refetch();
    trending.refetch(); recentlyViewed.refetch();
  };
  const refreshing =
    rate.isRefetching || budget.isRefetching ||
    newArrivals.isRefetching || trending.isRefetching || recentlyViewed.isRefetching;

  const r: any   = rate.data ?? {};
  const goGold   = r.GOLDRATE ?? r.gold ?? r.goldRate;
  const goSilver = r.SILVERRATE ?? r.silver ?? r.silverRate;

  const openLink = (link: string | undefined, filterId: any, title?: string) => {
    const p = linkToParams(link, title);
    if (!p.itemId && !p.ItemName && !p.filterId && filterId != null) p.filterId = String(filterId);
    navigation.navigate('Products', p);
  };

  return (
    <View style={[styles.safe, { backgroundColor: C.background }]}>
      <StatusBar barStyle={C.statusBar} backgroundColor={C.card} />

      <View style={[styles.topbar, { backgroundColor: C.card, borderBottomColor: C.borderColor }]}>
        <Text style={[styles.brand, { color: C.title }]}>
          BMG <Text style={{ color: C.secondary }}>Jewels</Text>
        </Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Search')}>
            <Feather name="search" size={20} color={C.title} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Wishlist')}>
            <Feather name="heart" size={20} color={C.title} />
            {favoritesCount > 0 && (
              <View style={[styles.badge, { backgroundColor: C.danger }]}>
                <Text style={[styles.badgeTxt, { color: C.white }]}>{favoritesCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('MyCart')}>
            <Feather name="shopping-bag" size={20} color={C.title} />
            {cartCount > 0 && (
              <View style={[styles.badge, { backgroundColor: C.primary }]}>
                <Text style={[styles.badgeTxt, { color: C.white }]}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: SIZES.TAB_BAR_HEIGHT }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
      >
        {(goGold || goSilver) && (
          <View style={[styles.rateStrip, { backgroundColor: C.primaryLight }]}>
            <Feather name="trending-up" size={15} color={C.secondary} />
            <Text style={[styles.rateTxt, { color: C.text }]}>
              {"Today's Rate  —  Gold: "}{String(goGold ?? '-')}{"  |  Silver: "}{String(goSilver ?? '-')}
            </Text>
          </View>
        )}

        {sections.map((sec, i) => (
          <BudgetSection key={sec.imageKey ?? i} section={sec} onOpen={openLink} />
        ))}

        {arrivals.length > 0 && (
          <>
            <View style={styles.secHead}>
              <Text style={[styles.secTitle, { color: C.title }]}>New Arrivals</Text>
            </View>
            <FlatList
              data={arrivals} horizontal showsHorizontalScrollIndicator={false}
              keyExtractor={(it: any, i) => String(it.TAGKEY ?? i)}
              contentContainerStyle={styles.hList}
              renderItem={({ item }) => (
                <ProductTile item={item} C={C} onPress={() => navigation.navigate('ProductDetails', { tagKey: item.TAGKEY })} />
              )}
            />
          </>
        )}

        {trend.length > 0 && (
          <>
            <View style={styles.secHead}>
              <Text style={[styles.secTitle, { color: C.title }]}>Trending Now</Text>
            </View>
            <FlatList
              data={trend} horizontal showsHorizontalScrollIndicator={false}
              keyExtractor={(it: any, i) => String(it.TAGKEY ?? i)}
              contentContainerStyle={styles.hList}
              renderItem={({ item }) => (
                <ProductTile item={item} C={C} onPress={() => navigation.navigate('ProductDetails', { tagKey: item.TAGKEY })} />
              )}
            />
          </>
        )}

        {recent.length > 0 && (
          <>
            <View style={styles.secHead}>
              <Text style={[styles.secTitle, { color: C.title }]}>Recently Viewed</Text>
              <TouchableOpacity onPress={() => navigation.navigate('RecentlyViewed')}>
                <Text style={[styles.seeAll, { color: C.primary }]}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={recent} horizontal showsHorizontalScrollIndicator={false}
              keyExtractor={(it: any, i) => String(it.TAGKEY ?? i)}
              contentContainerStyle={styles.hList}
              renderItem={({ item }) => (
                <ProductTile item={item} C={C} onPress={() => navigation.navigate('ProductDetails', { tagKey: item.TAGKEY })} />
              )}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
};

const TILE_W = 140;

const styles = StyleSheet.create({
  safe:    { flex: 1 },
  topbar:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: PAD, paddingVertical: 12, borderBottomWidth: 1 },
  brand:   { ...FONTS.h5, ...FONTS.fontSemiBold },
  iconBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  badge:   { position: 'absolute', top: 4, right: 2, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  badgeTxt:  { fontSize: 9, fontWeight: '700' },
  rateStrip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: PAD, paddingVertical: 10 },
  rateTxt:   { ...FONTS.fontSm, flex: 1 },
  secHead:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: PAD, paddingTop: 20, paddingBottom: 8 },
  secTitle:  { ...FONTS.h6, ...FONTS.fontSemiBold },
  seeAll:    { ...FONTS.fontSm, ...FONTS.fontSemiBold },
  hList:     { paddingHorizontal: PAD, gap: GAP },
  tile:      { width: TILE_W, borderRadius: 12, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  tileImg:   { width: TILE_W, height: TILE_W },
  tileName:  { ...FONTS.fontSm, ...FONTS.fontSemiBold, padding: 8, paddingBottom: 2 },
  tilePrice: { ...FONTS.fontSm, ...FONTS.fontBold, paddingHorizontal: 8, paddingBottom: 8 },
});

export default Home;
