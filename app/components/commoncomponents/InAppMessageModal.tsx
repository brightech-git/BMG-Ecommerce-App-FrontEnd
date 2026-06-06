import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  Animated, Dimensions, TouchableWithoutFeedback,
  BackHandler, Platform, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { axiosInstance } from '../../api/axiosInstance';
import { NOTIFICATIONS } from '../../api/endpoints';
import { RootStackParamList } from '../../Navigations/RootStackParamList';

const { width } = Dimensions.get('window');
const CARD_W = Math.min(width * 0.88, 380);

type Message = {
  id: number;
  title: string;
  message: string;
  imageUrl?: string;
  screenName?: string;
};

type NavProp = StackNavigationProp<RootStackParamList>;

function useMessageQueue() {
  const queueRef   = useRef<Message[]>([]);
  const [current, setCurrent] = useState<Message | null>(null);
  const [visible, setVisible] = useState(false);
  const busy = useRef(false);

  const showNext = useCallback(() => {
    if (busy.current || queueRef.current.length === 0) return;
    setCurrent(queueRef.current.shift()!);
    setVisible(true);
  }, []);

  const enqueue = useCallback((msgs: Message[]) => {
    queueRef.current = msgs;
    showNext();
  }, [showNext]);

  return { queueRef, current, setCurrent, visible, setVisible, busy, showNext, enqueue };
}

function useModalAnim(visible: boolean) {
  const backdropOp = useRef(new Animated.Value(0)).current;
  const cardScale  = useRef(new Animated.Value(0.85)).current;
  const cardOp     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    backdropOp.setValue(0); cardScale.setValue(0.85); cardOp.setValue(0);
    Animated.parallel([
      Animated.timing(backdropOp, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.spring(cardScale,  { toValue: 1, damping: 15, stiffness: 180, useNativeDriver: true }),
      Animated.timing(cardOp,     { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [visible]);

  const animateOut = useCallback((onDone: () => void) => {
    Animated.parallel([
      Animated.timing(backdropOp, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(cardOp,     { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.spring(cardScale,  { toValue: 0.85, damping: 20, useNativeDriver: true }),
    ]).start(onDone);
  }, [backdropOp, cardOp, cardScale]);

  return { backdropOp, cardScale, cardOp, animateOut };
}

export default function InAppMessageModal() {
  const navigation = useNavigation<NavProp>();
  const { queueRef, current, setCurrent, visible, setVisible, busy, showNext, enqueue } = useMessageQueue();
  const { backdropOp, cardScale, cardOp, animateOut } = useModalAnim(visible);
  const [navigating, setNavigating] = useState(false);

  // Fetch unread in-app messages
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const userStr = await AsyncStorage.getItem('@user');
        if (!userStr || cancelled) return;
        const user = JSON.parse(userStr);
        const userId = user?.id;
        if (!userId) return;

        const res = await axiosInstance.get(NOTIFICATIONS.GET_USER(Number(userId)));
        const items: any[] = res.data?.data ?? [];

        const unread: Message[] = items
          .filter((n: any) => n.InAppMessage === true && n.IsRead === false)
          .map((n: any) => ({
            id:         n.Id,
            title:      n.Title   ?? '',
            message:    n.Message ?? '',
            imageUrl:   n.ImageUrl   || undefined,
            screenName: n.ScreenName || undefined,
          }));

        if (unread.length > 0 && !cancelled) enqueue(unread);
      } catch { /* non-critical */ }
    })();
    return () => { cancelled = true; };
  }, [enqueue]);

  const markAsRead = useCallback(async (msg: Message) => {
    try {
      const userStr = await AsyncStorage.getItem('@user');
      if (!userStr) return;
      const userId = JSON.parse(userStr)?.id;
      if (!userId) return;
      await axiosInstance.post(NOTIFICATIONS.MARK_READ(msg.id, Number(userId)));
    } catch { /* non-critical */ }
  }, []);

  const dismiss = useCallback((shouldNavigate = false) => {
    if (busy.current || !visible) return;
    busy.current = true;

    const screenName = current?.screenName;
    if (current) markAsRead(current);
    if (shouldNavigate && screenName) setNavigating(true);

    animateOut(() => {
      busy.current = false;
      setVisible(false);
      setCurrent(null);
      setTimeout(showNext, 300);

      if (shouldNavigate && screenName) {
        try { navigation.navigate(screenName as any); } catch {}
        setNavigating(false);
      }
    });
  }, [busy, visible, current, markAsRead, animateOut, setVisible, setCurrent, showNext, navigation]);

  useEffect(() => {
    if (!visible || Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => { dismiss(false); return true; });
    return () => sub.remove();
  }, [visible, dismiss]);

  if (!current && !navigating) return null;

  const hasImage  = !!current?.imageUrl;
  const hasAction = !!current?.screenName;
  const remaining = queueRef.current.length;

  return (
    <>
      {navigating && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}

      {!!current && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <TouchableWithoutFeedback onPress={() => dismiss(false)}>
            <Animated.View style={[styles.backdrop, { opacity: backdropOp }]} />
          </TouchableWithoutFeedback>

          <View style={styles.center} pointerEvents="box-none">
            <View>
              {/* Close button */}
              <Animated.View style={[styles.closeBtnWrap, { opacity: cardOp }]}>
                <TouchableOpacity style={styles.closeBtn} onPress={() => dismiss(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={[FONTS.fontMedium, { fontSize: 14, color: COLORS.label }]}>✕</Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Card */}
              <Animated.View style={[styles.card, { opacity: cardOp, transform: [{ scale: cardScale }] }]}>
                <View style={[styles.accentBar, { backgroundColor: COLORS.primary }]} />

                {hasImage && (
                  <Image source={{ uri: current.imageUrl }} style={styles.image} resizeMode="cover" />
                )}

                <View style={[styles.body, !hasImage && { paddingTop: 28 }]}>
                  <Text style={[FONTS.fontSemiBold, styles.title]} numberOfLines={2}>{current.title}</Text>
                  <Text style={[FONTS.fontRegular, styles.message]} numberOfLines={5}>{current.message}</Text>
                </View>

                {remaining > 0 && (
                  <Text style={[FONTS.fontRegular, styles.queueHint]}>
                    {remaining} more message{remaining > 1 ? 's' : ''}
                  </Text>
                )}

                <View style={[styles.divider, { backgroundColor: COLORS.borderColor }]} />

                <TouchableOpacity
                  onPress={() => dismiss(hasAction)}
                  style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}
                  activeOpacity={0.82}
                >
                  <Text style={[FONTS.fontMedium, { color: COLORS.white, fontSize: 15 }]}>
                    {hasAction ? 'View' : 'Got it'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  backdrop:     { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 50 },
  center:       { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', zIndex: 51 },
  card:         { width: CARD_W, backgroundColor: COLORS.card, borderRadius: 20, overflow: 'hidden', paddingBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 12 },
  accentBar:    { width: '100%', height: 4 },
  image:        { width: '100%', height: 180 },
  body:         { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 8, width: '100%' },
  title:        { fontSize: 18, color: COLORS.dark, textAlign: 'center', marginBottom: 10 },
  message:      { fontSize: 14, color: COLORS.label, textAlign: 'center', lineHeight: 22 },
  queueHint:    { fontSize: 12, color: COLORS.label, marginTop: 4 },
  divider:      { width: '85%', height: StyleSheet.hairlineWidth, marginVertical: 16 },
  actionBtn:    { paddingHorizontal: 40, paddingVertical: 12, borderRadius: 12, marginBottom: 4 },
  closeBtnWrap: { position: 'absolute', top: -14, right: -14, zIndex: 100 },
  closeBtn:     { backgroundColor: COLORS.white, borderRadius: 20, width: 28, height: 28, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 },
  loaderOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center', zIndex: 999 },
});
