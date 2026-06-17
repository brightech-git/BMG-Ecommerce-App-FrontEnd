import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {useFilteredProducts} from '../../hooks/useProducts';
import ProductCard from '../../components/common/ProductCard';
import {colors} from '../../theme/theme';

const {width: SW} = Dimensions.get('window');
const CARD_W = (SW - 32 - 10) / 2;

const POPULAR = [
  'Gold Rings', 'Diamond Earrings', 'Silver Bangles',
  'Necklace', 'Pendant', 'Chain', 'Bracelet',
];

const SearchScreen = ({navigation}) => {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const inputRef = useRef(null);

  const filters = useMemo(
    () => (submitted.trim() ? {search: submitted.trim()} : null),
    [submitted],
  );

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isError,
  } = useFilteredProducts(filters ?? {});

  // Only run query when user actually submitted
  const products = useMemo(() => {
    if (!submitted.trim()) return [];
    return data?.pages?.flatMap(p => p?.data ?? []) ?? [];
  }, [data, submitted]);

  const total = data?.pages?.[0]?.total ?? 0;

  const handleSearch = useCallback(() => {
    if (!query.trim()) return;
    Keyboard.dismiss();
    setSubmitted(query.trim());
  }, [query]);

  const handleChip = useCallback(label => {
    setQuery(label);
    setSubmitted(label);
    Keyboard.dismiss();
  }, []);

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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Search bar */}
      <View style={styles.searchHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          style={{marginRight: 8}}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>

        <View style={styles.inputWrap}>
          <Ionicons
            name="search-outline"
            size={16}
            color={colors.placeholder}
            style={{marginRight: 6}}
          />
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Search jewellery…"
            placeholderTextColor={colors.placeholder}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setQuery('');
                setSubmitted('');
              }}>
              <Ionicons name="close-circle" size={16} color={colors.placeholder} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.searchBtn}
          onPress={handleSearch}
          disabled={!query.trim()}>
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {!submitted.trim() ? (
        /* Popular searches */
        <View style={styles.popularWrap}>
          <Text style={styles.popularTitle}>Popular Searches</Text>
          <View style={styles.chipsWrap}>
            {POPULAR.map(tag => (
              <TouchableOpacity
                key={tag}
                style={styles.popularChip}
                onPress={() => handleChip(tag)}>
                <Ionicons
                  name="trending-up-outline"
                  size={12}
                  color={colors.primary}
                  style={{marginRight: 4}}
                />
                <Text style={styles.popularChipText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Searching…</Text>
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <Text style={{fontSize: 36, marginBottom: 12}}>😕</Text>
          <Text style={styles.errorText}>Search failed. Try again.</Text>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.centered}>
          <Text style={{fontSize: 40, marginBottom: 12}}>🔍</Text>
          <Text style={styles.emptyTitle}>No results for "{submitted}"</Text>
          <Text style={styles.emptySub}>Try a different keyword</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item, i) =>
            item?.TAGKEY ? String(item.TAGKEY) : `sr-${i}`
          }
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.resultCount}>
              {products.length} of {total || products.length} results for "{submitted}"
            </Text>
          }
          renderItem={renderItem}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator
                color={colors.primary}
                style={{marginVertical: 16}}
              />
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: colors.background},

  searchHeader: {
    backgroundColor: colors.headerBg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {flex: 1, fontSize: 14, color: colors.text},
  searchBtn: {
    backgroundColor: colors.primaryMild,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  searchBtnText: {fontSize: 13, fontWeight: '700', color: colors.white},

  popularWrap: {padding: 20},
  popularTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  chipsWrap: {flexDirection: 'row', flexWrap: 'wrap', gap: 10},
  popularChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  popularChipText: {fontSize: 13, color: colors.text, fontWeight: '500'},

  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {marginTop: 12, fontSize: 14, color: colors.textSecondary},
  errorText: {fontSize: 14, color: colors.error},
  emptyTitle: {fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 4},
  emptySub: {fontSize: 13, color: colors.textSecondary},

  list: {paddingHorizontal: 16, paddingBottom: 32},
  row: {justifyContent: 'space-between'},
  resultCount: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    marginTop: 4,
  },
});
