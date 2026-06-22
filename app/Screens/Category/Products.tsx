// app/Screens/Category/Products.tsx
import React, { useCallback, useMemo, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, StatusBar,
  Modal, ScrollView, SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { FONTS } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { useProductListing } from '../../api/hooks/useProducts';
import { ProductList, toCardItem, ViewMode } from '../../components/ProductCard/ProductCard';
import { Loader, EmptyState, ErrorState } from '../../components/common/StateViews';
import { CartWishlistBadge } from '../../components/common/CartWishlistBadge';
import { MaterialCommunityIcons } from '@expo/vector-icons';
type Props = StackScreenProps<RootStackParamList, 'Products'>;

/* ─── Types ─────────────────────────────────────────────────────── */
type SortValue = 'priceLowToHigh' | 'priceHighToLow' | '';

type ActiveFilters = {
  gender?: string;
  metalType?: string;
  priceRange?: string;
  availability?: string;
  occasion?: string;
  discountRange?: string;
};

const EMPTY_FILTERS: ActiveFilters = {};

/* ─── Options ───────────────────────────────────────────────────── */
const SORT_OPTS: { label: string; value: SortValue }[] = [
  { label: 'Price: Low → High', value: 'priceLowToHigh' },
  { label: 'Price: High → Low', value: 'priceHighToLow' },
];

const GENDER_OPTS   = ['Men', 'Women', 'Kids', 'Unisex'];
const METAL_OPTS    = ['Gold', 'Silver', 'Platinum', 'Diamond'];
const AVAIL_OPTS    = ['All', 'In Stock'];

const PRICE_OPTS = [
  { label: 'Under ₹5K',    value: '0-5000' },
  { label: '₹5K – ₹15K',  value: '5000-15000' },
  { label: '₹15K – ₹50K', value: '15000-50000' },
  { label: '₹50K – ₹1L',  value: '50000-100000' },
  { label: 'Above ₹1L',   value: '100000-10000000' },
];

const OCCASION_OPTS = [
  'Anniversary', 'Engagement', 'Baby Shower', 'Wedding',
  'Naming Ceremony', 'Housewarming', 'Festival Gifts', 'Daily Wear',
];

const DISCOUNT_OPTS = [
  { label: '5% & above',  value: '5-100' },
  { label: '10% & above', value: '10-100' },
  { label: '20% & above', value: '20-100' },
];

const PRICE_LBL    = Object.fromEntries(PRICE_OPTS.map(p => [p.value, p.label]));
const DISCOUNT_LBL = Object.fromEntries(DISCOUNT_OPTS.map(d => [d.value, d.label]));
const SORT_LBL: Record<string, string> = {
  priceLowToHigh: 'Price ↑',
  priceHighToLow: 'Price ↓',
};

/* ─── Chip ──────────────────────────────────────────────────────── */
type ChipP = { label: string; active: boolean; onPress: () => void; primary: string; title: string; faint: string };
const Chip = ({ label, active, onPress, primary, title, faint }: ChipP) => (
  <TouchableOpacity
    activeOpacity={0.75} onPress={onPress}
    style={[cs.chip, active ? { backgroundColor: primary, borderColor: primary } : { borderColor: faint }]}
  >
    <Text style={[cs.lbl, { color: active ? '#fff' : title }]}>{label}</Text>
  </TouchableOpacity>
);
const cs = StyleSheet.create({
  chip: { paddingHorizontal: 13, paddingVertical: 7, borderRadius: 20, borderWidth: 1, marginRight: 8, marginBottom: 8 },
  lbl:  { ...FONTS.fontSm, fontWeight: '600' },
});

/* ─── Sort sheet ────────────────────────────────────────────────── */
type SortSheetP = { visible: boolean; value: SortValue; onChange: (v: SortValue) => void; onClose: () => void; C: any };
const SortSheet = ({ visible, value, onChange, onClose, C }: SortSheetP) => (
  <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
    <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' }} activeOpacity={1} onPress={onClose}>
      <View style={{ flex: 1 }} />
      <SafeAreaView style={[shs.sheet, { backgroundColor: C.background }]}>
        <View style={[shs.hdr, { borderBottomColor: C.borderColor }]}>
          <Text style={[shs.title, { color: C.title }]}>Sort By</Text>
          <TouchableOpacity style={shs.closeBtn} onPress={onClose}>
            <Feather name="x" size={20} color={C.title} />
          </TouchableOpacity>
        </View>
        {/* Default / clear option */}
        <TouchableOpacity
          style={shs.row} activeOpacity={0.7}
          onPress={() => { onChange(''); onClose(); }}
        >
          <View style={[shs.radio, { borderColor: !value ? C.primary : C.textLight }]}>
            {!value && <View style={[shs.dot, { backgroundColor: C.primary }]} />}
          </View>
          <Text style={[shs.lbl, { color: C.title }]}>Relevance (default)</Text>
        </TouchableOpacity>
        {SORT_OPTS.map(opt => (
          <TouchableOpacity
            key={opt.value} style={shs.row} activeOpacity={0.7}
            onPress={() => { onChange(opt.value); onClose(); }}
          >
            <View style={[shs.radio, { borderColor: value === opt.value ? C.primary : C.textLight }]}>
              {value === opt.value && <View style={[shs.dot, { backgroundColor: C.primary }]} />}
            </View>
            <Text style={[shs.lbl, { color: C.title }]}>{opt.label}</Text>
            {value === opt.value && <Feather name="check" size={16} color={C.primary} />}
          </TouchableOpacity>
        ))}
        <View style={{ height: 16 }} />
      </SafeAreaView>
    </TouchableOpacity>
  </Modal>
);
const shs = StyleSheet.create({
  sheet:    { borderTopLeftRadius: 22, borderTopRightRadius: 22 },
  hdr:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  title:    { ...FONTS.h6, ...FONTS.fontSemiBold, flex: 1 },
  closeBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  row:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 14 },
  radio:    { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  dot:      { width: 10, height: 10, borderRadius: 5 },
  lbl:      { ...FONTS.font, flex: 1 },
});

/* ─── Filter sheet ──────────────────────────────────────────────── */
type FilterSheetP = {
  visible: boolean; draft: ActiveFilters;
  onChange: (f: ActiveFilters) => void;
  onApply: () => void; onReset: () => void; onClose: () => void; C: any;
};
const FilterSheet = ({ visible, draft, onChange, onApply, onReset, onClose, C }: FilterSheetP) => {
  const count = Object.values(draft).filter(Boolean).length;
  const faint = C.textLight + '55';
  const toggle = (key: keyof ActiveFilters, val: string) =>
    onChange({ ...draft, [key]: draft[key] === val ? undefined : val });

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' }}>
        <SafeAreaView style={[fs.sheet, { backgroundColor: C.background }]}>

          <View style={[fs.hdr, { borderBottomColor: C.borderColor }]}>
            <Text style={[fs.title, { color: C.title }]}>Filters</Text>
            {count > 0 && (
              <View style={[fs.badge, { backgroundColor: C.primary }]}>
                <Text style={fs.badgeTxt}>{count}</Text>
              </View>
            )}
            <TouchableOpacity style={fs.closeBtn} onPress={onClose}>
              <Feather name="x" size={20} color={C.title} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={fs.body}>

            <Text style={[fs.sec, { color: C.textLight }]}>GENDER</Text>
            <View style={fs.chips}>
              {GENDER_OPTS.map(g => (
                <Chip key={g} label={g} active={draft.gender === g}
                  onPress={() => toggle('gender', g)}
                  primary={C.primary} title={C.title} faint={faint} />
              ))}
            </View>

            <View style={[fs.div, { backgroundColor: C.borderColor }]} />

            <Text style={[fs.sec, { color: C.textLight }]}>METAL TYPE</Text>
            <View style={fs.chips}>
              {METAL_OPTS.map(m => (
                <Chip key={m} label={m} active={draft.metalType === m}
                  onPress={() => toggle('metalType', m)}
                  primary={C.primary} title={C.title} faint={faint} />
              ))}
            </View>

            <View style={[fs.div, { backgroundColor: C.borderColor }]} />

            <Text style={[fs.sec, { color: C.textLight }]}>PRICE RANGE</Text>
            <View style={fs.chips}>
              {PRICE_OPTS.map(p => (
                <Chip key={p.value} label={p.label} active={draft.priceRange === p.value}
                  onPress={() => toggle('priceRange', p.value)}
                  primary={C.primary} title={C.title} faint={faint} />
              ))}
            </View>

            <View style={[fs.div, { backgroundColor: C.borderColor }]} />

            <Text style={[fs.sec, { color: C.textLight }]}>OCCASION</Text>
            <View style={fs.chips}>
              {OCCASION_OPTS.map(o => (
                <Chip key={o} label={o} active={draft.occasion === o}
                  onPress={() => toggle('occasion', o)}
                  primary={C.primary} title={C.title} faint={faint} />
              ))}
            </View>

            <View style={[fs.div, { backgroundColor: C.borderColor }]} />

            <Text style={[fs.sec, { color: C.textLight }]}>DISCOUNT</Text>
            <View style={fs.chips}>
              {DISCOUNT_OPTS.map(d => (
                <Chip key={d.value} label={d.label} active={draft.discountRange === d.value}
                  onPress={() => toggle('discountRange', d.value)}
                  primary={C.primary} title={C.title} faint={faint} />
              ))}
            </View>

            <View style={[fs.div, { backgroundColor: C.borderColor }]} />

            <Text style={[fs.sec, { color: C.textLight }]}>AVAILABILITY</Text>
            <View style={fs.chips}>
              {AVAIL_OPTS.map(a => (
                <Chip key={a} label={a}
                  active={a === 'All' ? !draft.availability : draft.availability === a}
                  onPress={() => onChange({ ...draft, availability: a === 'All' ? undefined : a })}
                  primary={C.primary} title={C.title} faint={faint} />
              ))}
            </View>

          </ScrollView>

          <View style={[fs.footer, { borderTopColor: C.borderColor, backgroundColor: C.background }]}>
            <TouchableOpacity style={[fs.resetBtn, { borderColor: C.borderColor }]} onPress={onReset}>
              <Text style={[fs.resetTxt, { color: C.textLight }]}>Reset All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[fs.applyBtn, { backgroundColor: C.primary }]} onPress={onApply}>
              <Text style={fs.applyTxt}>Apply</Text>
            </TouchableOpacity>
          </View>

        </SafeAreaView>
      </View>
    </Modal>
  );
};
const fs = StyleSheet.create({
  sheet:    { borderTopLeftRadius: 22, borderTopRightRadius: 22, maxHeight: '92%' },
  hdr:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14, borderBottomWidth: 1 },
  title:    { ...FONTS.h6, ...FONTS.fontSemiBold, flex: 1 },
  badge:    { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  badgeTxt: { color: '#fff', fontSize: 11, fontWeight: '700' },
  closeBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  body:     { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  sec:      { ...FONTS.fontXs, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
  chips:    { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 },
  div:      { height: 1, marginVertical: 16 },
  footer:   { flexDirection: 'row', gap: 12, padding: 16, borderTopWidth: 1 },
  resetBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  resetTxt: { ...FONTS.font, ...FONTS.fontSemiBold },
  applyBtn: { flex: 2, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  applyTxt: { ...FONTS.font, ...FONTS.fontSemiBold, color: '#fff', fontSize: 15 },
});

/* ─── Main screen ───────────────────────────────────────────────── */
const Products = ({ route, navigation }: Props) => {
  const { colors: C } = useTheme();
  const params = route.params ?? {};
  const title = params.title || params.occasion || params.ItemName || params.search || 'Products';

  const [viewMode,    setViewMode]   = useState<ViewMode>('grid2');
  const [sortBy,      setSortBy]     = useState<SortValue>('');
  const [applied,     setApplied]    = useState<ActiveFilters>(EMPTY_FILTERS);
  const [draft,       setDraft]      = useState<ActiveFilters>(EMPTY_FILTERS);
  const [sortOpen,    setSortOpen]   = useState(false);
  const [filterOpen,  setFilterOpen] = useState(false);

  const openFilter  = useCallback(() => { setDraft(applied); setFilterOpen(true); }, [applied]);
  const applyFilter = useCallback(() => { setApplied(draft); setFilterOpen(false); }, [draft]);
  const resetFilter = useCallback(() => setDraft(EMPTY_FILTERS), []);

  const filterCount = useMemo(() => Object.values(applied).filter(Boolean).length, [applied]);

  /* Build API params */
  const filters = useMemo(() => {
    const f: Record<string, any> = {};
    if (params.search)      f.search      = params.search;
    if (params.ItemName)    f.ItemName    = params.ItemName;
    if (params.SubItemName) f.SubItemName = params.SubItemName;
    if (params.itemId)      f.itemId      = params.itemId;
    if (params.metal)       f.metal       = params.metal;
    if (params.filterIds)   f.filterIds   = Number(params.filterIds);
    if (params.filterId && !params.filterIds) f.filterIds = Number(params.filterId);
    if (params.gender)      f.gender      = params.gender;
    if (params.priceRange)  f.priceRange  = params.priceRange;
    if (params.occasion)    f.occasion    = params.occasion;
    // sort
    if (sortBy)             f.sortBy      = sortBy;
    // applied filters
    if (applied.gender)       f.gender        = applied.gender;
    if (applied.metalType)    f.metalType     = applied.metalType;
    if (applied.priceRange)   f.priceRange    = applied.priceRange;
    if (applied.occasion)     f.occasion      = applied.occasion;
    if (applied.discountRange) f.discountRange = applied.discountRange;
    if (applied.availability && applied.availability !== 'All')
                              f.availability  = applied.availability;
    console.log('[Products] filter params sent to API →', JSON.stringify(f, null, 2));
    return f;
  }, [params, sortBy, applied]);

  const {
    products, totalProducts, isLoading, isError, error,
    refetch, fetchNextPage, hasNextPage, isFetchingNextPage,
  } = useProductListing(filters);

  console.log('[Products] response — totalProducts:', totalProducts, '| loaded:', products.length, '| isLoading:', isLoading, '| isError:', isError);

  const cardItems = useMemo(
    () => products.map(p => toCardItem({ ...p, ImagePath: p.ImagePath ?? undefined })),
    [products],
  );

  /* Active filter pills (filters only, not sort) */
  const activePills = useMemo(() => {
    const pills: { key: keyof ActiveFilters; label: string }[] = [];
    if (applied.gender)        pills.push({ key: 'gender',        label: applied.gender });
    if (applied.metalType)     pills.push({ key: 'metalType',     label: applied.metalType });
    if (applied.priceRange)    pills.push({ key: 'priceRange',    label: PRICE_LBL[applied.priceRange] ?? applied.priceRange });
    if (applied.occasion)      pills.push({ key: 'occasion',      label: applied.occasion });
    if (applied.discountRange) pills.push({ key: 'discountRange', label: DISCOUNT_LBL[applied.discountRange] ?? applied.discountRange });
    if (applied.availability && applied.availability !== 'All')
      pills.push({ key: 'availability', label: applied.availability });
    return pills;
  }, [applied]);

  const removePill = (key: keyof ActiveFilters) =>
    setApplied(prev => { const n = { ...prev }; delete n[key]; return n; });

  return (
    <View style={[styles.safe, { backgroundColor: C.background }]}>
      <StatusBar barStyle={C.statusBar} backgroundColor={C.card} />

      {/* ── Header ──────────────────────────────────────────────── */}
      <View style={[styles.header, { backgroundColor: C.card, borderBottomColor: C.borderColor }]}>
        <TouchableOpacity style={styles.hBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={C.title} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.hTitle, { color: C.title }]} numberOfLines={1}>{title}</Text>
          {!isLoading && !isError && (
            <Text style={[styles.hSub, { color: C.textLight }]}>
              {totalProducts} item{totalProducts === 1 ? '' : 's'}
            </Text>
          )}
        </View>

        {/* List / Grid toggle */}
        <View style={[styles.modeWrap, { backgroundColor: C.primaryLight }]}>
          <TouchableOpacity
            style={[styles.modeBtn, viewMode === 'list' && { backgroundColor: C.primary }]}
            onPress={() => setViewMode('list')}
          >
            <Feather name="list" size={15} color={viewMode === 'list' ? '#fff' : C.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, viewMode === 'grid2' && { backgroundColor: C.primary }]}
            onPress={() => setViewMode('grid2')}
          >
            <Feather name="grid" size={15} color={viewMode === 'grid2' ? '#fff' : C.primary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.hBtn} onPress={() => navigation.navigate('Search')}>
          <Feather name="search" size={20} color={C.title} />
        </TouchableOpacity>
        <CartWishlistBadge />
      </View>

      {/* ── Sort & Filter sub-row ────────────────────────────────── */}
      <View style={[styles.subRow, { backgroundColor: C.card, borderBottomColor: C.borderColor }]}>

        {/* Sort By */}
        <TouchableOpacity
          style={[
            styles.subBtn,
            { borderColor: sortBy ? C.primary : C.borderColor },
            sortBy && { backgroundColor: C.primaryLight },
          ]}
          onPress={() => setSortOpen(true)}
        >
          <MaterialCommunityIcons name="arrow-up-down" size={14} color={sortBy ? C.primary : C.textLight} />
          <Text style={[styles.subBtnTxt, { color: sortBy ? C.primary : C.title }]}>
            {sortBy ? SORT_LBL[sortBy] : 'Sort By'}
          </Text>
          {sortBy && (
            <TouchableOpacity hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }} onPress={() => setSortBy('')}>
              <Feather name="x" size={13} color={C.primary} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        <View style={[styles.subDivider, { backgroundColor: C.borderColor }]} />

        {/* Filter */}
        <TouchableOpacity
          style={[
            styles.subBtn,
            { borderColor: filterCount > 0 ? C.primary : C.borderColor },
            filterCount > 0 && { backgroundColor: C.primaryLight },
          ]}
          onPress={openFilter}
        >
          <Feather name="sliders" size={14} color={filterCount > 0 ? C.primary : C.textLight} />
          <Text style={[styles.subBtnTxt, { color: filterCount > 0 ? C.primary : C.title }]}>Filter</Text>
          {filterCount > 0 && (
            <View style={[styles.badge, { backgroundColor: C.primary }]}>
              <Text style={styles.badgeTxt}>{filterCount}</Text>
            </View>
          )}
        </TouchableOpacity>

      </View>

      {/* ── Active filter pills ──────────────────────────────────── */}
      {activePills.length > 0 && (
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          style={[styles.pillsRow, { backgroundColor: C.card, borderBottomColor: C.borderColor }]}
          contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8, gap: 8 }}
        >
          {activePills.map(pill => (
            <TouchableOpacity
              key={pill.key}
              style={[styles.pill, { backgroundColor: C.primaryLight, borderColor: C.primary }]}
              onPress={() => removePill(pill.key)}
            >
              <Text style={[styles.pillTxt, { color: C.primary }]}>{pill.label}</Text>
              <Feather name="x" size={12} color={C.primary} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.pill, { borderColor: C.textLight + '55' }]}
            onPress={() => setApplied(EMPTY_FILTERS)}
          >
            <Text style={[styles.pillTxt, { color: C.textLight }]}>Clear all</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* ── Content ─────────────────────────────────────────────── */}
      {isLoading ? (
        <Loader message="Loading products..." />
      ) : isError ? (
        <ErrorState message={(error as any)?.message} onRetry={refetch} />
      ) : cardItems.length === 0 ? (
        <EmptyState
          icon="search"
          title="No products found for this filter"
          subtitle={
            filterCount > 0 || !!sortBy
              ? 'Try removing or changing some filters.'
              : 'No products available in this category.'
          }
          ctaLabel={filterCount > 0 || !!sortBy ? 'Clear Filters' : undefined}
          onCta={filterCount > 0 || !!sortBy ? () => { setApplied(EMPTY_FILTERS); setSortBy(''); } : undefined}
        />
      ) : (
        <ProductList
          products={cardItems}
          mode={viewMode}
          onPress={item => navigation.navigate('ProductDetails', { tagKey: item.id })}
          onEndReached={() => { if (hasNextPage) fetchNextPage(); }}
          loadingMore={isFetchingNextPage}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      {/* ── Sheets ──────────────────────────────────────────────── */}
      <SortSheet
        visible={sortOpen} value={sortBy}
        onChange={v => setSortBy(v)}
        onClose={() => setSortOpen(false)}
        C={C}
      />
      <FilterSheet
        visible={filterOpen} draft={draft} onChange={setDraft}
        onApply={applyFilter} onReset={resetFilter}
        onClose={() => setFilterOpen(false)}
        C={C}
      />
    </View>
  );
};

/* ─── Styles ────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  safe:   { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 10, borderBottomWidth: 1,
  },
  hBtn:   { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  hTitle: { ...FONTS.h6, ...FONTS.fontSemiBold },
  hSub:   { ...FONTS.fontXs },

  modeWrap: { flexDirection: 'row', borderRadius: 8, overflow: 'hidden', marginHorizontal: 2 },
  modeBtn:  { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },

  /* Sub-row */
  subRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8,
    borderBottomWidth: 1, gap: 0,
  },
  subBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 8, borderRadius: 20, borderWidth: 1,
  },
  subBtnTxt: { ...FONTS.fontSm, fontWeight: '600' },
  subDivider: { width: 1, height: 30, marginHorizontal: 8 },
  badge:      { width: 17, height: 17, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  badgeTxt:   { color: '#fff', fontSize: 10, fontWeight: '700' },

  /* Pills */
  pillsRow: { flexGrow: 0, borderBottomWidth: 1 },
  pill:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16, borderWidth: 1 },
  pillTxt:  { ...FONTS.fontXs, fontWeight: '600' },
});

export default Products;
