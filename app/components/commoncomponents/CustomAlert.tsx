import React, { useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Dimensions, TouchableWithoutFeedback,
  BackHandler, Modal,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

const { width } = Dimensions.get('window');
const CARD_W = Math.min(width * 0.86, 360);

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

export type AlertButton = {
  label: string;
  onPress?: () => void;
  style?: 'primary' | 'secondary' | 'danger' | 'ghost';
};

export type CustomAlertProps = {
  visible: boolean;
  type?: AlertType;
  title: string;
  message?: string;
  buttons?: AlertButton[];
  dismissible?: boolean;
  onDismiss?: () => void;
  loading?: boolean;
  autoDismiss?: number;
};

const TYPE_CONFIG = {
  success: { icon: 'checkmark-circle' as const, color: COLORS.success,  bg: 'rgba(21,158,66,0.12)',  ring: 'rgba(21,158,66,0.25)' },
  error:   { icon: 'close-circle'     as const, color: COLORS.danger,   bg: 'rgba(255,49,49,0.10)',  ring: 'rgba(255,49,49,0.20)' },
  warning: { icon: 'warning'          as const, color: COLORS.warning,  bg: 'rgba(255,176,44,0.12)', ring: 'rgba(255,176,44,0.22)' },
  info:    { icon: 'information-circle' as const, color: COLORS.info,   bg: 'rgba(43,57,185,0.10)',  ring: 'rgba(43,57,185,0.20)' },
  confirm: { icon: 'help-circle'      as const, color: COLORS.primary,  bg: 'rgba(255,151,29,0.10)', ring: 'rgba(255,151,29,0.20)' },
};

function Spinner() {
  const rot = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.timing(rot, { toValue: 1, duration: 900, useNativeDriver: true })).start();
  }, []);
  const spin = rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <Animated.View style={[styles.spinner, { borderTopColor: COLORS.primary, transform: [{ rotate: spin }] }]} />
  );
}

function AlertBtn({ btn, onDismiss, isLast }: { btn: AlertButton; onDismiss?: () => void; isLast: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;
  const s = btn.style ?? 'primary';
  const bg     = s === 'primary' ? COLORS.primary : s === 'danger' ? COLORS.danger : 'transparent';
  const border  = s === 'secondary' ? COLORS.primary : s === 'ghost' ? COLORS.borderColor : 'transparent';
  const txtColor = s === 'primary' || s === 'danger' ? COLORS.white : COLORS.primary;

  return (
    <TouchableOpacity
      onPress={() => { btn.onPress?.(); onDismiss?.(); }}
      onPressIn={() => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, speed: 40 }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 24 }).start()}
      activeOpacity={1}
      style={{ flex: 1 }}
    >
      <Animated.View style={[
        styles.btn,
        { backgroundColor: bg, borderColor: border, borderWidth: s === 'secondary' || s === 'ghost' ? 1.5 : 0, transform: [{ scale }] },
        !isLast && { marginRight: 8 },
      ]}>
        <Text style={[FONTS.fontMedium, { fontSize: 15, color: txtColor }]}>{btn.label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function CustomAlert({
  visible,
  type        = 'info',
  title,
  message,
  buttons     = [{ label: 'OK', style: 'primary' }],
  dismissible = true,
  onDismiss,
  loading     = false,
  autoDismiss = 0,
}: CustomAlertProps) {
  const cfg = TYPE_CONFIG[type];
  const backdropOp = useRef(new Animated.Value(0)).current;
  const cardScale  = useRef(new Animated.Value(0.8)).current;
  const cardOp     = useRef(new Animated.Value(0)).current;
  const cardY      = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropOp, { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.spring(cardScale,  { toValue: 1, useNativeDriver: true, damping: 16, stiffness: 200 }),
        Animated.timing(cardOp,     { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(cardY,      { toValue: 0, useNativeDriver: true, damping: 16, stiffness: 200 }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOp, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(cardOp,     { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.spring(cardScale,  { toValue: 0.85, useNativeDriver: true, damping: 20 }),
      ]).start(() => { cardScale.setValue(0.8); cardY.setValue(30); });
    }
  }, [visible]);

  useEffect(() => {
    if (!visible || !autoDismiss) return;
    const t = setTimeout(() => onDismiss?.(), autoDismiss);
    return () => clearTimeout(t);
  }, [visible, autoDismiss]);

  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (dismissible) onDismiss?.();
      return true;
    });
    return () => sub.remove();
  }, [visible, dismissible]);

  const handleBackdrop = useCallback(() => {
    if (dismissible && !loading) onDismiss?.();
  }, [dismissible, loading, onDismiss]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={onDismiss}>
      <TouchableWithoutFeedback onPress={handleBackdrop}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: backdropOp }]} />
      </TouchableWithoutFeedback>

      <View style={styles.center} pointerEvents="box-none">
        <Animated.View style={[styles.card, { opacity: cardOp, transform: [{ scale: cardScale }, { translateY: cardY }] }]}>
          <View style={[styles.accentBar, { backgroundColor: cfg.color }]} />

          {/* Icon */}
          <View style={[styles.iconRing, { backgroundColor: cfg.ring }]}>
            <View style={[styles.iconBg, { backgroundColor: cfg.bg }]}>
              {loading ? <Spinner /> : <Ionicons name={cfg.icon} size={32} color={cfg.color} />}
            </View>
          </View>

          <Text style={[FONTS.fontSemiBold, styles.title]}>{title}</Text>

          {!!message && (
            <Text style={[FONTS.fontRegular, styles.message]}>{message}</Text>
          )}

          <View style={styles.divider} />

          {loading ? (
            <Text style={[FONTS.fontRegular, styles.waitText]}>Please wait…</Text>
          ) : (
            <View style={styles.btnRow}>
              {buttons.map((btn, i) => (
                <AlertBtn key={i} btn={btn} onDismiss={onDismiss} isLast={i === buttons.length - 1} />
              ))}
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50 },
  center:   { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', zIndex: 51 },
  card: {
    width: CARD_W,
    backgroundColor: COLORS.card,
    borderRadius: 24,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  accentBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 4, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  iconRing:  { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center', marginVertical: 16 },
  iconBg:    { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  spinner:   { width: 44, height: 44, borderRadius: 22, borderWidth: 4, borderColor: COLORS.borderColor, borderTopColor: COLORS.primary },
  title:     { fontSize: 18, color: COLORS.dark, textAlign: 'center', marginBottom: 8 },
  message:   { fontSize: 14, color: COLORS.label, textAlign: 'center', lineHeight: 22, paddingHorizontal: 8 },
  divider:   { width: '100%', height: StyleSheet.hairlineWidth, backgroundColor: COLORS.borderColor, marginVertical: 16 },
  btnRow:    { flexDirection: 'row', width: '100%' },
  btn:       { height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  waitText:  { fontSize: 13, color: COLORS.label, marginTop: 8 },
});
