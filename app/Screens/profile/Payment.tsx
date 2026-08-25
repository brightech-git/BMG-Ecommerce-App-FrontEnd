// app/Screens/profile/Payment.tsx
// Website: /payment/:orderId. Online flow:
//   /payment/initiate-sale -> { redirectURI, tranCtx, responseCode }
//   /payment/redirect-url   -> gateway URL (text)  -> load in WebView
//   on return to returnURL (bmgjewellers.com) -> PaymentStatus.
// Payload mirrors the proven working version: payType:0 + customerEmailID/MobileNo
// + paymentMode + cardType/upiApp/bankCode.
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { Feather } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { COLORS, FONTS } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { initiatePayment, getPaymentRedirectUrl } from '../../api/services/paymentService';
import { AsyncStorageHelper } from '../../utils/AsyncStorageHelper';
import { Loader, ErrorState } from '../../components/common/StateViews';

type Props = StackScreenProps<RootStackParamList, 'Payment'>;
const RETURN_HOST = 'bmgjewellers.com';

const apiPaymentMode = (t?: string) => (t === 'NETBANKING' ? 'NB' : (t ?? 'CARD'));

const Payment = ({ route, navigation }: Props) => {
  const { orderId, paymentMode, paymentType, totalAmount } = route.params;
  const { isDark, colors: C } = useTheme();
  const [gatewayUrl, setGatewayUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(true);
  const startedRef = useRef(false);
  const settledRef = useRef(false);

  useEffect(() => {
    if (paymentMode === 'COD') {
      navigation.replace('PaymentStatus', { orderId, mode: 'cod' });
    }
  }, [paymentMode, orderId, navigation]);

  useEffect(() => {
    if (paymentMode === 'COD' || startedRef.current) return;
    startedRef.current = true;

    (async () => {
      try {
        const [email, contact] = await Promise.all([
          AsyncStorageHelper.getEmail(),
          AsyncStorageHelper.getContactNumber(),
        ]);

        const req: any = {
          merchantTxnNo: String(orderId),
          amount: Number(totalAmount ?? 0).toFixed(2),
          currencyCode: 356,
          payType: 0,
          transactionType: 'SALE',
          addlParam1: '',
          addlParam2: '',
          returnURL: `https://${RETURN_HOST}`,
          customerEmailID: email ?? '',
          customerMobileNo: contact ?? '',
          paymentMode: apiPaymentMode(paymentType),
        };
        if (paymentType === 'CARD') req.cardType = 'ALL';
        else if (paymentType === 'UPI') req.upiApp = 'ALL';
        else if (paymentType === 'NETBANKING') req.bankCode = 'ALL';

        const res: any = await initiatePayment(req);
        console.log('[Payment] initiatePayment response:', JSON.stringify(res, null, 2));
        if (res?.responseCode && res.responseCode !== 'R1000') {
          throw new Error(`Payment failed (code: ${res.responseCode})`);
        }
        const redirectURI = res?.redirectURI ?? res?.data?.redirectURI;
        const tranCtx = res?.tranCtx ?? res?.data?.tranCtx;
        console.log('[Payment] redirectURI:', redirectURI, '| tranCtx:', tranCtx);
        if (!redirectURI || !tranCtx) throw new Error('Invalid payment response');

        const url: any = await getPaymentRedirectUrl(redirectURI, tranCtx);
        console.log('[Payment] getPaymentRedirectUrl response:', JSON.stringify(url, null, 2));
        const finalUrl = typeof url === 'string' ? url : (url?.url ?? url?.data ?? '');
        console.log('[Payment] finalUrl:', finalUrl);
        if (!finalUrl) throw new Error('Could not build payment URL');
        setGatewayUrl(finalUrl);
      } catch (e: any) {
        setError(e?.message ?? 'Payment initiation failed');
      } finally {
        setPreparing(false);
      }
    })();
  }, [orderId, paymentMode, paymentType, totalAmount]);

  const onNav = (nav: WebViewNavigation) => {
    if (settledRef.current) return;
    const url = nav.url || '';
    console.log('[Payment] WebView URL:', url, '| loading:', nav.loading, '| navType:', nav.navigationType);
    // Only navigate when the gateway redirects back to our return URL (bmgjewellers.com)
    if (url.includes(RETURN_HOST)) {
      console.log('[Payment] Return URL detected → navigating to PaymentStatus');
      settledRef.current = true;
      navigation.replace('PaymentStatus', { orderId, mode: 'online' });
    }
  };

  return (
    <View style={[styles.safe, { backgroundColor: C.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { backgroundColor: C.card, borderBottomColor: C.borderColor }]}>
        <TouchableOpacity style={styles.hBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={C.title} />
        </TouchableOpacity>
        <Text style={[styles.hTitle, { color: C.title }]}>Secure Payment</Text>
        <View style={styles.hBtn} />
      </View>

      {error ? (
        <ErrorState message={error} onRetry={() => navigation.goBack()} />
      ) : preparing || !gatewayUrl ? (
        <Loader message="Redirecting to secure gateway..." />
      ) : (
        <WebView
          source={{ uri: gatewayUrl }}
          onNavigationStateChange={onNav}
          startInLoadingState
          renderLoading={() => <Loader message="Loading payment..." />}
          javaScriptEnabled
          domStorageEnabled
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  safe:   { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1 },
  hBtn:   { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  hTitle: { flex: 1, ...FONTS.h5, ...FONTS.fontSemiBold },
});

export default Payment;
