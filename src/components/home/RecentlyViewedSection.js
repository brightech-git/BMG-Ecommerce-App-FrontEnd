import React from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {useRecentlyViewed} from '../../hooks/useRecentlyViewed';
import {getImage} from '../../utils/imageUtils';
import {colors} from '../../theme/theme';
import {useAuth} from '../../context/AuthContext';

const ITEM_W = 130;
const ITEM_H = 130;

const ProductCard = ({item, onPress}) => {
  const imageUri = getImage(item.imageUrl ?? item.images ?? item.image);
  const name = item.ITEMNAME ?? item.name ?? item.itemName ?? '';
  const price = item.SALERATE ?? item.price ?? '';

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)} activeOpacity={0.85}>
      <View style={styles.imgWrap}>
        {imageUri ? (
          <Image source={{uri: imageUri}} style={styles.img} resizeMode="cover" />
        ) : (
          <View style={[styles.img, styles.imgPlaceholder]}>
            <Text style={{fontSize: 24}}>💍</Text>
          </View>
        )}
      </View>
      <Text style={styles.name} numberOfLines={2}>{name}</Text>
      {price ? (
        <Text style={styles.price}>₹{Number(price).toLocaleString('en-IN')}</Text>
      ) : null}
    </TouchableOpacity>
  );
};

const RecentlyViewedSection = ({navigation}) => {
  const {isAuthenticated} = useAuth();
  const {data, isLoading} = useRecentlyViewed();

  if (!isAuthenticated) return null;

  const items = data?.data ?? data ?? [];
  if (!isLoading && (!items || items.length === 0)) return null;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>Recently Viewed</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator
          color={colors.primary}
          style={{marginVertical: 16}}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item, i) => String(item.TAGKEY ?? item.id ?? i)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={({item}) => (
            <ProductCard
              item={item}
              onPress={p =>
                navigation?.navigate('ProductDetail', {
                  tagKey: p.TAGKEY ?? p.tagKey,
                  product: p,
                })
              }
            />
          )}
        />
      )}
    </View>
  );
};

export default RecentlyViewedSection;

const styles = StyleSheet.create({
  section: {
    backgroundColor: colors.surface,
    marginVertical: 8,
    paddingBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  list: {paddingHorizontal: 10, gap: 10},
  card: {
    width: ITEM_W,
    borderRadius: 10,
    backgroundColor: colors.background,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  imgWrap: {
    width: ITEM_W,
    height: ITEM_H,
    backgroundColor: '#F9F9F9',
  },
  img: {width: ITEM_W, height: ITEM_H},
  imgPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0F0',
  },
  name: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '500',
    paddingHorizontal: 6,
    paddingTop: 6,
    lineHeight: 15,
  },
  price: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingBottom: 6,
    paddingTop: 2,
  },
});
