// app/Screens/Product/ProductDetails.tsx
import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Dimensions, StatusBar, Alert, FlatList,
} from 'react-native';
import { Feather, AntDesign, Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { useProductDetail, useRelatedProducts } from '../../api/hooks/useProductDetail';
import { useProductReviews } from '../../api/hooks/useReviews';
import { Rating } from 'react-native-ratings';
import { useRecordRecentlyViewed } from '../../api/hooks/useHome';
import { useCart } from '../../api/hooks/useCart';
import { useWishlist } from '../../api/hooks/useWishlist';
import { useTodayRate } from '../../api/hooks/useRate';
import { parseImages } from '../../utils/image';
import { SmartImage } from '../../components/common/SmartImage';
import { CartWishlistBadge } from '../../components/common/CartWishlistBadge';
import { Loader, ErrorState } from '../../components/common/StateViews';
import { setPendingAuthRedirect } from '../../utils/authRedirect';

const { width } = Dimensions.get('window');
type Props = StackScreenProps<RootStackParamList, 'ProductDetails'>;

const InfoChip = ({ label, value, chipBg, labelColor, valueColor }: {
  label: string; value?: string | number;
  chipBg: string; labelColor: string; valueColor: string;
}) => {
  if (value === undefined || value === null || value === '') return null;
  return (
    <View style={[styles.chip, { backgroundColor: chipBg }]}>
      <Text style={[styles.chipLabel, { color: labelColor }]}>{label}</Text>
      <Text style={[styles.chipValue, { color: valueColor }]}>{String(value)}</Text>
    </View>
  );
};

const ProductDetails = ({ route, navigation }: Props) => {
  const { tagKey } = route.params;
  const { colors: C } = useTheme();
  const { data: product, isLoading, isError, error, refetch } = useProductDetail(tagKey);
  const { data: rate } = useTodayRate();
  const { isInCart, addItem, isAdding, isAuthenticated } = useCart();
  const { isFavorite, toggleFavorite } = useWishlist();

  const [activeImg, setActiveImg] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const { mutate: recordView } = useRecordRecentlyViewed();

  const recorded = useRef(false);
  useEffect(() => {
    if (isAuthenticated && tagKey && !recorded.current) {
      recorded.current = true;
      recordView(tagKey);
    }
  }, [isAuthenticated, tagKey]);

  const images      = useMemo(() => parseImages(product?.ImagePath), [product?.ImagePath]);
  const galleryImgs = images.length > 0 ? images : [undefined];

  const relatedId = (product?.SubItemId && product.SubItemId > 0)
    ? product.SubItemId
    : (product?.ITEMID ?? null);
  const { data: relatedRaw } = useRelatedProducts(relatedId);

  const related: any[] = useMemo(
    () => (Array.isArray(relatedRaw) ? relatedRaw : (relatedRaw as any)?.data ?? [])
            .filter((p: any) => p.TAGKEY !== tagKey),
    [relatedRaw, tagKey],
  );

  const { reviews, avgRating, count: reviewCount } = useProductReviews(product?.TAGNO);

  const requireAuth = (action: () => string) => {
    const res = action();
    if (res === 'unauth') {
      Alert.alert('Login required', 'Please sign in to continue.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => {
          setPendingAuthRedirect({ screen: 'ProductDetails', params: { tagKey } });
          navigation.navigate('SignIn');
        } },
      ]);
    }
  };

  const handleWriteReview = () => {
    if (!isAuthenticated) {
      Alert.alert('Login required', 'Please sign in to write a review.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => {
          setPendingAuthRedirect({ screen: 'ProductDetails', params: { tagKey } });
          navigation.navigate('SignIn');
        } },
      ]);
      return;
    }
    navigation.navigate('WriteReview', {
      tagNo: product!.TAGNO,
      itemId: String(product!.ITEMID ?? ''),
      productName: product!.ITEMNAME,
      productImage: images[0],
    });
  };

  if (isLoading) {
    return <View style={[styles.safe, { backgroundColor: C.background }]}><Loader message="Loading product..." /></View>;
  }
  if (isError || !product) {
    return (
      <View style={[styles.safe, { backgroundColor: C.background }]}>
        <ErrorState message={(error as any)?.message ?? 'Product not found.'} onRetry={refetch} />
      </View>
    );
  }

  const inCart   = isInCart(product.TAGKEY);
  const faved    = isFavorite(product.TAGKEY);
  const r: any   = rate ?? {};
  const goGold   = r.GOLDRATE ?? r.gold ?? r.goldRate;
  const goSilver = r.SILVERRATE ?? r.silver ?? r.silverRate;

  return (
    <View style={[styles.safe, { backgroundColor: C.background }]}>
      <StatusBar barStyle={C.statusBar} backgroundColor={C.card} />

      <View style={[styles.header, { backgroundColor: C.card, borderBottomColor: C.borderColor }]}>
        <TouchableOpacity style={styles.hBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={C.title} />
        </TouchableOpacity>
        <Text style={[styles.hTitle, { color: C.title }]} numberOfLines={1}>{product.ITEMNAME}</Text>
        <CartWishlistBadge />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        <View>
          <FlatList
            data={galleryImgs}
            horizontal pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => String(i)}
            onMomentumScrollEnd={(e) =>
              setActiveImg(Math.round(e.nativeEvent.contentOffset.x / width))}
            renderItem={({ item }) => (
              <SmartImage uri={item} style={{ width, height: width }} />
            )}
          />
          <TouchableOpacity
            style={[styles.heart, { backgroundColor: C.card }]}
            onPress={() => requireAuth(() => toggleFavorite(product.TAGKEY))}
          >
            <Ionicons name={faved ? 'heart' : 'heart-outline'} size={20} color={faved ? C.danger : C.title} />
          </TouchableOpacity>
          {galleryImgs.length > 1 && (
            <View style={styles.dots}>
              {galleryImgs.map((_, i) => (
                <View key={i} style={[styles.dot, i === activeImg && { backgroundColor: C.primary, width: 16 }]} />
              ))}
            </View>
          )}
        </View>

        <View style={styles.body}>
          <Text style={[styles.name, { color: C.title }]}>{product.ITEMNAME}</Text>
          {!!product.SUBITEMNAME && (
            <Text style={[styles.subName, { color: C.secondary }]}>{product.SUBITEMNAME}</Text>
          )}

          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: C.title }]}>{'₹'}{product.FinalAmount}</Text>
            {!!product.OriginalAmount && product.OriginalAmount !== product.FinalAmount && (
              <Text style={[styles.orig, { color: C.textLight }]}>{'₹'}{product.OriginalAmount}</Text>
            )}
            {!!product.OfferPercentage && product.OfferPercentage !== '0' && (
              <View style={[styles.offer, { backgroundColor: C.danger }]}>
                <Text style={[styles.offerTxt, { color: C.white }]}>{product.OfferPercentage}% OFF</Text>
              </View>
            )}
          </View>

          {(goGold || goSilver) && (
            <View style={[styles.rateCard, { backgroundColor: C.primaryLight }]}>
              <Feather name="trending-up" size={16} color={C.secondary} />
              <Text style={[styles.rateTxt, { color: C.text }]}>
                Today's Rate: Gold {String(goGold ?? '-')}  |  Silver {String(goSilver ?? '-')}
              </Text>
            </View>
          )}

          <View style={styles.chips}>
            <InfoChip label="Purity"   value={product.NEWPURITY}                        chipBg={C.card} labelColor={C.textLight} valueColor={C.title} />
            <InfoChip label="Gross Wt" value={product.GRSWT ? product.GRSWT + ' g' : ''} chipBg={C.card} labelColor={C.textLight} valueColor={C.title} />
            <InfoChip label="Net Wt"   value={product.NETWT ? product.NETWT + ' g' : ''}  chipBg={C.card} labelColor={C.textLight} valueColor={C.title} />
            <InfoChip label="Metal"    value={product.CATNAME}                           chipBg={C.card} labelColor={C.textLight} valueColor={C.title} />
            <InfoChip label="Tag No"   value={product.TAGNO}                             chipBg={C.card} labelColor={C.textLight} valueColor={C.title} />
          </View>

          <>
            <Text style={[styles.secTitle, { color: C.title }]}>Description</Text>
            <Text style={[styles.desc, { color: C.text }]}>
              {product.Description?.trim()
                ? product.Description
                : 'Crafted with precision and elegance, this exquisite jewellery piece is made from the finest quality metal and adorned with carefully selected stones. Each piece reflects timeless craftsmanship, making it a perfect accessory for every occasion — from festive celebrations to everyday wear. A treasured addition to your jewellery collection.'}
            </Text>
          </>

          {related.length > 0 && (
            <>
              <Text style={[styles.secTitle, { color: C.title }]}>Similar Products</Text>
              <FlatList
                data={related} horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(it: any, i) => String(it.TAGKEY ?? i)}
                contentContainerStyle={{ gap: 12, paddingVertical: 4 }}
                renderItem={({ item }: any) => (
                  <TouchableOpacity
                    style={[styles.relCard, { backgroundColor: C.card }]}
                    activeOpacity={0.85}
                    onPress={() => navigation.push('ProductDetails', { tagKey: item.TAGKEY })}
                  >
                    <View style={styles.relImgWrap}>
                      <SmartImage uri={parseImages(item.ImagePath)[0]} style={styles.relImg} />
                      {!!item.OfferPercentage && item.OfferPercentage !== '0' && (
                        <View style={[styles.relBadge, { backgroundColor: C.danger }]}>
                          <Text style={[styles.relBadgeTxt, { color: C.white }]}>{item.OfferPercentage}% OFF</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.relName, { color: C.title }]} numberOfLines={2}>{item.ITEMNAME}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 }}>
                      <Text style={[styles.relPrice, { color: C.title }]}>{'₹'}{item.FinalAmount}</Text>
                      {!!item.OriginalAmount && item.OriginalAmount !== item.FinalAmount && (
                        <Text style={[styles.relOrig, { color: C.textLight }]}>{'₹'}{item.OriginalAmount}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                )}
              />
            </>
          )}

          <View style={styles.reviewsHeaderRow}>
            <View>
              <Text style={[styles.secTitle, { color: C.title, marginTop: 0 }]}>Ratings & Reviews</Text>
              {reviewCount > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Rating readonly startingValue={avgRating} imageSize={16} />
                  <Text style={{ ...FONTS.fontSm, color: C.textLight }}>
                    {avgRating.toFixed(1)} · {reviewCount} review{reviewCount === 1 ? '' : 's'}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity style={[styles.writeReviewBtn, { borderColor: C.primary }]} onPress={handleWriteReview}>
              <Text style={[styles.writeReviewTxt, { color: C.primary }]}>Write a Review</Text>
            </TouchableOpacity>
          </View>

          {reviews.length === 0 ? (
            <Text style={{ ...FONTS.fontSm, color: C.textLight, marginTop: 4 }}>
              No reviews yet. Be the first to review this product!
            </Text>
          ) : (
            <>
              {(showAllReviews ? reviews : reviews.slice(0, 3)).map((r: any, i: number) => (
                <View key={r.id ?? i} style={[styles.reviewCard, { borderColor: C.borderColor }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={[styles.reviewerName, { color: C.title }]}>{r.reviewerName}</Text>
                    {!!r.postedAt && (
                      <Text style={{ ...FONTS.fontXs, color: C.textLight }}>
                        {new Date(r.postedAt).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                  <Rating readonly startingValue={r.rating} imageSize={14} style={{ alignSelf: 'flex-start', marginTop: 4 }} />
                  <Text style={[styles.reviewComment, { color: C.text }]}>{r.comment}</Text>
                </View>
              ))}
              {reviews.length > 3 && (
                <TouchableOpacity style={styles.viewMoreBtn} onPress={() => setShowAllReviews(v => !v)}>
                  <Text style={[styles.viewMoreTxt, { color: C.primary }]}>
                    {showAllReviews ? 'View Less' : `View More (${reviews.length - 3} more)`}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: C.card, borderTopColor: C.borderColor }]}>
        <TouchableOpacity
          style={[styles.cartBtn, { borderColor: C.primary }, inCart && { backgroundColor: C.primary }]}
          disabled={isAdding}
          onPress={() => inCart ? navigation.navigate('MyCart') : requireAuth(() => addItem(product.TAGKEY))}
        >
          <Feather name="shopping-bag" size={18} color={inCart ? C.white : C.primary} />
          <Text style={[styles.cartTxt, { color: inCart ? C.white : C.primary }]}>
            {inCart ? 'In Cart' : isAdding ? 'Adding...' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.buyBtn, { backgroundColor: C.primary }]}
          onPress={() => {
            if (!isAuthenticated) {
              Alert.alert('Login required', 'Please sign in to continue.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign In', onPress: () => {
                  setPendingAuthRedirect({ screen: 'ProductDetails', params: { tagKey } });
                  navigation.navigate('SignIn');
                } },
              ]);
              return;
            }
            navigation.navigate('Checkout', { buyNowProduct: product });
          }}
        >
          <Text style={[styles.buyTxt, { color: C.white }]}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safe:     { flex: 1 },
  header:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, borderBottomWidth: 1 },
  hBtn:     { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  hTitle:   { flex: 1, ...FONTS.h6, ...FONTS.fontSemiBold, textAlign: 'center' },
  heart:    { position: 'absolute', top: 14, right: 14, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', elevation: 3, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  dots:     { position: 'absolute', bottom: 12, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 5 },
  dot:      { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.2)' },
  body:     { padding: SIZES.padding },
  name:     { ...FONTS.h5, ...FONTS.fontSemiBold },
  subName:  { ...FONTS.font, marginTop: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  price:    { ...FONTS.h4, ...FONTS.fontBold },
  orig:     { ...FONTS.font, textDecorationLine: 'line-through' },
  offer:    { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 },
  offerTxt: { ...FONTS.fontXs, fontWeight: '700' },
  rateCard: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14, padding: 10, borderRadius: 10 },
  rateTxt:  { ...FONTS.fontSm, flex: 1 },
  chips:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  chip:     { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  chipLabel:  { ...FONTS.fontXs, marginBottom: 1 },
  chipValue:  { ...FONTS.fontSm, ...FONTS.fontSemiBold },
  secTitle:   { ...FONTS.h6, ...FONTS.fontSemiBold, marginTop: 20, marginBottom: 10 },
  desc:       { ...FONTS.font, lineHeight: 22 },
  relCard:    { width: 140, borderRadius: 12, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  relImgWrap: { position: 'relative' },
  relImg:     { width: 140, height: 140 },
  relBadge:   { position: 'absolute', top: 6, left: 6, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  relBadgeTxt:{ ...FONTS.fontXs, fontWeight: '700' },
  relName:    { ...FONTS.fontSm, ...FONTS.fontSemiBold, padding: 8, paddingBottom: 2 },
  relPrice:   { ...FONTS.fontSm, ...FONTS.fontBold, paddingHorizontal: 8 },
  relOrig:    { ...FONTS.fontXs, textDecorationLine: 'line-through', paddingBottom: 8 },
  bottomBar:  { flexDirection: 'row', gap: 12, padding: 14, borderTopWidth: 1 },
  cartBtn:    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5 },
  cartTxt:    { ...FONTS.font, ...FONTS.fontSemiBold },
  buyBtn:     { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 14 },
  buyTxt:     { ...FONTS.font, ...FONTS.fontSemiBold },
  reviewsHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 },
  writeReviewBtn:   { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  writeReviewTxt:   { ...FONTS.fontSm, ...FONTS.fontSemiBold },
  reviewCard:       { borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 12 },
  reviewerName:     { ...FONTS.fontSm, ...FONTS.fontSemiBold },
  reviewComment:    { ...FONTS.fontSm, lineHeight: 20, marginTop: 6 },
  viewMoreBtn:      { alignItems: 'center', paddingVertical: 12, marginTop: 4 },
  viewMoreTxt:      { ...FONTS.fontSm, ...FONTS.fontSemiBold },
});

export default ProductDetails;
