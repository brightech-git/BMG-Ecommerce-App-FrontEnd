import React, {useState, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {useFilteredProducts, useProductFilters} from '../../hooks/useProducts';
import ProductCard from '../../components/common/ProductCard';
import FilterBottomSheet from '../../components/common/FilterBottomSheet';
import {colors} from '../../theme/theme';

const {width: SCREEN_W} = Dimensions.get('window');
const CARD_GAP = 10;
const CARD_W = (SCREEN_W - 32 - CARD_GAP) / 2;

// ── Skeleton card ─────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <View style={[skeleton.card, {width: CARD_W}]}>
    <View style={[skeleton.img, {width: CARD_W, height: CARD_W}]} />
    <View style={skeleton.line} />
    <View style={[skeleton.line, {width: '60%'}]} />
    <View style={[skeleton.line, {width: '40%', backgroundColor: '#E0C080'}]} />
  </View>
);
const skeleton = StyleSheet.create({
  card: {borderRadius: 12, overflow: 'hidden', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EEE', marginBottom: 12},
  img: {backgroundColor: '#EFEFEF'},
  line: {height: 10, backgroundColor: '#EFEFEF', borderRadius: 4, margin: 8, marginBottom: 4},
});

// ── Filter chip ───────────────────────────────────────────────────────────────
const Chip = ({label, active, onPress}) => (
  <TouchableOpacity
    style={[styles.chip, active && styles.chipActive]}
    onPress={onPress}
    activeOpacity={0.8}>
    <Text style={[styles.chipText, active && styles.chipTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

// ── ProductsScreen ────────────────────────────────────────────────────────────
const ProductsScreen = ({route, navigation}) => {
  const {filters: rawRouteFilters = {}, title: paramTitle} = route.params ?? {};
  const title = paramTitle || rawRouteFilters?._title || 'Products';
  // Strip internal-only keys (prefixed with _) before sending to API
  const routeFilters = useMemo(() => {
    const f = {...rawRouteFilters};
    Object.keys(f).forEach(k => { if (k.startsWith('_')) delete f[k]; });
    return f;
  }, [rawRouteFilters]);

  const [search, setSearch] = useState('');
  const [activeSubItem, setActiveSubItem] = useState(null);
  const [activeSize, setActiveSize] = useState(null);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [menuFilters, setMenuFilters] = useState({});

  // Build query filters
  const queryFilters = useMemo(() => {
    const f = {...routeFilters, ...menuFilters};
    if (search.trim()) f.search = search.trim();
    if (activeSubItem) f.subItemName = activeSubItem;
    if (activeSize) f.size = activeSize;
    return f;
  }, [routeFilters, search, activeSubItem, activeSize, menuFilters]);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
    isRefetching,
    isError,
  } = useFilteredProducts(queryFilters);

  // Filter options from API
  const {data: filterData} = useProductFilters(routeFilters?.itemName);
  const subItems = filterData?.data?.subItems ?? [];
  const sizes = filterData?.data?.sizes ?? [];

  // Flatten all pages
  const products = useMemo(
    () => data?.pages?.flatMap(p => p?.data ?? []) ?? [],
    [data],
  );
  const total = data?.pages?.[0]?.total ?? 0;

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({item}) => (
      <ProductCard
        item={item}
        cardWidth={CARD_W}
        onPress={p =>
          navigation.navigate('ProductDetail', {
            tagKey: p.TAGKEY,
            itemName: p.ITEMNAME,
          })
        }
      />
    ),
    [navigation],
  );

  const ListHeader = (
    <View>
      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={16} color={colors.textLight} style={{marginRight: 6}} />
        <TextInput
          style={styles.searchInput}
          placeholder={`Search in ${title}…`}
          placeholderTextColor={colors.placeholder}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          autoCorrect={false}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={colors.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {/* SubItem chips */}
      {subItems.length > 0 && (
        <FlatList
          data={[{label: 'All', value: null}, ...subItems.map(s => ({label: s.subItemName ?? s, value: s.subItemName ?? s}))]}
          keyExtractor={(_, i) => String(i)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          renderItem={({item: chip}) => (
            <Chip
              label={chip.label}
              active={activeSubItem === chip.value}
              onPress={() => setActiveSubItem(chip.value)}
            />
          )}
        />
      )}

      {/* Size chips */}
      {sizes.length > 0 && (
        <FlatList
          data={[{label: 'All Sizes', value: null}, ...sizes.map(s => ({label: s.size ?? s, value: s.size ?? s}))]}
          keyExtractor={(_, i) => String(i)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          renderItem={({item: chip}) => (
            <Chip
              label={chip.label}
              active={activeSize === chip.value}
              onPress={() => setActiveSize(chip.value)}
            />
          )}
        />
      )}

      {/* Count */}
      {!isLoading && (
        <Text style={styles.count}>
          {products.length} of {total || products.length} products
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
        <TouchableOpacity
          onPress={() => setFilterSheetVisible(true)}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Ionicons name="options-outline" size={22} color={colors.white} />
          {Object.keys(menuFilters).length > 0 && (
            <View style={styles.filterBadge} />
          )}
        </TouchableOpacity>
      </View>

      {/* Error state */}
      {isError && (
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>Failed to load products</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Product grid */}
      <FlatList
        data={isLoading ? Array(6).fill({}) : products}
        keyExtractor={(item, i) => item?.TAGKEY ? String(item.TAGKEY) : `sk-${i}`}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        ListHeaderComponent={!isLoading ? ListHeader : null}
        renderItem={isLoading
          ? () => <SkeletonCard />
          : renderItem
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        onRefresh={refetch}
        refreshing={isRefetching && !isLoading}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator color={colors.primary} style={{marginVertical: 16}} />
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyWrap}>
              <Text style={{fontSize: 40, marginBottom: 12}}>🔍</Text>
              <Text style={styles.emptyText}>No products found</Text>
              <Text style={styles.emptySub}>Try adjusting your filters</Text>
            </View>
          ) : null
        }
      />

      {/* Filter Bottom Sheet */}
      <FilterBottomSheet
        visible={filterSheetVisible}
        onClose={() => setFilterSheetVisible(false)}
        onApply={setMenuFilters}
        activeFilters={menuFilters}
      />
    </SafeAreaView>
  );
};

export default ProductsScreen;

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: colors.headerBg},
  header: {
    backgroundColor: colors.headerBg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
  },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    height: 42,
  },
  searchInput: {flex: 1, fontSize: 14, color: colors.text},

  chipRow: {paddingHorizontal: 12, paddingVertical: 4, gap: 8},
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {fontSize: 12, color: colors.textSecondary, fontWeight: '500'},
  chipTextActive: {color: colors.white, fontWeight: '700'},

  count: {
    fontSize: 12,
    color: colors.textSecondary,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },

  list: {paddingHorizontal: 16, paddingBottom: 24, backgroundColor: colors.background},
  row: {justifyContent: 'space-between', marginBottom: 0},

  errorWrap: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32},
  errorText: {fontSize: 15, color: colors.error, marginBottom: 12},
  retryBtn: {
    backgroundColor: colors.primaryMild, borderRadius: 8,
    paddingVertical: 10, paddingHorizontal: 24,
  },
  retryText: {color: colors.white, fontWeight: '700'},

  emptyWrap: {alignItems: 'center', paddingTop: 60, paddingBottom: 40},
  emptyText: {fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 4},
  emptySub: {fontSize: 13, color: colors.textSecondary},

  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.warning,
  },
});
