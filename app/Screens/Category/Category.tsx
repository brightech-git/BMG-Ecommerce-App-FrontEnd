// app/Screens/Category/Category.tsx
// Shows the bmgWorld categories from /budget-categories/getOnlyVisible —
// the same data source used in the Home screen category section.
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
import { useBudgetBanners } from '../../api/hooks/useHome';
import { absUrl } from '../../utils/image';
import { SmartImage } from '../../components/common/SmartImage';
import { Loader, EmptyState, ErrorState } from '../../components/common/StateViews';
import { CartWishlistBadge } from '../../components/common/CartWishlistBadge';

const { width } = Dimensions.get('window');
const GAP    = 12;
const COLS   = 2;
const CARD_W = (width - SIZES.padding * 2 - GAP) / COLS;

type Nav = StackNavigationProp<RootStackParamList>;

/* ── same helpers as Home.tsx ──────────────────────────────────── */
const mobileUrl = (img: any): string | undefined => {
  if (!img) return undefined;
  if (img.isSingle) return absUrl(img.url);
  return absUrl(img.mobile?.url ?? img.desktop?.url);
};

const nameFromUrl = (url?: string): string => {
  if (!url) return '';
  const seg   = (url.split('/').pop() ?? '').replace(/\.[^.]+$/, '');
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
    if (key === 'itemName')      p.ItemName  = val;
    else if (key === 'itemId')   p.itemId    = val;
    else if (key === 'filterId') p.filterIds = Number(val);
    else                         p[key]      = val;
  });
  return p;
};

/* ── component ─────────────────────────────────────────────────── */
const Category = () => {
  const navigation   = useNavigation<Nav>();
  const { colors: C } = useTheme();
  const { data, isLoading, isError, error, refetch } = useBudgetBanners();

  const items: any[] = useMemo(() => {
    const d = (data as any)?.data ?? {};
    return (d.bmgWorld?.images ?? []) as any[];
  }, [data]);

  const navItem = (img: any) => {
    const link   = img.isSingle ? img.link : (img.mobile?.link   ?? img.desktop?.link   ?? '');
    const fId    = img.isSingle ? img.filterId : (img.mobile?.filterId ?? img.desktop?.filterId);
    const rawUrl = img.isSingle ? img.url : (img.mobile?.url ?? img.desktop?.url);
    const params = parseLink(link, fId);
    if (!params.itemId && !params.ItemName && !params.filterIds) return;
    const title  = nameFromUrl(rawUrl);
    navigation.navigate('Products', { ...params, title });
  };

  return (
    <View style={[styles.safe, { backgroundColor: C.background }]}>
      <StatusBar barStyle={C.statusBar} backgroundColor={C.card} />

      <View style={[styles.header, { backgroundColor: C.card, borderBottomColor: C.borderColor }]}>
        {navigation.canGoBack() && (
          <TouchableOpacity style={styles.hBtn} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={22} color={C.title} />
          </TouchableOpacity>
        )}
        <Text style={[styles.hTitle, { color: C.title }]}>BMG World</Text>
        <TouchableOpacity style={styles.hBtn} onPress={() => navigation.navigate('Search')}>
          <Feather name="search" size={20} color={C.title} />
        </TouchableOpacity>
        <CartWishlistBadge />
      </View>

      {isLoading ? (
        <Loader message="Loading categories..." />
      ) : isError ? (
        <ErrorState message={(error as any)?.message} onRetry={refetch} />
      ) : items.length === 0 ? (
        <EmptyState icon="grid" title="No categories" subtitle="Please check back soon." />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(_, i) => String(i)}
          numColumns={COLS}
          contentContainerStyle={{ padding: SIZES.padding, paddingBottom: SIZES.TAB_BAR_HEIGHT + 10 }}
          columnWrapperStyle={{ gap: GAP, marginBottom: GAP }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }: any) => {
            const uri  = mobileUrl(item);
            const name = nameFromUrl(item.isSingle ? item.url : (item.mobile?.url ?? item.desktop?.url));
            return (
              <TouchableOpacity
                style={[styles.card, { width: CARD_W, backgroundColor: C.card }]}
                activeOpacity={0.85}
                onPress={() => navItem(item)}
              >
                <SmartImage uri={uri} style={[styles.img, { backgroundColor: C.borderColor }]} />
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  safe:       { flex: 1 },
  header:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1 },
  hBtn:       { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  hTitle:     { flex: 1, ...FONTS.h5, ...FONTS.fontSemiBold },
  card:       { borderRadius: 14, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  img:        { width: '100%', height: CARD_W },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, borderTopWidth: StyleSheet.hairlineWidth },
  cardTitle:  { ...FONTS.fontSm, ...FONTS.fontSemiBold, flex: 1 },
});

export default Category;
