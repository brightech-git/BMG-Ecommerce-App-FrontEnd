// app/Screens/profile/PaymentStatus.tsx
// Website: /payment-success (paymentStatus.jsx). COD -> success; ONLINE -> verify via
// /payment/status, then show result. Clears the cart on success.
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { StackScreenProps } from '@react-navigation/stack';
import { CommonActions } from '@react-navigation/native';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { getPaymentStatus } from '../../api/services/paymentService';
import { Loader } from '../../components/common/StateViews';

type Props = StackScreenProps<RootStackParamList, 'PaymentStatus'>;
type Result = 'success' | 'failed' | 'pending';

const isSuccess = (s: any): boolean => {
  const txt = JSON.stringify(s ?? {}).toUpperCase();
  return /SUCCESS|CAPTURED|"PAID"|COMPLETED|APPROVED/.test(txt) && !/FAIL|DECLINE|CANCEL/.test(txt);
};

const PaymentStatus = ({ route, navigation }: Props) => {
  const { isDark, colors: C } = useTheme();
  const { orderId, mode } = route.params;
  const isCod = (mode ?? '').toLowerCase() === 'cod';
  const qc = useQueryClient();
  const [result, setResult] = useState<Result>(isCod ? 'success' : 'pending');
  const [loading, setLoading] = useState(!isCod);
  const ran = useRef(false);

  useEffect(() => {
    // success clears the cart cache
    if (result === 'success') qc.invalidateQueries({ queryKey: ['cart'] });
  }, [result, qc]);

  useEffect(() => {
    if (isCod || ran.current) return;
    ran.current = true;
    (async () => {
      try {
        const s = await getPaymentStatus(orderId);
        setResult(isSuccess(s) ? 'success' : 'failed');
      } catch {
        setResult('pending'); // could not confirm; let user check Orders
      } finally {
        setLoading(false);
      }
    })();
  }, [isCod, orderId]);

  const goHome = () => navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'DrawerNavigation' as never }] }));
  const goOrders = () => navigation.navigate('Myorder');

  if (loading) return <View style={[styles.safe, { backgroundColor: C.background }]}><Loader message="Confirming your payment..." /></View>;

  const cfg = result === 'success'
    ? { icon: 'check-circle' as const, color: COLORS.success, title: isCod ? 'Order Placed!' : 'Payment Successful!', sub: `Your order #${orderId} has been confirmed.` }
    : result === 'failed'
    ? { icon: 'x-circle' as const, color: COLORS.danger, title: 'Payment Failed', sub: 'Your payment could not be completed. You can try again from your cart.' }
    : { icon: 'clock' as const, color: COLORS.warning, title: 'Payment Pending', sub: `We couldn't confirm payment for order #${orderId} yet. Check My Orders shortly.` };

  return (
    <View style={[styles.safe, { backgroundColor: C.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={styles.center}>
        <View style={[styles.circle, { backgroundColor: cfg.color + '18' }]}>
          <Feather name={cfg.icon} size={56} color={cfg.color} />
        </View>
        <Text style={[styles.title, { color: C.title }]}>{cfg.title}</Text>
        <Text style={[styles.sub, { color: C.textLight }]}>{cfg.sub}</Text>

        <TouchableOpacity style={styles.primaryBtn} onPress={goOrders}>
          <Text style={styles.primaryTxt}>View My Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={goHome}>
          <Text style={styles.secondaryTxt}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  circle: { width: 110, height: 110, borderRadius: 55, alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
  title: { ...FONTS.h3, ...FONTS.fontSemiBold, textAlign: 'center' },
  sub: { ...FONTS.font, textAlign: 'center', marginTop: 8, maxWidth: 300 },
  primaryBtn: { backgroundColor: COLORS.primary, borderRadius: SIZES.radius_lg, paddingVertical: 14, paddingHorizontal: 40, marginTop: 30 },
  primaryTxt: { ...FONTS.fontLg, ...FONTS.fontSemiBold, color: COLORS.white },
  secondaryBtn: { paddingVertical: 14, paddingHorizontal: 40, marginTop: 10 },
  secondaryTxt: { ...FONTS.font, ...FONTS.fontSemiBold, color: COLORS.primary },
});

export default PaymentStatus;
