// app/Screens/Product/ProductDetails.tsx
// Website page: /products-page/:tagKey (ProductDetail / ProductInfo).
// Data: /product/getTagkeyFilter/:tagKey, /product/related. Cart + wishlist actions.
// NOTE: root App.tsx provides SafeAreaView, so use a plain View container.
import React, { useMemo, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Dimensions, StatusBar, Alert, FlatList,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { useProductDetail, useRelatedProducts } from '../../api/hooks/useProductDetail';
import { useCart } from '../../api/hooks/useCart';
import { useWishlist } from '../../api/hooks/useWishlist';
import { useTodayRate } from '../../api/hooks/useRate';
import { parseImages } from '../../utils/image';
import { SmartImage } from '../../components/common/SmartImage';
import { CartWishlistBadge } from '../../components/common/CartWishlistBadge';
import { Loader, ErrorState } from '../../components/common/StateViews';

const { width } = Dimensions.get('window');
type Props = StackScreenProps<RootStackParamList, 'ProductDetails'>;

const InfoChip = ({ label, value }: { label: string; value?: string | number }) => {
  if (value === undefined || value === null || value === '') return null;
  return (
    <View style={styles.chip}>
      <Text style={styles.chipLabel}>{label}</Text>
      <Text style={styles.chipValue}>{String(value)}</Text>
    </View>
  );
};

const ProductDetails = ({ route, navigation }: Props) => {
  const { tagKey } = route.params;
  const { data: product, isLoading, isError, error, refetch } = useProductDetail(tagKey);
  const { data: rate } = useTodayRate();
  const { isInCart, addItem, isAdding, isAuthenticated } = useCart();
  const { isFavorite, toggleFavorite } = useWishlist();

  const [activeImg, setActiveImg] = useState(0);

  const images = useMemo(() => parseImages(product?.ImagePath), [product?.ImagePath]);
  const galleryImgs = images.length > 0 ? images : [undefined];
  const relatedId = product?.SubItemId ?? product?.ITEMID;
  const { data: related = [] } = useRelatedProducts(relatedId);

  const requireAuth = (action: () => string) => {
    const res = action();
    if (res === 'unauth') {
      Alert.alert('Login required', 'Please sign in to continue.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => navigation.navigate('SignIn') },
      ]);
    }
  };

  if (isLoading) {
    return <View style={styles.safe}><Loader message="Loading product..." /></View>;
  }
  if (isError || !product) {
    return (
      <View style={styles.safe}>
        <ErrorState message={(error as any)?.message ?? 'Product not found.'} onRetry={refetch} />
      </View>
    );
  }

  const inCart = isInCart(product.TAGKEY);
  const faved = isFavorite(product.TAGKEY);
  const r: any = rate ?? {};
  const goGold = r.GOLDRATE ?? r.gold ?? r.goldRate;
  const goSilver = r.SILVERRATE ?? r.silver ?? r.silverRate;

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.hBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={COLORS.title} />
        </TouchableOpacity>
        <Text style={styles.hTitle} numberOfLines={1}>{product.ITEMNAME}</Text>
        <CartWishlistBadge />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        <View>
          <FlatList
            data={galleryImgs}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => String(i)}
            onMomentumScrollEnd={(e) =>
              setActiveImg(Math.round(e.nativeEvent.contentOffset.x / width))}
            renderItem={({ item }) => (
              <SmartImage uri={item} style={{ width, height: width }} />
            )}
          />
          <TouchableOpacity
            style={styles.heart}
            onPress={() => requireAuth(() => toggleFavorite(product.TAGKEY))}
          >
            <Feather name="heart" size={20} color={faved ? COLORS.danger : COLORS.title} />
          </TouchableOpacity>
          {galleryImgs.length > 1 && (
            <View style={styles.dots}>
              {galleryImgs.map((_, i) => (
                <View key={i} style={[styles.dot, i === activeImg && styles.dotActive]} />
              ))}
            </View>
          )}
        </View>

        <View style={styles.body}>
          <Text style={styles.name}>{product.ITEMNAME}</Text>
          {!!product.SUBITEMNAME && <Text style={styles.subName}>{product.SUBITEMNAME}</Text>}

          <View style={styles.priceRow}>
            <Text style={styles.price}>{'₹'}{product.FinalAmount}</Text>
            {!!product.OriginalAmount && product.OriginalAmount !== product.FinalAmount && (
              <Text style={styles.orig}>{'₹'}{product.OriginalAmount}</Text>
            )}
            {!!product.OfferPercentage && product.OfferPercentage !== '0' && (
              <View style={styles.offer}><Text style={styles.offerTxt}>{product.OfferPercentage}% OFF</Text></View>
            )}
          </View>

          {(goGold || goSilver) && (
            <View style={styles.rateCard}>
              <Feather name="trending-up" size={16} color={COLORS.secondary} />
              <Text style={styles.rateTxt}>
                Today's Rate: Gold {String(goGold ?? '-')}  |  Silver {String(goSilver ?? '-')}
              </Text>
            </View>
          )}

          <View style={styles.chips}>
            <InfoChip label="Purity" value={product.NEWPURITY} />
            <InfoChip label="Gross Wt" value={product.GRSWT ? `${product.GRSWT} g` : ''} />
            <InfoChip label="Net Wt" value={product.NETWT ? `${product.NETWT} g` : ''} />
            <InfoChip label="Metal" value={product.CATNAME} />
            <InfoChip label="Tag No" value={product.TAGNO} />
          </View>

          {!!product.Description && (
            <>
              <Text style={styles.secTitle}>Description</Text>
              <Text style={styles.desc}>{product.Description}</Text>
            </>
          )}

          {Array.isArray(related) && related.length > 0 && (
            <>
              <Text style={styles.secTitle}>You may also like</Text>
              <FlatList
                data={related}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(it: any, i) => String(it.TAGKEY ?? i)}
                contentContainerStyle={{ gap: 12, paddingVertical: 4 }}
                renderItem={({ item }: any) => (
                  <TouchableOpacity
                    style={styles.relCard}
                    onPress={() => navigation.push('ProductDetails', { tagKey: item.TAGKEY })}
                  >
                    <SmartImage uri={parseImages(item.ImagePath)[0]} style={styles.relImg} />
                    <Text style={styles.relName} numberOfLines={1}>{item.ITEMNAME}</Text>
                    <Text style={styles.relPrice}>{'₹'}{item.FinalAmount}</Text>
                  </TouchableOpacity>
                )}
              />
            </>
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.cartBtn, inCart && styles.cartBtnActive]}
          disabled={isAdding}
          onPress={() => inCart ? navigation.navigate('MyCart') : requireAuth(() => addItem(product.TAGKEY))}
        >
          <Feather name="shopping-bag" size={18} color={inCart ? COLORS.white : COLORS.primary} />
          <Text style={[styles.cartTxt, inCart && { color: COLORS.white }]}>
            {inCart ? 'In Cart' : isAdding ? 'Adding...' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buyBtn}
          onPress={() => {
            if (!isAuthenticated) {
              Alert.alert('Login required', 'Please sign in to continue.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign In', onPress: () => navigation.navigate('SignIn') },
              ]);
              return;
            }
            // Pass product directly — does NOT add to cart, only this item goes to checkout
            navigation.navigate('Checkout', { buyNowProduct: product });
          }}
        >
          <Text style={styles.buyTxt}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderColor,
  },
  hBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  hTitle: { flex: 1, ...FONTS.h6, ...FONTS.fontSemiBold, color: COLORS.title, textAlign: 'center' },
  heart: {
    position: 'absolute', top: 14, right: 14,
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.white,
    alignItems: 'center', justifyContent: 'center', elevation: 3,
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
  },
  dots: { position: 'absolute', bottom: 12, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.2)' },
  dotActive: { backgroundColor: COLORS.primary, width: 16 },
  body: { padding: SIZES.padding },
  name: { ...FONTS.h5, ...FONTS.fontSemiBold, color: COLORS.title },
  subName: { ...FONTS.font, color: COLORS.secondary, marginTop: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  price: { ...FONTS.h4, ...FONTS.fontBold, color: COLORS.title },
  orig: { ...FONTS.font, color: COLORS.textLight, textDecorationLine: 'line-through' },
  offer: { backgroundColor: COLORS.danger, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 },
  offerTxt: { ...FONTS.fontXs, color: COLORS.white, fontWeight: '700' },
  rateCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14,
    backgroundColor: COLORS.primaryLight, padding: 10, borderRadius: SIZES.radius,
  },
  rateTxt: { ...FONTS.fontSm, color: COLORS.title, flex: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  chip: { backgroundColor: COLORS.input, borderRadius: SIZES.radius, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: COLORS.borderColor },
  chipLabel: { ...FONTS.fontXs, color: COLORS.textLight },
  chipValue: { ...FONTS.fontSm, ...FONTS.fontSemiBold, color: COLORS.title },
  secTitle: { ...FONTS.h6, ...FONTS.fontSemiBold, color: COLORS.title, marginTop: 22, marginBottom: 8 },
  desc: { ...FONTS.font, color: COLORS.text, lineHeight: 21 },
  relCard: { width: 130 },
  relImg: { width: 130, height: 130, borderRadius: 12, backgroundColor: '#EDE8DF' },
  relName: { ...FONTS.fontSm, ...FONTS.fontSemiBold, color: COLORS.title, marginTop: 6 },
  relPrice: { ...FONTS.fontSm, color: COLORS.secondary },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 10, padding: 12,
    backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.borderColor,
  },
  cartBtn: {
    flex: 1, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: SIZES.radius_lg, paddingVertical: 13,
  },
  cartBtnActive: { backgroundColor: COLORS.primary },
  cartTxt: { ...FONTS.font, ...FONTS.fontSemiBold, color: COLORS.primary },
  buyBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, borderRadius: SIZES.radius_lg, paddingVertical: 13 },
  buyTxt: { ...FONTS.font, ...FONTS.fontSemiBold, color: COLORS.white },
});

export default ProductDetails;
