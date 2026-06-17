import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {useCart} from '../../hooks/useCart';
import {useAuth} from '../../context/AuthContext';
import {colors} from '../../theme/theme';

const BASE = 'https://app.bmgjewellers.com';

const resolveImg = imageData => {
  try {
    const arr =
      typeof imageData === 'string' ? JSON.parse(imageData) : imageData;
    if (!Array.isArray(arr) || !arr.length) return null;
    const img = arr[0];
    return img.startsWith('http') ? img : `${BASE}${img}`;
  } catch {
    return null;
  }
};

const fmt = val => {
  const n = parseFloat(val);
  if (!n) return '—';
  return `₹${n.toLocaleString('en-IN', {maximumFractionDigits: 0})}`;
};

// ── Cart item row ─────────────────────────────────────────────────────────────
const CartItem = ({item, onDelete, navigation}) => {
  const uri = resolveImg(item?.ImagePath);
  const name = item?.ITEMNAME ?? item?.itemName ?? 'Product';
  const price = fmt(item?.FinalAmount ?? item?.GrandTotal ?? item?.SALERATE);

  return (
    <View style={styles.itemCard}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('ProductDetail', {
            tagKey: item?.TAGKEY,
            itemName: item?.ITEMNAME,
          })
        }
        activeOpacity={0.9}>
        {uri ? (
          <Image source={{uri}} style={styles.itemImg} resizeMode="cover" />
        ) : (
          <View style={[styles.itemImg, styles.imgPlaceholder]}>
            <Text style={{fontSize: 28}}>💍</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>{name}</Text>
        {item?.NETWT ? (
          <Text style={styles.itemMeta}>{item.NETWT}g net wt</Text>
        ) : null}
        {item?.PURITY ? (
          <Text style={styles.itemMeta}>{item.PURITY}</Text>
        ) : null}
        <Text style={styles.itemPrice}>{price}</Text>
      </View>

      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={onDelete}
        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
        <Ionicons name="trash-outline" size={18} color={colors.error} />
      </TouchableOpacity>
    </View>
  );
};

// ── CartScreen ────────────────────────────────────────────────────────────────
const CartScreen = ({navigation}) => {
  const {cartProducts, isLoading, deleteCart, clearCart} = useCart();
  const {isAuthenticated} = useAuth();
  const [clearing, setClearing] = useState(false);

  const total = cartProducts.reduce((sum, p) => {
    const v = parseFloat(p?.FinalAmount ?? p?.GrandTotal ?? p?.SALERATE ?? 0);
    return sum + v;
  }, 0);

  const handleDelete = item => {
    Alert.alert('Remove Item', `Remove "${item?.ITEMNAME}" from cart?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => deleteCart.mutate(item?.id ?? item?.ID ?? item?.TAGKEY),
      },
    ]);
  };

  const handleClear = () => {
    Alert.alert('Clear Cart', 'Remove all items from cart?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Clear All',
        style: 'destructive',
        onPress: async () => {
          setClearing(true);
          clearCart();
          setTimeout(() => setClearing(false), 1000);
        },
      },
    ]);
  };

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Cart</Text>
        </View>
        <View style={styles.emptyWrap}>
          <Text style={{fontSize: 56, marginBottom: 16}}>🛒</Text>
          <Text style={styles.emptyTitle}>Please log in</Text>
          <Text style={styles.emptySub}>Sign in to view your cart</Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        {cartProducts.length > 0 ? (
          <TouchableOpacity onPress={handleClear}>
            {clearing ? (
              <ActivityIndicator size="small" color={colors.error} />
            ) : (
              <Text style={styles.clearText}>Clear</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={{width: 40}} />
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : cartProducts.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={{fontSize: 56, marginBottom: 16}}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySub}>Browse our collection and add items</Text>
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => navigation.navigate('Home')}>
            <Text style={styles.shopBtnText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartProducts}
            keyExtractor={(item, i) => item?.TAGKEY ? String(item.TAGKEY) : `c-${i}`}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({item}) => (
              <CartItem
                item={item}
                onDelete={() => handleDelete(item)}
                navigation={navigation}
              />
            )}
          />

          {/* Summary + checkout */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Items ({cartProducts.length})
              </Text>
              <Text style={styles.summaryValue}>{fmt(total)}</Text>
            </View>
            <View style={[styles.summaryRow, {marginTop: 4}]}>
              <Text style={styles.summaryLabel}>Delivery</Text>
              <Text style={[styles.summaryValue, {color: colors.success}]}>
                Free
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{fmt(total)}</Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={() => navigation.navigate('Checkout')}
              activeOpacity={0.85}>
              <Ionicons name="bag-check-outline" size={20} color={colors.white} />
              <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: colors.background},
  header: {
    backgroundColor: colors.headerBg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
  },
  clearText: {fontSize: 13, color: colors.error, fontWeight: '700'},

  loadingWrap: {flex: 1, alignItems: 'center', justifyContent: 'center'},

  list: {padding: 16, paddingBottom: 8},

  itemCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    overflow: 'hidden',
  },
  itemImg: {width: 90, height: 90},
  imgPlaceholder: {
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {flex: 1, padding: 10, justifyContent: 'center'},
  itemName: {fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 3},
  itemMeta: {fontSize: 11, color: colors.textSecondary, marginBottom: 2},
  itemPrice: {fontSize: 14, fontWeight: '800', color: colors.primary, marginTop: 4},
  deleteBtn: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  summaryCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 28,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 12,
  },
  summaryRow: {flexDirection: 'row', justifyContent: 'space-between'},
  summaryLabel: {fontSize: 13, color: colors.textSecondary},
  summaryValue: {fontSize: 13, fontWeight: '600', color: colors.text},
  divider: {height: 1, backgroundColor: colors.border, marginVertical: 12},
  totalLabel: {fontSize: 16, fontWeight: '800', color: colors.text},
  totalValue: {fontSize: 18, fontWeight: '900', color: colors.primary},

  checkoutBtn: {
    marginTop: 16,
    backgroundColor: colors.primaryMild,
    borderRadius: 12,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  checkoutBtnText: {fontSize: 15, fontWeight: '800', color: colors.white, letterSpacing: 0.5},

  emptyWrap: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32},
  emptyTitle: {fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 6},
  emptySub: {fontSize: 13, color: colors.textSecondary, marginBottom: 24, textAlign: 'center'},
  shopBtn: {
    backgroundColor: colors.primaryMild,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  shopBtnText: {fontSize: 14, fontWeight: '700', color: colors.white},
  loginBtn: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  loginBtnText: {fontSize: 14, fontWeight: '700', color: colors.primary},
});
