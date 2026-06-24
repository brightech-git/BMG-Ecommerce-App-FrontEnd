// app/Screens/profile/Checkout.tsx
// Website: /checkout.
// KEY FIX: itemId must be Number(TAGKEY) — the piece-level unique numeric identifier.
// KEY FIX: shippingFee now calculated live via /shipping/calculate (destPincode + weightInGrams).
// KEY FIX: totalAmount = subtotal + shippingFee (grandTotal).
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { useCart } from '../../api/hooks/useCart';
import { useAddresses } from '../../api/hooks/useAddresses';
import { useProfile } from '../../api/hooks/useProfile';
import { createOrder, CreateOrderPayload } from '../../api/services/orderService';
import { Loader, EmptyState } from '../../components/common/StateViews';
import { toastError } from '../../utils/toast';
import { axiosInstance } from '../../api/axiosInstance';
import { SHIPPING } from '../../api/endpoints';

type Nav = StackNavigationProp<RootStackParamList>;
type CheckoutRoute = RouteProp<RootStackParamList, 'Checkout'>;

const num = (v: any): number => {
  const n = parseFloat(String(v ?? '0').replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : n;
};

// Discounted price shown to user (FinalAmount = after discount, before order GST)
const itemPrice = (p: any): number => num(p.FinalAmount ?? p.GrandTotal ?? p.price ?? 0);
// Original price before discount (for strikethrough display)
const originalPrice = (p: any): number => num(p.OriginalAmount ?? p.GrandTotal ?? 0);

const Checkout = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<CheckoutRoute>();
  const { buyNowProduct, selectedTagKeys } = route.params ?? {};
  const { cart, cartProducts, isLoading } = useCart();
  const { addresses, isLoading: addrLoading, refetch: refetchAddresses } = useAddresses();
  const { profile } = useProfile();

  const [selectedId, setSelectedId] = useState<any>(null);
  const [paymentMode, setPaymentMode] = useState<'ONLINE' | 'COD'>('ONLINE');
  const [paymentType, setPaymentType] = useState<'CARD' | 'UPI' | 'NETBANKING'>('CARD');
  const [placing, setPlacing] = useState(false);
  const [shippingFee, setShippingFee] = useState(0);
  const [shippingLoading, setShippingLoading] = useState(false);
  const lastShippingKey = useRef('');

  useEffect(() => { refetchAddresses(); }, []);

  useEffect(() => {
    if (selectedId == null && addresses.length) {
      const complete = [...addresses].reverse().find((a: any) => a.addressLine);
      const def = addresses.find((a: any) => a.isDefault);
      setSelectedId(
        (complete ?? def ?? addresses[addresses.length - 1] ?? addresses[0])?.id
      );
    }
  }, [addresses, selectedId]);

  const selected = useMemo(
    () => addresses.find((a: any) => a.id === selectedId),
    [addresses, selectedId]
  );

  // Resolve which products to checkout:
  //   1. buyNowProduct — single item from "Buy Now" (not from cart)
  //   2. selectedTagKeys — subset of cart items selected on the cart page
  //   3. fallback — all cart items
  const checkoutProducts: any[] = useMemo(() => {
    if (buyNowProduct) return [{ ...buyNowProduct, quantity: buyNowProduct.quantity ?? 1 }];
    if (selectedTagKeys && selectedTagKeys.length > 0) {
      return cartProducts.filter((p: any) => selectedTagKeys.includes(String(p.TAGKEY)));
    }
    return cartProducts;
  }, [buyNowProduct, selectedTagKeys, cartProducts]);

  const isBuyNow = !!buyNowProduct;

  // Full (original) amount before any discount
  const fullAmount = useMemo(
    () => checkoutProducts.reduce((s: number, p: any) => s + originalPrice(p) * (p.quantity ?? 1), 0),
    [checkoutProducts]
  );

  // Discounted subtotal (what customer actually pays for items)
  const subtotal = useMemo(
    () => checkoutProducts.reduce((s: number, p: any) => s + itemPrice(p) * (p.quantity ?? 1), 0),
    [checkoutProducts]
  );

  const discountAmount = fullAmount - subtotal;

  // Total gross weight in grams across checkout items
  const totalWeightInGrams = useMemo(
    () => checkoutProducts.reduce((s: number, p: any) => {
      const wt = num(p.GRSWT ?? p.GrsWt ?? p.grsWt ?? p.NETWT ?? 0);
      return s + wt * (p.quantity ?? 1);
    }, 0),
    [checkoutProducts]
  );

  const grandTotal = subtotal + shippingFee;

  // Recalculate shipping whenever selected address or cart weight changes
  useEffect(() => {
    const pincode = (selected as any)?.pincode;
    if (!pincode || totalWeightInGrams <= 0) { setShippingFee(0); return; }

    const key = `${pincode}:${totalWeightInGrams}`;
    if (lastShippingKey.current === key) return;
    lastShippingKey.current = key;

    setShippingLoading(true);
    console.log('[Shipping] REQUEST params:', { destinationPincode: String(pincode), weightInGrams: totalWeightInGrams });
    axiosInstance.get(SHIPPING.CALCULATE, {
      params: { destinationPincode: String(pincode), weightInGrams: totalWeightInGrams },
    }).then((res: any) => {
      console.log('[Shipping] RESPONSE status:', res.status);
      console.log('[Shipping] RESPONSE data:', JSON.stringify(res.data, null, 2));
      const d = res.data;
      const fee = num(
        d?.totalAmount ?? d?.shippingCharge ?? d?.amount ?? d?.rate ??
        d?.totalCharge ?? d?.data?.totalAmount ?? d?.data?.shippingCharge ?? 0
      );
      console.log('[Shipping] Resolved fee:', fee);
      setShippingFee(fee);
    }).catch((e: any) => {
      console.log('[Shipping] ERROR status:', e?.response?.status);
      console.log('[Shipping] ERROR response data:', JSON.stringify(e?.response?.data, null, 2));
      console.log('[Shipping] ERROR message:', e?.message);
      setShippingFee(0);
    }).finally(() => setShippingLoading(false));
  }, [selected, totalWeightInGrams]);

  const placeOrder = async () => {
    if (!selected) {
      toastError('Please select a delivery address');
      return;
    }
    if (!(selected as any).addressLine) {
      toastError('Incomplete address', 'Please edit this address and fill the full address line.');
      return;
    }
    if (checkoutProducts.length === 0) {
      toastError('No items to checkout');
      return;
    }

    const items = checkoutProducts.map((p: any, i: number) => {
      const itemId = Number(p.TAGKEY) || Number(p.tagKey) || Number(p.itemId) || 0;
      const gstPer = parseFloat(String(p.GSTPer ?? p.GSTPER ?? p.gstPer ?? '0').replace('%', '')) || 0;
      let imagePath = '';
      try {
        const imgs = JSON.parse(p.ImagePath ?? '[]');
        imagePath = Array.isArray(imgs) ? (imgs[0] ?? '') : '';
      } catch { imagePath = p.imagePath ?? ''; }

      return {
        sno:         String(p.SNO ?? p.sno ?? String(i + 1)),
        itemId,
        tagNo:       String(p.TAGNO ?? p.tagNo ?? ''),
        productName: String(p.ITEMNAME ?? p.productName ?? p.SUBITEMNAME ?? ''),
        quantity:    Number(p.quantity ?? 1),
        price:       itemPrice(p),
        grossAmount: num(p.GrossAmount ?? p.grossAmount ?? 0),
        gstPer,
        gstAmount:   Number(p.gstAmount ?? p.GSTAmount ?? 0) || 0,
        netWt:       num(p.NETWT ?? p.NetWt ?? p.netWt ?? 0),
        grsWt:       num(p.GRSWT ?? p.GrsWt ?? p.grsWt ?? 0),
        gstType:     String(p.GSTType ?? p.gstType ?? ''),
        imagePath,
      };
    });

    const addr = selected as any;
    const payload: CreateOrderPayload = {
      totalAmount:     grandTotal,
      paymentMode:     paymentMode === 'COD' ? 'CASH' : 'ONLINE',
      paymentStatus:   'PENDING',
      shippingPincode: String(addr.pincode ?? ''),
      address: {
        name:           String(addr.name           ?? ''),
        mobile:          String(addr.phone          ?? ''),
        addressLine1:    String(addr.addressLine    ?? ''),
        addressLine:       String(addr.locality       ?? ''),
        city:           String(addr.city           ?? ''),
        state:          String(addr.state          ?? ''),
        country:        String(addr.country        ?? 'India'),
        pincode:        String(addr.pincode        ?? ''),
        ...(addr.alternatePhone  && { alternatePhone: String(addr.alternatePhone) }),
        ...(addr.landmark        && { landmark:       String(addr.landmark) }),
        ...(addr.isDefault  != null && { isDefault:  Boolean(addr.isDefault) }),
        ...(addr.gstNumber       && { gstNumber:      String(addr.gstNumber) }),
        ...(addr.companyName     && { companyName:    String(addr.companyName) }),
        ...(addr.createdTime     && { createdTime:    String(addr.createdTime) }),
        ...(addr.latitude        && { latitude:       Number(addr.latitude) }),
        ...(addr.longitude       && { longitude:      Number(addr.longitude) }),
      },
      items,
    };


    try {
      setPlacing(true);
      const res: any = await createOrder(payload);

      const orderId = res?.orderId ?? res?.data?.orderId ?? res?.id;
      if (!orderId) {
        toastError('Order placed but no order ID returned');
        return;
      }

      if (paymentMode === 'ONLINE') {
        navigation.navigate('Payment', {
          orderId,
          paymentMode:  'ONLINE',
          paymentType,
          totalAmount:  grandTotal,
        });
      } else {
        navigation.navigate('PaymentStatus', { orderId, mode: 'cod' });
      }
    } catch (e: any) {

      const errMsg =
        e?.response?.data?.message ??
        e?.response?.data?.error   ??
        e?.message                 ??
        'Could not place order. Please try again.';
      toastError(
        'Order failed',
        typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg)
      );
    } finally {
      setPlacing(false);
    }
  };

  if ((isLoading && !isBuyNow) || addrLoading) {
    return <View style={styles.safe}><Loader message="Loading checkout..." /></View>;
  }

  if (checkoutProducts.length === 0) {
    return (
      <View style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.hBtn} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={22} color={COLORS.title} />
          </TouchableOpacity>
          <Text style={styles.hTitle}>Checkout</Text>
          <View style={styles.hBtn} />
        </View>
        <EmptyState
          icon="shopping-bag"
          title="Your cart is empty"
          ctaLabel="Start shopping"
          onCta={() => navigation.navigate('Products', {})}
        />
      </View>
    );
  }

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.hBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={COLORS.title} />
        </TouchableOpacity>
        <Text style={styles.hTitle}>Checkout</Text>
        <View style={styles.hBtn} />
      </View>

      <ScrollView contentContainerStyle={{ padding: SIZES.padding, paddingBottom: 24 }}>

        {/* ── Delivery address ── */}
        <View style={styles.secRow}>
          <Text style={styles.secTitle}>Delivery Address</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SaveAddress', {})}>
            <Text style={styles.link}>+ Add</Text>
          </TouchableOpacity>
        </View>
        {addresses.length === 0 ? (
          <TouchableOpacity
            style={styles.addAddr}
            onPress={() => navigation.navigate('SaveAddress', {})}
          >
            <Feather name="plus" size={18} color={COLORS.primary} />
            <Text style={styles.link}>Add a delivery address</Text>
          </TouchableOpacity>
        ) : addresses.map((a: any) => (
          <TouchableOpacity
            key={a.id}
            style={[styles.addrCard, selectedId === a.id && styles.addrCardActive]}
            onPress={() => setSelectedId(a.id)}
          >
            <Feather
              name={selectedId === a.id ? 'check-circle' : 'circle'}
              size={18}
              color={selectedId === a.id ? COLORS.primary : COLORS.textLight}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.addrName}>
                {a.name}{a.addressType ? ` · ${a.addressType}` : ''}
              </Text>
              <Text style={styles.addrLine}>
                {[a.addressLine, a.locality, a.city, a.state, a.pincode].filter(Boolean).join(', ')}
              </Text>
              {!!a.phone && <Text style={styles.addrPhone}>{a.phone}</Text>}
            </View>
          </TouchableOpacity>
        ))}

        {/* ── Items ── */}
        <Text style={[styles.secTitle, { marginTop: 20 }]}>
          Items ({checkoutProducts.length}){isBuyNow ? ' · Buy Now' : ''}
        </Text>
        {checkoutProducts.map((p: any, i: number) => {
          const discounted = itemPrice(p);
          const original = originalPrice(p);
          const hasDiscount = original > 0 && original > discounted;
          return (
            <View key={i} style={styles.itemRow}>
              <Text style={styles.itemName} numberOfLines={1}>
                {p.ITEMNAME ?? p.SUBITEMNAME}
              </Text>
              <Text style={styles.itemQty}>x{p.quantity ?? 1}</Text>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.itemPrice}>₹{discounted.toLocaleString('en-IN')}</Text>
                {hasDiscount && (
                  <Text style={styles.itemOriginal}>₹{original.toLocaleString('en-IN')}</Text>
                )}
              </View>
            </View>
          );
        })}

        {/* ── Payment method ── */}
        <Text style={[styles.secTitle, { marginTop: 20 }]}>Payment Method</Text>
        {(['ONLINE', 'COD'] as const).map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.payRow, paymentMode === m && styles.payRowActive]}
            onPress={() => setPaymentMode(m)}
          >
            <Feather
              name={paymentMode === m ? 'check-circle' : 'circle'}
              size={18}
              color={paymentMode === m ? COLORS.primary : COLORS.textLight}
            />
            <Text style={styles.payLabel}>
              {m === 'ONLINE' ? 'Online Payment' : 'Cash on Delivery'}
            </Text>
          </TouchableOpacity>
        ))}
        {paymentMode === 'ONLINE' && (
          <View style={styles.typeRow}>
            {(['CARD', 'UPI', 'NETBANKING'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.typeChip, paymentType === t && styles.typeChipActive]}
                onPress={() => setPaymentType(t)}
              >
                <Text style={[styles.typeTxt, paymentType === t && styles.typeTxtActive]}>
                  {t === 'NETBANKING' ? 'Net Banking' : t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ── Summary + Place Order ── */}
      <View style={styles.summary}>
        {fullAmount > 0 && (
          <View style={styles.sumRow}>
            <Text style={styles.sumLabel}>Full Amount</Text>
            <Text style={styles.sumAmt}>₹{fullAmount.toLocaleString('en-IN')}</Text>
          </View>
        )}
        {discountAmount > 0 && (
          <View style={styles.sumRow}>
            <Text style={styles.sumLabel}>Discount</Text>
            <Text style={styles.sumDiscount}>− ₹{discountAmount.toLocaleString('en-IN')}</Text>
          </View>
        )}
        <View style={styles.sumRow}>
          <Text style={styles.sumLabel}>Sub Total</Text>
          <Text style={styles.sumAmt}>₹{subtotal.toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.sumRow}>
          <Text style={styles.sumLabel}>Shipping</Text>
          {shippingLoading
            ? <ActivityIndicator size="small" color={COLORS.primary} />
            : <Text style={styles.sumAmt}>
                {shippingFee > 0 ? `₹${shippingFee.toLocaleString('en-IN')}` : 'FREE'}
              </Text>
          }
        </View>
        <View style={[styles.sumRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.sumValue}>₹{grandTotal.toLocaleString('en-IN')}</Text>
        </View>
        <TouchableOpacity
          style={[styles.placeBtn, (placing || shippingLoading) && styles.placeBtnDisabled]}
          disabled={placing || shippingLoading}
          onPress={placeOrder}
        >
          <Text style={styles.placeTxt}>
            {placing
              ? 'Placing order…'
              : shippingLoading
                ? 'Calculating shipping…'
                : paymentMode === 'ONLINE'
                  ? 'Pay & Place Order'
                  : 'Place Order (COD)'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9F6F1' },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.borderColor,
  },
  hBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  hTitle: { flex: 1, ...FONTS.h5, ...FONTS.fontSemiBold, color: COLORS.title },
  secRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  secTitle: { ...FONTS.h6, ...FONTS.fontSemiBold, color: COLORS.title, marginBottom: 8 },
  link: { ...FONTS.fontSm, ...FONTS.fontSemiBold, color: COLORS.primary },
  addAddr: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.white,
    padding: 16, borderRadius: 12, borderWidth: 1,
    borderColor: COLORS.borderColor, borderStyle: 'dashed',
  },
  addrCard: {
    flexDirection: 'row', gap: 10, backgroundColor: COLORS.white, padding: 12,
    borderRadius: 12, marginBottom: 10, borderWidth: 1.5, borderColor: COLORS.borderColor,
  },
  addrCardActive: { borderColor: COLORS.primary },
  addrName: { ...FONTS.fontSm, ...FONTS.fontSemiBold, color: COLORS.title },
  addrLine: { ...FONTS.fontSm, color: COLORS.text, marginTop: 2 },
  addrPhone: { ...FONTS.fontXs, color: COLORS.textLight, marginTop: 2 },
  itemRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.white, padding: 12, borderRadius: 10, marginBottom: 8,
  },
  itemName: { flex: 1, ...FONTS.fontSm, color: COLORS.title },
  itemQty: { ...FONTS.fontSm, color: COLORS.textLight },
  itemPrice: { ...FONTS.fontSm, ...FONTS.fontSemiBold, color: COLORS.title },
  itemOriginal: { ...FONTS.fontXs, color: COLORS.textLight, textDecorationLine: 'line-through' },
  payRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.white,
    padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1.5, borderColor: COLORS.borderColor,
  },
  payRowActive: { borderColor: COLORS.primary },
  payLabel: { ...FONTS.font, ...FONTS.fontMedium, color: COLORS.title },
  typeRow: { flexDirection: 'row', gap: 8, marginTop: 2 },
  typeChip: {
    flex: 1, alignItems: 'center', paddingVertical: 10,
    borderRadius: SIZES.radius, borderWidth: 1,
    borderColor: COLORS.borderColor, backgroundColor: COLORS.white,
  },
  typeChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  typeTxt: { ...FONTS.fontSm, color: COLORS.text },
  typeTxtActive: { color: COLORS.white },
  summary: {
    backgroundColor: COLORS.white, padding: SIZES.padding,
    borderTopWidth: 1, borderTopColor: COLORS.borderColor, gap: 6,
  },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.borderColor,
    paddingTop: 8, marginTop: 2,
  },
  sumLabel: { ...FONTS.fontSm, color: COLORS.text },
  sumAmt: { ...FONTS.fontSm, color: COLORS.title },
  sumDiscount: { ...FONTS.fontSm, ...FONTS.fontSemiBold, color: '#16a34a' },
  totalLabel: { ...FONTS.fontLg, ...FONTS.fontSemiBold, color: COLORS.title },
  sumValue: { ...FONTS.h5, ...FONTS.fontBold, color: COLORS.title },
  placeBtn: {
    backgroundColor: COLORS.primary, borderRadius: SIZES.radius_lg,
    paddingVertical: 15, alignItems: 'center', marginTop: 4,
  },
  placeBtnDisabled: { opacity: 0.6 },
  placeTxt: { ...FONTS.fontLg, ...FONTS.fontSemiBold, color: COLORS.white },
});

export default Checkout;
