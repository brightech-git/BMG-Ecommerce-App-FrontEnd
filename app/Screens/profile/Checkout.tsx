// app/Screens/profile/Checkout.tsx
// Website: /checkout. Item mapping mirrors website cart->order EXACTLY:
//   productId=TAGKEY, itemId=ITEMID, price=GrandTotal, gstType=GSTType (required by
//   backend GST lookup), etc. Then createOrder -> ONLINE: Payment ; COD: PaymentStatus.
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { useCart, DEFAULT_PINCODE } from '../../api/hooks/useCart';
import { useAddresses } from '../../api/hooks/useAddresses';
import { useProfile } from '../../api/hooks/useProfile';
import { createOrder, CreateOrderPayload } from '../../api/services/orderService';
import { Loader, EmptyState } from '../../components/common/StateViews';
import { toastError } from '../../utils/toast';

type Nav = StackNavigationProp<RootStackParamList>;
const num = (v: any) => { const n = parseFloat(String(v ?? '0').replace(/[^0-9.]/g, '')); return isNaN(n) ? 0 : n; };
const rawFirstImage = (p: any): string => {
  try { const a = JSON.parse(p?.ImagePath ?? '[]'); return Array.isArray(a) ? (a[0] ?? '') : ''; }
  catch { return p?.imagePath ?? ''; }
};
// Per-item charge total (matches website: price = GrandTotal, falls back gracefully)
const itemPrice = (p: any) => num(p.GrandTotal ?? p.price ?? p.FinalAmount);

const Checkout = () => {
  const navigation = useNavigation<Nav>();
  const { cartProducts, isLoading } = useCart();
  const { addresses, isLoading: addrLoading, refetch: refetchAddresses } = useAddresses();
  const { profile } = useProfile();

  const [selectedId, setSelectedId] = useState<any>(null);
  const [paymentMode, setPaymentMode] = useState<'ONLINE' | 'COD'>('ONLINE');
  const [paymentType, setPaymentType] = useState<'CARD' | 'UPI' | 'NETBANKING'>('CARD');
  const [placing, setPlacing] = useState(false);

  useEffect(() => { refetchAddresses(); }, []);

  useEffect(() => {
    if (selectedId == null && addresses.length) {
      // Prefer the newest address that has a real address line, then default, then last/first
      const complete = [...addresses].reverse().find((a: any) => a.addressLine);
      const def = addresses.find((a: any) => a.isDefault);
      setSelectedId((complete ?? def ?? addresses[addresses.length - 1] ?? addresses[0])?.id);
    }
  }, [addresses, selectedId]);

  const selected = useMemo(() => addresses.find((a: any) => a.id === selectedId), [addresses, selectedId]);
  const subtotal = useMemo(
    () => cartProducts.reduce((s: number, p: any) => s + itemPrice(p) * (p.quantity ?? 1), 0),
    [cartProducts],
  );

  const placeOrder = async () => {
    if (!selected) { toastError('Please select a delivery address'); return; }
    if (!(selected as any).addressLine) { toastError('This address is incomplete. Please edit it and fill the full address line.'); return; }
    if (cartProducts.length === 0) { toastError('Your cart is empty'); return; }

    const payload: CreateOrderPayload = {
      customerName: (profile as any)?.username ?? (profile as any)?.name ?? (selected as any).name,
      contact: (profile as any)?.contactNumber ?? (selected as any).phone,
      email: (profile as any)?.email ?? (selected as any).email,
      totalAmount: subtotal,
      paymentMode,
      paymentType: paymentMode === 'ONLINE' ? paymentType : null,
      paymentStatus: 'PENDING',
      shippingPincode: (selected as any).pincode || DEFAULT_PINCODE,
      address: { ...(selected as any), country: (selected as any).country || 'India' },
      items: cartProducts.map((p: any) => ({
        itemId: p.ITEMID ?? p.itemId,
        tagNo: p.TAGNO ?? p.tagNo,
        sno: p.SNO ?? p.sno,
        productName: p.ItemName ?? p.SUBITEMNAME ?? p.ITEMNAME ?? p.productName,
        grossAmount: num(p.GrossAmount ?? p.grossAmount),
        price: itemPrice(p),
        netWt: num(p.NETWT ?? p.netWt),
        grsWt: num(p.GRSWT ?? p.grsWt),
        imagePath: rawFirstImage(p),
        quantity: p.quantity ?? 1,
        gstType: p.GSTType ?? p.gstType ?? 'CGST_SGST',
        gstPer: num(p.GSTPER ?? p.gstPer),
        gstAmount: num(p.GSTAmount ?? p.gstAmount),
      })),
    };

    try {
      setPlacing(true);
      const res: any = await createOrder(payload);
      const orderId = res?.orderId ?? res?.data?.orderId ?? res?.id;
      if (!orderId) { toastError('Order created but no order id returned'); return; }
      if (paymentMode === 'ONLINE') {
        navigation.navigate('Payment', { orderId, paymentMode: 'ONLINE', paymentType, totalAmount: subtotal });
      } else {
        navigation.navigate('PaymentStatus', { orderId, mode: 'cod' });
      }
    } catch (e: any) {
      toastError('Could not place order', e?.message);
    } finally {
      setPlacing(false);
    }
  };

  if (isLoading || addrLoading) return <View style={styles.safe}><Loader message="Loading checkout..." /></View>;

  if (cartProducts.length === 0) {
    return (
      <View style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.hBtn} onPress={() => navigation.goBack()}><Feather name="arrow-left" size={22} color={COLORS.title} /></TouchableOpacity>
          <Text style={styles.hTitle}>Checkout</Text><View style={styles.hBtn} />
        </View>
        <EmptyState icon="shopping-bag" title="Your cart is empty"
          ctaLabel="Start shopping" onCta={() => navigation.navigate('Products', {})} />
      </View>
    );
  }

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.hBtn} onPress={() => navigation.goBack()}><Feather name="arrow-left" size={22} color={COLORS.title} /></TouchableOpacity>
        <Text style={styles.hTitle}>Checkout</Text><View style={styles.hBtn} />
      </View>

      <ScrollView contentContainerStyle={{ padding: SIZES.padding, paddingBottom: 24 }}>
        <View style={styles.secRow}>
          <Text style={styles.secTitle}>Delivery Address</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SaveAddress', {})}>
            <Text style={styles.link}>+ Add</Text>
          </TouchableOpacity>
        </View>
        {addresses.length === 0 ? (
          <TouchableOpacity style={styles.addAddr} onPress={() => navigation.navigate('SaveAddress', {})}>
            <Feather name="plus" size={18} color={COLORS.primary} />
            <Text style={styles.link}>Add a delivery address</Text>
          </TouchableOpacity>
        ) : addresses.map((a: any) => (
          <TouchableOpacity key={a.id} style={[styles.addrCard, selectedId === a.id && styles.addrCardActive]}
            onPress={() => setSelectedId(a.id)}>
            <Feather name={selectedId === a.id ? 'check-circle' : 'circle'} size={18} color={selectedId === a.id ? COLORS.primary : COLORS.textLight} />
            <View style={{ flex: 1 }}>
              <Text style={styles.addrName}>{a.name} {a.addressType ? `· ${a.addressType}` : ''}</Text>
              <Text style={styles.addrLine}>{[a.addressLine, a.locality, a.city, a.state, a.pincode].filter(Boolean).join(', ')}</Text>
              {!!a.phone && <Text style={styles.addrPhone}>{a.phone}</Text>}
            </View>
          </TouchableOpacity>
        ))}

        <Text style={[styles.secTitle, { marginTop: 20 }]}>Items ({cartProducts.length})</Text>
        {cartProducts.map((p: any, i: number) => (
          <View key={i} style={styles.itemRow}>
            <Text style={styles.itemName} numberOfLines={1}>{p.ITEMNAME ?? p.SUBITEMNAME}</Text>
            <Text style={styles.itemQty}>x{p.quantity ?? 1}</Text>
            <Text style={styles.itemPrice}>{'₹'}{itemPrice(p).toLocaleString('en-IN')}</Text>
          </View>
        ))}

        <Text style={[styles.secTitle, { marginTop: 20 }]}>Payment Method</Text>
        {(['ONLINE', 'COD'] as const).map((m) => (
          <TouchableOpacity key={m} style={[styles.payRow, paymentMode === m && styles.payRowActive]} onPress={() => setPaymentMode(m)}>
            <Feather name={paymentMode === m ? 'check-circle' : 'circle'} size={18} color={paymentMode === m ? COLORS.primary : COLORS.textLight} />
            <Text style={styles.payLabel}>{m === 'ONLINE' ? 'Online Payment' : 'Cash on Delivery'}</Text>
          </TouchableOpacity>
        ))}
        {paymentMode === 'ONLINE' && (
          <View style={styles.typeRow}>
            {(['CARD', 'UPI', 'NETBANKING'] as const).map((t) => (
              <TouchableOpacity key={t} style={[styles.typeChip, paymentType === t && styles.typeChipActive]} onPress={() => setPaymentType(t)}>
                <Text style={[styles.typeTxt, paymentType === t && styles.typeTxtActive]}>{t === 'NETBANKING' ? 'Net Banking' : t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.summary}>
        <View style={styles.sumRow}>
          <Text style={styles.sumLabel}>Total</Text>
          <Text style={styles.sumValue}>{'₹'}{subtotal.toLocaleString('en-IN')}</Text>
        </View>
        <TouchableOpacity style={styles.placeBtn} disabled={placing} onPress={placeOrder}>
          <Text style={styles.placeTxt}>{placing ? 'Placing order...' : paymentMode === 'ONLINE' ? 'Pay & Place Order' : 'Place Order (COD)'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9F6F1' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.borderColor },
  hBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  hTitle: { flex: 1, ...FONTS.h5, ...FONTS.fontSemiBold, color: COLORS.title },
  secRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  secTitle: { ...FONTS.h6, ...FONTS.fontSemiBold, color: COLORS.title, marginBottom: 8 },
  link: { ...FONTS.fontSm, ...FONTS.fontSemiBold, color: COLORS.primary },
  addAddr: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.white, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.borderColor, borderStyle: 'dashed' },
  addrCard: { flexDirection: 'row', gap: 10, backgroundColor: COLORS.white, padding: 12, borderRadius: 12, marginBottom: 10, borderWidth: 1.5, borderColor: COLORS.borderColor },
  addrCardActive: { borderColor: COLORS.primary },
  addrName: { ...FONTS.fontSm, ...FONTS.fontSemiBold, color: COLORS.title },
  addrLine: { ...FONTS.fontSm, color: COLORS.text, marginTop: 2 },
  addrPhone: { ...FONTS.fontXs, color: COLORS.textLight, marginTop: 2 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.white, padding: 12, borderRadius: 10, marginBottom: 8 },
  itemName: { flex: 1, ...FONTS.fontSm, color: COLORS.title },
  itemQty: { ...FONTS.fontSm, color: COLORS.textLight },
  itemPrice: { ...FONTS.fontSm, ...FONTS.fontSemiBold, color: COLORS.title },
  payRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.white, padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1.5, borderColor: COLORS.borderColor },
  payRowActive: { borderColor: COLORS.primary },
  payLabel: { ...FONTS.font, ...FONTS.fontMedium, color: COLORS.title },
  typeRow: { flexDirection: 'row', gap: 8, marginTop: 2 },
  typeChip: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: SIZES.radius, borderWidth: 1, borderColor: COLORS.borderColor, backgroundColor: COLORS.white },
  typeChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  typeTxt: { ...FONTS.fontSm, color: COLORS.text },
  typeTxtActive: { color: COLORS.white },
  summary: { backgroundColor: COLORS.white, padding: SIZES.padding, borderTopWidth: 1, borderTopColor: COLORS.borderColor, gap: 12 },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sumLabel: { ...FONTS.fontLg, color: COLORS.text },
  sumValue: { ...FONTS.h5, ...FONTS.fontBold, color: COLORS.title },
  placeBtn: { backgroundColor: COLORS.primary, borderRadius: SIZES.radius_lg, paddingVertical: 15, alignItems: 'center' },
  placeTxt: { ...FONTS.fontLg, ...FONTS.fontSemiBold, color: COLORS.white },
});

export default Checkout;
