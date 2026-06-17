// app/Screens/Category/Category.tsx
// Website: home "Bmg World" categories. Data: /mainCategory_images/list -> [{item_name, image_path}].
// Tap -> Products?ItemName=. NOTE: root App.tsx provides SafeAreaView, so use a plain View.
import React, { useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList, Dimensions, StatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { useCategoryImages } from '../../api/hooks/useCatalog';
import { absUrl } from '../../utils/image';
import { SmartImage } from '../../components/common/SmartImage';
import { Loader, EmptyState, ErrorState } from '../../components/common/StateViews';

const { width } = Dimensions.get('window');
const GAP = 12;
const COLS = 2;
const CARD_W = (width - SIZES.padding * 2 - GAP) / COLS;

type Nav = StackNavigationProp<RootStackParamList>;

const titleCase = (s = '') =>
  s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

const Category = () => {
  const navigation = useNavigation<Nav>();
  const { data, isLoading, isError, error, refetch } = useCategoryImages();

  const items = useMemo(() => {
    const raw = Array.isArray(data) ? data : (data as any)?.data ?? [];
    return raw.map((c: any) => ({
      name: c.item_name || c.ItemName || c.itemName || c.title || c.name || '',
      image: absUrl(c.image_path || c.imagePath || c.image || c.ImagePath),
    })).filter((c: any) => c.name);
  }, [data]);

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        {navigation.canGoBack() && (
          <TouchableOpacity style={styles.hBtn} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={22} color={COLORS.title} />
          </TouchableOpacity>
        )}
        <Text style={styles.hTitle}>Categories</Text>
        <TouchableOpacity style={styles.hBtn} onPress={() => navigation.navigate('Search')}>
          <Feather name="search" size={20} color={COLORS.title} />
        </TouchableOpacity>
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
          keyExtractor={(it, i) => `${it.name}-${i}`}
          numColumns={COLS}
          contentContainerStyle={{ padding: SIZES.padding }}
          columnWrapperStyle={{ gap: GAP, marginBottom: GAP }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, { width: CARD_W }]}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Products', { ItemName: item.name, title: titleCase(item.name) })}
            >
              <SmartImage uri={item.image} style={styles.img} />
              <View style={styles.cardFooter}>
                <Text style={styles.cardTitle} numberOfLines={1}>{titleCase(item.name)}</Text>
                <Feather name="chevron-right" size={16} color={COLORS.primary} />
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9F6F1' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 12, backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderColor,
  },
  hBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  hTitle: { flex: 1, ...FONTS.h5, ...FONTS.fontSemiBold, color: COLORS.title },
  card: {
    backgroundColor: COLORS.white, borderRadius: 14, overflow: 'hidden',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 5, shadowOffset: { width: 0, height: 2 },
  },
  img: { width: '100%', height: CARD_W },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10 },
  cardTitle: { ...FONTS.fontSm, ...FONTS.fontSemiBold, color: COLORS.title, flex: 1 },
});

export default Category;
