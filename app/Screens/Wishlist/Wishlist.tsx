// app/Screens/Wishlist/Wishlist.tsx
// Website page: /wishlist (Wishlist). Data: /wishlist (useWishlist).
// NOTE: root App.tsx provides SafeAreaView, so use a plain View container.
import React, { useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList, Dimensions, StatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { useWishlist } from '../../api/hooks/useWishlist';
import { useCart } from '../../api/hooks/useCart';
import { firstImage } from '../../utils/image';
import { SmartImage } from '../../components/common/SmartImage';
import { Loader, EmptyState, ErrorState } from '../../components/common/StateViews';
import { CartWishlistBadge } from '../../components/common/CartWishlistBadge';

const { width } = Dimensions.get('window');
const GAP = 12;
const CARD_W = (width - SIZES.padding * 2 - GAP) / 2;
type Nav = StackNavigationProp<RootStackParamList>;

const Wishlist = () => {
  const { isDark, colors: C } = useTheme();
  const navigation = useNavigation<Nav>();
  const { favorites, isLoading, isError, error, refetch, isAuthenticated, removeFavorite } = useWishlist();
  const { addItem } = useCart();

  const items = useMemo(() => favorites, [favorites]);

  const Header = (
    <View style={[styles.header, { backgroundColor: C.card, borderBottomColor: C.borderColor }]}>
      {navigation.canGoBack() && (
        <TouchableOpacity style={styles.hBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={C.title} />
        </TouchableOpacity>
      )}
      <Text style={[styles.hTitle, { color: C.title }]}>Wishlist</Text>
      <CartWishlistBadge />
    </View>
  );

  if (!isAuthenticated) {
    return (
      <View style={[styles.safe, { backgroundColor: C.background }]}>{Header}
        <EmptyState icon="heart" title="Your wishlist is waiting"
          subtitle="Sign in to save your favourite pieces."
          ctaLabel="Sign In" onCta={() => navigation.navigate('SignIn')} />
      </View>
    );
  }

  return (
    <View style={[styles.safe, { backgroundColor: C.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      {Header}
      {isLoading ? (
        <Loader message="Loading wishlist..." />
      ) : isError ? (
        <ErrorState message={(error as any)?.message} onRetry={refetch} />
      ) : items.length === 0 ? (
        <EmptyState icon="heart" title="No favourites yet"
          subtitle="Tap the heart on any product to save it here."
          ctaLabel="Explore products" onCta={() => navigation.navigate('Products', {})} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it: any, i) => String(it.TAGKEY ?? i)}
          numColumns={2}
          contentContainerStyle={{ padding: SIZES.padding, paddingBottom: SIZES.TAB_BAR_HEIGHT }}
          columnWrapperStyle={{ gap: GAP, marginBottom: GAP }}
          renderItem={({ item }: any) => (
            <View style={[styles.card, { width: CARD_W, backgroundColor: C.card }]}>
              <TouchableOpacity activeOpacity={0.85}
                onPress={() => navigation.navigate('ProductDetails', { tagKey: item.TAGKEY })}>
                <SmartImage uri={firstImage(item.ImagePath)} style={styles.img} />
                <TouchableOpacity style={[styles.remove, { backgroundColor: C.card }]} onPress={() => removeFavorite(item.TAGKEY)}>
                  <Feather name="x" size={15} color={C.title} />
                </TouchableOpacity>
              </TouchableOpacity>
              <View style={styles.body}>
                <Text style={[styles.name, { color: C.title }]} numberOfLines={2}>{item.ITEMNAME}</Text>
                <Text style={[styles.price, { color: C.title }]}>{'₹'}{item.FinalAmount}</Text>
                <TouchableOpacity style={styles.cartBtn} onPress={() => addItem(item.TAGKEY)}>
                  <Feather name="shopping-bag" size={14} color={COLORS.white} />
                  <Text style={styles.cartTxt}>Add to Cart</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 12,
    borderBottomWidth: 1,
  },
  hBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  hTitle: { flex: 1, ...FONTS.h5, ...FONTS.fontSemiBold },
  card: { borderRadius: 14, overflow: 'hidden', elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  img: { width: '100%', height: CARD_W },
  remove: { position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', elevation: 2 },
  body: { padding: 10, gap: 5 },
  name: { ...FONTS.fontSm, ...FONTS.fontSemiBold, lineHeight: 17 },
  price: { ...FONTS.font, ...FONTS.fontBold },
  cartBtn: { flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.primary, borderRadius: SIZES.radius, paddingVertical: 8, marginTop: 4 },
  cartTxt: { ...FONTS.fontSm, ...FONTS.fontSemiBold, color: COLORS.white },
});

export default Wishlist;
