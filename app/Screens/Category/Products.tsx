// app/Screens/Category/Products.tsx
// Website page: /products-page (ProductsPage) — listing with filter + pagination.
// Data: /product/items/filter via useProductListing. Reuses ProductList/toCardItem.
// NOTE: root App.tsx provides SafeAreaView, so use a plain View container.
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { COLORS, FONTS } from '../../constants/theme';
import { useProductListing } from '../../api/hooks/useProducts';
import { ProductList, toCardItem } from '../../components/ProductCard/ProductCard';
import { Loader, EmptyState, ErrorState } from '../../components/common/StateViews';

type Props = StackScreenProps<RootStackParamList, 'Products'>;

const Products = ({ route, navigation }: Props) => {
  const params = route.params ?? {};
  const title = params.title || params.ItemName || params.search || 'Products';

  const filters = useMemo(() => {
    const f: Record<string, any> = {};
    if (params.search) f.search = params.search;
    if (params.ItemName) f.ItemName = params.ItemName;
    if (params.SubItemName) f.SubItemName = params.SubItemName;
    if (params.itemId) f.itemId = params.itemId;
    if (params.metal) f.metal = params.metal;
    if (params.filterId) f.filterId = params.filterId;
    if (params.gender) f.gender = params.gender;
    return f;
  }, [params.search, params.ItemName, params.SubItemName, params.itemId, params.metal, params.filterId, params.gender]);

  const {
    products, totalProducts, isLoading, isError, error,
    refetch, fetchNextPage, hasNextPage, isFetchingNextPage,
  } = useProductListing(filters);

  const cardItems = useMemo(
    () => products.map((p) => toCardItem({ ...p, ImagePath: p.ImagePath ?? undefined })),
    [products],
  );

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.hBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={COLORS.title} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.hTitle} numberOfLines={1}>{title}</Text>
          {!isLoading && !isError && (
            <Text style={styles.hSub}>{totalProducts} item{totalProducts === 1 ? '' : 's'}</Text>
          )}
        </View>
        <TouchableOpacity style={styles.hBtn} onPress={() => navigation.navigate('Search')}>
          <Feather name="search" size={20} color={COLORS.title} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.hBtn} onPress={() => navigation.navigate('MyCart')}>
          <Feather name="shopping-bag" size={20} color={COLORS.title} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <Loader message="Loading products..." />
      ) : isError ? (
        <ErrorState message={(error as any)?.message} onRetry={refetch} />
      ) : cardItems.length === 0 ? (
        <EmptyState
          icon="search"
          title="No products found"
          subtitle="Try a different category or search term."
          ctaLabel="Back to Home"
          onCta={() => navigation.navigate('DrawerNavigation' as never)}
        />
      ) : (
        <ProductList
          products={cardItems}
          defaultMode="grid2"
          onPress={(item) => navigation.navigate('ProductDetails', { tagKey: item.id })}
          onEndReached={() => { if (hasNextPage) fetchNextPage(); }}
          loadingMore={isFetchingNextPage}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9F6F1' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderColor,
  },
  hBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  hTitle: { ...FONTS.h6, ...FONTS.fontSemiBold, color: COLORS.title },
  hSub: { ...FONTS.fontXs, color: COLORS.textLight },
});

export default Products;
