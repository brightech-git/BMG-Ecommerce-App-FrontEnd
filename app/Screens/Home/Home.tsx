// app/Screens/Home/Home.tsx
// Modern app-first Home — all sections driven from useBudgetBanners() + rate/product hooks.
// Categories  → budget.data.bmgWorld
// Budget      → budget.data.budget_banner
// Occasion    → budget.data.shopByOccasion
// Promo       → budget.data.heroBanner
import React, { useMemo, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  FlatList, Dimensions, StatusBar, RefreshControl, Linking, Image,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { FONTS, SIZES } from '../../constants/theme';
import { IMAGES } from '../../constants/Images';
import { useTheme, ThemeColors } from '../../context/ThemeContext';
import { useTodayRate } from '../../api/hooks/useRate';
import {
  useBudgetBanners, useNewArrivals, useTrending,
  useRecentlyViewed, useSuggestedProducts,
} from '../../api/hooks/useHome';
import { useCart } from '../../api/hooks/useCart';
import { useWishlist } from '../../api/hooks/useWishlist';
import { firstImage, absUrl } from '../../utils/image';
import { SmartImage } from '../../components/common/SmartImage';

const { width } = Dimensions.get('window');
const PAD = SIZES.padding;
const GAP = 12;
const BMG_SCHEME_URL = 'https://play.google.com/store/apps/details?id=com.bmg.bmgscheme';
type Nav = StackNavigationProp<RootStackParamList>;

/* ─── image helpers ────────────────────────────────────────────── */
const mobileUrl = (img: any): string | undefined => {
  if (!img) return undefined;
  if (img.isSingle) return absUrl(img.url);
  return absUrl(img.mobile?.url ?? img.desktop?.url);
};

const nameFromUrl = (url?: string): string => {
  if (!url) return '';
  const seg = (url.split('/').pop() ?? '').replace(/\.[^.]+$/, '');
  const clean = seg.replace(/^[0-9a-f-]{36}_/i, '');
  return clean.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

const parseLink = (link?: string, filterId?: string | number | null): Record<string, any> => {
  const p: Record<string, any> = {};
  if (filterId != null && filterId !== '') p.filterIds = Number(filterId);
  if (!link) return p;
  link.split('&').forEach((pair) => {
    const [k, v] = pair.split('=');
    if (!k || v === undefined) return;
    const key = k.trim(), val = decodeURIComponent(v.trim());
    if (key === 'itemName') p.ItemName = val;
    else if (key === 'itemId') p.itemId = val;
    else if (key === 'filterId') p.filterIds = Number(val);
    else p[key] = val;
  });
  return p;
};

const asArray = (d: any): any[] => {
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.products)) return d.products;
  if (Array.isArray(d?.items)) return d.items;
  return [];
};

/* ─── sub-components ───────────────────────────────────────────── */
const SecHeader = ({ title, onSeeAll, C }: { title: string; onSeeAll?: () => void; C: ThemeColors }) => (
  <View style={styles.secHead}>
    <Text style={[styles.secTitle, { color: C.title }]}>{title}</Text>
    {onSeeAll && (
      <TouchableOpacity onPress={onSeeAll}>
        <Text style={[styles.seeAll, { color: C.primary }]}>See All</Text>
      </TouchableOpacity>
    )}
  </View>
);

const CatChip = ({ img, C, onPress }: { img: any; C: ThemeColors; onPress: () => void }) => {
  const uri = mobileUrl(img);
  const name = nameFromUrl(img.isSingle ? img.url : (img.mobile?.url ?? img.desktop?.url));
  return (
    <TouchableOpacity style={styles.catWrap} activeOpacity={0.8} onPress={onPress}>
      <View style={[styles.catImg, { borderColor: C.borderColor }]}>
        {uri
          ? <SmartImage uri={uri} style={styles.catImgInner} />
          : <Feather name="star" size={22} color={C.primary} />}
      </View>
    </TouchableOpacity>
  );
};

const ImgCard = ({ img, size, C, onPress }: { img: any; size: number; C: ThemeColors; onPress: () => void }) => {
  const uri = mobileUrl(img);
  return (
    <TouchableOpacity
      style={[styles.imgCard, { width: size, height: size, backgroundColor: C.card }]}
      activeOpacity={0.88}
      onPress={onPress}
    >
      {uri
        ? <SmartImage uri={uri} style={{ width: size, height: size, borderRadius: 14 }} />
        : <View style={[styles.imgCardPlaceholder, { backgroundColor: C.borderColor }]} />}
    </TouchableOpacity>
  );
};

const ProductCard = ({ item, onPress, C }: { item: any; onPress: () => void; C: ThemeColors }) => {
  const img = firstImage(item.ImagePath);
  const hasOffer = item.OfferPercentage && item.OfferPercentage !== '0';
  return (
    <TouchableOpacity style={[styles.pCard, { backgroundColor: C.card }]} activeOpacity={0.88} onPress={onPress}>
      <View style={styles.pImgWrap}>
        <SmartImage uri={img} style={[styles.pImg, { backgroundColor: C.borderColor }]} />
        {hasOffer && (
          <View style={[styles.offerPill, { backgroundColor: C.danger }]}>
            <Text style={[styles.offerPillTxt, { color: C.white }]}>{item.OfferPercentage}% OFF</Text>
          </View>
        )}
      </View>
      <View style={styles.pInfo}>
        <Text style={[styles.pName, { color: C.title }]} numberOfLines={2}>{item.ITEMNAME}</Text>
        {!!item.SUBITEMNAME && (
          <Text style={[styles.pSub, { color: C.textLight }]} numberOfLines={1}>{item.SUBITEMNAME}</Text>
        )}
        <View style={styles.pPriceRow}>
          <Text style={[styles.pPrice, { color: C.primary }]}>{'₹'}{item.FinalAmount}</Text>
          {!!item.OriginalAmount && item.OriginalAmount !== item.FinalAmount && (
            <Text style={[styles.pOrig, { color: C.textLight }]}>{'₹'}{item.OriginalAmount}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

/* ─── main component ───────────────────────────────────────────── */
const Home = () => {
  const navigation = useNavigation<Nav>();
  const { colors: C } = useTheme();

  const user = useSelector((s: any) => s.auth?.user);
  const firstName = (user?.username || user?.name || '').split(' ')[0] || 'there';

  // Incremented on pull-to-refresh so all SmartImage components remount and retry
  const [refreshKey, setRefreshKey] = useState(0);

  const rate = useTodayRate();
  const budget = useBudgetBanners();
  const newArrivals = useNewArrivals();
  const trending = useTrending();
  const recentlyViewed = useRecentlyViewed();
  const suggested = useSuggestedProducts();
  const { cartCount } = useCart();
  const { favoritesCount } = useWishlist();

  const { cats, bmgTitle, budgetImgs, occasionImgs, heroImgs, offerImgs, offerBg, offerTitle, genderImgs, genderTitle } = useMemo(() => {
    const d = (budget.data as any)?.data ?? {};
    return {
      cats:         (d.bmgWorld?.images ?? []) as any[],
      bmgTitle:     (d.bmgWorld?.title ?? 'BMG World') as string,
      budgetImgs:   (d.budget_banner?.images ?? []) as any[],
      occasionImgs: (d.shopByOccasion?.images ?? []) as any[],
      heroImgs:     (d.heroBanner?.images ?? []).slice(0, 2) as any[],
      offerImgs:    (d.offerBanner?.images ?? []) as any[],
      offerBg:      (d.offerBanner?.backgroundColor ?? '#fef3db') as string,
      offerTitle:   (d.offerBanner?.title ?? 'Exclusive Offers') as string,
      genderImgs:   (d.ShopByGender?.images ?? []) as any[],
      genderTitle:  (d.ShopByGender?.title ?? 'Shop by Gender') as string,
    };
  }, [budget.data]);

  const arrivals = useMemo(() => asArray(newArrivals.data).slice(0, 12), [newArrivals.data]);
  const trend = useMemo(() => asArray(trending.data).slice(0, 12), [trending.data]);
  const recent = useMemo(() => {
    const raw = recentlyViewed.data as any;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw.data)) return raw.data;
    if (Array.isArray(raw.recentlyViewed)) return raw.recentlyViewed;
    return [];
  }, [recentlyViewed.data]);

  // useSuggestedProducts already returns grouped categories
  const suggestCats = suggested.categories ?? [];

  const rate_ = (rate.data ?? {}) as any;
  const goldRate = rate_.GOLDRATE ?? rate_.gold ?? rate_.goldRate;
  const silverRate = rate_.SILVERRATE ?? rate_.silver ?? rate_.silverRate;

  const onRefresh = useCallback(() => {
    rate.refetch(); budget.refetch();
    newArrivals.refetch(); trending.refetch(); recentlyViewed.refetch();
    setRefreshKey((k) => k + 1);
  }, [rate, budget, newArrivals, trending, recentlyViewed]);
  const refreshing = rate.isRefetching || budget.isRefetching ||
    newArrivals.isRefetching || trending.isRefetching || recentlyViewed.isRefetching;

  const navImg = (img: any) => {
    const link = img.isSingle ? img.link : (img.mobile?.link ?? img.desktop?.link ?? '');
    const fId = img.isSingle ? img.filterId : (img.mobile?.filterId ?? img.desktop?.filterId);
    navigation.navigate('Products', parseLink(link, fId));
  };

  const SIDE = (width - PAD * 2 - GAP) / 2.4;

  return (
    <View style={[styles.safe, { backgroundColor: C.background }]}>
      <StatusBar barStyle={C.statusBar} backgroundColor={C.card} />

      {/* ── Header ─────────────────────────────────────────────── */}
      <View style={[styles.header, { backgroundColor: C.card, borderBottomColor: C.borderColor }]}>
        {/* Notification — left */}
        {/* <TouchableOpacity style={[styles.iconBtn, { backgroundColor: C.background }]} onPress={() => navigation.navigate('Notification')}>
          <Feather name="bell" size={19} color={C.title} />
        </TouchableOpacity> */}

        {/* Logo + Greeting — centre */}
        <View style={styles.headerLeft}>
          <Image source={IMAGES.logo} style={styles.headerLogo} resizeMode="contain" />
          <View style={styles.headerGreeting}>
            <Text style={[styles.greeting, { color: C.textLight }]}>Hi, {firstName} {'👋'}</Text>
            <Text style={[styles.subGreeting, { color: C.title }]}>Find your perfect jewel</Text>
          </View>
        </View>

        {/* Wishlist + Menu — right */}
        <View style={styles.headerIcons}>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: C.background }]} onPress={() => navigation.navigate('Wishlist')}>
            <Feather name="heart" size={19} color={C.title} />
            {favoritesCount > 0 && <View style={[styles.badge, { backgroundColor: C.danger }]}><Text style={styles.badgeTxt}>{favoritesCount}</Text></View>}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: C.background }]}
            onPress={() => (navigation as any).openDrawer?.() ?? (navigation as any).getParent?.()?.openDrawer?.()}>
            <Feather name="menu" size={22} color={C.title} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: SIZES.TAB_BAR_HEIGHT + 10 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
      >
        {/* ── Search Bar ─────────────────────────────────────── */}
        <TouchableOpacity
          style={[styles.searchBar, { backgroundColor: C.input, borderColor: C.borderColor }]}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Search')}
        >
          <Feather name="search" size={16} color={C.textLight} />
          <Text style={[styles.searchPlaceholder, { color: C.placeholder }]}>Search rings, chains, bangles…</Text>
        </TouchableOpacity>

        {/* ── Gold & Silver Rate Card ─────────────────────────── */}
        {(goldRate || silverRate) && (
          <View style={[styles.rateCard, { backgroundColor: C.card }]}>
            <View style={styles.rateCardLeft}>
              <View style={[styles.rateIconWrap, { backgroundColor: 'rgba(201,177,93,0.15)' }]}>
                <MaterialCommunityIcons name="gold" size={22} color="#C9B15D" />
              </View>
              <View>
                <Text style={[styles.rateLabel, { color: C.textLight }]}>Gold (22K)</Text>
                <Text style={[styles.rateValue, { color: C.title }]}>
                  {'₹'}{String(goldRate ?? '—')}<Text style={[styles.rateUnit, { color: C.textLight }]}>/g</Text>
                </Text>
              </View>
            </View>
            <View style={[styles.rateDivider, { backgroundColor: C.borderColor }]} />
            <View style={styles.rateCardRight}>
              <View style={[styles.rateIconWrap, { backgroundColor: 'rgba(148,163,184,0.15)' }]}>
                <MaterialCommunityIcons name="shimmer" size={22} color="#94A3B8" />
              </View>
              <View>
                <Text style={[styles.rateLabel, { color: C.textLight }]}>Silver</Text>
                <Text style={[styles.rateValue, { color: C.title }]}>
                  {'₹'}{String(silverRate ?? '—')}<Text style={[styles.rateUnit, { color: C.textLight }]}>/g</Text>
                </Text>
              </View>
            </View>
            <View style={[styles.rateLiveChip, { backgroundColor: 'rgba(21,158,66,0.12)' }]}>
              <View style={styles.rateDot} />
              <Text style={[styles.rateLiveTxt, { color: '#159E42' }]}>Live</Text>
            </View>
          </View>
        )}


        {/* ── Promo Banners (heroBanner — max 2) ─────────────── */}
        {heroImgs.length > 0 && (
          <>
            <SecHeader title="Special Offers" C={C} />
            <FlatList
              data={heroImgs} horizontal showsHorizontalScrollIndicator={false}
              keyExtractor={(_, i) => String(i)}
              contentContainerStyle={{ paddingHorizontal: PAD, gap: GAP }}
              renderItem={({ item }: any) => {
                const uri = mobileUrl(item);
                const W = width - PAD * 2;
                return (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={{ width: W, height: W * 0.5, borderRadius: 16, overflow: 'hidden' }}
                    onPress={() => navImg(item)}
                  >
                    <SmartImage uri={uri} style={{ width: W, height: W * 0.5 }} />
                  </TouchableOpacity>
                );
              }}
            />
          </>
        )}

        {/* ── Categories (bmgWorld) ───────────────────────────── */}
        {cats.length > 0 && (
          <>
            <SecHeader title={bmgTitle} C={C} onSeeAll={() => navigation.navigate('Category')} />
            <FlatList
              data={cats} horizontal showsHorizontalScrollIndicator={false}
              keyExtractor={(_, i) => String(i)}
              contentContainerStyle={styles.catList}
              renderItem={({ item }: any) => (
                <CatChip img={item} C={C} onPress={() => navImg(item)} />
              )}
            />
          </>
        )}



        {/* ── Suggested for You — single mixed card ──────────── */}
        {suggestCats.length > 0 && (() => {
          // Pick first product from each category to make a mixed 2×2 (or 2×3) grid
          const mixed = suggestCats.map((cat: any) => ({
            ...cat.products[0],
            _cat: cat.name,
            _accent: cat.accentColor,
            _bg: cat.headerColor,
          })).filter(Boolean);
          return (
            <View style={[styles.suggestCard, { backgroundColor: C.card }]}>
              {/* Header */}
              <View style={styles.suggestCardHeader}>
                <Text style={[styles.suggestCardTitle, { color: C.title }]}>Suggested for You</Text>
                <TouchableOpacity
                  style={[styles.suggestArrow, { backgroundColor: C.primary }]}
                  onPress={() => navigation.navigate('Products', { title: 'Suggested for You' })}
                >
                  <Feather name="arrow-right" size={13} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* 2-column grid of mixed products */}
              <View style={styles.suggestGrid}>
                {mixed.map((product: any, idx: number) => {
                  const img = firstImage(product.ImagePath);
                  const hasOffer = product.OfferPercentage && product.OfferPercentage !== '0';
                  return (
                    <TouchableOpacity
                      key={product.TAGKEY ?? idx}
                      style={[styles.suggestCell, { backgroundColor: product._bg }]}
                      activeOpacity={0.87}
                      onPress={() => navigation.navigate('ProductDetails', { tagKey: product.TAGKEY })}
                    >
                      <View style={styles.suggestImgWrap}>
                        <SmartImage uri={img} style={styles.suggestImg} resizeMode="cover" />
                        {hasOffer && (
                          <View style={[styles.suggestBadge, { backgroundColor: product._accent }]}>
                            <Text style={styles.suggestBadgeTxt}>{product.OfferPercentage}% OFF</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.suggestCatLabel, { color: product._accent }]}>{product._cat}</Text>
                      <Text style={[styles.suggestItemName, { color: C.title }]} numberOfLines={1}>{product.ITEMNAME}</Text>
                      <Text style={[styles.suggestItemPrice, { color: product._accent }]}>{'₹'}{product.FinalAmount}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })()}

        {/* ── Shop by Budget ──────────────────────────────────── */}
        {budgetImgs.length > 0 && (
          <>
            <SecHeader title="Shop by Budget" C={C} />
            <FlatList
              data={budgetImgs} horizontal showsHorizontalScrollIndicator={false}
              keyExtractor={(_, i) => String(i)}
              contentContainerStyle={styles.imgList}
              renderItem={({ item }: any) => (
                <ImgCard img={item} size={SIDE} C={C} onPress={() => navImg(item)} />
              )}
            />
          </>
        )}

        {/* ── Savings / Scheme Card ──────────────────────────── */}
        <View style={styles.schemeOuter}>
          <LinearGradient
            colors={['#C9B15D', '#A0893A']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.schemeCard}
          >
            <View style={styles.schemeLeft}>
              <Text style={styles.schemeTag}>BMG DigiSilver</Text>
              <Text style={styles.schemeTitle}>Monthly Silver{'\n'}Savings Scheme</Text>
              <Text style={styles.schemeDesc}>Save as little as {'₹'}1,000/month{'\n'}and get jewellery worth more!</Text>
              <View style={styles.schemeBtns}>
                <TouchableOpacity style={styles.schemeBtnPrimary} onPress={() => Linking.openURL(BMG_SCHEME_URL)}>
                  <Text style={styles.schemeBtnPrimaryTxt}>Join Now</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.schemeBtnOutline} onPress={() => Linking.openURL(BMG_SCHEME_URL)}>
                  <Text style={styles.schemeBtnOutlineTxt}>Learn More</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.schemeRight}>
              <MaterialCommunityIcons name="gold" size={80} color="rgba(255,255,255,0.15)" />
              <MaterialCommunityIcons name="ring" size={40} color="rgba(255,255,255,0.25)"
                style={{ position: 'absolute', bottom: 8, right: 0 }} />
            </View>
          </LinearGradient>
        </View>

        {/* ── Shop by Occasion ────────────────────────────────── */}
        {occasionImgs.length > 0 && (
          <>
            <SecHeader title="Shop by Occasion" C={C} />
            <FlatList
              data={occasionImgs} horizontal showsHorizontalScrollIndicator={false}
              keyExtractor={(_, i) => String(i)}
              contentContainerStyle={styles.imgList}
              renderItem={({ item }: any) => (
                <ImgCard img={item} size={SIDE} C={C} onPress={() => navImg(item)} />
              )}
            />
          </>
        )}
           {/* ── Recently Viewed ─────────────────────────────────── */}
        {recent.length > 0 && (
          <>
            <SecHeader title="Recently Viewed" C={C} onSeeAll={() => navigation.navigate('RecentlyViewed')} />
            <FlatList
              data={recent} horizontal showsHorizontalScrollIndicator={false}
              keyExtractor={(it: any, i) => String(it.TAGKEY ?? i)}
              contentContainerStyle={styles.cardList}
              renderItem={({ item }) => (
                <ProductCard item={item} C={C} onPress={() => navigation.navigate('ProductDetails', { tagKey: item.TAGKEY })} />
              )}
            />
          </>
        )}

        {/* ── Offer Banner ───────────────────────────────────── */}
        {offerImgs.length > 0 && (
          <View style={[styles.offerSection]}>
            <SecHeader title={offerTitle} C={C} />
            <FlatList
              data={offerImgs} horizontal showsHorizontalScrollIndicator={false}
              keyExtractor={(_, i) => String(i)}
              contentContainerStyle={{ paddingHorizontal: PAD, gap: GAP, paddingBottom: 16 }}
              renderItem={({ item }: any) => {
                const uri = mobileUrl(item);
                const W = width - PAD * 2;
                return (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={{ width: W, height: W * 0.45, borderRadius: 16, overflow: 'hidden' }}
                    onPress={() => navImg(item)}
                  >
                    <SmartImage uri={uri} style={{ width: W, height: W * 0.45 }} />
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        )}

        {/* ── Shop by Gender ─────────────────────────────────── */}
        {genderImgs.length > 0 && (
          <>
            <SecHeader title={genderTitle} C={C} />
            <View style={styles.genderGrid}>
              {genderImgs.map((item: any, i: number) => {
                const uri = mobileUrl(item);
                const W = (width - PAD * 2 - GAP) / 2;
                return (
                  <TouchableOpacity
                    key={i}
                    activeOpacity={0.88}
                    style={{ width: W, height: W, borderRadius: 14, overflow: 'hidden' }}
                    onPress={() => navImg(item)}
                  >
                    <SmartImage uri={uri} style={{ width: W, height: W }} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* ── New Arrivals ────────────────────────────────────── */}
        {arrivals.length > 0 && (
          <>
            <SecHeader title="New Arrivals" C={C} onSeeAll={() => navigation.navigate('Products', { title: 'New Arrivals' })} />
            <FlatList
              data={arrivals} horizontal showsHorizontalScrollIndicator={false}
              keyExtractor={(it: any, i) => String(it.TAGKEY ?? i)}
              contentContainerStyle={styles.cardList}
              renderItem={({ item }) => (
                <ProductCard item={item} C={C} onPress={() => navigation.navigate('ProductDetails', { tagKey: item.TAGKEY })} />
              )}
            />
          </>
        )}

        {/* ── Trending Designs ────────────────────────────────── */}
        {trend.length > 0 && (
          <>
            <SecHeader title="Trending Designs" C={C} onSeeAll={() => navigation.navigate('Products', { title: 'Trending' })} />
            <FlatList
              data={trend} horizontal showsHorizontalScrollIndicator={false}
              keyExtractor={(it: any, i) => String(it.TAGKEY ?? i)}
              contentContainerStyle={styles.cardList}
              renderItem={({ item }) => (
                <ProductCard item={item} C={C} onPress={() => navigation.navigate('ProductDetails', { tagKey: item.TAGKEY })} />
              )}
            />
          </>
        )}






     
      </ScrollView>
    </View>
  );
};

/* ─── styles ───────────────────────────────────────────────────── */
const CARD_W = 155;
const CAT_W = 100;
const SG_IMG = 88;   // suggested mini product image height

const styles = StyleSheet.create({
  safe: { flex: 1 },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: PAD, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  headerLogo: { width: 44, height: 44, borderRadius: 10 },
  headerGreeting: { flexShrink: 1 },
  greeting: { ...FONTS.fontXs, letterSpacing: 0.3 },
  subGreeting: { ...FONTS.fontSm, ...FONTS.fontSemiBold, marginTop: 1 },
  headerIcons: { flexDirection: 'row', gap: 6 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 0, right: 0, width: 15, height: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  badgeTxt: { fontSize: 8, fontWeight: '800', color: '#fff' },

  // Search bar
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: PAD, marginTop: 14, marginBottom: 4, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 14, borderWidth: 1 },
  searchPlaceholder: { ...FONTS.fontSm, flex: 1 },

  // Rate card
  rateCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: PAD, marginTop: 16, borderRadius: 18, padding: 16, elevation: 3, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, position: 'relative' },
  rateCardLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  rateCardRight: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  rateDivider: { width: 1, height: 36, marginHorizontal: 12 },
  rateIconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  rateLabel: { ...FONTS.fontXs, marginBottom: 2 },
  rateValue: { ...FONTS.h6, ...FONTS.fontBold },
  rateUnit: { ...FONTS.fontXs, ...FONTS.fontSemiBold },
  rateLiveChip: { position: 'absolute', top: 10, right: 12, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  rateDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#159E42' },
  rateLiveTxt: { ...FONTS.fontXs, fontWeight: '700' },

  // Section header
  secHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: PAD, paddingTop: 22, paddingBottom: 10 },
  secTitle: { ...FONTS.h6, ...FONTS.fontSemiBold },
  seeAll: { ...FONTS.fontSm, ...FONTS.fontSemiBold },

  // Category chips (bmgWorld)
  catList: { paddingHorizontal: PAD, gap: 10 },
  catWrap: { alignItems: 'center', width: CAT_W },
  catImg: { width: 88, height: 88, borderRadius: 44, borderWidth: 1.5, overflow: 'hidden', marginBottom: 6 },
  catImgInner: { width: 88, height: 88 },
  catName: { ...FONTS.fontSm, textAlign: 'center', lineHeight: 16 },

  // Image cards (budget / occasion)
  imgList: { paddingHorizontal: PAD, gap: GAP },
  imgCard: { borderRadius: 14, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  imgCardPlaceholder: { flex: 1 },

  // Standard product cards (New Arrivals, Trending, Recently Viewed)
  cardList: { paddingHorizontal: PAD, gap: GAP },
  pCard: { width: CARD_W, borderRadius: 16, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  pImgWrap: { position: 'relative' },
  pImg: { width: CARD_W, height: CARD_W },
  offerPill: { position: 'absolute', top: 8, left: 8, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  offerPillTxt: { ...FONTS.fontXs, fontWeight: '700' },
  pInfo: { padding: 10, gap: 3 },
  pName: { ...FONTS.fontSm, ...FONTS.fontSemiBold, lineHeight: 17 },
  pSub: { ...FONTS.fontXs },
  pPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  pPrice: { ...FONTS.font, ...FONTS.fontBold },
  pOrig: { ...FONTS.fontXs, textDecorationLine: 'line-through' },

  // Suggested for You — single mixed card
  suggestCard: { marginHorizontal: PAD, marginTop: 6, borderRadius: 16, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  suggestCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12 },
  suggestCardTitle: { ...FONTS.h6, ...FONTS.fontBold },
  suggestArrow: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  suggestGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10, paddingBottom: 10, gap: 10 },
  suggestCell: { width: '47%', borderRadius: 12, overflow: 'hidden', padding: 10, flexGrow: 1 },
  suggestImgWrap: { width: '100%', borderRadius: 8, overflow: 'hidden' },
  suggestImg: { width: '100%', height: 120, borderRadius: 8 },
  suggestBadge: { position: 'absolute', top: 4, left: 4, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
  suggestBadgeTxt: { ...FONTS.fontXs, fontWeight: '800', color: '#fff' },
  suggestCatLabel: { ...FONTS.fontXs, fontWeight: '700', marginTop: 6, letterSpacing: 0.3 },
  suggestItemName: { ...FONTS.fontXs, ...FONTS.fontSemiBold, marginTop: 2, lineHeight: 14, color: '#444' },
  suggestItemPrice: { ...FONTS.fontSm, ...FONTS.fontBold, marginTop: 3 },

  // Offer banner section
  offerSection: { marginTop: 22, paddingTop: 4, paddingBottom: 4 },

  // Shop by Gender grid
  genderGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: PAD, gap: GAP, marginBottom: 4 },

  // Savings scheme card
  schemeOuter: { marginHorizontal: PAD, marginTop: 22, borderRadius: 20, overflow: 'hidden', elevation: 4, shadowColor: '#C9B15D', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  schemeCard: { flexDirection: 'row', padding: 22, minHeight: 170 },
  schemeLeft: { flex: 1 },
  schemeRight: { width: 90, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  schemeTag: { fontSize: 9, fontWeight: '800', color: 'rgba(255,255,255,0.7)', letterSpacing: 1.5, marginBottom: 6 },
  schemeTitle: { ...FONTS.h5, ...FONTS.fontBold, color: '#fff', lineHeight: 26, marginBottom: 8 },
  schemeDesc: { ...FONTS.fontSm, color: 'rgba(255,255,255,0.8)', lineHeight: 18, marginBottom: 16 },
  schemeBtns: { flexDirection: 'row', gap: 10 },
  schemeBtnPrimary: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  schemeBtnPrimaryTxt: { ...FONTS.fontSm, ...FONTS.fontBold, color: '#A0893A' },
  schemeBtnOutline: { borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.6)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  schemeBtnOutlineTxt: { ...FONTS.fontSm, ...FONTS.fontSemiBold, color: '#fff' },
});

export default Home;