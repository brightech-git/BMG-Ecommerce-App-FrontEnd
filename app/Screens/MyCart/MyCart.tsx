// app/Screens/MyCart/MyCart.tsx
// Website page: /cart (Cart). Data: /cart/summary, /cart/item/:tagKey, /cart/clear (useCart).
// NOTE: root App.tsx provides SafeAreaView, so use a plain View container.
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, StatusBar, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { useCart } from '../../api/hooks/useCart';
import { firstImage } from '../../utils/image';
import { SmartImage } from '../../components/common/SmartImage';
import { Loader, EmptyState, ErrorState } from '../../components/common/StateViews';

type Nav = StackNavigationProp<RootStackParamList>;
const num = (v: any) => { const n = parseFloat(String(v ?? '0').replace(/[^0-9.]/g, '')); return isNaN(n) ? 0 : n; };

const MyCart = () => {
  const navigation = useNavigation<Nav>();
  const {
    cart, cartProducts, cartCount, isLoading, isError, refetch,
    isAuthenticated, removeItem, isRemoving, clearCart,
  } = useCart();

  const subtotal = useMemo(() => {
    const provided = (cart.data as any)?.data?.subtotal ?? (cart.data as any)?.data?.total;
    if (provided != null) return num(provided);
    return cartProducts.reduce((sum: number, p: any) => sum + num(p.FinalAmount) * (p.quantity ?? 1), 0);
  }, [cart.data, cartProducts]);

  const Header = (
    <View style={styles.header}>
      {navigation.canGoBack() && (
        <TouchableOpacity style={styles.hBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={COLORS.title} />
        </TouchableOpacity>
      )}
      <Text style={styles.hTitle}>My Cart{cartCount ? ` (${cartCount})` : ''}</Text>
      {cartCount > 0 && (
        <TouchableOpacity style={styles.hBtn}
          onPress={() => Alert.alert('Clear cart', 'Remove all items?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Clear', style: 'destructive', onPress: () => clearCart() },
          ])}>
          <Feather name="trash-2" size={19} color={COLORS.danger} />
        </TouchableOpacity>
      )}
    </View>
  );

  if (!isAuthenticated) {
    return (
      <View style={styles.safe}>{Header}
        <EmptyState icon="shopping-bag" title="Your cart is empty"
          subtitle="Sign in to start shopping." ctaLabel="Sign In"
          onCta={() => navigation.navigate('SignIn')} />
      </View>
    );
  }

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      {Header}
      {isLoading ? (
        <Loader message="Loading cart..." />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : cartProducts.length === 0 ? (
        <EmptyState icon="shopping-bag" title="Your cart is empty"
          subtitle="Browse our collections and add something sparkly."
          ctaLabel="Start shopping" onCta={() => navigation.navigate('Products', {})} />
      ) : (
        <>
          <FlatList
            data={cartProducts}
            keyExtractor={(it: any, i) => String(it.TAGKEY ?? i)}
            contentContainerStyle={{ padding: SIZES.padding, paddingBottom: 20 }}
            renderItem={({ item }: any) => (
              <View style={styles.row}>
                <TouchableOpacity onPress={() => navigation.navigate('ProductDetails', { tagKey: item.TAGKEY })}>
                  <SmartImage uri={firstImage(item.ImagePath)} style={styles.thumb} />
                </TouchableOpacity>
                <View style={styles.info}>
                  <Text style={styles.name} numberOfLines={2}>{item.ITEMNAME}</Text>
                  {!!item.SUBITEMNAME && <Text style={styles.sub} numberOfLines={1}>{item.SUBITEMNAME}</Text>}
                  <Text style={styles.price}>{'₹'}{item.FinalAmount}</Text>
                  <Text style={styles.qty}>Qty: {item.quantity ?? 1}</Text>
                </View>
                <TouchableOpacity style={styles.del} disabled={isRemoving}
                  onPress={() => removeItem(item.TAGKEY)}>
                  <Feather name="trash-2" size={18} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            )}
          />
          <View style={styles.summary}>
            <View style={styles.sumRow}>
              <Text style={styles.sumLabel}>Subtotal</Text>
              <Text style={styles.sumValue}>{'₹'}{subtotal.toLocaleString('en-IN')}</Text>
            </View>
            <TouchableOpacity style={styles.checkout} onPress={() => navigation.navigate('Checkout')}>
              <Text style={styles.checkoutTxt}>Proceed to Checkout</Text>
              <Feather name="arrow-right" size={18} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </>
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
  row: {
    flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 14, padding: 10,
    marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
  },
  thumb: { width: 90, height: 90, borderRadius: 10 },
  info: { flex: 1, paddingHorizontal: 12, justifyContent: 'center', gap: 3 },
  name: { ...FONTS.fontSm, ...FONTS.fontSemiBold, color: COLORS.title, lineHeight: 17 },
  sub: { ...FONTS.fontXs, color: COLORS.secondary },
  price: { ...FONTS.font, ...FONTS.fontBold, color: COLORS.title, marginTop: 2 },
  qty: { ...FONTS.fontXs, color: COLORS.textLight },
  del: { padding: 6, alignSelf: 'flex-start' },
  summary: {
    backgroundColor: COLORS.white, padding: SIZES.padding,
    borderTopWidth: 1, borderTopColor: COLORS.borderColor, gap: 12,
  },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sumLabel: { ...FONTS.fontLg, color: COLORS.text },
  sumValue: { ...FONTS.h5, ...FONTS.fontBold, color: COLORS.title },
  checkout: {
    flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.primary, borderRadius: SIZES.radius_lg, paddingVertical: 15,
  },
  checkoutTxt: { ...FONTS.fontLg, ...FONTS.fontSemiBold, color: COLORS.white },
});

export default MyCart;
