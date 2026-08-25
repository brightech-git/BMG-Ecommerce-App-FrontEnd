// app/Screens/profile/PaymentStatus.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Animated, Dimensions, Easing } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { StackScreenProps } from '@react-navigation/stack';
import { CommonActions } from '@react-navigation/native';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { getPaymentStatus } from '../../api/services/paymentService';
import { Loader } from '../../components/common/StateViews';

const { width: SW, height: SH } = Dimensions.get('window');
const PARTICLE_COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98FB98', COLORS.primary];
const PARTICLE_COUNT = 60;

const rand = (min: number, max: number) => Math.random() * (max - min) + min;

const Particle = ({ delay }: { delay: number }) => {
  const x = useRef(rand(0, SW)).current;
  const size = useRef(rand(4, 10)).current;
  const color = useRef(PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)]).current;
  const isCircle = useRef(Math.random() > 0.5).current;
  const translateY = useRef(new Animated.Value(-20)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const duration = useRef(rand(2200, 3800)).current;
  const drift = useRef(rand(-40, 40)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, { toValue: SH + 20, duration, useNativeDriver: true, easing: Easing.linear }),
          Animated.timing(translateX, { toValue: drift, duration, useNativeDriver: true, easing: Easing.sin }),
          Animated.sequence([
            Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0.7, duration: duration - 600, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
          ]),
          Animated.timing(rotate, { toValue: 1, duration, useNativeDriver: true, easing: Easing.linear }),
        ]),
        Animated.parallel([
          Animated.timing(translateY, { toValue: -20, duration: 0, useNativeDriver: true }),
          Animated.timing(translateX, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.timing(rotate, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '720deg'] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        top: 0,
        width: size,
        height: isCircle ? size : size * 2.5,
        borderRadius: isCircle ? size / 2 : 2,
        backgroundColor: color,
        opacity,
        transform: [{ translateY }, { translateX }, { rotate: spin }],
      }}
    />
  );
};

type Props = StackScreenProps<RootStackParamList, 'PaymentStatus'>;
type Result = 'success' | 'failed' | 'pending';

const isSuccess = (s: any): boolean => {
  const status = (s?.paymentStatus ?? s?.status ?? '').toUpperCase();
  const txnStatus = (s?.payphiResponse?.txnStatus ?? s?.txnStatus ?? '').toUpperCase();
  const txnCode = String(s?.payphiResponse?.txnResponseCode ?? s?.txnResponseCode ?? '');
  if (status === 'PAID' || status === 'SUCCESS' || status === 'COMPLETED') return true;
  if (txnStatus === 'SUC' || txnStatus === 'SUCCESS') return true;
  if (txnCode === '0000' || txnCode === '00') return true;
  return false;
};

const PaymentStatus = ({ route, navigation }: Props) => {
  const { isDark, colors: C } = useTheme();
  const { orderId, mode } = route.params;
  const isCod = (mode ?? '').toLowerCase() === 'cod';
  const qc = useQueryClient();
  const [result, setResult] = useState<Result>(isCod ? 'success' : 'pending');
  const [loading, setLoading] = useState(!isCod);
  const ran = useRef(false);

  // Success animation values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (result === 'success') {
      qc.invalidateQueries({ queryKey: ['cart'] });
      // Entrance animation sequence
      Animated.sequence([
        Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }),
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 0, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]),
      ]).start(() => {
        // Pulse the checkmark
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, { toValue: 1.12, duration: 800, useNativeDriver: true }),
            Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          ])
        ).start();
      });
    }
  }, [result]);

  useEffect(() => {
    if (isCod || ran.current) return;
    ran.current = true;
    (async () => {
      await new Promise(r => setTimeout(r, 3000));
      try {
        console.log('[PaymentStatus] Checking status for orderId:', orderId);
        const s = await getPaymentStatus(orderId);
        console.log('[PaymentStatus] RAW response:', JSON.stringify(s, null, 2));
        const success = isSuccess(s);
        console.log('[PaymentStatus] isSuccess result:', success);
        setResult(success ? 'success' : 'failed');
      } catch (e: any) {
        console.log('[PaymentStatus] ERROR:', e?.message);
        setResult('pending');
      } finally {
        setLoading(false);
      }
    })();
  }, [isCod, orderId]);

  const goHome = () => navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'DrawerNavigation' as never }] }));
  const goOrders = () => navigation.navigate('Myorder');

  if (loading) return <View style={[styles.safe, { backgroundColor: C.background }]}><Loader message="Confirming your payment..." /></View>;

  // ── SUCCESS screen ──
  if (result === 'success') {
    return (
      <View style={[styles.safe, { backgroundColor: '#0a0a1a' }]}>
        <StatusBar barStyle="light-content" />
        {/* Rainy confetti particles */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
            <Particle key={i} delay={rand(0, 2500)} />
          ))}
        </View>

        <View style={styles.successCenter}>
          {/* Glowing ring */}
          <Animated.View style={[styles.glowRing, { transform: [{ scale: scaleAnim }] }]}>
            <Animated.View style={[styles.innerRing, { transform: [{ scale: pulseAnim }] }]}>
              <Feather name="check" size={52} color="#fff" />
            </Animated.View>
          </Animated.View>

          {/* Text content */}
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: 'center' }}>
            <Text style={styles.congrats}>🎉 Congratulations!</Text>
            <Text style={styles.successTitle}>Order Placed Successfully</Text>
            <Text style={styles.successSub}>
              {isCod ? 'Your order' : 'Payment confirmed for order'}{' '}
              <Text style={{ color: COLORS.primary, fontWeight: '700' }}>#{orderId}</Text>
              {' '}has been confirmed.{`\n`}We'll notify you once it's shipped!
            </Text>

            <View style={styles.badgeRow}>
              <View style={styles.badge}><Text style={styles.badgeTxt}>✅ Confirmed</Text></View>
              <View style={styles.badge}><Text style={styles.badgeTxt}>📦 Processing</Text></View>
            </View>
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim, width: '100%', alignItems: 'center' }}>
            <TouchableOpacity style={styles.primaryBtn} onPress={goOrders}>
              <Text style={styles.primaryTxt}>View My Orders</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={goHome}>
              <Text style={styles.secondaryTxt}>Continue Shopping</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    );
  }

  // ── FAILED / PENDING screen ──
  const cfg = result === 'failed'
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
  // Success
  successCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 28 },
  glowRing: {
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: COLORS.primary + '30',
    borderWidth: 2, borderColor: COLORS.primary + '60',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.primary, shadowOpacity: 0.8, shadowRadius: 24, elevation: 20,
  },
  innerRing: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.primary, shadowOpacity: 1, shadowRadius: 16, elevation: 12,
  },
  congrats: { fontSize: 26, marginBottom: 6, textAlign: 'center' },
  successTitle: { ...FONTS.h3, fontWeight: '800', color: '#fff', textAlign: 'center', letterSpacing: 0.4 },
  successSub: { ...FONTS.font, color: '#aaa', textAlign: 'center', marginTop: 10, lineHeight: 22, maxWidth: 300 },
  badgeRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  badge: { backgroundColor: '#ffffff15', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: '#ffffff20' },
  badgeTxt: { ...FONTS.fontSm, color: '#fff', fontWeight: '600' },
  // Shared
  primaryBtn: { backgroundColor: COLORS.primary, borderRadius: SIZES.radius_lg, paddingVertical: 15, paddingHorizontal: 48, marginTop: 8 },
  primaryTxt: { ...FONTS.fontLg, fontWeight: '700', color: '#fff' },
  secondaryBtn: { paddingVertical: 12, paddingHorizontal: 40 },
  secondaryTxt: { ...FONTS.font, fontWeight: '600', color: COLORS.primary },
  // Failed/Pending
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  circle: { width: 110, height: 110, borderRadius: 55, alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
  title: { ...FONTS.h3, ...FONTS.fontSemiBold, textAlign: 'center' },
  sub: { ...FONTS.font, textAlign: 'center', marginTop: 8, maxWidth: 300, marginBottom: 20 },
});

export default PaymentStatus;
