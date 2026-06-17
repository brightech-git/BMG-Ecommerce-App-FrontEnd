import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Animated,
  Share,
  Linking,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {useSingleProduct, useRelatedProducts} from '../../hooks/useProducts';
import {useCart} from '../../hooks/useCart';
import {useFavorites} from '../../hooks/useFavorites';
import {addRecentlyViewed} from '../../services/RecentlyViewedService';
import ProductCard from '../../components/common/ProductCard';
import {colors} from '../../theme/theme';

const {width: SW} = Dimensions.get('window');
const IMG_H = SW * 1.0;   // square-ish image
const BASE = 'https://app.bmgjewellers.com';

// ── helpers ───────────────────────────────────────────────────────────────────
const resolveImg = src => {
  if (!src) return null;
  if (src.startsWith('http')) return src;
  return `${BASE}${src.startsWith('/') ? '' : '/'}${src}`;
};

const parseImages = imageData => {
  try {
    const arr =
      typeof imageData === 'string' ? JSON.parse(imageData) : imageData;
    return Array.isArray(arr) ? arr.map(resolveImg).filter(Boolean) : [];
  } catch {
    return [];
  }
};

const fmt = val => {
  const n = parseFloat(val);
  if (!n) return null;
  return `₹${n.toLocaleString('en-IN', {maximumFractionDigits: 0})}`;
};

// ── price row component ───────────────────────────────────────────────────────
const PriceRow = ({label, value, bold, highlight}) => (
  <View style={priceStyles.row}>
    <Text style={[priceStyles.label, bold && priceStyles.bold]}>{label}</Text>
    <Text
      style={[
        priceStyles.value,
        bold && priceStyles.bold,
        highlight && priceStyles.highlight,
      ]}>
      {value}
    </Text>
  </View>
);
const priceStyles = StyleSheet.create({
  row: {flexDirection: 'row', justifyContent: 'space-between', marginVertical: 3},
  label: {fontSize: 13, color: colors.textSecondary},
  value: {fontSize: 13, color: colors.text},
  bold: {fontWeight: '700', fontSize: 14, color: colors.text},
  highlight: {color: colors.primary, fontSize: 15},
});

// ── main component ────────────────────────────────────────────────────────────
const ProductDetailScreen = ({route, navigation}) => {
  const {tagKey} = route.params ?? {};
  const {data: resp, isLoading, isError, refetch} = useSingleProduct(tagKey);

  const product = resp?.data ?? resp;

  const {handleAddToCart} = useCart();
  const {isFavorite, toggleFavorite} = useFavorites();

  const [activeImg, setActiveImg] = useState(0);
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  const flatRef = useRef(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  // related products
  const itemCtrId = product?.ITEMCTRID ?? product?.itemCtrId;
  const {data: relatedData} = useRelatedProducts(itemCtrId);
  const relatedProducts = relatedData?.data ?? [];

  // mark recently viewed
  useEffect(() => {
    if (tagKey) {
      addRecentlyViewed(tagKey).catch(() => {});
    }
  }, [tagKey]);

  const images = parseImages(product?.ImagePath);
  const isWishlisted = isFavorite(tagKey);

  // ── Derived price fields ───────────────────────────────────────────────────
  const saleMode = product?.SALEMODE ?? '';
  const isWeight = saleMode === 'W';

  const metalRate = product?.METALRATE ?? product?.metalRate;
  const netWt = product?.NETWT ?? product?.netWeight;
  const grossWt = product?.GROSSWT ?? product?.grossWt;
  const makingCharges = product?.MAKINGCHARGES ?? product?.makingCharges;
  const stoneAmt = product?.STONEAMOUNT ?? product?.stoneAmount;
  const gst = product?.GST ?? product?.gst;
  const finalAmt = product?.FinalAmount ?? product?.GrandTotal;
  const mrp = product?.GrandTotal ?? product?.GrossAmount;
  const discount = product?.OfferPercentage;
  const hasDiscount = discount > 0 && mrp && finalAmt && mrp !== finalAmt;

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `Check out ${product?.ITEMNAME} at BMG Jewellers!\nhttps://bmgjewellers.com`,
      });
    } catch {}
  }, [product]);

  const renderThumbnail = useCallback(
    ({item, index}) => (
      <TouchableOpacity
        onPress={() => {
          setActiveImg(index);
          flatRef.current?.scrollToIndex({index, animated: true});
        }}
        style={[
          styles.thumb,
          index === activeImg && styles.thumbActive,
        ]}>
        <Image
          source={{uri: item}}
          style={styles.thumbImg}
          resizeMode="cover"
        />
      </TouchableOpacity>
    ),
    [activeImg],
  );

  const renderRelated = useCallback(
    ({item}) => (
      <ProductCard
        item={item}
        cardWidth={150}
        onPress={p =>
          navigation.push('ProductDetail', {tagKey: p.TAGKEY, itemName: p.ITEMNAME})
        }
      />
    ),
    [navigation],
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center} edges={['top']}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Loading product…</Text>
      </SafeAreaView>
    );
  }

  if (isError || !product) {
    return (
      <SafeAreaView style={styles.center} edges={['top']}>
        <Text style={{fontSize: 40, marginBottom: 12}}>😕</Text>
        <Text style={styles.loadingText}>Product not found</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const headerBg = scrollY.interpolate({
    inputRange: [0, IMG_H - 80],
    outputRange: ['transparent', colors.headerBg],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Floating header */}
      <Animated.View style={[styles.floatHeader, {backgroundColor: headerBg}]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          style={styles.floatBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.floatActions}>
          <TouchableOpacity onPress={handleShare} style={styles.floatBtn}>
            <Ionicons name="share-outline" size={22} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => toggleFavorite(product)}
            style={styles.floatBtn}>
            <Ionicons
              name={isWishlisted ? 'heart' : 'heart-outline'}
              size={22}
              color={isWishlisted ? '#FF4444' : colors.white}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: false},
        )}
        scrollEventThrottle={16}>

        {/* ── Image gallery ── */}
        <FlatList
          ref={flatRef}
          data={images.length ? images : [null]}
          keyExtractor={(_, i) => String(i)}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={e =>
            setActiveImg(Math.round(e.nativeEvent.contentOffset.x / SW))
          }
          renderItem={({item}) =>
            item ? (
              <Image
                source={{uri: item}}
                style={{width: SW, height: IMG_H}}
                resizeMode="cover"
              />
            ) : (
              <View style={{width: SW, height: IMG_H, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5'}}>
                <Text style={{fontSize: 60}}>💍</Text>
              </View>
            )
          }
          scrollEnabled={images.length > 1}
        />

        {/* Dot indicators */}
        {images.length > 1 && (
          <View style={styles.dotsRow}>
            {images.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === activeImg && styles.dotActive]}
              />
            ))}
          </View>
        )}

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <FlatList
            data={images}
            keyExtractor={(_, i) => `t${i}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbRow}
            renderItem={renderThumbnail}
          />
        )}

        {/* ── Product info card ── */}
        <View style={styles.infoCard}>
          {/* Category / name */}
          <Text style={styles.category}>
            {product.ITEMNAME ?? product.itemName ?? ''}
          </Text>
          <Text style={styles.subName}>
            {product.ITEMDESC ?? product.subItemName ?? product.SUBITEMNAME ?? ''}
          </Text>

          {/* Metal / weight tags */}
          <View style={styles.tagsRow}>
            {product.METALTYPE && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>
                  {product.METALTYPE}
                </Text>
              </View>
            )}
            {product.PURITY && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{product.PURITY}</Text>
              </View>
            )}
            {netWt && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{netWt}g net wt</Text>
              </View>
            )}
            {grossWt && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{grossWt}g gross</Text>
              </View>
            )}
          </View>

          {/* ── Price block ── */}
          <View style={styles.priceBlock}>
            <View style={styles.priceMain}>
              <Text style={styles.priceFinal}>{fmt(finalAmt) ?? 'MRP on request'}</Text>
              {hasDiscount && (
                <View style={styles.discountRow}>
                  <Text style={styles.priceMrp}>{fmt(mrp)}</Text>
                  <View style={styles.discountPill}>
                    <Text style={styles.discountPillText}>{discount}% OFF</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Breakdown toggle */}
            <TouchableOpacity
              style={styles.breakdownToggle}
              onPress={() => setBreakdownOpen(v => !v)}>
              <Text style={styles.breakdownToggleText}>
                Price Breakdown
              </Text>
              <Ionicons
                name={breakdownOpen ? 'chevron-up' : 'chevron-down'}
                size={14}
                color={colors.primary}
              />
            </TouchableOpacity>

            {breakdownOpen && (
              <View style={styles.breakdownBody}>
                {isWeight ? (
                  <>
                    {metalRate && netWt && (
                      <PriceRow
                        label={`Metal Rate × ${netWt}g`}
                        value={fmt(parseFloat(metalRate) * parseFloat(netWt))}
                      />
                    )}
                    {makingCharges && (
                      <PriceRow label="Making Charges" value={fmt(makingCharges)} />
                    )}
                    {stoneAmt && <PriceRow label="Stone Amount" value={fmt(stoneAmt)} />}
                    {gst && <PriceRow label="GST" value={`${gst}%`} />}
                  </>
                ) : (
                  <>
                    {product.SALERATE && (
                      <PriceRow label="Sale Rate" value={fmt(product.SALERATE)} />
                    )}
                    {stoneAmt && <PriceRow label="Stone Amount" value={fmt(stoneAmt)} />}
                    {gst && <PriceRow label="GST" value={`${gst}%`} />}
                  </>
                )}
                <View style={styles.divider} />
                <PriceRow
                  label="Total"
                  value={fmt(finalAmt) ?? '—'}
                  bold
                  highlight
                />
              </View>
            )}
          </View>

          {/* ── Add to Cart / Wishlist ── */}
          <View style={styles.ctaRow}>
            <TouchableOpacity
              style={[styles.ctaBtn, styles.wishlistBtn]}
              onPress={() => toggleFavorite(product)}>
              <Ionicons
                name={isWishlisted ? 'heart' : 'heart-outline'}
                size={20}
                color={isWishlisted ? '#FF4444' : colors.primary}
              />
              <Text style={[styles.ctaBtnText, {color: colors.primary}]}>
                {isWishlisted ? 'Wishlisted' : 'Wishlist'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.ctaBtn, styles.cartBtn]}
              onPress={() => handleAddToCart(product)}>
              <Ionicons name="cart-outline" size={20} color={colors.white} />
              <Text style={styles.ctaBtnText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>

          {/* Tag key */}
          <Text style={styles.tagKeyText}>Tag: {tagKey}</Text>

          {/* WhatsApp enquiry */}
          <TouchableOpacity
            style={styles.whatsappBtn}
            onPress={() =>
              Linking.openURL(
                `https://wa.me/+91?text=${encodeURIComponent(`Hi, I'm interested in ${product.ITEMNAME} (Tag: ${tagKey})`)}`,
              )
            }>
            <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
            <Text style={styles.whatsappText}>Enquire on WhatsApp</Text>
          </TouchableOpacity>
        </View>

        {/* ── Related products ── */}
        {relatedProducts.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={styles.sectionTitle}>You may also like</Text>
            <FlatList
              data={relatedProducts.filter(p => p.TAGKEY !== tagKey)}
              keyExtractor={item => String(item.TAGKEY)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{paddingHorizontal: 16, gap: 12}}
              renderItem={renderRelated}
            />
          </View>
        )}

        <View style={{height: 32}} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

export default ProductDetailScreen;

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: colors.background},
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {fontSize: 15, color: colors.textSecondary},
  retryBtn: {
    backgroundColor: colors.primaryMild,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  retryText: {color: colors.white, fontWeight: '700'},

  // floating header
  floatHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  floatActions: {flexDirection: 'row', gap: 8},
  floatBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.38)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotActive: {backgroundColor: colors.primary, width: 14},

  thumbRow: {paddingHorizontal: 12, paddingVertical: 8, gap: 8},
  thumb: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbActive: {borderColor: colors.primary},
  thumbImg: {width: 56, height: 56},

  infoCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 8,
    padding: 20,
    paddingBottom: 28,
  },
  category: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  subName: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  tagsRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16},
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#FFF8E7',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0C870',
  },
  tagText: {fontSize: 11, fontWeight: '600', color: colors.primaryDark},

  priceBlock: {
    backgroundColor: '#FAFAF7',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  priceMain: {marginBottom: 8},
  priceFinal: {fontSize: 24, fontWeight: '900', color: colors.primary},
  discountRow: {flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4},
  priceMrp: {
    fontSize: 14,
    color: colors.textLight,
    textDecorationLine: 'line-through',
  },
  discountPill: {
    backgroundColor: colors.error,
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  discountPillText: {fontSize: 10, fontWeight: '800', color: colors.white},

  breakdownToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: 4,
  },
  breakdownToggleText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  breakdownBody: {marginTop: 12},
  divider: {height: 1, backgroundColor: colors.border, marginVertical: 8},

  ctaRow: {flexDirection: 'row', gap: 10, marginBottom: 16},
  ctaBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 14,
    gap: 6,
  },
  wishlistBtn: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
  cartBtn: {
    backgroundColor: colors.primaryMild,
    shadowColor: colors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaBtnText: {fontSize: 14, fontWeight: '700', color: colors.white},

  tagKeyText: {
    fontSize: 11,
    color: colors.textLight,
    marginBottom: 12,
  },
  whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#25D366',
    borderRadius: 10,
    paddingVertical: 12,
  },
  whatsappText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#25D366',
  },

  relatedSection: {paddingTop: 8, paddingBottom: 12, backgroundColor: colors.background},
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
});
