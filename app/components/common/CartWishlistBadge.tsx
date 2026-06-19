// app/components/common/CartWishlistBadge.tsx
// Reusable cart + wishlist icon pair with live count badges.
// Drop into any header's right side. Both icons navigate to their screens.
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../../api/hooks/useCart';
import { useWishlist } from '../../api/hooks/useWishlist';
import { COLORS } from '../../constants/theme';

type Props = { iconColor?: string };

export const CartWishlistBadge: React.FC<Props> = ({ iconColor = COLORS.title }) => {
  const navigation = useNavigation<any>();
  const { cartCount } = useCart();
  const { favoritesCount } = useWishlist();

  return (
    <View style={styles.row}>
      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Wishlist')}>
        <Feather name="heart" size={21} color={iconColor} />
        {favoritesCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeTxt}>{favoritesCount > 99 ? '99+' : favoritesCount}</Text>
          </View>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('MyCart')}>
        <Feather name="shopping-bag" size={21} color={iconColor} />
        {cartCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeTxt}>{cartCount > 99 ? '99+' : cartCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  row:      { flexDirection: 'row', alignItems: 'center', gap: 4 },
  btn:      { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute', top: 2, right: 2,
    minWidth: 16, height: 16, borderRadius: 8,
    backgroundColor: COLORS.danger,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  badgeTxt: { color: '#fff', fontSize: 9, fontWeight: '800', lineHeight: 13 },
});

export default CartWishlistBadge;
