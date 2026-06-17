import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {colors, fonts, radius} from '../../theme/theme';
import {useCart} from '../../hooks/useCart';
import {useFavorites} from '../../hooks/useFavorites';

// Resolve ImagePath (JSON string | array) → first image URL
const getFirstImage = imageData => {
  try {
    if (!imageData) return null;
    const arr =
      typeof imageData === 'string' ? JSON.parse(imageData) : imageData;
    if (!Array.isArray(arr) || !arr.length) return null;
    const img = arr[0];
    return img.startsWith('http') ? img : `https://app.bmgjewellers.com${img}`;
  } catch {
    return null;
  }
};

const formatPrice = val => {
  const n = parseFloat(val);
  if (!n) return null;
  return `₹${n.toLocaleString('en-IN', {maximumFractionDigits: 0})}`;
};

const ProductCard = ({item, onPress, cardWidth}) => {
  const {handleAddToCart} = useCart();
  const {isFavorite, toggleFavorite} = useFavorites();
  const [imgLoaded, setImgLoaded] = useState(false);

  const imageUri = getFirstImage(item?.ImagePath);
  const name = item?.ITEMNAME ?? item?.itemName ?? '';
  const finalPrice = item?.FinalAmount ?? item?.SALERATE ?? item?.GrandTotal;
  const originalPrice = item?.GrandTotal ?? item?.GrossAmount;
  const discount = item?.OfferPercentage;
  const weight = item?.NETWT ? `${item.NETWT}g` : null;
  const isWishlisted = isFavorite(item?.TAGKEY);
  const width = cardWidth ?? 160;

  return (
    <TouchableOpacity
      style={[styles.card, {width}]}
      onPress={() => onPress && onPress(item)}
      activeOpacity={0.92}>

      {/* Image */}
      <View style={[styles.imgWrap, {width, height: width}]}>
        {imageUri ? (
          <>
            {!imgLoaded && (
              <View style={[StyleSheet.absoluteFill, styles.imgShimmer]}>
                <ActivityIndicator color={colors.primary} size="small" />
              </View>
            )}
            <Image
              source={{uri: imageUri}}
              style={{width, height: width}}
              resizeMode="cover"
              onLoad={() => setImgLoaded(true)}
            />
          </>
        ) : (
          <View style={[styles.imgShimmer, {width, height: width, alignItems: 'center', justifyContent: 'center'}]}>
            <Text style={{fontSize: 36}}>💍</Text>
          </View>
        )}

        {/* Discount badge */}
        {discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount}% OFF</Text>
          </View>
        )}

        {/* Wishlist button */}
        <TouchableOpacity
          style={styles.wishBtn}
          onPress={() => toggleFavorite(item)}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Ionicons
            name={isWishlisted ? 'heart' : 'heart-outline'}
            size={18}
            color={isWishlisted ? colors.error : colors.white}
          />
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{name}</Text>
        {weight ? <Text style={styles.weight}>{weight}</Text> : null}

        <View style={styles.priceRow}>
          {finalPrice ? (
            <Text style={styles.price}>{formatPrice(finalPrice)}</Text>
          ) : null}
          {originalPrice && originalPrice !== finalPrice ? (
            <Text style={styles.originalPrice}>{formatPrice(originalPrice)}</Text>
          ) : null}
        </View>

        {/* Add to Cart */}
        <TouchableOpacity
          style={styles.cartBtn}
          onPress={() => handleAddToCart(item)}
          activeOpacity={0.85}>
          <Ionicons name="cart-outline" size={14} color={colors.white} />
          <Text style={styles.cartBtnText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  imgWrap: {
    backgroundColor: '#F5F5F5',
    position: 'relative',
  },
  imgShimmer: {
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.error,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.white,
  },
  wishBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 14,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    padding: 8,
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 17,
    marginBottom: 3,
  },
  weight: {
    fontSize: 10,
    color: colors.textLight,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  price: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  originalPrice: {
    fontSize: 10,
    color: colors.textLight,
    textDecorationLine: 'line-through',
  },
  cartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryMild,
    borderRadius: radius.sm,
    paddingVertical: 6,
    gap: 4,
  },
  cartBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.5,
  },
});
