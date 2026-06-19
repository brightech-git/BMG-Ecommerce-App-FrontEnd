// app/Screens/MyCart/MyCart.tsx
// Cart with per-item selection. Only selected items are passed to Checkout.
import React, { useMemo, useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  FlatList, StatusBar, Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { useCart } from '../../api/hooks/useCart';
import { firstImage } from '../../utils/image';
import { SmartImage } from '../../components/common/SmartImage';
import { CartWishlistBadge } from '../../components/common/CartWishlistBadge';
import { Loader, EmptyState, ErrorState } from '../../components/common/StateViews';

type Nav = StackNavigationProp<RootStackParamList>;
const num = (v: any) => { const n = parseFloat(String(v ?? '0').replace(/[^0-9.]/g, '')); return isNaN(n) ? 0 : n; };

const MyCart = () => {
  const navigation = useNavigation<Nav>();
  const {
    cart, cartProducts, cartCount, isLoading, isError, refetch,
    isAuthenticated, removeItem, isRemoving, clearCart,
  } = useCart();

  // Selection state — keys of selected items (all selected by default)
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  // When cart loads / changes, auto-select all new items
  useEffect(() => {
    if (cartProducts.length > 0) {
      setSelectedKeys(new Set(cartProducts.map((p: any) => String(p.TAGKEY))));
    }
  }, [cartProducts.length]);

  const allSelected = cartProducts.length > 0 && selectedKeys.size === cartProducts.length;

  const toggleItem = (key: string) => {
    setSelectedKeys(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelectedKeys(new Set());
    } else {
      setSelectedKeys(new Set(cartProducts.map((p: any) => String(p.TAGKEY))));
    }
  };

  const selectedProducts = useMemo(
    () => cartProducts.filter((p: any) => selectedKeys.has(String(p.TAGKEY))),
    [cartProducts, selectedKeys]
  );

  const subtotal = useMemo(() => {
    const provided = (cart.data as any)?.data?.subtotal ?? (cart.data as any)?.data?.total;
    if (provided != null && selectedKeys.size === cartProducts.length) return num(provided);
    return selectedProducts.reduce((sum: number, p: any) => sum + num(p.FinalAmount) * (p.quantity ?? 1), 0);
  }, [cart.data, cartProducts, selectedProducts, selectedKeys]);

  const handleCheckout = () => {
    if (selectedKeys.size === 0) {
      Alert.alert('No items selected', 'Please select at least one item to checkout.');
      return;
    }
    navigation.navigate('Checkout', {
      selectedTagKeys: [...selectedKeys],
    });
  };

  const Header = (
    <View style={styles.header}>
      {navigation.canGoBack() && (
        <TouchableOpacity style={styles.hBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={COLORS.title} />
        </TouchableOpacity>
      )}
      <Text style={styles.hTitle}>My Cart{cartCount ? ` (${cartCount})` : ''}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {cartCount > 0 && (
          <TouchableOpacity style={styles.hBtn}
            onPress={() => Alert.alert('Clear cart', 'Remove all items?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Clear', style: 'destructive', onPress: () => clearCart() },
            ])}>
            <Feather name="trash-2" size={19} color={COLORS.danger} />
          </TouchableOpacity>
        )}
        <CartWishlistBadge />
      </View>
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
          {/* Select all row */}
          <View style={styles.selectAllRow}>
            <TouchableOpacity style={styles.checkRow} onPress={toggleAll}>
              <View style={[styles.checkbox, allSelected && styles.checkboxActive]}>
                {allSelected && <Feather name="check" size={11} color="#fff" />}
              </View>
              <Text style={styles.selectAllTxt}>
                {allSelected ? 'Deselect All' : `Select All (${cartProducts.length})`}
              </Text>
            </TouchableOpacity>
            {selectedKeys.size > 0 && (
              <Text style={styles.selectedInfo}>{selectedKeys.size} selected</Text>
            )}
          </View>

          <FlatList
            data={cartProducts}
            keyExtractor={(it: any, i) => String(it.TAGKEY ?? i)}
            contentContainerStyle={{ padding: SIZES.padding, paddingBottom: 20 }}
            renderItem={({ item }: any) => {
              const key = String(item.TAGKEY);
              const checked = selectedKeys.has(key);
              return (
                <View style={[styles.row, !checked && styles.rowDimmed]}>
                  {/* Checkbox */}
                  <TouchableOpacity style={styles.checkTap} onPress={() => toggleItem(key)}>
                    <View style={[styles.checkbox, checked && styles.checkboxActive]}>
                      {checked && <Feather name="check" size={11} color="#fff" />}
                    </View>
                  </TouchableOpacity>

                  {/* Thumbnail */}
                  <TouchableOpacity onPress={() => navigation.navigate('ProductDetails', { tagKey: item.TAGKEY })}>
                    <SmartImage uri={firstImage(item.ImagePath)} style={styles.thumb} />
                  </TouchableOpacity>

                  <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={2}>{item.ITEMNAME}</Text>
                    {!!item.SUBITEMNAME && <Text style={styles.sub} numberOfLines={1}>{item.SUBITEMNAME}</Text>}
                    <Text style={styles.price}>₹{item.FinalAmount}</Text>
                    <Text style={styles.qty}>Qty: {item.quantity ?? 1}</Text>
                  </View>
                  <TouchableOpacity style={styles.del} disabled={isRemoving}
                    onPress={() => removeItem(item.TAGKEY)}>
                    <Feather name="trash-2" size={18} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>
              );
            }}
          />
          <View style={styles.summary}>
            <View style={styles.sumRow}>
              <Text style={styles.sumLabel}>
                Subtotal ({selectedKeys.size} of {cartProducts.length} items)
              </Text>
              <Text style={styles.sumValue}>₹{subtotal.toLocaleString('en-IN')}</Text>
            </View>
            <TouchableOpacity
              style={[styles.checkout, selectedKeys.size === 0 && styles.checkoutDisabled]}
              onPress={handleCheckout}
              disabled={selectedKeys.size === 0}
            >
              <Text style={styles.checkoutTxt}>
                Checkout ({selectedKeys.size} item{selectedKeys.size !== 1 ? 's' : ''})
              </Text>
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

  selectAllRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.borderColor,
  },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: {
    width: 20, height: 20, borderRadius: 5,
    borderWidth: 1.5, borderColor: COLORS.borderColor,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  selectAllTxt: { ...FONTS.fontSm, ...FONTS.fontMedium, color: COLORS.title },
  selectedInfo: { ...FONTS.fontXs, color: COLORS.primary, ...FONTS.fontSemiBold },

  row: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
    borderRadius: 14, padding: 10, marginBottom: 12,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
  },
  rowDimmed: { opacity: 0.45 },
  checkTap: { paddingRight: 8, alignSelf: 'center' },
  thumb: { width: 80, height: 80, borderRadius: 10 },
  info: { flex: 1, paddingHorizontal: 10, justifyContent: 'center', gap: 3 },
  name: { ...FONTS.fontSm, ...FONTS.fontSemiBold, color: COLORS.title, lineHeight: 17 },
  sub: { ...FONTS.fontXs, color: COLORS.secondary },
  price: { ...FONTS.font, ...FONTS.fontBold, color: COLORS.title, marginTop: 2 },
  qty: { ...FONTS.fontXs, color: COLORS.textLight },
  del: { padding: 6, alignSelf: 'flex-start' },

  summary: {
    backgroundColor: COLORS.white, padding: SIZES.padding,
    paddingBottom: SIZES.TAB_BAR_HEIGHT,
    borderTopWidth: 1, borderTopColor: COLORS.borderColor, gap: 12,
  },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sumLabel: { ...FONTS.fontSm, color: COLORS.text },
  sumValue: { ...FONTS.h5, ...FONTS.fontBold, color: COLORS.title },
  checkout: {
    flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.primary, borderRadius: SIZES.radius_lg, paddingVertical: 15,
  },
  checkoutDisabled: { backgroundColor: COLORS.textLight },
  checkoutTxt: { ...FONTS.fontLg, ...FONTS.fontSemiBold, color: COLORS.white },
});

export default MyCart;
